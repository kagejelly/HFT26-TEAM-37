# EVIDENTIA API handoff — frontend assumptions to confirm

The frontend's proposed contract is intentionally isolated in `src/services/api.ts`. Before integration, agree one real JSON example for each resource with the backend developer. Do not silently rename fields on one side.

## Current TypeScript domain shape

- `Investigation`: `id`, `title`, `incidentDate`, optional `incidentTime`, `timeUnknown`, `location`, `description`, `reference`, `status`, `createdAt`, `updatedAt`.
- `Evidence`: `id`, `investigationId`, `type` (`video | witness | sensor`), `filename`, `uploadedAt`, `status` (`Queued | Processing | Completed | Failed`), optional `error`, `size`.
- `Event`: `id`, `investigationId`, `sourceType`, `eventType`, optional `timestamp`, `originalTimestamp`, `timestampType` (`absolute | relative | unknown`), optional `timestampUncertainty`, `description`, `vehicleLabel`, `confidence`, `classification`, `reference`.
- `Report`: investigation, evidence array, events array, conflicts, gaps, limitations.

## Proposed routes

| Method | Path | Request / response |
|---|---|---|
| GET | `/api/investigations` | `Investigation[]` |
| POST | `/api/investigations` | JSON `Partial<Investigation>` → `Investigation` |
| GET | `/api/investigations/{id}` | `Investigation` |
| POST | `/api/investigations/{id}/evidence` | multipart `file`, `type` → `Evidence` |
| GET | `/api/investigations/{id}/evidence` | `Evidence[]` |
| GET | `/api/evidence/{id}/status` | `Evidence` or a documented status envelope |
| POST | `/api/evidence/{id}/events` | backend-specific event extraction operation |
| GET | `/api/investigations/{id}/events` | `Event[]` |
| GET | `/api/investigations/{id}/events/{eventId}` | `Event` (confirm this proposed detail route) |
| GET | `/api/investigations/{id}/report` | `Report` |

The event detail route is a frontend proposal; the master prompt does not specify an exact event-detail URL. The frontend does not currently call the explicit evidence status or extraction endpoints. Add them once the backend contract and processing model are confirmed.

## Integration decisions still needed

1. Authentication method, token refresh and authorization rules.
2. Exact request and response JSON, field naming and enum casing.
3. Whether IDs are strings or UUIDs and whether incident date/time are ISO values.
4. Upload size/type limits, storage behaviour, multipart field names and upload progress mechanism.
5. Processing status refresh strategy (polling interval, server-sent events or websocket) and retry semantics.
6. Pagination, sorting and filtering conventions.
7. Standard error response shape and validation error format.
8. Whether timestamps are raw, normalised or both; timezone and clock-offset metadata.
9. How conflicts, evidence gaps, event confidence and source locators are produced and validated.
10. Report generation/export responsibilities and whether the backend returns a PDF.
