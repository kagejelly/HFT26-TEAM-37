import type { Evidence, EvidenceType, Event, Investigation, Report } from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? value as UnknownRecord : {};
}

function first(source: UnknownRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  const obj = record(value);
  const nested = first(obj, 'data', 'items', 'results', 'investigations', 'evidence', 'events');
  return Array.isArray(nested) ? nested as T[] : [];
}

function normalizeStatus(value: unknown): Investigation['status'] {
  const status = asString(value, 'Open').toLowerCase().replace(/[_-]/g, ' ');
  if (status.includes('complete') || status === 'done') return 'Completed';
  if (status.includes('review')) return 'In review';
  if (status.includes('process')) return 'Processing';
  if (status.includes('queue') || status.includes('pending')) return 'Queued';
  if (status.includes('fail') || status.includes('error')) return 'Failed';
  return 'Open';
}

function normalizeInvestigation(value: unknown): Investigation {
  const x = record(value);
  return {
    id: asString(first(x, 'id', 'investigation_id', 'case_id')),
    title: asString(first(x, 'title', 'name'), 'Untitled investigation'),
    incidentDate: asString(first(x, 'incidentDate', 'incident_date', 'date')),
    incidentTime: asString(first(x, 'incidentTime', 'incident_time', 'time')) || undefined,
    timeUnknown: Boolean(first(x, 'timeUnknown', 'time_unknown')),
    location: asString(first(x, 'location', 'incident_location')) || undefined,
    description: asString(first(x, 'description', 'summary')) || undefined,
    reference: asString(first(x, 'reference', 'case_reference', 'reference_number')) || undefined,
    status: normalizeStatus(first(x, 'status', 'state')),
    createdAt: asString(first(x, 'createdAt', 'created_at')),
    updatedAt: asString(first(x, 'updatedAt', 'updated_at', 'modified_at')),
  };
}

function normalizeEvidence(value: unknown, investigationId: string): Evidence {
  const x = record(value);
  const rawType = asString(first(x, 'type', 'evidence_type', 'source_type'), 'video').toLowerCase();
  const type: EvidenceType = rawType === 'witness' ? 'witness' : rawType === 'sensor' ? 'sensor' : 'video';
  const rawStatus = asString(first(x, 'status', 'processing_status'), 'queued').toLowerCase();
  const status: Evidence['status'] =
    rawStatus.includes('complete') ? 'Completed' :
    rawStatus.includes('process') ? 'Processing' :
    rawStatus.includes('fail') || rawStatus.includes('error') ? 'Failed' : 'Queued';
  const size = first(x, 'size', 'size_bytes', 'file_size');
  return {
    id: asString(first(x, 'id', 'evidence_id')),
    investigationId: asString(first(x, 'investigationId', 'investigation_id'), investigationId),
    type,
    filename: asString(first(x, 'filename', 'file_name', 'original_filename', 'name'), 'Uploaded evidence'),
    uploadedAt: asString(first(x, 'uploadedAt', 'uploaded_at', 'created_at')),
    status,
    error: asString(first(x, 'error', 'error_message')) || undefined,
    size: typeof size === 'number' ? size : undefined,
  };
}

