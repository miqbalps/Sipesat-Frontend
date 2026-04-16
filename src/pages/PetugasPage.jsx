import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ClipboardList, MapPinned, RefreshCw } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

function statusBadgeVariant(status) {
  if (status === 'Selesai') return 'done';
  if (status === 'Dijadwalkan') return 'scheduled';
  return 'pending';
}

export default function PetugasPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const counts = useMemo(() => {
    const c = { Pending: 0, Dijadwalkan: 0, Selesai: 0 };
    for (const r of reports) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [reports]);

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

  function openScheduleModal(report) {
    setActiveReport(report);
    setPickupDate(report.pickup_date || '');
    setPickupTime(report.pickup_time ? String(report.pickup_time).slice(0, 5) : '');
    setScheduleOpen(true);
  }

  async function saveSchedule() {
    if (!activeReport) return;
    setIsSavingSchedule(true);
    try {
      await api.post(`/reports/${activeReport.id}/schedule`, {
        pickup_date: pickupDate,
        pickup_time: pickupTime,
      });
      setScheduleOpen(false);
      setActiveReport(null);
      await loadReports();
      alert('Jadwal tersimpan.');
    } catch (e) {
      alert(e?.response?.data?.message || 'Gagal menyimpan jadwal.');
    } finally {
      setIsSavingSchedule(false);
    }
  }

  async function updateStatus(reportId, status) {
    try {
      await api.patch(`/reports/${reportId}/status`, { status });
      await loadReports();
    } catch (e) {
      alert(e?.response?.data?.message || 'Gagal update status.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-brand-700" />
              Monitoring Peta
            </CardTitle>
            <CardDescription>Titik: Pending (merah), Dijadwalkan (kuning), Selesai (hijau).</CardDescription>
          </CardHeader>
          <CardContent>
            <MapComponent role="petugas" reports={reports} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-700" />
              Ringkasan
            </CardTitle>
            <CardDescription>{isLoading ? 'Memuat...' : 'Jumlah laporan per status.'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="text-sm font-medium">Pending</div>
              <Badge variant="pending">{counts.Pending || 0}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="text-sm font-medium">Dijadwalkan</div>
              <Badge variant="scheduled">{counts.Dijadwalkan || 0}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="text-sm font-medium">Selesai</div>
              <Badge variant="done">{counts.Selesai || 0}</Badge>
            </div>

            <Button variant="outline" className="w-full" onClick={loadReports} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-brand-700" />
            Daftar Laporan
          </CardTitle>
          <CardDescription>{isLoading ? 'Memuat...' : `${reports.length} laporan.`}</CardDescription>
        </CardHeader>
        <CardContent>
          {!reports.length ? (
            <div className="text-sm text-slate-500">Belum ada laporan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-700">
                    <th className="p-3">ID</th>
                    <th className="p-3">Pelapor</th>
                    <th className="p-3">Deskripsi</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Jadwal</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3 font-mono">#{r.id}</td>
                      <td className="p-3">{r.reporter_name || '-'}</td>
                      <td className="p-3">
                        <div className="max-w-[360px] overflow-hidden text-ellipsis whitespace-nowrap text-slate-700">
                          {r.description || '-'}
                        </div>
                        <div className="mt-1 text-xs font-mono text-slate-500">
                          {Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}
                        </div>
                        <a href={r.photo_url} target="_blank" rel="noreferrer" className="text-xs text-brand-700 hover:underline">
                          Lihat foto
                        </a>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                          <select
                            className="h-9 w-full rounded-md border bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Dijadwalkan">Dijadwalkan</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        {r.pickup_date && r.pickup_time ? (
                          <div>
                            <div className="font-medium">{r.pickup_date}</div>
                            <div className="text-xs text-slate-500">{String(r.pickup_time).slice(0, 5)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" onClick={() => openScheduleModal(r)}>
                          Atur Jadwal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Pickup</DialogTitle>
            <DialogDescription>
              Laporan {activeReport ? `#${activeReport.id}` : ''}. Isi tanggal dan jam penjemputan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pickupDate">Tanggal</Label>
              <Input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Jam</Label>
              <Input id="pickupTime" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)} disabled={isSavingSchedule}>
              Batal
            </Button>
            <Button onClick={saveSchedule} disabled={isSavingSchedule || !pickupDate || !pickupTime}>
              {isSavingSchedule ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
