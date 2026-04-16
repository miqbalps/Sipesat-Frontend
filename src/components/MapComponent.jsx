import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { createRoot } from 'react-dom/client';

function getStatusConfig(status) {
  if (status === 'Selesai') {
    return { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle2, label: 'Selesai' }; // emerald
  }
  if (status === 'Dijadwalkan') {
    return { color: '#f59e0b', bgColor: '#fef3c7', icon: Clock, label: 'Dijadwalkan' }; // amber
  }
  return { color: '#ef4444', bgColor: '#fee2e2', icon: AlertCircle, label: 'Pending' }; // red
}

function createCustomMarker(status) {
  const config = getStatusConfig(status);
  
  let iconSVG = '';
  
  // Create appropriate SVG icon based on status
  if (status === 'Selesai') {
    // CheckCircle2 - simple checkmark
    iconSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 12l2 2 4-4"/>
      </svg>
    `;
  } else if (status === 'Dijadwalkan') {
    // Clock - just hands
    iconSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 6v6l4 2"/>
      </svg>
    `;
  } else {
    // AlertCircle - just exclamation mark style
    iconSVG = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 9v2M12 17h.01"/>
      </svg>
    `;
  }
  
  const html = `
    <div style="
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${config.bgColor};
      border: 2.5px solid ${config.color};
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    ">
      ${iconSVG}
    </div>
  `;
  
  return L.divIcon({
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
    className: 'custom-marker-icon'
  });
}

function LocationSelector({ enabled, onSelect, selectedPosition, onInternalChange }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onInternalChange(e.latlng);
      if (onSelect) onSelect(e.latlng);
    },
  });

  if (!enabled) return null;
  if (!selectedPosition) return null;

  return (
    <Marker
      position={[selectedPosition.lat, selectedPosition.lng]}
      icon={L.divIcon({
        html: '<div style="width:30px;height:30px;background:#059669;border:3px solid #047857;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.2)"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'location-selector-marker'
      })}
    />
  );
}

export default function MapComponent({
  role,
  reports = [],
  onLocationSelect,
  selectedPosition,
  center = [-6.8915, 107.633],
  zoom = 13,
}) {
  const [internalSelected, setInternalSelected] = useState(null);
  const effectiveSelected = selectedPosition || internalSelected;

  const normalizedReports = useMemo(() => {
    return (reports || [])
      .filter((r) => r && r.lat != null && r.lng != null)
      .map((r) => ({
        ...r,
        lat: Number(r.lat),
        lng: Number(r.lng),
      }))
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
  }, [reports]);

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border relative z-10">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" style={{ zIndex: 10 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {normalizedReports.map((rep) => {
          return (
            <Marker
              key={rep.id}
              position={[rep.lat, rep.lng]}
              icon={createCustomMarker(rep.status)}
            >
              <Popup>
                <div className="space-y-2">
                  <img src={rep.photo_url} alt="foto laporan" style={{ width: 220, maxWidth: '100%', borderRadius: 8 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Laporan #{rep.id}</div>
                    {rep.reporter_name ? <div style={{ fontSize: 12 }}>Pelapor: {rep.reporter_name}</div> : null}
                    {rep.description ? <div style={{ marginTop: 6 }}>{rep.description}</div> : null}
                    <div style={{ marginTop: 6 }}>
                      <b>Status:</b> {rep.status}
                    </div>
                    {rep.pickup_date && rep.pickup_time ? (
                      <div style={{ marginTop: 6 }}>
                        <b>Pickup:</b> {rep.pickup_date} • {String(rep.pickup_time).slice(0, 5)}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <LocationSelector
          enabled={role === 'masyarakat'}
          onSelect={onLocationSelect}
          selectedPosition={effectiveSelected}
          onInternalChange={setInternalSelected}
        />
      </MapContainer>
    </div>
  );
}
