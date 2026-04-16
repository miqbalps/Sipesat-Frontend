import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { api } from '../lib/api';

export default function CalendarPage({ user }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
    // Removed auto-refresh polling - data updates when user navigates between pages
  }, []);

  async function loadSchedules() {
    setIsLoading(true);
    try {
      const response = await api.get('/reports');
      // Filter schedules that have pickup_date and normalize date format
      const scheduled = response.data
        .filter(r => r.pickup_date && r.pickup_time)
        .map(r => ({
          ...r,
          // Normalize pickup_date to YYYY-MM-DD format
          pickup_date: String(r.pickup_date).split('T')[0]
        }));
      setSchedules(scheduled);
    } catch (e) {
      console.error('Failed to load schedules:', e);
    } finally {
      setIsLoading(false);
    }
  }

  // Get days in month
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date as YYYY-MM-DD
  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Get schedules for a specific date, filtered by date range
  const getSchedulesForDate = (dateStr) => {
    // Filter by exact date match
    let daySchedules = schedules.filter(s => {
      // Normalize both dates to YYYY-MM-DD format for comparison
      const normalizedPickupDate = String(s.pickup_date).split('T')[0];
      return normalizedPickupDate === dateStr;
    });
    
    // Apply date range filter
    if (filterStartDate && new Date(dateStr) < new Date(filterStartDate)) {
      daySchedules = [];
    }
    if (filterEndDate && new Date(dateStr) > new Date(filterEndDate)) {
      daySchedules = [];
    }
    
    return daySchedules;
  };

  // Navigate months
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const days = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);

  const monthName = new Date(year, month).toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Calendar days array
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let day = 1; day <= days; day++) calendarDays.push(day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-7 w-7 text-emerald-600" />
          Jadwal Pickup
        </h1>
      </div>

      {/* Date Filter Card */}
      <Card className="border-0 bg-white">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Calendar and Schedule Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar - Left Side */}
        <div className="lg:col-span-1">
          <Card className="border-0 bg-white relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{monthName}</CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center font-semibold text-xs text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }

                  const dateStr = formatDate(year, month, day);
                  const daySchedules = getSchedulesForDate(dateStr);
                  const hasSchedules = daySchedules.length > 0;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-lg border-2 p-1 text-xs transition-all flex flex-col items-center justify-center ${ 
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : hasSchedules
                          ? 'border-emerald-200 bg-emerald-50 cursor-pointer hover:shadow-md'
                          : 'border-gray-200 bg-white cursor-pointer hover:shadow-md'
                      }`}
                    >
                      <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>{day}</div>
                      {hasSchedules && (
                        <div className={`text-xs font-medium ${isSelected ? 'text-emerald-50' : 'text-emerald-700'}`}>
                          {daySchedules.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedules List - Right Side */}
        <div className="lg:col-span-2">
          {selectedDate ? (
            <Card className="border-0 bg-white h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Jadwal pada {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {getSchedulesForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Tidak ada jadwal untuk tanggal ini
                  </div>
                ) : (
                  getSchedulesForDate(selectedDate).map((schedule, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground">Laporan #{schedule.id}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {schedule.reporter_name || 'Anonim'}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            {Number(schedule.lat).toFixed(5)}, {Number(schedule.lng).toFixed(5)}
                          </div>
                          {schedule.description && (
                            <div className="text-xs text-gray-600 mt-2">
                              {schedule.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-emerald-700">
                            {String(schedule.pickup_time).slice(0, 5)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-white h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Pilih tanggal untuk melihat jadwal</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
