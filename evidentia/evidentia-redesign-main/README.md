# EVIDENTIA

EVIDENTIA is an evidence-led road accident investigation-support frontend. It brings video, witness and sensor material into a traceable event timeline while preserving uncertainty and source context.

## Experiences and routes

- `/` — public editorial landing page
- `/app/dashboard` — investigation dashboard
- `/app/investigations/new` — create an investigation
- `/app/investigations/:id` — case overview
- `/app/investigations/:id/evidence` — evidence library
- `/app/investigations/:id/timeline` — forensic timeline
- `/app/investigations/:id/events/:eventId` — event detail
- `/app/investigations/:id/reconstruction` — illustrative reconstruction
- `/app/investigations/:id/report` — investigation report

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Type check:

```bash
npm run typecheck
```

Configure the backend with `VITE_API_BASE_URL` using `.env.example`. Development fixtures and API integration remain separated in `src/services`.

## Design notes

The public landing page is an editorial, light-toned product introduction. The investigation application uses a dark navy sidebar with a light analytical workspace, cobalt/blue analytical elements and restrained amber accents. The sidebar navigation scrolls independently from the main workspace and keeps all eight destinations visible; case-specific destinations remain disabled until a case or event is selected.

## Responsible-use note

EVIDENTIA supports investigation and review. It does not determine legal responsibility or conclusively establish fault. Observations, witness claims and AI-generated inferences must remain distinct. Incomparable timestamps must not be forced into a false chronological order. Vehicle positions in the reconstruction are illustrative unless validated measurements are supplied.

## Image assets

See `IMAGE_ATTRIBUTION.md` for the Unsplash image sources used by the landing page. Before public launch, consider downloading approved licensed assets into `public/images/` and updating the references to use local files.
