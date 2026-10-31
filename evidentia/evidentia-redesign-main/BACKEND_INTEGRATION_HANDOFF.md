# EVIDENTIA — Backend integration handoff

The frontend is prepared for a separately developed FastAPI backend. Keep the API contract agreed between frontend and backend developers; the endpoint list below is provisional and should be confirmed with example JSON before wiring production responses.

## Configuration

Set `VITE_API_BASE_URL` in `.env.local`. Do not hardcode host URLs in page components.

## Operations to confirm

- `GET /api/investigations`
- `POST /api/investigations`
- `GET /api/investigations/{id}`
- `GET /api/investigations/{id}/evidence`
- `POST /api/investigations/{id}/evidence` (multipart/form-data)
- `GET /api/evidence/{id}/status`
- `GET /api/investigations/{id}/events`
- `GET /api/investigations/{id}/report`

Confirm whether event detail and reconstruction have dedicated endpoints or are returned as part of case/timeline payloads.

## Data contract requirements

**Investigation:** `id`, `title`, incident date/time or unknown marker, optional location and description, status, created/updated timestamps.

**Evidence:** `id`, `investigationId`, type (`video`, `witness`, `sensor`, `document`, `image`), filename, upload timestamp, processing status (`queued`, `processing`, `completed`, `failed`), error details when failed, and source metadata.

**Event:** `id`, `sourceType`, event type, description, vehicle label when known, original timestamp, normalized/display timestamp when available, timestamp classification (`absolute`, `relative`, `unknown`), uncertainty, confidence only when actually supplied, classification (`observed`, `claim`, `inferred`), evidence ID and exact source reference.

**Report:** case details, evidence summary, event list, source disagreements, evidence gaps, uncertainty and limitations. Conflicts and gaps must be derived from supplied data, not fabricated in the frontend.

## Important integration rules

- File upload success is not processing completion.
- Return upload progress only if the API can report it.
- Return processing status independently and support refresh/polling.
- Keep relative and unknown timestamps separate from comparable absolute clock times.
- Preserve raw/original timestamps when normalized timestamps are supplied.
- Preserve exact references: video frame/time, witness page/paragraph/excerpt, sensor record/row identifier.
- Do not invent confidence scores, speed, distances, trajectories or final vehicle positions.
- Distinguish observations, witness claims and AI-generated inferences.
- Reconstruction output must declare whether geometry is measured or illustrative.

## Frontend service layer

All requests should remain behind `src/services/api.ts`. `src/services/mockApi.ts` is development-only and must not be mixed with production API responses. Confirm API response envelopes and error format with the backend developer before removing any provisional adapters.
