const Notification = require("../Models/NotificationModel");
const { getSupabase } = require("../config/supabase");
const { useSupabase } = require("../lib/supabaseModel");

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    if (useSupabase()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return res.json(
        (data || []).map((n) => ({
          _id: n.id,
          id: n.id,
          userId: n.user_id,
          title: n.title,
          body: n.body,
          read: n.read,
          createdAt: n.created_at,
        }))
      );
    }
    const rows = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    if (useSupabase()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Updated", notification: data });
    }
    res.status(501).json({ message: "Not implemented for MongoDB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
