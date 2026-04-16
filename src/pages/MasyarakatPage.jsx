import { useEffect, useMemo, useState } from 'react';
import { Camera, MapPin, Send } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

function statusBadgeVariant(status) {
  if (status === 'Selesai') return 'done';
  if (status === 'Dijadwalkan') return 'scheduled';
  return 'pending';
}

export default function MasyarakatPage({ user }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => !!photo && !!selected && !isSubmitting, [photo, selected, isSubmitting]);

  async function loadReports() {
    setIsLoading(true);
    try {
      const res = await api.get('/reports');
      setReports(res.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || 'Gagal memuat laporan.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submitReport() {
    if (!photo || !selected) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('photo', photo);
      fd.append('lat', String(selected.lat));
      fd.append('lng', String(selected.lng));
      fd.append('description', description);

      await api.post('/reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPhoto(null);
      setDescription('');
      setSelected(null);
      await loadReports();
      alert('Laporan terkirim!');
    } catch (e) {
      alert(e?.response?.data?.message || 'Gagal mengirim laporan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-brand-700" />
              Buat Laporan Sampah
            </CardTitle>
            <CardDescription>Upload foto, pilih titik lokasi di peta, lalu kirim.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Foto</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              <div className="text-xs text-slate-500">JPG/PNG/WEBP, maks 5MB.</div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                placeholder="Contoh: Tumpukan sampah di dekat jembatan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="rounded-lg border bg-slate-50 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <MapPin className="h-4 w-4 text-brand-700" />
                Lokasi dipilih
              </div>
              <div className="mt-1 font-mono text-xs text-slate-700">
                {selected ? `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}` : 'Belum dipilih (klik peta).'}
              </div>
            </div>

            <Button className="w-full" onClick={submitReport} disabled={!canSubmit}>
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Peta</CardTitle>
            <CardDescription>Klik peta untuk menentukan titik laporan.</CardDescription>
          </CardHeader>
          <CardContent>
            <MapComponent role="masyarakat" reports={reports} onLocationSelect={setSelected} selectedPosition={selected} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Laporan</CardTitle>
          <CardDescription>
            {isLoading ? 'Memuat...' : `${reports.length} laporan untuk ${user.name}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!reports.length ? (
            <div className="text-sm text-slate-500">Belum ada laporan.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reports.map((r) => (
                <div key={r.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900">Laporan #{r.id}</div>
                        <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}
                      </div>
                    </div>
                    <a href={r.photo_url} target="_blank" rel="noreferrer" className="text-sm text-brand-700 hover:underline">
                      Lihat foto
                    </a>
                  </div>

                  {r.description ? <div className="mt-3 text-sm text-slate-700">{r.description}</div> : null}

                  {r.pickup_date && r.pickup_time ? (
                    <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-sm">
                      <div className="font-medium text-slate-900">Jadwal pickup</div>
                      <div className="text-slate-700">
                        {r.pickup_date} • {String(r.pickup_time).slice(0, 5)}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
