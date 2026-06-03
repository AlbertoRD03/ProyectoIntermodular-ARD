import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, ClipboardList, Dumbbell, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { listZones, searchCatalogExercises } from '../services/catalogApi';
import { getSessionPlan, getSessionPlanPreset, saveSessionPlan } from '../services/sessionPlanApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const dayNamesEs = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const dayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Card({ children, className, ...props }) {
  return (
    <section {...props} className={cx('rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_24px_70px_-55px_rgba(0,0,0,0.95)]', className)}>
      {children}
    </section>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cx('h-11 w-full rounded-xl border border-white/15 bg-[#1e1e1e] px-4 text-[12px] font-semibold text-white/85 placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/60 focus:ring-2 focus:ring-[#ff7849]/15', className)}
    />
  );
}

function Select({ className, children, ...props }) {
  return (
    <select
      {...props}
      className={cx('h-11 w-full rounded-xl border border-white/15 bg-[#1e1e1e] px-4 text-[12px] font-semibold text-white/85 outline-none transition focus:border-[#ff7849]/60 focus:ring-2 focus:ring-[#ff7849]/15', className)}
    >
      {children}
    </select>
  );
}

function makeSession(dayIndex, title = '') {
  return {
    dayIndex,
    title: title || dayNamesEs[dayIndex - 1] || 'Entreno',
    zoneKeys: [],
    notes: '',
    exercises: [],
  };
}

function normalizePlan(raw) {
  const plan = raw?.plan || raw || {};
  return {
    trainingDays: Number(plan.trainingDays || 3),
    sessions: Array.isArray(plan.sessions) ? plan.sessions.map((session) => ({
      dayIndex: Number(session.dayIndex || 1),
      title: String(session.title || ''),
      zoneKeys: Array.isArray(session.zoneKeys) ? session.zoneKeys : [],
      notes: String(session.notes || ''),
      exercises: Array.isArray(session.exercises) ? session.exercises.map((exercise) => ({
        catalogId: exercise.catalogId || exercise._id || exercise.id || '',
        name: String(exercise.name || exercise.nombre || ''),
        setsCount: Number(exercise.setsCount || 3) || 3,
      })).filter((exercise) => exercise.name) : [],
    })) : [],
  };
}

function getZoneLabel(zone, lang) {
  return String(lang === 'en' ? zone?.label_en : zone?.label_es || zone?.label_en || zone?.key || '').trim();
}

function getExerciseName(exercise) {
  return String(exercise?.nombre || exercise?.name || '').trim();
}

