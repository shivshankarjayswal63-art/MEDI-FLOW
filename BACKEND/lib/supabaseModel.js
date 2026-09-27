const { getSupabase, useSupabase } = require("../config/supabase");

function camelToSnake(key) {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function snakeToCamel(key) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toDb(data) {
  const row = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    row[camelToSnake(key)] = value;
  }
  return row;
}

function fromDb(row) {
  if (!row) return null;
  const doc = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "id") {
      doc._id = value;
      doc.id = value;
      continue;
    }
    doc[snakeToCamel(key)] = value;
  }
  return doc;
}

function omitFields(doc, select) {
  if (!select || !select.startsWith("-")) return doc;
  const omit = select.slice(1).split(/\s+/).filter(Boolean);
  const copy = { ...doc };
  for (const field of omit) {
    delete copy[field];
  }
  return copy;
}

const REF_TABLES = {
  doctorId: "doctors",
  patientId: "users",
  user_id: "users",
  userId: "users",
  correctedBy: "prescriptions",
};

async function fetchRef(table, id, fields) {
  if (!id) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  let doc = fromDb(data);
  if (fields) {
    const allowed = fields.split(/\s+/).filter(Boolean);
    const picked = {};
    for (const f of allowed) {
      if (doc[f] !== undefined) picked[f] = doc[f];
    }
    picked._id = doc._id;
    doc = picked;
  }
  delete doc.password;
  return doc;
}

async function applyPopulate(docs, populates) {
  if (!populates.length) return docs;
  const result = [];
  for (const doc of docs) {
    const copy = { ...doc };
    for (const { path, fields } of populates) {
      const table = REF_TABLES[path];
      if (table && copy[path]) {
        copy[path] = await fetchRef(table, copy[path], fields);
      }
    }
    result.push(copy);
  }
  return result;
}

class Document {
  constructor(table, data = {}) {
    this._table = table;
    Object.assign(this, data);
  }

  async save() {
    const supabase = getSupabase();
    const payload = toDb({ ...this });
    delete payload._table;
    delete payload._id;
    delete payload.id;

    if (this._id) {
      payload.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from(this._table)
        .update(payload)
        .eq("id", this._id)
        .select()
        .single();
      if (error) throw error;
      Object.assign(this, fromDb(data));
      return this;
    }

    const { data, error } = await supabase
      .from(this._table)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    Object.assign(this, fromDb(data));
    return this;
  }
}

class Query {
  constructor(table, filter = {}) {
    this.table = table;
    this.filter = filter;
    this._select = null;
    this._sort = null;
    this._populates = [];
    this._lean = false;
  }

  select(fields) {
    this._select = fields;
    return this;
  }

  sort(sortBy) {
    this._sort = sortBy;
    return this;
  }

  populate(path, fields) {
    this._populates.push({ path, fields });
    return this;
  }

  lean() {
    this._lean = true;
    return this;
  }

  async exec() {
    const supabase = getSupabase();
    let query = supabase.from(this.table).select("*");

    for (const [key, value] of Object.entries(this.filter)) {
      const col = camelToSnake(key);
      if (value && typeof value === "object" && value.$gt !== undefined) {
        query = query.gt(col, new Date(value.$gt).toISOString());
      } else {
        query = query.eq(col, value);
      }
    }

    if (this._sort) {
      const desc = String(this._sort).startsWith("-");
      const field = desc ? String(this._sort).slice(1) : String(this._sort);
      query = query.order(camelToSnake(field), { ascending: !desc });
    }

    const { data, error } = await query;
    if (error) throw error;

    let docs = (data || []).map(fromDb);
    if (this._select) {
      docs = docs.map((d) => omitFields(d, this._select));
    }
    docs = await applyPopulate(docs, this._populates);
    return docs;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function createModel(table) {
  function Model(data) {
    return new Document(table, data);
  }

  Model.find = (filter = {}) => new Query(table, filter);

  Model.findOne = async (filter = {}) => {
    const q = new Query(table, filter);
    const rows = await q.exec();
    if (!rows.length) return null;
    const doc = new Document(table, rows[0]);
    return doc;
  };

  Model.findById = (id) => {
    const state = { populates: [], select: null };
    const chain = {
      populate(path, fields) {
        state.populates.push({ path, fields });
        return chain;
      },
      select(fields) {
        state.select = fields;
        return chain;
      },
      then(resolve, reject) {
        return execFindById(table, id, state).then(resolve, reject);
      },
    };
    return chain;
  };

  Model.create = async (payload) => {
    const doc = new Document(table, payload);
    await doc.save();
    return doc;
  };

  Model.findByIdAndUpdate = (id, update, options = {}) => {
    const state = { select: null, options };
    const chain = {
      select(fields) {
        state.select = fields;
        return chain;
      },
      then(resolve, reject) {
        return execFindByIdAndUpdate(table, id, update, state).then(
          resolve,
          reject
        );
      },
    };
    return chain;
  };

  Model.findByIdAndDelete = async (id) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? fromDb(data) : null;
  };

  Model.countDocuments = async (filter = {}) => {
    const supabase = getSupabase();
    let query = supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(camelToSnake(key), value);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  };

  return Model;
}

async function execFindByIdAndUpdate(table, id, update, state) {
  const supabase = getSupabase();
  const payload = toDb(update);
  payload.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let doc = fromDb(data);
  if (state.select) doc = omitFields(doc, state.select);
  return state.options.new ? new Document(table, doc) : doc;
}

async function execFindById(table, id, state) {
  if (!id) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let doc = fromDb(data);
  if (state.select) doc = omitFields(doc, state.select);
  const populated = await applyPopulate([doc], state.populates);
  return new Document(table, populated[0]);
}

/** Resolve Supabase vs Mongoose at call time (Vercel loads env before first request). */
function lazyModel(table, mongooseFactory) {
  let model = null;
  const get = () => {
    if (!model) {
      model = useSupabase() ? createModel(table) : mongooseFactory();
    }
    return model;
  };
  const handler = {
    get(_target, prop) {
      const m = get();
      const value = m[prop];
      return typeof value === "function" ? value.bind(m) : value;
    },
    apply(_target, _thisArg, args) {
      const M = get();
      return new M(...args);
    },
    construct(_target, args) {
      const M = get();
      return new M(...args);
    },
  };
  const proxy = new Proxy(function ProxyModel() {}, handler);
  return proxy;
}

module.exports = { createModel, useSupabase, fromDb, toDb, lazyModel };
