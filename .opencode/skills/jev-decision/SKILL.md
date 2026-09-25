---
name: jev-decision
description: Evaluate any text with the Jev AI decision API. Use when the user asks "is this urgent?", "run a Jev check", "jev evaluate", "check this with jev", or wants a 0-1 urgency/confidence score from a typed noul question on their text.
---

# Jev AI Decision

Call the Jev decision API server-side (key never leaves the server) to get a typed noul probability on any text.

## Steps

1. Ensure `JEV_AI_API_KEY` is in the shell environment. If not set, tell the user to add it to their env (see README).
2. Run:
   ```
   node scripts/jev.js "$ARGUMENTS"
   ```
   `$ARGUMENTS` is the user's text. Default question: "Does this need urgent support?" Model: `jev-latest`. Override with `--model=` and `--question=`.
   Example: `node --input-type=module scripts/jev.js "My payment failed" --model=jev-latest --question="Is this billing-related?"`
3. Read the JSON output. Report `answers.urgent.noul` (0–1 probability) and `usage` (token counts) to the user.
4. If the call fails, surface the error message — it already maps 401/402/422/429/502/504 to human-readable reasons.

## Notes

- The key is server-only in `server/jev-client.js`; never expose it.
- To check connected models first, run `node -e "import('./server/jev-client.js').then(m=>m.getModels().then(x=>console.log(JSON.stringify(x))))"`.
- Laya models (`laya-english`, `laya-multilingual`) are supported — confirm they're connected via GET `/api/v1/models` before using them (512 / 1024 token limits per question).