function SessionEditor({ session, zones, exercises, lang, onChange, onDelete }) {
  const dayNames = lang === 'en' ? dayNamesEn : dayNamesEs;
  const [exerciseToAdd, setExerciseToAdd] = useState('');

  const addExercise = () => {
    const item = exercises.find((exercise) => String(exercise._id || exercise.id || getExerciseName(exercise)) === String(exerciseToAdd));
    const name = getExerciseName(item);
    if (!name) return;
    onChange({
      ...session,
      exercises: [
        ...(session.exercises || []),
        { catalogId: item?._id || item?.id || '', name, setsCount: 3 },
      ],
    });
    setExerciseToAdd('');
  };

  const toggleZone = (zoneKey) => {
    const current = new Set(session.zoneKeys || []);
    if (current.has(zoneKey)) current.delete(zoneKey);
    else current.add(zoneKey);
    onChange({ ...session, zoneKeys: Array.from(current) });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ff7849]/35 bg-[#ff7849]/10 text-[#ff7849]">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{dayNames[session.dayIndex - 1]}</div>
            <Input
              value={session.title}
              onChange={(e) => onChange({ ...session, title: e.target.value })}
              className="mt-1 h-9 bg-white/[0.035] text-[14px] font-bold uppercase"
              placeholder={tr(lang, 'Nombre de la sesión', 'Session name')}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={session.dayIndex} onChange={(e) => onChange({ ...session, dayIndex: Number(e.target.value) })} className="w-[150px]">
            {dayNames.map((day, idx) => <option key={day} value={idx + 1}>{day}</option>)}
          </Select>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 text-[11px] font-bold text-red-200 transition hover:bg-red-400/20"
          >
            <Trash2 className="h-4 w-4" />
            {tr(lang, 'Quitar', 'Remove')}
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40">{tr(lang, 'Zonas', 'Zones')}</div>
          <div className="flex flex-wrap gap-2">
            {zones.map((zone) => {
              const key = String(zone.key || '');
              const active = (session.zoneKeys || []).includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleZone(key)}
                  className={cx(
                    'rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition',
                    active ? 'border-[#ff7849] bg-[#ff7849] text-white' : 'border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.08]'
                  )}
                >
                  {getZoneLabel(zone, lang)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40">{tr(lang, 'Ejercicios base', 'Base exercises')}</div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Select value={exerciseToAdd} onChange={(e) => setExerciseToAdd(e.target.value)}>
              <option value="">{tr(lang, 'Seleccionar ejercicio', 'Select exercise')}</option>
              {exercises.map((exercise) => {
                const id = String(exercise._id || exercise.id || getExerciseName(exercise));
                return <option key={id} value={id}>{getExerciseName(exercise)}</option>;
              })}
            </Select>
            <button
              type="button"
              onClick={addExercise}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#ff7849]/40 bg-[#ff7849]/10 px-4 text-[12px] font-bold text-[#ff7849] transition hover:bg-[#ff7849]/20"
            >
              <Plus className="h-4 w-4" />
              {tr(lang, 'Añadir', 'Add')}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {(session.exercises || []).length ? session.exercises.map((exercise, idx) => (
              <div key={`${exercise.name}_${idx}`} className="grid grid-cols-[1fr_88px_40px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <div className="truncate px-2 text-[12px] font-semibold text-white/80">{exercise.name}</div>
                <Input
                  value={exercise.setsCount}
                  inputMode="numeric"
                  onChange={(e) => {
                    const next = [...session.exercises];
                    next[idx] = { ...exercise, setsCount: e.target.value };
                    onChange({ ...session, exercises: next });
                  }}
                  className="h-9 px-3 text-center"
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...session, exercises: session.exercises.filter((_, i) => i !== idx) })}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-3 text-[12px] text-white/45">
                {tr(lang, 'Sin ejercicios predefinidos. Se podrá completar al crear sesión.', 'No predefined exercises. You can complete it when creating the session.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SessionPlanner() {
  const { lang } = useI18n();
  const [plan, setPlan] = useState({ trainingDays: 3, sessions: [] });
  const [zones, setZones] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      getSessionPlan().catch(() => ({ plan: { trainingDays: 3, sessions: [] } })),
      listZones().catch(() => ({ items: [] })),
      searchCatalogExercises({ limit: 500 }).catch(() => ({ items: [] })),
    ]).then(([planData, zonesData, exerciseData]) => {
      if (!alive) return;
      setPlan(normalizePlan(planData));
      setZones(Array.isArray(zonesData?.items) ? zonesData.items : []);
      setExercises(Array.isArray(exerciseData?.items) ? exerciseData.items : []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const sortedSessions = useMemo(
    () => [...(plan.sessions || [])].sort((a, b) => Number(a.dayIndex) - Number(b.dayIndex)),
    [plan.sessions]
  );

  const applyPreset = async (days) => {
    setMessage('');
    const data = await getSessionPlanPreset(days).catch(() => ({ preset: { trainingDays: days, sessions: [] } }));
    setPlan(normalizePlan(data?.preset));
  };

  const setTrainingDays = (days) => {
    const value = Number(days);
    applyPreset(value);
  };

  const updateSession = (index, nextSession) => {
    const next = [...sortedSessions];
    next[index] = nextSession;
    setPlan((prev) => ({ ...prev, sessions: next }));
  };

  const addSession = () => {
    const used = new Set((plan.sessions || []).map((session) => Number(session.dayIndex)));
    const dayIndex = [1, 2, 3, 4, 5, 6, 7].find((day) => !used.has(day)) || 1;
    setPlan((prev) => ({
      ...prev,
      trainingDays: Math.min(7, Math.max(prev.trainingDays, (prev.sessions || []).length + 1)),
      sessions: [...(prev.sessions || []), makeSession(dayIndex)],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const data = await saveSessionPlan(plan);
      setPlan(normalizePlan(data));
      setMessage(tr(lang, 'Planificador guardado correctamente.', 'Planner saved successfully.'));
    } catch (error) {
      setMessage(error?.message || tr(lang, 'No se pudo guardar el planificador.', 'Could not save planner.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />
      <main className="w-full px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1320px] space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-[#ff7849]">FitTrack Planner</div>
              <h1 className="mt-2 text-[28px] font-bold uppercase tracking-wide text-white/95 sm:text-[34px]">
                {tr(lang, 'Planificador de sesiones', 'Session planner')}
              </h1>
              <p className="mt-2 max-w-[780px] text-[13px] text-white/50 sm:text-[14px]">
                {tr(lang, 'Define tu semana ideal, aplica un preset según los días que entrenas y úsalo directamente al crear sesiones.', 'Define your ideal week, apply presets based on training days, and use it directly when creating sessions.')}
              </p>
            </div>
            <Card className="grid grid-cols-2 gap-3 p-4 sm:min-w-[420px]">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">{tr(lang, 'Días/semana', 'Days/week')}</div>
                <Select value={plan.trainingDays} onChange={(e) => setTrainingDays(e.target.value)} className="mt-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day}</option>)}
                </Select>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40">{tr(lang, 'Sesiones', 'Sessions')}</div>
                <div className="mt-3 text-[28px] font-bold text-white/95">{sortedSessions.length}</div>
              </div>
            </Card>
          </div>

          <Card className="p-4" data-tour="planner-preset">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#ff7849]/35 bg-[#ff7849]/10 text-[#ff7849]">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold uppercase text-white/90">{tr(lang, 'Preset recomendado', 'Recommended preset')}</h2>
                  <p className="text-[11px] text-white/45">{tr(lang, 'Cambiar días aplica una propuesta editable.', 'Changing days applies an editable proposal.')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => applyPreset(plan.trainingDays)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-[11px] font-bold text-white/70 hover:bg-white/[0.08]">
                  <RotateCcw className="h-4 w-4" />
                  {tr(lang, 'Reaplicar preset', 'Reapply preset')}
                </button>
                <button type="button" onClick={addSession} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-[11px] font-bold text-white/70 hover:bg-white/[0.08]">
                  <Plus className="h-4 w-4" />
                  {tr(lang, 'Añadir día', 'Add day')}
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ff7849]/45 bg-[#ff7849] px-4 text-[11px] font-bold uppercase tracking-wide text-white disabled:opacity-60">
                  {saving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saving ? tr(lang, 'Guardando...', 'Saving...') : tr(lang, 'Guardar plan', 'Save plan')}
                </button>
              </div>
            </div>
            {message ? <div className="mt-4 rounded-xl border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">{message}</div> : null}
          </Card>

          {loading ? (
            <Card className="p-8 text-center text-[13px] text-white/55">{tr(lang, 'Cargando planificador...', 'Loading planner...')}</Card>
          ) : sortedSessions.length ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-tour="planner-sessions">
              {sortedSessions.map((session, index) => (
                <SessionEditor
                  key={`${session.dayIndex}_${index}`}
                  session={session}
                  zones={zones}
                  exercises={exercises}
                  lang={lang}
                  onChange={(nextSession) => updateSession(index, nextSession)}
                  onDelete={() => setPlan((prev) => ({ ...prev, sessions: sortedSessions.filter((_, i) => i !== index) }))}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center" data-tour="planner-sessions">
              <ClipboardList className="mx-auto h-8 w-8 text-white/25" />
              <div className="mt-3 text-[14px] font-bold uppercase text-white/80">{tr(lang, 'Sin sesiones planificadas', 'No planned sessions')}</div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
