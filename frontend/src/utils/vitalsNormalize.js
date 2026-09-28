/** Normalize vitals rows from API (Supabase snake_case or Mongoose). */
export function normalizeVitalsList(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((v) => ({
      bp: Number(v.bp),
      pulse: Number(v.pulse),
      sugar: Number(v.sugar),
      createdAt: v.createdAt || v.created_at,
    }))
    .filter((v) => v.createdAt && !Number.isNaN(v.bp))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function buildVitalsTrendChart(vitalsTrend, brand) {
  const labels = vitalsTrend.map((v) =>
    new Date(v.createdAt || v.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  );
  return {
    labels: labels.length ? labels : ["—"],
    datasets: [
      {
        label: "BP",
        data: vitalsTrend.length ? vitalsTrend.map((v) => v.bp) : [0],
        borderColor: brand?.primary || "#2b2c6c",
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Pulse",
        data: vitalsTrend.length ? vitalsTrend.map((v) => v.pulse) : [0],
        borderColor: brand?.success || "#2fb297",
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Sugar",
        data: vitalsTrend.length ? vitalsTrend.map((v) => v.sugar) : [0],
        borderColor: brand?.accent || "#e6317d",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };
}
