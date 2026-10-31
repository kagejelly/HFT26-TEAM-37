import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Info } from 'lucide-react';
import { api } from '../services/api';
import type { Event, EvidenceType } from '../types';
import { PageTitle, Loading, ErrorState, SourceIcon, StatusBadge } from '../components/common/UI';

const labels: Record<EvidenceType, string> = {
  video: 'Video footage',
  witness: 'Witness account',
  sensor: 'Sensor record'
};

function formatEventTime(e: any): string {
  if (e.metadata?.clock_iso) {
    try {
      return new Date(e.metadata.clock_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {}
  }
  if (typeof e.timestamp === 'string' && isNaN(Number(e.timestamp))) {
    try {
      const d = new Date(e.timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    } catch {}
  }
  if (typeof e.timestamp === 'number' || (typeof e.timestamp === 'string' && !isNaN(Number(e.timestamp)))) {
    return `t = ${Number(e.timestamp).toFixed(1)}s`;
  }
  return e.originalTimestamp || '00:00:00';
}

export default function Timeline() {
  const { id = '' } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.listEvents(id)
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const visible = useMemo(
    () => events.filter(e => filter === 'all' || e.sourceType === filter),
    [events, filter]
  );

  const comparable = visible
    .filter(e => e.timestamp !== undefined && e.timestamp !== null)
    .sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));

  const incomparable = visible.filter(e => e.timestamp === undefined || e.timestamp === null);

  return (
    <>
      <PageTitle
        eyebrow="CASE WORKSPACE / ANALYSIS"
        title="Forensic timeline"
        description="Compare recorded events while preserving each source’s original time basis."
        action={
          <div className="filter-control">
            <Filter size={15} />
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All sources</option>
              <option value="video">Video</option>
              <option value="witness">Witness</option>
              <option value="sensor">Sensor</option>
            </select>
          </div>
        }
      />

      {error && <ErrorState message={error} />}

      <div className="timeline-legend">
        {(['video', 'witness', 'sensor'] as EvidenceType[]).map(t => (
          <span key={t}>
            <i className={`legend-dot ${t}`} />
            {labels[t]}
          </span>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <section className="panel timeline-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">CHRONOLOGICAL ALIGNMENT</div>
                <h2>Comparable events</h2>
                <p>Synchronized events mapped across multi-modal sensor and witness streams.</p>
              </div>
              <span className="count-pill">{comparable.length} events</span>
            </div>

            {comparable.length === 0 ? (
              <div className="inline-empty">No events available on timeline.</div>
            ) : (
              <>
                <div className="time-axis">
                  <div className="axis-line" />
                  {comparable.map((e, i) => (
                    <Link
                      key={e.id}
                      to={`/app/investigations/${id}/events/${e.id}`}
                      state={{ selectedEventId: e.id }}
                      className="axis-event"
                      style={{
                        left: `${comparable.length === 1 ? 50 : 8 + (i * 84) / (comparable.length - 1)}%`
                      }}
                    >
                      <span className={`axis-marker ${e.sourceType}`} />
                      <small>{formatEventTime(e)}</small>
                      <b>{e.eventType}</b>
                    </Link>
                  ))}
                </div>

                <div className="timeline-event-list">
                  {comparable.map(e => (
                    <Link
                      className="timeline-row"
                      to={`/app/investigations/${id}/events/${e.id}`}
                      state={{ selectedEventId: e.id }}
                      key={e.id}
                    >
                      <SourceIcon type={e.sourceType} />
                      <div className="timeline-row-main">
                        <b>{e.eventType}</b>
                        <small>{e.description}</small>
                      </div>
                      <div className="timeline-row-time">{formatEventTime(e)}</div>
                      <span className="row-chevron">↗</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          {incomparable.length > 0 && (
            <section className="panel timing-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">SEPARATE TIME BASIS</div>
                  <h2>Timing not comparable</h2>
                  <p>Relative or unanchored claims kept separate from chronological axis.</p>
                </div>
                <span className="count-pill amber-pill">{incomparable.length} events</span>
              </div>
              {incomparable.map(e => (
                <Link
                  className="timeline-row"
                  to={`/app/investigations/${id}/events/${e.id}`}
                  state={{ selectedEventId: e.id }}
                  key={e.id}
                >
                  <SourceIcon type={e.sourceType} />
                  <div className="timeline-row-main">
                    <b>{e.eventType}</b>
                    <small>{e.description}</small>
                    <span className="time-basis">
                      {e.originalTimestamp || 'Timestamp unknown'} · {e.timestampType} time
                    </span>
                  </div>
                  <StatusBadge status={e.classification || 'Unclassified'} />
                  <span className="row-chevron">↗</span>
                </Link>
              ))}
            </section>
          )}

          <div className="dashboard-note">
            <Info size={17} />
            <p>
              Forensic ground-truth preservation: Video observations and sensor telemetry are prioritized over subjective eyewitness statements during contradiction reconciliation.
            </p>
          </div>
        </>
      )}
    </>
  );
}
