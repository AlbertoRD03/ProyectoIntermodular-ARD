import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, Info, Plus, Trash2, TrendingUp, Weight } from 'lucide-react';

import Header from '../components/Header';
import { API_BASE } from '../config/apiBase';
import { getAuthToken } from '../services/authToken';
import { useI18n } from '../i18n/I18nProvider';
import { readPrivacySettings, subscribePrivacySettings } from '../services/privacySettings';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function toISODate(d) {
  const date = d instanceof Date ? d : new Date(String(d || ''));
  if (!Number.isFinite(date.getTime())) return '';
  const yyyy = String(date.getFullYear()).padStart(4, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfISOWeek(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0..Sun=6
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d, n) {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
}

function formatTonnage(kg) {
  const v = Number(kg);
  if (!Number.isFinite(v)) return '--';
  if (v >= 1000) return `${Math.round((v / 1000) * 10) / 10}`;
  return `${Math.round(v)}`;
}

function Card({ title, icon: Icon, onClick, children }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
      className={cx(
        'rounded-xl border border-white/15 bg-white/[0.02] p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.9)]',
        onClick ? 'cursor-pointer transition hover:border-white/25 hover:bg-white/[0.03]' : ''
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-bold tracking-[0.22em] text-white/55">
          {title}
        </div>
        {Icon ? <Icon className="h-5 w-5 text-[#ff7849]/90" /> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatValue({ value, suffix }) {
  return (
    <div className="flex items-end gap-2">
      <div className="text-[28px] font-bold leading-none text-white/95">{value}</div>
      {suffix ? (
        <div className="pb-1 text-[12px] font-semibold tracking-wide text-white/45">
          {suffix}
        </div>
      ) : null}
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-xl border border-white/15 bg-black/10 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            'h-9 rounded-lg px-3 text-[12px] font-semibold tracking-wide transition',
            value === opt.value
              ? 'bg-[#ff7849] text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Hint({ text }) {
  return (
    <span className="relative inline-flex align-middle">
      <span className="group inline-flex cursor-help items-center justify-center rounded-md p-1 text-white/35 hover:text-white/70">
        <Info className="h-4 w-4" />
        <span className="pointer-events-none absolute right-0 top-[calc(100%+10px)] z-20 hidden w-[280px] rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-[12px] text-white/75 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)] group-hover:block">
          {text}
        </span>
      </span>
    </span>
  );
}

function SvgBarChart({ data, height = 180, tooltipFormatter }) {
  const safe = Array.isArray(data) ? data : [];
  const max = Math.max(1, ...safe.map((d) => Number(d?.value) || 0));
  const width = 760;
  const paddingL = 44;
  const paddingR = 18;
  const paddingT = 18;
  const paddingB = 28;
  const innerW = width - paddingL - paddingR;
  const innerH = height - paddingT - paddingB;
  const barGap = 8;
  const barW = safe.length ? (innerW - barGap * (safe.length - 1)) / safe.length : innerW;
  const ticks = 4;
  const formatTick = (v) => {
    if (v >= 1000) return `${Math.round((v / 1000) * 10) / 10}T`;
    return `${Math.round(v)}kg`;
  };

  const [hover, setHover] = useState(null);
  const barColor = (v) => {
    const t = Math.max(0, Math.min(1, v / Math.max(1, max)));
    // Warm -> hot. Keep brand hue but adjust opacity.
    const alpha = 0.35 + t * 0.65;
    return `rgba(255,120,73,${alpha.toFixed(3)})`;
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,120,73,0.95)" />
            <stop offset="100%" stopColor="rgba(255,120,73,0.55)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="14" fill="rgba(255,255,255,0.03)" />

        {/* grid + ticks */}
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const y = paddingT + (innerH * i) / ticks;
          const v = max - (max * i) / ticks;
          return (
            <g key={i}>
              <line
                x1={paddingL}
                x2={width - paddingR}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                x={paddingL - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="rgba(255,255,255,0.45)"
              >
                {formatTick(v)}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {safe.map((d, idx) => {
          const v = Number(d?.value) || 0;
          const h = Math.max(0, (v / max) * innerH);
          const x = paddingL + idx * (barW + barGap);
          const y = paddingT + (innerH - h);
          const isHot = hover?.idx === idx;
          return (
            <g
              key={d.key || idx}
              onMouseEnter={() => setHover({ idx, d })}
              onMouseLeave={() => setHover(null)}
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="8"
                fill={barColor(v)}
                opacity={isHot ? 1 : 0.95}
              />
              {/* x labels: sparse */}
              {safe.length <= 12 || idx % Math.ceil(safe.length / 8) === 0 ? (
                <text
                  x={x + barW / 2}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255,255,255,0.45)"
                >
                  {d?.label || ''}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {hover ? (
        <div className="pointer-events-none absolute left-4 top-4 z-10 w-[260px] rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-[12px] text-white/80 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
          <div className="font-semibold text-white/90">{hover.d?.title || hover.d?.key}</div>
          <div className="mt-1 text-white/65">
            {tooltipFormatter ? tooltipFormatter(hover.d) : `${Math.round(Number(hover.d?.value) || 0)} kg`}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SvgLineChart({ data, height = 160 }) {
  const safe = Array.isArray(data) ? data : [];
  const width = 640;
  const padding = 18;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const ys = safe.map((d) => Number(d?.value)).filter((n) => Number.isFinite(n));
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 1;
  const span = Math.max(1e-6, maxY - minY);

  const points = safe.map((d, i) => {
    const x = padding + (safe.length <= 1 ? innerW / 2 : (i / (safe.length - 1)) * innerW);
    const v = Number(d?.value);
    const y = padding + innerH - ((Number.isFinite(v) ? v : minY) - minY) / span * innerH;
    return { x, y, v };
  });

  const dPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <rect x="0" y="0" width={width} height={height} rx="12" fill="rgba(255,255,255,0.03)" />
      {points.length >= 2 ? (
        <path d={dPath} fill="none" stroke="rgba(255,120,73,0.95)" strokeWidth="3" />
      ) : null}
      {points.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r="4.5"
          fill="rgba(255,255,255,0.9)"
          stroke="rgba(255,120,73,0.95)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function Heatmap({ startDate, days, valueByDay, detailsByDay }) {
  const start = startOfISOWeek(startDate);
  const totalDays = Math.max(7, days);
  const weeks = Math.ceil(totalDays / 7);
  const [hover, setHover] = useState(null);

  const getColor = (v, max) => {
    if (!v) return 'rgba(255,255,255,0.06)';
    const t = Math.max(0, Math.min(1, v / Math.max(1, max)));
    if (t < 0.25) return 'rgba(255,120,73,0.25)';
    if (t < 0.5) return 'rgba(255,120,73,0.42)';
    if (t < 0.75) return 'rgba(255,120,73,0.62)';
    return 'rgba(255,120,73,0.85)';
  };

  const max = Math.max(0, ...Array.from(valueByDay.values()));
  const cols = Array.from({ length: weeks }, (_, w) => {
    const base = addDays(start, w * 7);
    const daysInCol = Array.from({ length: 7 }, (_, d) => addDays(base, d));
    return { base, daysInCol };
  });

  return (
    <div className="relative overflow-x-auto">
      {hover ? (
        <div className="pointer-events-none absolute left-0 top-0 z-10 w-[280px] rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-[12px] text-white/80 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
          <div className="font-semibold text-white/90">{hover.key}</div>
          <div className="mt-1 text-white/65">
            Volumen: {hover.v >= 1000 ? `${Math.round((hover.v / 1000) * 10) / 10} T` : `${Math.round(hover.v)} kg`}
          </div>
          <div className="mt-2 text-white/65">
            Top: <span className="text-white/85">{hover.top || '--'}</span>
          </div>
        </div>
      ) : null}
      <div className="flex min-w-max gap-2">
        {cols.map((col, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            {col.daysInCol.map((day) => {
              const key = toISODate(day);
              const v = valueByDay.get(key) || 0;
              const extra = detailsByDay?.get ? detailsByDay.get(key) : null;
              const top = extra?.topExercise || '--';
              return (
                <div
                  key={key}
                  onMouseEnter={() => setHover({ key, v, top })}
                  onMouseLeave={() => setHover(null)}
                  className="h-4 w-4 rounded-[4px] border border-white/10"
                  style={{ backgroundColor: getColor(v, max) }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/55">
        <div>{`0 → ${formatTonnage(max)} ${max >= 1000 ? 'T' : 'KG'}`}</div>
        <div>{`${weeks} semanas • más oscuro = más volumen`}</div>
      </div>
    </div>
  );
}

const formatKg = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '--';
  return String(Math.round(v * 10) / 10);
};


const sumSessionVolumeKg = (session) => {
  const ex = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
  let total = 0;
  for (const e of ex) {
    const sets = Array.isArray(e?.sets) ? e.sets : [];
    for (const s of sets) {
      const reps = Number(s?.reps);
      const peso = Number(s?.peso);
      if (Number.isFinite(reps) && Number.isFinite(peso)) total += reps * peso;
    }
  }
  return total;
};

const sumSessionVolumeByExercise = (session) => {
  const ex = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
  const map = new Map();
  for (const e of ex) {
    const name = String(e?.nombre_ejercicio || '').trim();
    if (!name) continue;
    const sets = Array.isArray(e?.sets) ? e.sets : [];
    let subtotal = 0;
    for (const s of sets) {
      const reps = Number(s?.reps);
      const peso = Number(s?.peso);
      if (Number.isFinite(reps) && Number.isFinite(peso)) subtotal += reps * peso;
    }
    map.set(name, (map.get(name) || 0) + subtotal);
  }
  return map;
};

export default function WeightEvolution() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [tab, setTab] = useState('volumen'); // volumen | peso
  const [range, setRange] = useState('dia'); // dia | semana | mes
  const chartRef = useRef(null);

  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [sessions, setSessions] = useState([]);

  const [weightsLoading, setWeightsLoading] = useState(false);
  const [weightsError, setWeightsError] = useState('');
  const [weightEntries, setWeightEntries] = useState([]);

  const [newWeightDate, setNewWeightDate] = useState(() => toISODate(new Date()));
  const [newWeightKg, setNewWeightKg] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [saveWeightError, setSaveWeightError] = useState('');

  const [privacy, setPrivacy] = useState(() => readPrivacySettings());

  useEffect(() => {
    setPrivacy(readPrivacySettings());
    return subscribePrivacySettings(setPrivacy);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    let cancelled = false;

    const now = new Date();
    const from = addDays(now, -120);
    const to = addDays(now, 1);

    setSessionsLoading(true);
    setSessionsError('');
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/sesiones/historial?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setSessionsError(data?.error || data?.message || t('No se pudieron cargar las sesiones.'));
          return;
        }
        setSessions(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (!cancelled) setSessionsError(t('Error de conexión. Inténtalo de nuevo.'));
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const setRangeAndScroll = (nextRange) => {
    setTab('volumen');
    setRange(nextRange);
    // Wait a tick so layout updates with the selected range.
    window.setTimeout(() => {
      try {
        chartRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      } catch {
        // ignore
      }
    }, 0);
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    let cancelled = false;

    setWeightsLoading(true);
    setWeightsError('');
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/weight-entries?limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setWeightsError(data?.error || data?.message || t('No se pudieron cargar tus pesos.'));
          return;
        }
        setWeightEntries(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (!cancelled) setWeightsError(t('Error de conexión. Inténtalo de nuevo.'));
      } finally {
        if (!cancelled) setWeightsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const volumeSeries = useMemo(() => {
    const items = sessions.map((s) => {
      const date = new Date(s?.fecha || s?.createdAt || s?.updatedAt || Date.now());
      return { date, volumeKg: sumSessionVolumeKg(s) };
    });

    const now = new Date();
    if (range === 'dia') {
      const start = startOfDay(addDays(now, -13));
      const keys = [];
      for (let i = 0; i < 14; i++) keys.push(toISODate(addDays(start, i)));

      const map = new Map(keys.map((k) => [k, 0]));
      for (const it of items) {
        const k = toISODate(it.date);
        if (map.has(k)) map.set(k, map.get(k) + it.volumeKg);
      }
      return keys.map((k) => ({ key: k, title: k, label: k.slice(5), value: map.get(k) || 0 }));
    }

    if (range === 'semana') {
      const start = startOfISOWeek(addDays(now, -7 * 11));
      const keys = [];
      for (let i = 0; i < 12; i++) keys.push(toISODate(addDays(start, i * 7)));
      const map = new Map(keys.map((k) => [k, 0]));
      for (const it of items) {
        const wk = toISODate(startOfISOWeek(it.date));
        if (map.has(wk)) map.set(wk, map.get(wk) + it.volumeKg);
      }
      return keys.map((k) => ({ key: k, title: `Semana ${k}`, label: k.slice(5), value: map.get(k) || 0 }));
    }

    const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1));
    const keys = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      keys.push(toISODate(d));
    }
    const map = new Map(keys.map((k) => [k, 0]));
    for (const it of items) {
      const m = startOfMonth(it.date);
      const mk = toISODate(m);
      if (map.has(mk)) map.set(mk, map.get(mk) + it.volumeKg);
    }
    return keys.map((k) => ({ key: k, title: k.slice(0, 7), label: k.slice(0, 7), value: map.get(k) || 0 }));
  }, [sessions, range]);

  const volumeKPIs = useMemo(() => {
    const now = new Date();
    // Rolling windows (more intuitive than calendar week/month for most users).
    const dayStart = startOfDay(now);
    const dayEnd = addDays(dayStart, 1);
    const weekStart = addDays(dayStart, -6); // last 7 days including today
    const weekEnd = dayEnd;
    const monthStart = addDays(dayStart, -29); // last 30 days including today
    const monthEnd = dayEnd;

    let day = 0;
    let week = 0;
    let month = 0;
    let lastActivityDate = null;

    const dayEx = new Map();
    const weekEx = new Map();
    const monthEx = new Map();
    for (const s of sessions) {
      const raw = s?.fecha ?? s?.createdAt ?? s?.updatedAt ?? Date.now();
      const date = new Date(raw);
      if (!Number.isFinite(date.getTime())) continue;
      if (!lastActivityDate || date > lastActivityDate) lastActivityDate = date;
      const v = sumSessionVolumeKg(s);
      if (date >= dayStart && date < dayEnd) day += v;
      if (date >= weekStart && date < weekEnd) week += v;
      if (date >= monthStart && date < monthEnd) month += v;

      const exMap = sumSessionVolumeByExercise(s);
      if (date >= dayStart && date < dayEnd) {
        for (const [k, val] of exMap.entries()) dayEx.set(k, (dayEx.get(k) || 0) + val);
      }
      if (date >= weekStart && date < weekEnd) {
        for (const [k, val] of exMap.entries()) weekEx.set(k, (weekEx.get(k) || 0) + val);
      }
      if (date >= monthStart && date < monthEnd) {
        for (const [k, val] of exMap.entries()) monthEx.set(k, (monthEx.get(k) || 0) + val);
      }
    }

    // If the user didn't train today/this week/this month, show the last active period instead of 0.
    const applyFallback = () => {
      if (!lastActivityDate) return { dayRef: null, weekRef: null, monthRef: null };
      const lastDayStart = startOfDay(lastActivityDate);
      const lastDayEnd = addDays(lastDayStart, 1);
      const lastWeekStart = startOfISOWeek(lastActivityDate);
      const lastWeekEnd = addDays(lastWeekStart, 7);
      const lastMonthStart = startOfMonth(lastActivityDate);
      const lastMonthEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 1);

      const acc = {
        day: 0,
        week: 0,
        month: 0,
        dayEx: new Map(),
        weekEx: new Map(),
        monthEx: new Map(),
      };

      for (const s of sessions) {
        const raw = s?.fecha ?? s?.createdAt ?? s?.updatedAt ?? Date.now();
        const date = new Date(raw);
        if (!Number.isFinite(date.getTime())) continue;
        const v = sumSessionVolumeKg(s);
        const exMap = sumSessionVolumeByExercise(s);

        if (date >= lastDayStart && date < lastDayEnd) {
          acc.day += v;
          for (const [k, val] of exMap.entries()) acc.dayEx.set(k, (acc.dayEx.get(k) || 0) + val);
        }
        if (date >= lastWeekStart && date < lastWeekEnd) {
          acc.week += v;
          for (const [k, val] of exMap.entries()) acc.weekEx.set(k, (acc.weekEx.get(k) || 0) + val);
        }
        if (date >= lastMonthStart && date < lastMonthEnd) {
          acc.month += v;
          for (const [k, val] of exMap.entries()) acc.monthEx.set(k, (acc.monthEx.get(k) || 0) + val);
        }
      }

      const topOf = (m) => {
        let best = { name: '--', value: 0 };
        for (const [name, value] of m.entries()) if (value > best.value) best = { name, value };
        return best;
      };

      if (day <= 0) {
        day = acc.day;
        dayEx.clear();
        for (const [k, v] of acc.dayEx.entries()) dayEx.set(k, v);
      }
      if (week <= 0) {
        week = acc.week;
        weekEx.clear();
        for (const [k, v] of acc.weekEx.entries()) weekEx.set(k, v);
      }
      if (month <= 0) {
        month = acc.month;
        monthEx.clear();
        for (const [k, v] of acc.monthEx.entries()) monthEx.set(k, v);
      }

      return { dayRef: lastDayStart, weekRef: lastWeekStart, monthRef: lastMonthStart, topOf };
    };

    const topOf = (m) => {
      let best = { name: '--', value: 0 };
      for (const [name, value] of m.entries()) {
        if (value > best.value) best = { name, value };
      }
      return best;
    };

    const fallback = applyFallback();

    return {
      day,
      week,
      month,
      topDay: topOf(dayEx),
      topWeek: topOf(weekEx),
      topMonth: topOf(monthEx),
      lastActivityIso: lastActivityDate ? toISODate(lastActivityDate) : '',
    };
  }, [sessions]);

  const heatmapData = useMemo(() => {
    const now = new Date();
    const start = startOfISOWeek(addDays(now, -(7 * 11))); // 12 weeks window
    const days = 7 * 12;
    const map = new Map();
    const details = new Map();
    for (let i = 0; i < days; i++) map.set(toISODate(addDays(start, i)), 0);

    for (const s of sessions) {
      const date = new Date(s?.fecha || s?.createdAt || Date.now());
      const key = toISODate(startOfDay(date));
      if (!map.has(key)) continue;
      const v = sumSessionVolumeKg(s);
      map.set(key, (map.get(key) || 0) + v);

      // Track top exercise for that day.
      const exMap = sumSessionVolumeByExercise(s);
      const prev = details.get(key) || { topExercise: '--', topValue: 0 };
      for (const [name, val] of exMap.entries()) {
        const nextVal = (prev?.byExercise?.get?.(name) || 0) + val;
        // Store running totals per exercise in a simple Map (kept inside details object).
        if (!prev.byExercise) prev.byExercise = new Map();
        prev.byExercise.set(name, nextVal);
        if (nextVal > prev.topValue) {
          prev.topValue = nextVal;
          prev.topExercise = name;
        }
      }
      details.set(key, prev);
    }
    return { start, days, map, details };
  }, [sessions]);

  const consistencyKPIs = useMemo(() => {
    const byDay = new Set();
    for (const s of sessions) {
      const date = new Date(s?.fecha || s?.createdAt || Date.now());
      byDay.add(toISODate(startOfDay(date)));
    }

    const dates = Array.from(byDay).sort();
    const today = toISODate(startOfDay(new Date()));
    const hasToday = byDay.has(today);

    const calcStreak = () => {
      let streak = 0;
      let cursor = startOfDay(new Date());
      if (!hasToday) cursor = addDays(cursor, -1);
      while (byDay.has(toISODate(cursor))) {
        streak += 1;
        cursor = addDays(cursor, -1);
      }
      return streak;
    };

    const streak = calcStreak();
    const last7 = Array.from({ length: 7 }, (_, i) => toISODate(addDays(startOfDay(new Date()), -i)));
    const activeDays7 = last7.filter((d) => byDay.has(d)).length;
    return { streak, activeDays7, totalActiveDays: dates.length };
  }, [sessions]);

  const weightSeries = useMemo(() => {
    const sorted = [...weightEntries]
      .map((e) => ({
        id: e?._id || e?.id,
        date: new Date(e?.fecha || e?.createdAt || Date.now()),
        value: Number(e?.peso_kg),
        nota: e?.nota || '',
      }))
      .filter((e) => Number.isFinite(e.value))
      .sort((a, b) => a.date - b.date);

    const slice = sorted.slice(-30);
    return slice.map((e) => ({ key: String(e.id || toISODate(e.date)), value: e.value, date: e.date, nota: e.nota }));
  }, [weightEntries]);

  const weightKPIs = useMemo(() => {
    if (!weightSeries.length) return { current: NaN, delta30: NaN, min30: NaN, max30: NaN };
    const current = weightSeries[weightSeries.length - 1].value;
    const first = weightSeries[0].value;
    const delta30 = current - first;
    const min30 = Math.min(...weightSeries.map((d) => d.value));
    const max30 = Math.max(...weightSeries.map((d) => d.value));
    return { current, delta30, min30, max30 };
  }, [weightSeries]);

  const addWeight = async () => {
    const token = getAuthToken();
    if (!token) return navigate('/login', { replace: true });
    setSaveWeightError('');
    setSavingWeight(true);
    try {
      const peso_kg = Number(String(newWeightKg).replace(',', '.'));
      const fecha = newWeightDate ? new Date(`${newWeightDate}T08:00:00`) : new Date();
      if (!Number.isFinite(peso_kg) || peso_kg <= 0) {
        setSaveWeightError(t('Introduce un peso válido.'));
        return;
      }
      const res = await fetch(`${API_BASE}/users/weight-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ peso_kg, fecha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveWeightError(data?.error || data?.message || t('No se pudo guardar el peso.'));
        return;
      }
      setWeightEntries((prev) => [data?.entry, ...prev].filter(Boolean));
      setNewWeightKg('');
    } catch {
      setSaveWeightError(t('Error de conexión. Inténtalo de nuevo.'));
    } finally {
      setSavingWeight(false);
    }
  };

  const deleteWeight = async (id) => {
    const token = getAuthToken();
    if (!token) return navigate('/login', { replace: true });
    try {
      await fetch(`${API_BASE}/users/weight-entries/${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      setWeightEntries((prev) => prev.filter((e) => (e?._id || e?.id) !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[22px] sm:text-[28px] font-bold tracking-wide text-white/95" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                {t('Evolución').toUpperCase()}
              </div>
              <div className="mt-1 text-[13px] text-white/55">
                {t('Analiza tu volumen de entrenamiento y tu peso corporal con resúmenes y gráficas.')}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                value={tab}
                onChange={(next) => {
                  if (next === 'peso' && privacy.hideWeight) return;
                  setTab(next);
                }}
                options={[
                  { value: 'volumen', label: t('Volumen') },
                  { value: 'peso', label: t('Peso corporal') },
                ]}
              />
              {tab === 'volumen' ? (
                <Segmented
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: 'dia', label: t('Día') },
                    { value: 'semana', label: t('Semana') },
                    { value: 'mes', label: t('Mes') },
                  ]}
                />
              ) : null}
            </div>
          </div>

          {tab === 'volumen' ? (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card title={t('Total hoy').toUpperCase()} icon={BarChart3} onClick={() => setRangeAndScroll('dia')}>
                <StatValue value={formatTonnage(volumeKPIs.day)} suffix={volumeKPIs.day >= 1000 ? 'T' : 'KG'} />
                <div className="mt-2 text-[12px] text-white/55">
                  {t('Top')}: <span className="text-white/75">{volumeKPIs.topDay?.name || '--'}</span>
                </div>
                <div className="mt-3 text-[12px] text-white/50">
                  Volumen = repeticiones × peso (por set). <Hint text="El 'volumen' (tonnage) es la suma de repeticiones x carga de todos tus sets. Es útil para ver cuánto trabajo total haces." />
                </div>
              </Card>
              <Card title={t('Últimos 7 días').toUpperCase()} icon={TrendingUp} onClick={() => setRangeAndScroll('semana')}>
                <StatValue value={formatTonnage(volumeKPIs.week)} suffix={volumeKPIs.week >= 1000 ? 'T' : 'KG'} />
                <div className="mt-2 text-[12px] text-white/55">
                  {t('Top')}: <span className="text-white/75">{volumeKPIs.topWeek?.name || '--'}</span>
                </div>
              </Card>
              <Card title={t('Últimos 30 días').toUpperCase()} icon={Calendar} onClick={() => setRangeAndScroll('mes')}>
                <StatValue value={formatTonnage(volumeKPIs.month)} suffix={volumeKPIs.month >= 1000 ? 'T' : 'KG'} />
                <div className="mt-2 text-[12px] text-white/55">
                  {t('Top')}: <span className="text-white/75">{volumeKPIs.topMonth?.name || '--'}</span>
                </div>
              </Card>

              <div className="lg:col-span-3 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                  <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">
                    {t('Consistencia').toUpperCase()}
                  </div>
                  <div className="mt-2 text-[12px] text-white/55">
                    {t('Streak')}: <span className="text-white/80 font-semibold">{consistencyKPIs.streak}</span> • {t('Días activos (7d)')}: <span className="text-white/80 font-semibold">{consistencyKPIs.activeDays7}</span>
                  </div>
                  <div className="mt-5">
                    <Heatmap
                      startDate={heatmapData.start}
                      days={heatmapData.days}
                      valueByDay={heatmapData.map}
                      detailsByDay={heatmapData.details}
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                  <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">
                    {t('Insights').toUpperCase()}
                  </div>
                  <div className="mt-4 space-y-3 text-[13px] text-white/70">
                    <div>{t('Sesiones')}: <span className="text-white/90 font-semibold">{sessions.length}</span></div>
                    <div>{t('Días activos')}: <span className="text-white/90 font-semibold">{consistencyKPIs.totalActiveDays}</span></div>
                    <div>{t('Ventana')}: <span className="text-white/90 font-semibold">120d</span></div>
                  </div>
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/10 px-4 py-4 text-[12px] text-white/55">
                    {t('Tip')}: {t('Busca mejorar la consistencia y la tendencia semanal, no solo los picos diarios.')}
                  </div>
                </div>
              </div>

              <div ref={chartRef} className="lg:col-span-3 rounded-2xl border border-white/15 bg-white/[0.02] p-6 scroll-mt-24">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">
                    {t('Pesos levantados').toUpperCase()} ({range.toUpperCase()}){' '}
                    <Hint text="Esto NO es tu peso corporal. Es el volumen total levantado: sumamos reps × kg en todos tus sets (sentadilla, press banca, etc.)." />
                  </div>
                    {sessionsLoading ? <div className="text-[12px] text-white/55">{t('Cargando...')}</div> : null}
                  </div>
                {sessionsError ? <div className="mt-3 text-[13px] text-[#ff7849]/90">{sessionsError}</div> : null}
                <div className="mt-5">
                  <SvgBarChart
                    data={volumeSeries}
                    tooltipFormatter={(d) => {
                      const v = Number(d?.value) || 0;
                      return v >= 1000 ? `${Math.round((v / 1000) * 10) / 10} toneladas` : `${Math.round(v)} kg`;
                    }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] text-white/55 sm:grid-cols-4">
                  <div>
                    {t('Ventana')}: {range === 'dia' ? '14 días' : range === 'semana' ? '12 semanas' : '12 meses'}{' '}
                    <Hint text="La ventana es el periodo que se muestra en la gráfica. No es un objetivo; solo el rango de tiempo visualizado." />
                  </div>
                  <div>{t('Sesiones')}: {sessions.length}</div>
                  <div>
                    {t('Último punto')}: {(() => {
                      const lastNonZero = [...volumeSeries].reverse().find((x) => (Number(x?.value) || 0) > 0);
                      const val = Number(lastNonZero?.value) || 0;
                      return `${formatTonnage(val)} ${val >= 1000 ? 'T' : 'KG'}`;
                    })()}
                  </div>
                  <div>{t('Máximo')}: {formatTonnage(Math.max(0, ...volumeSeries.map((d) => d.value)))} {Math.max(0, ...volumeSeries.map((d) => d.value)) >= 1000 ? 'T' : 'KG'}</div>
                </div>
              </div>
            </div>
          ) : (
            privacy.hideWeight ? (
              <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">
                  {t('Peso corporal oculto').toUpperCase()}
                </div>
                <div className="mt-3 text-[13px] text-white/60">
                  {t('Has activado la opción de privacidad para ocultar el peso corporal.')}
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => navigate('/privacy-settings')}
                    className="h-11 rounded-lg border border-white/15 bg-white/[0.02] px-4 text-[12px] font-bold tracking-wide text-white/80 transition hover:border-white/25 hover:bg-white/[0.03]"
                  >
                    {t('Abrir privacidad').toUpperCase()}
                  </button>
                </div>
              </div>
            ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card title={t('Peso actual').toUpperCase()} icon={Weight}>
                <StatValue value={formatKg(weightKPIs.current)} suffix="KG" />
                <div className="mt-2 text-[12px] text-white/55">{t('Último registro')}</div>
              </Card>
              <Card title={t('Cambio 30 días').toUpperCase()} icon={TrendingUp}>
                <StatValue value={Number.isFinite(weightKPIs.delta30) ? `${weightKPIs.delta30 > 0 ? '+' : ''}${formatKg(weightKPIs.delta30)}` : '--'} suffix="KG" />
                <div className="mt-2 text-[12px] text-white/55">{t('Diferencia entre primer y último')}</div>
              </Card>
              <Card title={t('Rango 30 días').toUpperCase()} icon={BarChart3}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold tracking-[0.22em] text-white/55">{t('MIN')}</div>
                    <div className="mt-2 text-[22px] font-bold text-white/95">{formatKg(weightKPIs.min30)} <span className="text-[12px] text-white/45">KG</span></div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold tracking-[0.22em] text-white/55">{t('MAX')}</div>
                    <div className="mt-2 text-[22px] font-bold text-white/95">{formatKg(weightKPIs.max30)} <span className="text-[12px] text-white/45">KG</span></div>
                  </div>
                </div>
              </Card>

              <div className="lg:col-span-2 rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">
                    {t('Evolución de peso').toUpperCase()}
                  </div>
                  {weightsLoading ? <div className="text-[12px] text-white/55">{t('Cargando...')}</div> : null}
                </div>
                {weightsError ? <div className="mt-3 text-[13px] text-[#ff7849]/90">{weightsError}</div> : null}
                <div className="mt-5">
                  <SvgLineChart data={weightSeries.map((d) => ({ key: d.key, value: d.value }))} />
                </div>
                <div className="mt-4 text-[12px] text-white/55">
                  {t('Consejo')}: {t('Registra tu peso a la misma hora y en condiciones similares para ver tendencias más claras.')}
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-6">
                <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">
                  {t('Añadir registro').toUpperCase()}
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{t('Fecha')}</div>
                    <input
                      type="date"
                      value={newWeightDate}
                      onChange={(e) => setNewWeightDate(e.target.value)}
                      className="mt-2 h-[44px] w-full rounded-lg border border-white/15 bg-[#1e1e1e] px-4 text-[13px] text-white/85 outline-none focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{t('Peso (kg)')}</div>
                    <input
                      value={newWeightKg}
                      onChange={(e) => setNewWeightKg(e.target.value)}
                      inputMode="decimal"
                      placeholder="Ej: 75.4"
                      className="mt-2 h-[44px] w-full rounded-lg border border-white/15 bg-[#1e1e1e] px-4 text-[13px] text-white/85 outline-none focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                    />
                  </div>
                  {saveWeightError ? <div className="text-[13px] text-[#ff7849]/90">{saveWeightError}</div> : null}
                  <button
                    type="button"
                    onClick={addWeight}
                    disabled={savingWeight}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#ff7849] text-[13px] font-bold tracking-wide text-white transition hover:brightness-95 disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {savingWeight ? t('Guardando...') : t('Añadir')}
                  </button>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="text-[11px] font-bold tracking-[0.22em] text-white/55">
                    {t('Recientes').toUpperCase()}
                  </div>
                  <div className="mt-3 space-y-2">
                    {weightEntries.slice(0, 6).map((e) => {
                      const id = e?._id || e?.id;
                      const fecha = new Date(e?.fecha || e?.createdAt || Date.now());
                      return (
                        <div key={String(id)} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-white/85">{formatKg(e?.peso_kg)} kg</div>
                            <div className="text-[11px] text-white/45">{toISODate(fecha)}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteWeight(id)}
                            className="rounded-md p-2 text-white/45 hover:text-white/80 hover:bg-white/5"
                            aria-label={t('Eliminar')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                    {!weightEntries.length && !weightsLoading ? (
                      <div className="text-[12px] text-white/55">{t('Aún no hay registros de peso.')}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
