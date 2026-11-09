# Қоян live chat: setup

Қоян answers through a Firebase Cloud Function (`functions/`). The browser never sees the Kimi key:
browser → our function (checks sign-in, limits and spending caps, picks the relevant facts from the verified database) → Kimi API → streamed answer.

Until these steps are done, the site shows «Чат временно недоступен» and a FAQ with checked answers.

## 1. Kimi account (pay-as-you-go API)
1. Sign in at https://platform.kimi.ai and top up the balance (K3.1 Pro unlocks after a top-up; the minimum is $1).
2. Create an API key. Keep it to yourself — don't paste it into chats, code or commits.
3. In the model list, check that `kimi-k3.1-pro` is available to your account. If you want another model, set `KIMI_MODEL` (step 4).

## 2. Firebase Blaze plan
Cloud Functions and Secret Manager need the pay-as-you-go **Blaze** plan:
Firebase console → project `unihop-88ba6` → Upgrade. Set a budget alert in Google Cloud Billing.

## 3. Put the key into Secret Manager (from your own terminal)
```
firebase functions:secrets:set KIMI_API_KEY --project unihop-88ba6
```
Paste the key when asked. It is stored encrypted, only the function can read it, and it never appears in logs.

## 4. Optional settings
Copy `functions/.env.example` to `functions/.env` and change what you need (all optional):
model, API address, message limits per day, concurrency, history and answer length, daily and monthly token caps,
and an optional monthly dollar cap (copy current prices from the Kimi price page — they are not hard-coded).
`KOYAN_ENABLED=false` switches the chat off without redeploying the site.

## 5. Deploy the function
```
npm --prefix functions install
firebase deploy --only functions --project unihop-88ba6
```
The data snapshot `functions/kb.json` is rebuilt automatically before each deploy (`scripts/build-kb.mjs`).
The function URL is printed at the end, e.g. `https://europe-west1-unihop-88ba6.cloudfunctions.net/koyan`.

## 6. Point the site at the function
Add the URL to `.env.local`:
```
VITE_KOYAN_URL=https://europe-west1-unihop-88ba6.cloudfunctions.net/koyan
```
then rebuild and deploy the site:
```
npm run build
firebase deploy --only hosting --project unihop-88ba6
```

## 7. Check it
- Open the URL in a browser: `{"configured":true}` means the key and settings are in place.
- Sign in with Google on the site, open «Чат с Қояном», and ask a question. Only after a real answer arrives is the integration confirmed.

## How costs are limited
- Only signed-in Google users can call the chat; requests from other sites are refused.
- Per student: 30 messages a day and one request at a time; per network address: 60 a day (all configurable).
- Input up to 1,200 characters, the last 8 turns of history (up to 8,000 characters), answers up to 2,500 tokens including reasoning; `reasoning_effort: low`.
- Only the relevant fragments of the database are sent, not the whole database; at most 2 database searches and 1 retry per answer.
- Daily and monthly token caps (and an optional dollar cap) stop new requests when reached; usage is counted in Firestore (`koyan_usage`).
- Logs contain only counters and error codes, never message text.

## Tests without a key
```
node scripts/build-kb.mjs
node functions/test/run.mjs          # 34 checks: search, limits, errors, tools, streaming (fake Kimi)
node functions/test/mock-server.mjs  # local endpoint with a fake Kimi on http://localhost:8787
node scripts/check-match.mjs         # matching for the reference profile
node scripts/check-plan.mjs          # plan for the reference profile
```
