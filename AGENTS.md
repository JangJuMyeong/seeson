# 시선 / 见线 / SEE;LINE — instructions for any coding AI

This repository is the development handoff for CG Invites' InvitesLoop V5 demo. Follow the human user's current instructions first. These instructions work as plain text: if your tool does not discover this file automatically, read it explicitly.

## Read before changing code

1. `docs/AI-HANDOFF.md`: current implementation, boundaries and a copyable prompt.
2. `docs/DEVELOPMENT.md`: architecture, state transitions, commands and deployment separation.
3. `skills/siseon-v5/SKILL.md`, then only the relevant reference. These describe the broader product vision; do not confuse planned capabilities with implemented ones.
4. For tomorrow's demonstration, `docs/DEMO-2026-10-28.md`.

## Current objective and visual contract

- Preserve the immersive fast 3D line/galaxy introduction, camera movement and official CG Invites logo. Preserve the logo's shape and proportions.
- The adopted flow is intro → intention selection → W question → M1 clinician review → M3 discharge handoff and intervention → W again. It is one continuous patient trajectory. Do not restore the old three generic choice screens before the care flow.
- Keep Korean `시선`, Simplified Chinese `见线`, and English `SEE;LINE`. Update all locale dictionaries together; preserve original user-entered question text.
- First W: zero score cards, ranks or numerical health dashboards. IRS+ foundation, health baseline, disease-sensitivity reference, future band and a next step stay attached to the line.
- Questions are trajectory nodes, not a chatbot feed. M1 is not an EMR summary; M3 is not an unrelated patient app plus portal.

## Clinical meaning and state invariants

- This is a fictional browser demo. No real patient records, diagnosis, EMR connection, clinician authentication, external message or certified medical prediction is implemented.
- Before clinician confirmation, never generate a personal disease classification. General guideline explanations need a real verified primary source. Current source text is general Korean guideline context, not localized Chinese clinical guidance.
- After confirmation, communicate the clinician's recorded judgment with clinician/date/source. Defer/revise decisions must be respected. Never promote an old superseded diagnosis into the current judgment.
- Interventions require current confirmation scope, evidence, consent, responsible clinician and a trace. This demo checks them in the reducer; a real service must enforce them on the server.
- Yes is acceptance, not adherence. No is context, not deterioration. Only a separate follow-up observation can narrow the illustrative observation gap; never infer a health improvement from a click or stamp.
- Policy improvement is a pending proposal until reviewed. Do not automatically apply a learned medical policy.
- Nodes carry dates, actors and evidence links. Revisions append with a supersedes link. Preserve previous records.
- Local demo consent is seeded true; do not describe it as real consent collection. Role switches are simulation controls, not access control.

## Working rules

- Use `npm run dev` (Node 22+) and `npm run verify`. No frontend build, dependency install or API key is required to serve `dist/`.
- Keep the app buildless unless the user asks for a migration. Third-party Three.js is vendored with its license. Prefer built-in Node modules for tooling.
- Change the care reducer for business rules; keep presentation in the care view. Do not bypass the reducer in UI handlers.
- Read-only browser inspection and meaningful manual flow checks complement automated tests. Do not claim a browser check or metric you did not run.
- Storage key `siseon-care-demo-v3` and `VERSION=3` belong together. Define migration/reset behavior when changing schema.
- Keep UI copy in `dist/i18n.js`; input is escaped before HTML rendering. Never interpolate unescaped user text.
- Respect reduced motion and preserve the software 3D fallback.
- No tokens, credentials, real medical data or local browser storage in commits. `.env` is ignored. Company logo is not covered by the Three.js license.
- Do not overwrite unrelated user changes, force-push, retag the demonstration snapshot or enable automatic production deployment.
- GitHub pushes run verification only. Editing this repository does not publish the existing Sites URL. See `docs/DEVELOPMENT.md`.

## Done means

Report what changed, checks actually run, remaining limits, forbidden-pattern self-check, and 6-guideline/3+1 mapping for any product feature. Keep these implementation details in developer documents rather than the patient experience. Clinical, usability and financial effectiveness are not established by a polished demo.
