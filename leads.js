// Vercel serverless function: /api/leads
// Reads/writes the entire leads array as one JSON blob under the Redis key "leads".
// Uses Upstash Redis's REST API directly (no extra npm packages needed).

export default async function handler(req, res) {
  const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
  const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  const SITE_PASSWORD = process.env.SITE_PASSWORD;

  if (!REST_URL || !REST_TOKEN) {
    return res.status(500).json({
      error: "Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN environment variables in Vercel project settings.",
    });
  }

  if (SITE_PASSWORD) {
    const supplied = req.headers["x-site-password"];
    if (supplied !== SITE_PASSWORD) {
      return res.status(401).json({ error: "Incorrect or missing password." });
    }
  }

  const headers = { Authorization: `Bearer ${REST_TOKEN}` };

  if (req.method === "GET") {
    try {
      const r = await fetch(`${REST_URL}/get/leads`, { headers });
      const data = await r.json();
      const leads = data.result ? JSON.parse(data.result) : null;
      return res.status(200).json({ leads });
    } catch (e) {
      return res.status(500).json({ error: "Failed to fetch leads from storage." });
    }
  }

  if (req.method === "POST") {
    try {
      const leads = req.body;
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: "Expected an array of leads in the request body." });
      }
      const r = await fetch(`${REST_URL}/set/leads`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(leads),
      });
      if (!r.ok) {
        return res.status(500).json({ error: "Upstash rejected the write." });
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: "Failed to save leads to storage." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
