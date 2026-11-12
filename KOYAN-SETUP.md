# Қоян live chat: setup (Render, free)

Firebase stays on the free **Spark** plan (Hosting + Firestore). Қоян's server runs separately on **Render's free plan**:

```
site (Firebase Hosting)  →  server/ on Render  →  Kimi API
  no keys                     key in Render's        kimi-k3.1-pro-highspeed
  Google sign-in token        environment only
```

The server checks the site address, Google sign-in, message length and limits, sends Kimi only the relevant
pieces of the verified database, and streams the answer back. Message text is never logged.

Until the steps below are done, the site shows «Чат временно недоступен» and the FAQ.

## Cost and limits
- **Firebase:** stays on the free Spark plan.
- **Render free web service:** $0, 750 instance hours a month per workspace. It **sleeps after 15 idle minutes**, and the first request after that takes up to about a minute; the site shows «Қоян просыпается…».
- **Kimi:** pay-as-you-go. The server uses the fast kimi-k3.1-pro-highspeed (review sites list about $4 / 1M input and $20 / 1M output tokens, twice the regular kimi-k3.1-pro at $2 / $10); check the official price page. To switch back, set KIMI_MODEL=kimi-k3.1-pro in Render → Environment. With the fast model that is roughly $0.04–0.08 per answer.
- **Default caps:** 30 messages a day per student, 60 per network address, one request at a time. Spending stops at 1M tokens a day or 10M a month (about $10 a day or $80 a month with the fast model; half that with the regular one).

## 1. Kimi key
1. At https://platform.kimi.ai, top up the balance (minimum $1) and create a **new** API key.
2. Delete any key that was ever pasted into a chat or a file in the repository.

## 2. Local test with the real key (optional, recommended)
1. Open `server/.env` (git-ignored) in your editor and put the key after `KIMI_API_KEY=`. Save.
2. Run `node server/test/live.mjs`. It asks 30 questions in RU/KZ/EN and writes `server/test/live-report.md`.

## 3. Firestore access for limits (recommended)
Without it, limits live in memory and reset each time the free service sleeps.
1. Google Cloud console → IAM & Admin → Service accounts (project `unihop-88ba6`) → **Create service account**, e.g. `koyan-limits`.
2. Give it the single role **Cloud Datastore User**.
3. Open it → Keys → **Add key → JSON**. A file downloads. Keep it private.

## 4. Render
1. Sign up at https://render.com (free) and connect your GitHub account.
2. **New → Blueprint**, pick the `unihop` repository. Render reads `render.yaml` and creates the `unihop-koyan` web service on the free plan.
3. When asked for secret values:
   - `KIMI_API_KEY`: the Kimi key.
   - `FIREBASE_SERVICE_ACCOUNT`: the whole content of the JSON file from step 3 (paste it as is).
4. Wait for the deploy. Open `https://<your-service>.onrender.com/health`. It should show `"configured":true` and `"limits":"firestore"`.

If you create the service by hand (**New → Web Service**) instead of the Blueprint, use:
- Language **Node**, Branch `main`, **Root Directory empty**, Instance type **Free**
- Build Command `npm install`, Start Command `npm start`
- Health Check Path `/health`
- Environment: `KIMI_API_KEY` (and optionally `FIREBASE_SERVICE_ACCOUNT`), plus
  `KOYAN_ALLOWED_ORIGINS=https://unihop-88ba6.web.app,https://unihop-88ba6.firebaseapp.com`

Node 22 is picked from `.node-version`. All other settings (model, limits, caps, optional dollar cap) are listed in
`server/.env.example` and can be changed in Render → Environment.

## 5. Connect the site
Add the service address to `.env.local`:
```
VITE_KOYAN_URL=https://<your-service>.onrender.com
```
Then rebuild and publish the site:
```
npm run build
firebase deploy --only hosting --project unihop-88ba6
```

## Tests without a key
```
node scripts/build-kb.mjs
node server/test/run.mjs   # 34 checks: search for 30 questions, limits, errors, tools, streaming (fake Kimi)
node server/test/e2e.mjs   # 11 checks of the real server over HTTP with a fake Kimi
node scripts/check-match.mjs
node scripts/check-plan.mjs
```
