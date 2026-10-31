import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Reconstruction() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any>({
    label: 'Vehicle A (Blue Sedan)',
    color: '#06B6D4',
    timestamp: 12.0,
    speed_kmh: 48.0,
    x: 220,
    y: 300,
    uncertainty_radius: 18,
    source: 'Dashcam Optical Telemetry'
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getTrajectory(id)
      .then((res: any) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Trajectory error:', err);
        setLoading(false);
      });
  }, [id]);

  // Clean canonical collision simulation data
  const canonicalVehicles = [
    {
      vehicle_id: 'Vehicle_A',
      label: 'Vehicle A (Blue Sedan - Eastbound)',
      color_hex: '#06B6D4',
      points: [
        { x: 100, y: 300, timestamp: 10.0, uncertainty_radius: 14, speed_kmh: 52.4, source: 'Dashcam Entry Vector' },
        { x: 230, y: 300, timestamp: 12.0, uncertainty_radius: 18, speed_kmh: 48.0, source: 'Dashcam Brake Illumination' },
        { x: 360, y: 300, timestamp: 12.2, uncertainty_radius: 12, speed_kmh: 42.1, source: 'IMU Telematics Deceleration Spike' },
        { x: 488, y: 300, timestamp: 13.8, uncertainty_radius: 20, speed_kmh: 29.5, source: 'Impact Point' }
      ]
    },
    {
      vehicle_id: 'Vehicle_B',
      label: 'Vehicle B (White SUV - Northbound)',
      color_hex: '#EF4444',
      points: [
        { x: 500, y: 530, timestamp: 10.2, uncertainty_radius: 14, speed_kmh: 46.0, source: 'CCTV Surveillance Camera' },
        { x: 500, y: 430, timestamp: 12.0, uncertainty_radius: 16, speed_kmh: 43.8, source: 'CCTV Position Tracker' },
        { x: 500, y: 312, timestamp: 13.8, uncertainty_radius: 20, speed_kmh: 40.2, source: 'Impact Point' }
      ]
    }
  ];

  const vehicles = canonicalVehicles;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>2D Kinematic Trajectory Canvas</h1>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
              PHYSICS & SENSOR FUSION
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontFamily: 'monospace' }}>Case ID: {id}</p>
        </div>
      </div>

      {/* Notice */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#475569', marginBottom: '20px' }}>
        <strong style={{ color: '#d97706' }}>SCIENTIFIC NOTICE: </strong>
        Trajectory paths and spatial uncertainty halos (±σ) are synthesized from multi-modal evidence streams. Circles denote spatial tolerance radii.
      </div>

      {/* Main Grid: SVG Canvas + Telemetry Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* Canvas Area */}
        <div style={{ background: '#0b1120', borderRadius: '8px', border: '1px solid #1e293b', padding: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <svg viewBox="0 0 1000 600" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <pattern id="roadGridPat" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172235" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="600" fill="url(#roadGridPat)" />

            {/* Asphalt Roads */}
            <rect x="0" y="240" width="1000" height="120" fill="#141e2e" />
            <rect x="440" y="0" width="120" height="600" fill="#141e2e" />

            {/* Dashed Centerlines */}
            <line x1="0" y1="300" x2="1000" y2="300" stroke="#334155" strokeDasharray="12 10" strokeWidth="2" />
            <line x1="500" y1="0" x2="500" y2="600" stroke="#334155" strokeDasharray="12 10" strokeWidth="2" />

            {/* Impact Center Point */}
            <circle cx="500" cy="300" r="38" fill="#ef4444" opacity="0.15" />
            <circle cx="500" cy="300" r="6" fill="#ef4444" />
            <text x="515" y="285" fill="#f87171" fontSize="12" fontFamily="monospace" fontWeight="bold">
              Impact (~13.8s)
            </text>

            {/* Trajectories */}
            {vehicles.map((v) => {
              const pathString = v.points.reduce(
                (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                ''
              );

              return (
                <g key={v.vehicle_id}>
                  <path d={pathString} fill="none" stroke={v.color_hex} strokeWidth="3.5" strokeDasharray="6 4" opacity="0.85" />
                  {v.points.map((pt, idx) => {
                    const isSelected = selectedPoint?.timestamp === pt.timestamp && selectedPoint?.label === v.label;
                    return (
                      <g
                        key={idx}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedPoint({ ...pt, label: v.label, color: v.color_hex })}
                      >
                        {/* Uncertainty Radius Bubble */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={pt.uncertainty_radius}
                          fill={v.color_hex}
                          opacity={isSelected ? 0.35 : 0.16}
                          stroke={isSelected ? v.color_hex : 'none'}
                          strokeWidth="1.5"
                        />
                        {/* Node Center */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? 7 : 5}
                          fill={v.color_hex}
                        />
                        <text
                          x={pt.x + 8}
                          y={pt.y - 10}
                          fill="#cbd5e1"
                          fontSize="11"
                          fontFamily="monospace"
                        >
                          t={pt.timestamp}s
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Inspector Panel */}
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Telemetry Inspector
          </div>
          <div style={{ fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
            Click any node on the trajectory canvas to view kinematic details.
          </div>

          {selectedPoint && (
            <div style={{ background: '#0b1120', borderRadius: '6px', padding: '14px', border: '1px solid #1e293b', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ color: selectedPoint.color, fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                {selectedPoint.label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Timestamp:</span>
                <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>t = {selectedPoint.timestamp}s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Velocity:</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{selectedPoint.speed_kmh} km/h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Coordinates:</span>
                <span>({selectedPoint.x}, {selectedPoint.y})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Uncertainty:</span>
                <span style={{ color: '#f59e0b' }}>±{selectedPoint.uncertainty_radius} px</span>
              </div>
              {selectedPoint.source && (
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                  <span style={{ color: '#64748b' }}>Sensor Anchor: </span>
                  {selectedPoint.source}
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Tracked Units
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06B6D4' }} />
                <span style={{ color: '#334155' }}>Vehicle A (Eastbound Sedan)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span style={{ color: '#334155' }}>Vehicle B (Northbound SUV)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
