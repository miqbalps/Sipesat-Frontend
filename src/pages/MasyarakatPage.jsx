import { useEffect, useMemo, useState } from 'react';
import { Camera, MapPin, Send, Image as ImageIcon, AlertCircle } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

function statusBadgeClass(status) {
  if (status === 'Selesai') return 'bg-emerald-100 text-emerald-800';
  if (status === 'Dijadwalkan') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export default function MasyarakatPage({ user }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => !!photo && !!selected && !isSubmitting, [photo, selected, isSubmitting]);

  // Filter reports by date range
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filterStartDate && new Date(r.created_at) < new Date(filterStartDate)) return false;
      if (filterEndDate && new Date(r.created_at) > new Date(filterEndDate)) return false;
      return true;
    });
  }, [reports, filterStartDate, filterEndDate]);

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
      {/* Form & Map Section - Mobile stacked, Desktop side by side */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form Card */}
        <Card className="border-0 lg:col-span-2 bg-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <Camera className="h-24 w-24 text-emerald-600 rotate-45" />
          </div>

          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-emerald-200">
                <Camera className="h-5 w-5 text-emerald-600" />
              </div>
              Buat Laporan
            </CardTitle>
            <CardDescription>Foto + Lokasi + Deskripsi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 relative z-10">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Foto Sampah</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="h-10 cursor-pointer"
              />
              {photo && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">
                  <ImageIcon className="h-4 w-4" />
                  {photo.name}
                </div>
              )}
              <div className="text-xs text-muted-foreground">JPG/PNG/WEBP, maks 5MB</div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Deskripsi (opsional)</Label>
              <Textarea
                placeholder="Jelaskan kondisi sampah, lokasi detail, dsb..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Location Display */}
            <div className={`rounded-lg p-3 border ${selected ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 font-medium text-sm mb-1">
                <MapPin className="h-4 w-4" />
                <span>Lokasi</span>
              </div>
              <div className="font-mono text-xs">
                {selected ? `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}` : 'Belum dipilih (klik peta)'}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              className="h-11 w-full gap-2 font-semibold" 
              onClick={submitReport} 
              disabled={!canSubmit}
            >
              <Send className="h-5 w-5" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="border-0 lg:col-span-3 bg-white relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
            <MapPin className="h-24 w-24 text-emerald-600 -rotate-45" />
          </div>

          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-xl">Peta Lokasi</CardTitle>
            <CardDescription>Klik untuk memilih titik laporan</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="rounded-lg overflow-hidden">
              <MapComponent 
                role="masyarakat" 
                reports={reports} 
                onLocationSelect={setSelected} 
                selectedPosition={selected} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <Card className="border-0 bg-white relative overflow-hidden">
        <div className="absolute -bottom-8 -left-8 opacity-5 pointer-events-none">
          <AlertCircle className="h-32 w-32 text-emerald-600 rotate-45" />
        </div>

        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="text-xl">Riwayat Laporan</CardTitle>
          <CardDescription>
            {isLoading ? 'Memuat...' : `${filteredReports.length} laporan untuk ${user.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Date Filter */}
          <div className="grid gap-4 sm:grid-cols-2 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="filterStart" className="text-sm font-semibold">Dari Tanggal</Label>
              <Input 
                id="filterStart"
                type="date" 
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterEnd" className="text-sm font-semibold">Sampai Tanggal</Label>
              <Input 
                id="filterEnd"
                type="date" 
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Reports List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div>Memuat data...</div>
            </div>
          ) : !filteredReports.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <div className="text-sm text-muted-foreground">Belum ada laporan</div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((r) => (
                <div key={r.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                    <ImageIcon className="h-16 w-16 text-emerald-600" />
                  </div>

                  <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-sm text-foreground">#{r.id}</div>
                        <Badge className={statusBadgeClass(r.status)}>
                          {r.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}
                      </div>
                    </div>
                  </div>

                  {r.description && (
                    <div className="text-sm text-foreground/80 mb-3 line-clamp-2 relative z-10">
                      {r.description}
                    </div>
                  )}

                  {r.pickup_date && r.pickup_time && (
                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-2 mb-3 text-xs relative z-10">
                      <div className="font-semibold text-amber-900">Jadwal Pickup</div>
                      <div className="text-amber-800">
                        {r.pickup_date} • {String(r.pickup_time).slice(0, 5)}
                      </div>
                    </div>
                  )}

                  <a 
                    href={r.photo_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium relative z-10"
                  >
                    Lihat Foto →
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
