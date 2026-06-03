import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CalendarDays, Dumbbell, LineChart, Target, Timer, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { listSessionHistory } from '../services/sessionsApi';
import { API_BASE } from '../config/apiBase';
import { getAuthToken } from '../services/authToken';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ children, className }) {
  return (
    <section className={cx('rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_24px_70px_-55px_rgba(0,0,0,0.95)]', className)}>
      {children}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, helper, tone = 'orange' }) {
  const tones = {
    orange: 'border-[#ff7849]/35 text-[#ff7849] bg-[#ff7849]/10',
    blue: 'border-blue-300/35 text-blue-200 bg-blue-400/10',
    purple: 'border-purple-300/35 text-purple-200 bg-purple-400/10',
    teal: 'border-teal-300/35 text-teal-200 bg-teal-400/10',
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</div>
          <div className="mt-3 text-[24px] sm:text-[28px] font-bold text-white/95">{value}</div>
          {helper ? <div className="mt-1 text-[11px] text-white/45">{helper}</div> : null}
        </div>
        <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl border', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function SelectPill({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-white/15 bg-[#1e1e1e] px-4 text-[12px] font-semibold text-white/85 outline-none transition focus:border-[#ff7849]/60 focus:ring-2 focus:ring-[#ff7849]/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ children }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-6 text-center text-[13px] text-white/50">
      {children}
    </div>
  );
}

function formatNumber(value, locale) {
  return Math.round(Number(value || 0)).toLocaleString(locale);
}

function getSessionDate(session) {
  const date = new Date(session?.fecha || session?.date || session?.createdAt || Date.now());
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function getSessionExercises(session) {
  if (Array.isArray(session?.ejercicios_realizados)) return session.ejercicios_realizados;
  if (Array.isArray(session?.exercises)) {
    return session.exercises.map((exercise, index) => ({
      ejercicio_id: exercise.id || index + 1,
      nombre_ejercicio: exercise.name,
      sets: Array.isArray(exercise.sets)
        ? exercise.sets.map((set) => ({ reps: set.reps, peso: set.peso ?? set.weight }))
        : [],
    }));
  }
  return [];
}

function getSetStats(session) {
  const exercises = getSessionExercises(session);
  return exercises.reduce((acc, exercise) => {
    const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
    sets.forEach((set) => {
      const reps = Number(set?.reps || 0);
      const weight = Number(set?.peso ?? set?.weight ?? 0);
      if (!Number.isFinite(reps) || !Number.isFinite(weight)) return;
      acc.sets += 1;
      acc.reps += reps;
      acc.volume += reps * weight;
      acc.maxWeight = Math.max(acc.maxWeight, weight);
      acc.estimated1rm = Math.max(acc.estimated1rm, weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0);
    });
    return acc;
  }, { sets: 0, reps: 0, volume: 0, maxWeight: 0, estimated1rm: 0 });
}

function getDuration(session) {
  return Number(session?.duracion_minutos || session?.duration || 0) || 0;
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay() === 0 ? 6 : copy.getDay() - 1;
  copy.setHours(12, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

function filterByRange(sessions, range) {
  if (range === 'all') return sessions;
  const days = Number(range);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - days + 1);
  return sessions.filter((session) => {
    const date = getSessionDate(session);
    return date && date >= since;
  });
}

function buildWeekSeries(sessions, lang) {
  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  const map = new Map();
  sessions.forEach((session) => {
    const date = getSessionDate(session);
    if (!date) return;
    const week = startOfWeek(date);
    const key = getDateKey(week);
    const current = map.get(key) || { key, label: week.toLocaleDateString(locale, { day: '2-digit', month: 'short' }), volume: 0, sessions: 0 };
    current.volume += getSetStats(session).volume;
    current.sessions += 1;
    map.set(key, current);
  });
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-8);
}

function buildExerciseStats(sessions) {
  const map = new Map();
  sessions.forEach((session) => {
    const date = getSessionDate(session);
    getSessionExercises(session).forEach((exercise) => {
      const name = String(exercise?.nombre_ejercicio || exercise?.name || '').trim();
      if (!name) return;
      const item = map.get(name) || { name, sessions: 0, sets: 0, reps: 0, volume: 0, maxWeight: 0, estimated1rm: 0, points: [] };
      const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
      const point = sets.reduce((acc, set) => {
        const reps = Number(set?.reps || 0);
        const weight = Number(set?.peso ?? set?.weight ?? 0);
        if (!Number.isFinite(reps) || !Number.isFinite(weight)) return acc;
        acc.sets += 1;
        acc.reps += reps;
        acc.volume += reps * weight;
        acc.maxWeight = Math.max(acc.maxWeight, weight);
        acc.estimated1rm = Math.max(acc.estimated1rm, weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0);
        return acc;
      }, { sets: 0, reps: 0, volume: 0, maxWeight: 0, estimated1rm: 0 });
      item.sessions += 1;
      item.sets += point.sets;
      item.reps += point.reps;
      item.volume += point.volume;
      item.maxWeight = Math.max(item.maxWeight, point.maxWeight);
      item.estimated1rm = Math.max(item.estimated1rm, point.estimated1rm);
      if (date) item.points.push({ date, label: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), ...point });
      map.set(name, item);
    });
  });
  return Array.from(map.values()).sort((a, b) => b.volume - a.volume);
}

