import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n } from '../i18n/I18nProvider';
import { listSessionHistory, listSessionHistoryRange } from '../services/sessionsApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5 md:p-6 text-center">
      <p className="text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-white/50 mb-2 sm:mb-3">
        {label}
      </p>
      <p className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-white/95">
        {value}
      </p>
    </div>
  );
}

function WorkoutBadge({ type, onClick }) {
  const { t } = useI18n();
  const colorMap = {
    pecho: 'bg-[#ff7849]/20 text-[#ff7849]',
    espalda: 'bg-blue-500/20 text-blue-400',
    pierna: 'bg-purple-500/20 text-purple-400',
    cardio: 'bg-red-500/20 text-red-400',
    hombros: 'bg-green-500/20 text-green-400',
    yoga: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/20',
        colorMap[type.toLowerCase()] || 'bg-white/10 text-white/60'
      )}
      aria-label={`${t('Abrir entrenamiento')}: ${t(type)}`}
      title={t('Abrir detalle')}
    >
      {t(type)}
    </button>
  );
}

export default function Calendario() {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [currentDate, setCurrentDate] = useState(() => new Date()); // mes actual
  const [monthSessions, setMonthSessions] = useState([]);
  const [totalSessionsCount, setTotalSessionsCount] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadError, setLoadError] = useState('');

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajustar para que lunes sea 0

  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  const monthName = currentDate.toLocaleDateString(locale, { month: 'long' }).toUpperCase();
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const openWorkoutDetail = (session) => {
    if (!session) return;
    const fecha = session?.fecha ? new Date(session.fecha) : null;
    const dateLabel = fecha && !Number.isNaN(fecha.getTime())
      ? fecha.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    const ejercicios = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
    const totalSets = ejercicios.reduce((acc, ex) => acc + (Array.isArray(ex?.sets) ? ex.sets.length : 0), 0);

    const workout = {
      id: String(session?._id || session?.id || ''),
      title: String(session?.tipo_rutina || t('Sesión')),
      duration: session?.duracion_minutos ? `${session.duracion_minutos} MIN` : '—',
      date: dateLabel,
      series: totalSets,
      volume: totalSets ? `${totalSets * 40} KG` : '0 KG',
      exercises: ejercicios.map((ex) => ({
        name: String(ex?.nombre_ejercicio || '').toUpperCase(),
        sets: Array.isArray(ex?.sets)
          ? ex.sets.map((s, idx) => ({
              number: idx + 1,
              reps: s?.reps ?? 0,
              weight: s?.peso ?? 0,
            }))
          : [],
      })),
    };

    navigate(`/sessiondetail/${workout.id}`, { state: { workout } });
  };

  useEffect(() => {
    let alive = true;
    setLoadError('');
    setLoadingMonth(true);

    const from = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const to = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);

    Promise.all([
      listSessionHistoryRange({ from: from.toISOString(), to: to.toISOString() }),
      totalSessionsCount === null ? listSessionHistory() : Promise.resolve(null),
    ])
      .then(([monthRes, allRes]) => {
        if (!alive) return;
        setMonthSessions(Array.isArray(monthRes?.items) ? monthRes.items : []);
        if (allRes && Array.isArray(allRes?.items)) setTotalSessionsCount(allRes.items.length);
      })
      .catch((e) => {
        if (!alive) return;
        setMonthSessions([]);
        setLoadError(e?.message || t('No se pudo cargar el calendario.'));
      })
      .finally(() => {
        if (!alive) return;
        setLoadingMonth(false);
      });

    return () => {
      alive = false;
    };
  }, [monthIndex, totalSessionsCount, t, year]);

  const workoutsByDay = useMemo(() => {
    const map = {};
    monthSessions.forEach((s) => {
      const d = s?.fecha ? new Date(s.fecha) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(s);
    });
    return map;
  }, [monthSessions]);

  const monthWorkouts = useMemo(() => {
    return Object.keys(workoutsByDay).length;
  }, [workoutsByDay]);

  const days = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      {/* Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-7">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            <StatCard
              label={t('Días entrenados en total')}
              value={totalSessionsCount === null ? '—' : totalSessionsCount}
            />
            <div className="flex items-center justify-center">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center min-w-[220px]">
                <div className="text-[20px] sm:text-[24px] md:text-[28px] font-bold tracking-widest text-white/95">
                  {monthName}
                </div>
                <div className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-white/60 mt-1">
                  {year}
                </div>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <StatCard
              label={t('Días entrenados este mes')}
              value={loadingMonth ? '…' : monthWorkouts}
            />
          </div>

          {loadError ? (
            <div className="rounded-lg border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">
              {loadError}
            </div>
          ) : null}

          {/* Calendar */}
          <div className="rounded-lg border border-white/10 bg-white/[0.04] overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.03]">
              {(lang === 'en' ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] : ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']).map((day) => (
                <div
                  key={day}
                  className="p-3 sm:p-4 text-center text-[11px] sm:text-[12px] md:text-[13px] font-bold uppercase tracking-wider text-white/50 border-r border-white/10 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="divide-y divide-white/10">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7">
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={cx(
                        'aspect-square p-2 sm:p-3 md:p-4 border-r border-white/10 last:border-r-0 flex flex-col',
                        day ? 'bg-white/[0.02] hover:bg-white/[0.06] transition cursor-pointer' : 'bg-black/20'
                      )}
                    >
                      {day && (
                        <>
                          <div className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-white/60 mb-1 sm:mb-1.5">
                            {day}
                          </div>
                          {workoutsByDay[day] && (
                            <div className="space-y-1 flex-1 flex flex-col justify-center">
                              {workoutsByDay[day].map((session, idx) => (
                                <WorkoutBadge
                                  key={idx}
                                  type={String(session?.tipo_rutina || t('Sesión'))}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openWorkoutDetail(session);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
