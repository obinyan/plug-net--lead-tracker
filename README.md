# Client Pipeline — Lead Tracker (Vercel + Upstash)

This is a self-hosted lead tracker. Vercel serves the site and a tiny API endpoint
(`/api/leads`); Upstash Redis is the free database behind it. Every device/browser
that opens the site talks to the same API, so data added on your phone shows up on
your laptop and vice versa.

## 1. Create a free Upstash Redis database

1. Go to https://console.upstash.com and sign up (free tier is enough for this).
2. Create a new **Redis** database — any region close to you is fine.
3. On the database's detail page, find the **REST API** section.
4. Copy the **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** values — you'll need them in step 3.

## 2. Push this project to GitHub

1. Create a new repo (private is fine — see note below on Vercel + private repos).
2. Upload everything in this folder (`index.html`, `api/leads.js`, `package.json`) to the repo root, keeping the `api/` folder structure intact.

## 3. Deploy to Vercel

1. Go to https://vercel.com/new and sign in (GitHub login is easiest).
2. Import the repo you just created.
3. Before deploying, open **Environment Variables** and add:
   - `UPSTASH_REDIS_REST_URL` = (the value from step 1)
   - `UPSTASH_REDIS_REST_TOKEN` = (the value from step 1)
   - `SITE_PASSWORD` = any password you choose — this locks the whole site behind a password screen. Leave this variable out entirely if you don't want a password gate.
4. Click **Deploy**.
5. You'll get a live URL like `https://your-project.vercel.app` — that's your permanent link, live 24/7, on every device.

## Notes

- **Password gate:** if you set `SITE_PASSWORD`, visitors see a lock screen before the tracker loads. The password is checked on the server (`api/leads.js`) on every request, so it can't be bypassed by just editing the page. The browser remembers it for the current tab session only (via `sessionStorage`) — closing the tab means entering it again next time. This is a simple shared-password gate, not full user accounts; good enough for keeping casual visitors out, not for handling regulated client data.
- **Private repo on Vercel:** unlike GitHub Pages, Vercel doesn't require a paid plan to deploy from a private repository — the free Hobby plan supports this, and the *deployed site* is a normal public URL (share the link, not the repo).
- **Data storage:** the whole leads list is stored as a single JSON blob under one Redis key (`leads`). Simple and reliable for this scale (dozens to low thousands of leads).
- **First load:** if the database is empty, the site falls back to the built-in starter leads. As soon as you edit/add/remove anything, that full list gets saved to Upstash and becomes the shared source of truth for every device.
- **Local dev (optional):** if you want to test the API locally before deploying, install the Vercel CLI (`npm i -g vercel`), run `vercel dev` in this folder, and set the two environment variables in a local `.env` file.