function normalizeEvent(value: unknown, investigationId: string): Event {
  const x = record(value);
  const rawSource = asString(first(x, 'sourceType', 'source_type', 'evidence_type'), 'video').toLowerCase();
  const sourceType: EvidenceType = rawSource === 'witness' ? 'witness' : rawSource === 'sensor' ? 'sensor' : 'video';
  const rawTimestampType = asString(first(x, 'timestampType', 'timestamp_type', 'time_basis'), '').toLowerCase();
  const timestampType: Event['timestampType'] =
    rawTimestampType.includes('relative') ? 'relative' :
    rawTimestampType.includes('unknown') || rawTimestampType === '' ? 'unknown' : 'absolute';
  const rawReference = record(first(x, 'reference', 'source_reference', 'locator'));
  const confidence = first(x, 'confidence', 'confidence_score');
  return {
    id: asString(first(x, 'id', 'event_id')),
    investigationId: asString(first(x, 'investigationId', 'investigation_id'), investigationId),
    sourceType,
    eventType: asString(first(x, 'eventType', 'event_type', 'type', 'label'), 'Recorded event'),
    timestamp: asString(first(x, 'timestamp', 'normalized_timestamp', 'normalized_time')) || undefined,
    originalTimestamp: asString(first(x, 'originalTimestamp', 'original_timestamp', 'source_timestamp')) || undefined,
    timestampType,
    timestampUncertainty: asString(first(x, 'timestampUncertainty', 'timestamp_uncertainty', 'time_uncertainty')) || undefined,
    description: asString(first(x, 'description', 'details', 'observation', 'claim'), 'No description supplied.'),
    vehicleLabel: asString(first(x, 'vehicleLabel', 'vehicle_label', 'vehicle_id')) || undefined,
    confidence: typeof confidence === 'number' ? confidence : undefined,
    classification: asString(first(x, 'classification', 'event_classification')) || undefined,
    reference: Object.keys(rawReference).length ? {
      evidenceId: asString(first(rawReference, 'evidenceId', 'evidence_id')) || undefined,
      filename: asString(first(rawReference, 'filename', 'file_name')) || undefined,
      frame: typeof first(rawReference, 'frame', 'frame_number') === 'number' ? first(rawReference, 'frame', 'frame_number') as number : undefined,
      videoTime: asString(first(rawReference, 'videoTime', 'video_time')) || undefined,
      page: typeof rawReference.page === 'number' ? rawReference.page : undefined,
      paragraph: asString(rawReference.paragraph) || undefined,
      row: asString(first(rawReference, 'row', 'row_id', 'record_id')) || undefined,
      sensorId: asString(first(rawReference, 'sensorId', 'sensor_id')) || undefined,
      excerpt: asString(rawReference.excerpt) || undefined,
    } : undefined,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error('VITE_API_BASE_URL is not configured. Add it to .env.local and restart Vite.');
  const response = await fetch(`${BASE}${path}`, init);
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = record(await response.json());
      message = asString(first(body, 'detail', 'message', 'error'), message);
    } catch { /* response was not JSON */ }
    throw Object.assign(new Error(message), { status: response.status });
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function run<T>(real: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (USE_MOCKS) return fallback();
  return real();
}

export const api = {
  async listInvestigations(): Promise<Investigation[]> {
    return run(async () => asArray(await request<unknown>('/investigations')).map(normalizeInvestigation), async () => (await import('./mockApi')).mockApi.listInvestigations());
  },

  async getInvestigation(id: string): Promise<Investigation | null> {
    return run(async () => normalizeInvestigation(await request<unknown>(`/investigations/${encodeURIComponent(id)}`)), async () => (await import('./mockApi')).mockApi.getInvestigation(id));
  },

  async createInvestigation(body: Partial<Investigation>): Promise<Investigation> {
    return run(async () => normalizeInvestigation(await request<unknown>('/investigations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: body.title,
        incident_date: body.incidentDate,
        location: body.location,
        description: body.description,
      }),
    })), async () => (await import('./mockApi')).mockApi.createInvestigation(body));
  },

  async listEvidence(id: string): Promise<Evidence[]> {
    return run(async () => asArray(await request<unknown>(`/investigations/${encodeURIComponent(id)}/evidence`)).map(item => normalizeEvidence(item, id)), async () => (await import('./mockApi')).mockApi.listEvidence(id));
  },

  async uploadEvidence(id: string, file: File, type: EvidenceType, onProgress?: (n: number) => void): Promise<Evidence> {
    return run(async () => {
      const form = new FormData();
      form.append('file', file);
      form.append('evidence_type', type);
      onProgress?.(0);
      const result = await request<unknown>(`/investigations/${encodeURIComponent(id)}/evidence`, { method: 'POST', body: form });
      onProgress?.(100);
      return normalizeEvidence(result, id);
    }, async () => (await import('./mockApi')).mockApi.uploadEvidence(id, file, type));
  },

  async listEvents(id: string): Promise<Event[]> {
    return run(async () => asArray(await request<unknown>(`/investigations/${encodeURIComponent(id)}/events`)).map(item => normalizeEvent(item, id)), async () => (await import('./mockApi')).mockApi.listEvents(id));
  },

  async getEvent(id: string, eventId: string): Promise<Event | null> {
    // The supplied backend hand-off does not document a single-event endpoint.
    // Resolve event detail from the documented investigation events collection.
    return run(async () => (await api.listEvents(id)).find(event => event.id === eventId) ?? null, async () => (await import('./mockApi')).mockApi.getEvent(id, eventId));
  },

  async getConflicts(id: string): Promise<unknown> {
    return run(() => request<unknown>(`/investigations/${encodeURIComponent(id)}/conflicts`), async () => []);
  },

  async getTrajectory(id: string): Promise<unknown> {
    return run(() => request<unknown>(`/investigations/${encodeURIComponent(id)}/trajectory`), async () => null);
  },

  async getReport(id: string): Promise<Report | null> {
    return run(async () => {
      const raw = record(await request<unknown>(`/investigations/${encodeURIComponent(id)}/report`));
      const investigationRaw = first(raw, 'investigation', 'case') ?? await request<unknown>(`/investigations/${encodeURIComponent(id)}`);
      const evidenceRaw = first(raw, 'evidence', 'evidence_records') ?? await request<unknown>(`/investigations/${encodeURIComponent(id)}/evidence`);
      const eventsRaw = first(raw, 'events', 'timeline_events') ?? await request<unknown>(`/investigations/${encodeURIComponent(id)}/events`);
      const conflictsRaw = first(raw, 'conflicts', 'contradictions') ?? await api.getConflicts(id);
      const conflictItems = asArray<unknown>(conflictsRaw);
      const gapItems = asArray<unknown>(first(raw, 'gaps', 'evidence_gaps'));
      const limitationsRaw = first(raw, 'limitations', 'caveats');
      return {
        investigation: normalizeInvestigation(investigationRaw),
        evidence: asArray(evidenceRaw).map(item => normalizeEvidence(item, id)),
        events: asArray(eventsRaw).map(item => normalizeEvent(item, id)),
        conflicts: conflictItems.map(item => typeof item === 'string' ? item : asString(first(record(item), 'description', 'message', 'title', 'detail'), 'Conflict returned by backend')),
        gaps: gapItems.map(item => typeof item === 'string' ? item : asString(first(record(item), 'description', 'message', 'title', 'detail'), 'Evidence gap returned by backend')),
        limitations: Array.isArray(limitationsRaw) ? limitationsRaw.map(item => asString(item)) : [],
      };
    }, async () => (await import('./mockApi')).mockApi.getReport(id));
  },
};
