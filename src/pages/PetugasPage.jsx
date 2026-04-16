import { useEffect, useMemo, useState, useContext } from 'react';
import { MapPinned, BarChart3, Clock, RefreshCw, CheckCircle2, AlertCircle, Bell } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { api } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { NotificationContext } from '../contexts/NotificationContext';

function statusBadgeClass(status) {
  if (status === 'Selesai') return 'bg-emerald-100 text-emerald-800';
  if (status === 'Dijadwalkan') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export default function PetugasPage() {
  const { addNotification } = useContext(NotificationContext);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReportsCount, setNewReportsCount] = useState(0);

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
      console.error('Failed to load reports:', e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // Load once on mount only
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
      addNotification('Jadwal pickup tersimpan!', 'success', { duration: 4000, showInDrawer: true });
    } catch (e) {
      addNotification(e?.response?.data?.message || 'Gagal menyimpan jadwal.', 'error', { duration: 4000, showInDrawer: true });
    } finally {
      setIsSavingSchedule(false);
    }
  }

  async function updateStatus(reportId, status) {
    try {
      await api.patch(`/reports/${reportId}/status`, { status });
      await loadReports();
      const statusLabel = status === 'Selesai' ? 'selesai' : status === 'Dijadwalkan' ? 'dijadwalkan' : 'pending';
      addNotification(`Status laporan diubah menjadi ${statusLabel}`, 'info');
    } catch (e) {
      addNotification(e?.response?.data?.message || 'Gagal update status.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Badge untuk laporan baru */}
      {newReportsCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-600" />
            <div className="font-medium text-blue-900">
              {newReportsCount} laporan baru menunggu review
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNewReportsCount(0)}
            className="text-xs"
          >
            Tandai dibaca
          </Button>
        </div>
      )}

      {/* Map & Summary Section - Mobile stacked, Desktop side-by-side */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map */}
        <Card className="border-0 lg:col-span-3 bg-white relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
            <MapPinned className="h-24 w-24 text-emerald-600 rotate-45" />
          </div>

          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-emerald-200">
                <MapPinned className="h-5 w-5 text-emerald-600" />
              </div>
              Monitoring Peta
            </CardTitle>
            <CardDescription>Warna: Merah (Pending), Kuning (Dijadwalkan), Hijau (Selesai)</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="rounded-lg overflow-hidden">
              <MapComponent role="petugas" reports={reports} />
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Card className="border-0 lg:col-span-2 bg-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <BarChart3 className="h-24 w-24 text-blue-600 rotate-45" />
          </div>

          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-blue-200">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              Ringkasan
            </CardTitle>
            <CardDescription>{isLoading ? 'Memuat...' : 'Status laporan'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {/* Pending */}
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <div className="relative z-10">
                <div className="text-xs text-red-600 font-semibold">PENDING</div>
                <div className="text-2xl font-bold text-red-700">{counts.Pending || 0}</div>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 relative z-10" />
            </div>

            {/* Dijadwalkan */}
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <Clock className="h-16 w-16 text-amber-600" />
              </div>
              <div className="relative z-10">
                <div className="text-xs text-amber-600 font-semibold">DIJADWALKAN</div>
                <div className="text-2xl font-bold text-amber-700">{counts.Dijadwalkan || 0}</div>
              </div>
              <Clock className="h-8 w-8 text-amber-600 relative z-10" />
            </div>

            {/* Selesai */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="relative z-10">
                <div className="text-xs text-emerald-600 font-semibold">SELESAI</div>
                <div className="text-2xl font-bold text-emerald-700">{counts.Selesai || 0}</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600 relative z-10" />
            </div>

            <Button 
              variant="outline" 
              className="h-10 w-full gap-2" 
              onClick={loadReports} 
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports List Section */}
      <Card className="border-0 bg-white relative overflow-hidden">
        <div className="absolute -bottom-8 -left-8 opacity-5 pointer-events-none">
          <AlertCircle className="h-32 w-32 text-emerald-600 rotate-45" />
        </div>

        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="text-xl">Daftar Laporan</CardTitle>
          <CardDescription>{isLoading ? 'Memuat...' : `Total ${reports.length} laporan`}</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Memuat data...
            </div>
          ) : !reports.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <div className="text-sm text-muted-foreground">Belum ada laporan</div>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="space-y-3 md:hidden">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                      <AlertCircle className="h-16 w-16 text-emerald-600" />
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">#{r.id}</span>
                          <span className="text-sm text-muted-foreground">{r.reporter_name || 'Anonim'}</span>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}
                        </div>
                      </div>
                      <Badge className={statusBadgeClass(r.status)}>
                        {r.status}
                      </Badge>
                    </div>

                    {r.description && (
                      <div className="text-sm text-foreground/80 mb-3 line-clamp-2 relative z-10">
                        {r.description}
                      </div>
                    )}

                    <div className="space-y-2 mb-3 relative z-10">
                      <select
                        className="h-9 w-full rounded-md border bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Dijadwalkan">Dijadwalkan</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs relative z-10">
                      <div>
                        {r.pickup_date && r.pickup_time ? (
                          <div className="text-muted-foreground">
                            📅 {r.pickup_date} • {String(r.pickup_time).slice(0, 5)}
                          </div>
                        ) : (
                          <div className="text-amber-600 font-medium">Belum dijadwalkan</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="xs" 
                          variant="outline"
                          onClick={() => openScheduleModal(r)}
                          className="text-xs"
                        >
                          Jadwal
                        </Button>
                        <a 
                          href={r.photo_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-block"
                        >
                          <Button size="xs" variant="ghost" className="text-xs">
                            Foto
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Pelapor</th>
                      <th className="p-3 font-semibold">Lokasi & Deskripsi</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Jadwal</th>
                      <th className="p-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-mono font-semibold">#{r.id}</td>
                        <td className="p-3">
                          <div className="font-medium">{r.reporter_name || 'Anonim'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs font-mono text-muted-foreground mb-1">
                            {Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}
                          </div>
                          <div className="max-w-xs truncate text-foreground/80">
                            {r.description || '—'}
                          </div>
                          <a 
                            href={r.photo_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-emerald-600 hover:underline font-medium"
                          >
                            Lihat foto →
                          </a>
                        </td>
                        <td className="p-3">
                          <div className="mb-2">
                            <Badge className={statusBadgeClass(r.status)}>
                              {r.status}
                            </Badge>
                          </div>
                          <select
                            className="h-8 w-full rounded-md border bg-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Dijadwalkan">Dijadwalkan</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>
                        <td className="p-3">
                          {r.pickup_date && r.pickup_time ? (
                            <div className="text-sm">
                              <div className="font-medium">{r.pickup_date}</div>
                              <div className="text-muted-foreground">{String(r.pickup_time).slice(0, 5)}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openScheduleModal(r)}
                            className="text-xs"
                          >
                            Atur Jadwal
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-sm bg-linear-to-br from-white to-gray-50 border-0 overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <Clock className="h-20 w-20 text-emerald-600 rotate-45" />
          </div>

          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Jadwalkan Pickup
            </DialogTitle>
            <DialogDescription>
              Laporan #{activeReport?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="pickupDate" className="font-semibold">Tanggal</Label>
              <Input 
                id="pickupDate" 
                type="date" 
                value={pickupDate} 
                onChange={(e) => setPickupDate(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupTime" className="font-semibold">Jam</Label>
              <Input 
                id="pickupTime" 
                type="time" 
                value={pickupTime} 
                onChange={(e) => setPickupTime(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 relative z-10">
            <Button 
              variant="outline" 
              onClick={() => setScheduleOpen(false)} 
              disabled={isSavingSchedule}
              className="flex-1 h-11"
            >
              Batal
            </Button>
            <Button 
              onClick={saveSchedule} 
              disabled={isSavingSchedule || !pickupDate || !pickupTime}
              className="flex-1 gap-2 h-11"
            >
              {isSavingSchedule ? 'Menyimpan...' : 'Simpan Jadwal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