function buildRoutineDistribution(sessions) {
  const map = new Map();
  sessions.forEach((session) => {
    const name = String(session?.tipo_rutina || session?.muscleGroup || 'Sin tipo').trim() || 'Sin tipo';
    const current = map.get(name) || { name, sessions: 0, volume: 0 };
    current.sessions += 1;
    current.volume += getSetStats(session).volume;
    map.set(name, current);
  });
  return Array.from(map.values()).sort((a, b) => b.sessions - a.sessions).slice(0, 6);
}

function buildHeatmap(sessions) {
  const map = new Map();
  sessions.forEach((session) => {
    const date = getSessionDate(session);
    if (!date) return;
    const key = getDateKey(date);
    map.set(key, (map.get(key) || 0) + getSetStats(session).volume);
  });
  const days = [];
  const start = new Date();
  start.setDate(start.getDate() - 83);
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i < 84; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = getDateKey(date);
    days.push({ key, volume: map.get(key) || 0 });
  }
  const max = Math.max(1, ...days.map((day) => day.volume));
  return days.map((day) => ({ ...day, intensity: day.volume / max }));
}

function BarSeries({ items, valueKey = 'volume', format = (v) => v }) {
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey] || 0)));
  if (!items.length) return <EmptyState>No hay datos suficientes para construir esta gráfica.</EmptyState>;
  return (
    <div className="h-[260px] rounded-xl border border-white/10 bg-black/10 px-4 py-5">
      <div className="flex h-full items-end gap-2 sm:gap-3">
        {items.map((item) => {
          const height = Math.max(8, (Number(item[valueKey] || 0) / max) * 100);
          return (
            <div key={item.key || item.label} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-full w-full items-end justify-center">
                <div className="w-full max-w-[42px] rounded-t-lg bg-[#ff7849] transition group-hover:bg-[#ff8d66]" style={{ height: `${height}%` }} />
                <div className="pointer-events-none absolute bottom-[calc(100%+8px)] hidden rounded-lg border border-white/10 bg-[#121212] px-3 py-2 text-[11px] text-white/80 shadow-xl group-hover:block">
                  {format(item[valueKey])}
                </div>
              </div>
              <div className="w-full truncate text-center text-[10px] uppercase tracking-wide text-white/40">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseTrend({ points, lang }) {
  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  const data = points.slice(-8);
  const max = Math.max(1, ...data.map((point) => point.volume));
  if (!data.length) return <EmptyState>{tr(lang, 'Selecciona un ejercicio con historial.', 'Select an exercise with history.')}</EmptyState>;
  return (
    <div className="space-y-3">
      {data.map((point) => (
        <div key={`${point.date.toISOString()}-${point.volume}`} className="grid grid-cols-[72px_1fr_86px] items-center gap-3">
          <div className="text-[10px] uppercase tracking-wide text-white/40">
            {point.date.toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.max(5, (point.volume / max) * 100)}%` }} />
          </div>
          <div className="text-right text-[11px] font-semibold text-white/70">{formatNumber(point.volume, locale)} kg</div>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ days }) {
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
      {days.map((day) => {
        const level = day.intensity === 0 ? 'bg-white/[0.06]' : day.intensity < 0.35 ? 'bg-[#ff7849]/35' : day.intensity < 0.7 ? 'bg-[#ff7849]/65' : 'bg-[#ff7849]';
        return (
          <div
            key={day.key}
            className={cx('h-4 w-4 rounded-[4px] border border-white/5', level)}
            title={`${day.key}: ${Math.round(day.volume)} kg`}
          />
        );
      })}
    </div>
  );
}

async function fetchWeightEntries() {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/users/weight-entries`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data?.items) ? data.items : [];
}

export default function Statistics() {
  const { lang } = useI18n();
  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  const [range, setRange] = useState('90');
  const [sessions, setSessions] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      listSessionHistory().catch(() => ({ items: [] })),
      fetchWeightEntries().catch(() => []),
    ]).then(([sessionData, weights]) => {
      if (!alive) return;
      setSessions(Array.isArray(sessionData?.items) ? sessionData.items : []);
      setWeightEntries(Array.isArray(weights) ? weights : []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filteredSessions = useMemo(() => filterByRange(sessions, range), [range, sessions]);
  const exerciseStats = useMemo(() => buildExerciseStats(filteredSessions), [filteredSessions]);

  useEffect(() => {
    if (!selectedExercise && exerciseStats.length) setSelectedExercise(exerciseStats[0].name);
    if (selectedExercise && exerciseStats.length && !exerciseStats.some((exercise) => exercise.name === selectedExercise)) {
      setSelectedExercise(exerciseStats[0].name);
    }
  }, [exerciseStats, selectedExercise]);

  const metrics = useMemo(() => {
    const totals = filteredSessions.reduce((acc, session) => {
      const stats = getSetStats(session);
      acc.volume += stats.volume;
      acc.sets += stats.sets;
      acc.reps += stats.reps;
      acc.duration += getDuration(session);
      acc.maxWeight = Math.max(acc.maxWeight, stats.maxWeight);
      acc.estimated1rm = Math.max(acc.estimated1rm, stats.estimated1rm);
      return acc;
    }, { volume: 0, sets: 0, reps: 0, duration: 0, maxWeight: 0, estimated1rm: 0 });
    const activeDays = new Set(filteredSessions.map(getSessionDate).filter(Boolean).map(getDateKey)).size;
    return {
      ...totals,
      sessions: filteredSessions.length,
      activeDays,
      avgVolume: filteredSessions.length ? totals.volume / filteredSessions.length : 0,
      avgDuration: filteredSessions.length ? totals.duration / filteredSessions.length : 0,
    };
  }, [filteredSessions]);

  const weekSeries = useMemo(() => buildWeekSeries(filteredSessions, lang), [filteredSessions, lang]);
  const routineDistribution = useMemo(() => buildRoutineDistribution(filteredSessions), [filteredSessions]);
  const heatmap = useMemo(() => buildHeatmap(filteredSessions), [filteredSessions]);
  const selectedExerciseStats = useMemo(
    () => exerciseStats.find((exercise) => exercise.name === selectedExercise) || null,
    [exerciseStats, selectedExercise]
  );

  const lastWeight = useMemo(() => {
    const sorted = [...weightEntries].sort((a, b) => new Date(a.fecha || a.date || a.createdAt) - new Date(b.fecha || b.date || b.createdAt));
    const first = sorted[0]?.peso_kg ?? sorted[0]?.weight_kg ?? sorted[0]?.weight;
    const last = sorted[sorted.length - 1]?.peso_kg ?? sorted[sorted.length - 1]?.weight_kg ?? sorted[sorted.length - 1]?.weight;
    if (!Number.isFinite(Number(last))) return null;
    return {
      value: Number(last),
      delta: Number.isFinite(Number(first)) ? Number(last) - Number(first) : 0,
    };
  }, [weightEntries]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <main className="w-full px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1400px] space-y-5 sm:space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-[#ff7849]">FitTrack Analytics</div>
              <h1 className="mt-2 text-[28px] sm:text-[34px] font-bold uppercase tracking-wide text-white/95">
                {tr(lang, 'Estadísticas', 'Statistics')}
              </h1>
              <p className="mt-2 max-w-[760px] text-[13px] sm:text-[14px] text-white/50">
                {tr(lang, 'Analiza tu mejora por tiempo, ejercicio concreto, volumen, consistencia y composición corporal.', 'Analyze improvement by time, exercise, volume, consistency, and body metrics.')}
              </p>
            </div>

            <div className="w-full max-w-[260px]">
              <SelectPill
                label={tr(lang, 'Periodo', 'Period')}
                value={range}
                onChange={setRange}
                options={[
                  { value: '30', label: tr(lang, 'Últimos 30 días', 'Last 30 days') },
                  { value: '90', label: tr(lang, 'Últimos 90 días', 'Last 90 days') },
                  { value: '365', label: tr(lang, 'Último año', 'Last year') },
                  { value: 'all', label: tr(lang, 'Todo el historial', 'All history') },
                ]}
              />
            </div>
          </div>

          {loading ? (
            <EmptyState>{tr(lang, 'Calculando estadísticas...', 'Calculating statistics...')}</EmptyState>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Dumbbell} label={tr(lang, 'Volumen total', 'Total volume')} value={`${formatNumber(metrics.volume, locale)} kg`} helper={`${formatNumber(metrics.avgVolume, locale)} kg / sesión`} tone="orange" />
                <StatCard icon={CalendarDays} label={tr(lang, 'Sesiones', 'Sessions')} value={metrics.sessions} helper={`${metrics.activeDays} días activos`} tone="blue" />
                <StatCard icon={Timer} label={tr(lang, 'Duración media', 'Average duration')} value={`${Math.round(metrics.avgDuration)} min`} helper={`${formatNumber(metrics.duration, locale)} min acumulados`} tone="teal" />
                <StatCard icon={TrendingUp} label="1RM estimado" value={`${formatNumber(metrics.estimated1rm, locale)} kg`} helper={`${formatNumber(metrics.maxWeight, locale)} kg máximo registrado`} tone="purple" />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
                <Card className="p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">{tr(lang, 'Tendencia', 'Trend')}</div>
                      <h2 className="mt-1 text-[18px] font-bold uppercase text-white/90">{tr(lang, 'Volumen semanal', 'Weekly volume')}</h2>
                    </div>
                    <BarChart3 className="h-5 w-5 text-[#ff7849]" />
                  </div>
                  <BarSeries items={weekSeries} format={(value) => `${formatNumber(value, locale)} kg`} />
                </Card>

                <Card className="p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">{tr(lang, 'Consistencia', 'Consistency')}</div>
                      <h2 className="mt-1 text-[18px] font-bold uppercase text-white/90">Heatmap 12w</h2>
                    </div>
                    <Activity className="h-5 w-5 text-[#ff7849]" />
                  </div>
                  <Heatmap days={heatmap} />
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-white/55">
                    {tr(lang, 'Más oscuro significa más volumen levantado ese día. Úsalo para detectar semanas flojas o sobrecargas.', 'Darker means more volume lifted that day. Use it to detect weak weeks or overloads.')}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
                <Card className="p-4 sm:p-5">
                  <SelectPill
                    label={tr(lang, 'Ejercicio concreto', 'Specific exercise')}
                    value={selectedExercise}
                    onChange={setSelectedExercise}
                    options={exerciseStats.length ? exerciseStats.map((exercise) => ({ value: exercise.name, label: exercise.name })) : [{ value: '', label: tr(lang, 'Sin ejercicios', 'No exercises') }]}
                  />

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-widest text-white/35">Volumen</div>
                      <div className="mt-2 text-[20px] font-bold text-white/90">{formatNumber(selectedExerciseStats?.volume, locale)} kg</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-widest text-white/35">1RM</div>
                      <div className="mt-2 text-[20px] font-bold text-white/90">{formatNumber(selectedExerciseStats?.estimated1rm, locale)} kg</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-widest text-white/35">Series</div>
                      <div className="mt-2 text-[20px] font-bold text-white/90">{formatNumber(selectedExerciseStats?.sets, locale)}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-widest text-white/35">Reps</div>
                      <div className="mt-2 text-[20px] font-bold text-white/90">{formatNumber(selectedExerciseStats?.reps, locale)}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">{tr(lang, 'Progreso por ejercicio', 'Exercise progress')}</div>
                      <h2 className="mt-1 text-[18px] font-bold uppercase text-white/90">{selectedExercise || tr(lang, 'Sin datos', 'No data')}</h2>
                    </div>
                    <LineChart className="h-5 w-5 text-blue-300" />
                  </div>
                  <ExerciseTrend points={selectedExerciseStats?.points || []} lang={lang} />
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <Card className="p-4 sm:p-5 xl:col-span-2">
                  <div className="mb-5 flex items-center gap-3">
                    <Target className="h-5 w-5 text-[#ff7849]" />
                    <h2 className="text-[18px] font-bold uppercase text-white/90">{tr(lang, 'Distribución por rutina', 'Routine distribution')}</h2>
                  </div>
                  <div className="space-y-3">
                    {routineDistribution.length ? routineDistribution.map((item) => {
                      const maxSessions = Math.max(1, ...routineDistribution.map((routine) => routine.sessions));
                      return (
                        <div key={item.name} className="grid grid-cols-[120px_1fr_72px] items-center gap-3">
                          <div className="truncate text-[12px] font-semibold uppercase text-white/70">{item.name}</div>
                          <div className="h-3 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-purple-400" style={{ width: `${Math.max(7, (item.sessions / maxSessions) * 100)}%` }} />
                          </div>
                          <div className="text-right text-[11px] text-white/50">{item.sessions} sesiones</div>
                        </div>
                      );
                    }) : <EmptyState>{tr(lang, 'No hay rutinas registradas.', 'No routines logged.')}</EmptyState>}
                  </div>
                </Card>

                <Card className="p-4 sm:p-5">
                  <div className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/40">{tr(lang, 'Peso corporal', 'Body weight')}</div>
                  {lastWeight ? (
                    <div>
                      <div className="text-[34px] font-bold text-white/95">{lastWeight.value.toFixed(1)} kg</div>
                      <div className={cx('mt-2 text-[13px] font-semibold', lastWeight.delta <= 0 ? 'text-teal-300' : 'text-[#ff7849]')}>
                        {lastWeight.delta >= 0 ? '+' : ''}{lastWeight.delta.toFixed(1)} kg en el periodo registrado
                      </div>
                      <p className="mt-4 text-[12px] leading-relaxed text-white/50">
                        {tr(lang, 'Cruza este dato con volumen y consistencia para entender si estás ganando fuerza, definiendo o subiendo masa.', 'Compare this with volume and consistency to understand strength gain, cutting, or mass gain.')}
                      </p>
                    </div>
                  ) : (
                    <EmptyState>{tr(lang, 'Registra pesos corporales para ver esta evolución.', 'Log body weights to see this evolution.')}</EmptyState>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
