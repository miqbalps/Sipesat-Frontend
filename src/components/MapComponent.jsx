import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';

function colorByStatus(status) {
  if (status === 'Selesai') return '#10b981'; // emerald-500
  if (status === 'Dijadwalkan') return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
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
    <CircleMarker
      center={[selectedPosition.lat, selectedPosition.lng]}
      radius={10}
      pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.9 }}
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
    <div className="h-[420px] w-full overflow-hidden rounded-xl border">
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {normalizedReports.map((rep) => {
          const color = colorByStatus(rep.status);
          return (
            <CircleMarker
              key={rep.id}
              center={[rep.lat, rep.lng]}
              radius={9}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.85 }}
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
            </CircleMarker>
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
