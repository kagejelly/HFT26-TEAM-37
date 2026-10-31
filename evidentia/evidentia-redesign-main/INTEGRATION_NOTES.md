# EVIDENTIA frontend integration notes

## Configured backend
- API base: `https://evidentia-backend-hmzt.onrender.com/api`
- Health check: `https://evidentia-backend-hmzt.onrender.com/health`
- Swagger UI: `https://evidentia-backend-hmzt.onrender.com/docs`

The health endpoint was reachable during integration and reported the service online with its database connected. This does not by itself verify every API route or response schema.

## Changes made
- Corrected API paths to append `/investigations...` to the base URL ending in `/api`, avoiding `/api/api/...`.
- Configured `.env.local` for the deployed backend with mocks disabled.
- Added `.env.local` to `.gitignore`.
- Changed evidence upload multipart field from `type` to `evidence_type`, matching the supplied backend hand-off.
- Changed investigation creation JSON to the documented snake_case fields: `title`, `incident_date`, `location`, `description`.
- Added adapters for common snake_case/camelCase response field names.
- Implemented event detail lookup by fetching the documented event collection and finding the selected event, because the hand-off does not document a single-event endpoint.
- Added API methods for the documented conflicts and trajectory endpoints.
- Updated report loading to use the report response and fetch missing case/evidence/event collections when the report omits them.

## Important verification still required
The Swagger UI returned HTML, but its rendered OpenAPI schema was not readable in the inspection environment. Therefore the following still need to be tested against the live backend from the user's browser:
1. `GET /api/investigations` and the actual response envelope.
2. `GET /api/investigations/{id}` and field names.
3. `POST /api/investigations` and validation behaviour.
4. Evidence upload multipart field and returned evidence shape.
5. Event, conflict, trajectory and report response shapes.
6. CORS permissions for the frontend's local development origin and eventual deployed frontend origin.

If the backend uses a different field name or response envelope than the supplied hand-off, update the adapter in `src/services/api.ts`; do not change page components or silently fabricate missing values.

## Run locally
From this folder:
```bash
npm install
npm run dev
```
Open `http://localhost:5173/`. Keep the terminal running.

The `.env.local` file is preconfigured. Restart Vite after changing environment variables.
