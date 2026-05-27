import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, ChevronDown, ClipboardCopy, Search, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { getDateKey, upsertSession } from '../services/sessionStore';
import { createSession } from '../services/sessionsApi';
import { listWorkoutTypes, listZones, searchCatalogExercises } from '../services/catalogApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ children, className }) {
  return (
    <section
      className={cx(
        'rounded-lg sm:rounded-lg md:rounded-xl border border-white/10 bg-white/[0.06] shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </section>
  );
}

function FieldLabel({ children }) {
  return (
    <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/45 mb-2">{children}</p>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cx(
        'w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-[12px] sm:text-[13px] text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 focus:bg-white/[0.06]',
        className
      )}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 pr-10 text-[12px] sm:text-[13px] text-white/85 outline-none focus:border-white/30 focus:bg-white/[0.06]"
      >
        {options.map((opt) => {
          const isString = typeof opt === 'string';
          const optionValue = isString ? opt : opt.value;
          const optionLabel = isString ? opt : opt.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <ChevronDown className="h-4 w-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function OutlineButton({ children, className, ...props }) {
  return (
    <button
      {...props}
      type={props.type || 'button'}
      className={cx(
        'inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/[0.02] px-4 py-3 text-[12px] sm:text-[13px] font-semibold text-white/75 hover:text-white/90 hover:border-white/35 hover:bg-white/[0.05] transition',
        className
      )}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className, ...props }) {
  return (
    <button
      {...props}
      type={props.type || 'button'}
      className={cx(
        'inline-flex items-center justify-center rounded-lg border border-[#2c4c73] bg-[#1e3a5f] px-5 py-3 text-[12px] sm:text-[13px] font-semibold text-white/90 hover:bg-[#24466f] transition',
        className
      )}
    >
      {children}
    </button>
  );
}

function ResultRow({ label, onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full text-left rounded-lg border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] transition px-5 py-4"
    >
      <div className="text-[12px] sm:text-[13px] font-semibold text-white/85 uppercase tracking-wide">{label}</div>
    </button>
  );
}

function SetRow({ index, reps, weight, option, onChange, onRemove }) {
  const { lang } = useI18n();
  return (
    <div className="grid grid-cols-[44px_1fr_1fr_1fr_44px] gap-3 items-center">
      <div className="h-10 w-10 rounded-lg border border-white/20 bg-white/[0.02] flex items-center justify-center text-[12px] font-semibold text-white/80">
        {index + 1}
      </div>

      <Input
        value={reps}
        onChange={(e) => onChange({ reps: e.target.value })}
        placeholder={tr(lang, 'REPETICIONES', 'REPS')}
        className="py-2.5"
        inputMode="numeric"
      />

      <Input
        value={weight}
        onChange={(e) => onChange({ weight: e.target.value })}
        placeholder={tr(lang, 'PESO (KG)', 'WEIGHT (KG)')}
        className="py-2.5"
        inputMode="decimal"
      />

      <div className="relative">
        <select
          value={option}
          onChange={(e) => onChange({ option: e.target.value })}
          className="appearance-none w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 pr-10 text-[12px] text-white/70 outline-none focus:border-white/30 focus:bg-white/[0.06]"
        >
          <option value="OPCIONES">{tr(lang, 'OPCIONES', 'OPTIONS')}</option>
          <option value="NORMAL">{tr(lang, 'NORMAL', 'NORMAL')}</option>
          <option value="FALLO">{tr(lang, 'FALLO', 'FAILURE')}</option>
          <option value="DROPSET">{tr(lang, 'DROPSET', 'DROPSET')}</option>
          <option value="PAUSA">{tr(lang, 'PAUSA', 'PAUSE')}</option>
        </select>
        <ChevronDown className="h-4 w-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="h-10 w-10 rounded-lg border border-white/20 bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:text-white/90 transition flex items-center justify-center"
        aria-label={tr(lang, 'Eliminar serie', 'Remove set')}
        title={tr(lang, 'Eliminar serie', 'Remove set')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddedExerciseCard({ exercise, onRemoveExercise, onUpdateSet, onAddSet, onRemoveSet }) {
  const { lang } = useI18n();
  return (
    <Card className="p-5 sm:p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[14px] sm:text-[15px] md:text-[16px] font-bold text-white/90 uppercase tracking-wide">
          {exercise.name}
        </div>
        <OutlineButton onClick={onRemoveExercise} className="px-4 py-2 text-[11px]">
          {tr(lang, 'ELIMINAR', 'REMOVE')}
        </OutlineButton>
      </div>

      <div className="h-px w-full bg-white/10 my-4 sm:my-5" />

      <div className="space-y-3">
        {exercise.sets.map((set, idx) => (
          <SetRow
            key={set.id}
            index={idx}
            reps={set.reps}
            weight={set.weight}
            option={set.option}
            onChange={(patch) => onUpdateSet(set.id, patch)}
            onRemove={() => onRemoveSet(set.id)}
          />
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onAddSet}
          className="w-full rounded-lg border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] transition py-3 text-[12px] font-semibold text-white/80"
        >
          + {tr(lang, 'AÑADIR', 'ADD')}
        </button>
      </div>
    </Card>
  );
}

function makeId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function SavedWorkoutStat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="text-[13px] font-bold text-white/90">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

function SavedWorkoutCard({ workout, copiedState, onCopyReplace, onCopyAppend }) {
  const { lang } = useI18n();
  return (
    <Card className="p-4 sm:p-5 border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] sm:text-[13px] font-bold text-white/90 uppercase tracking-wide truncate">
            {workout.title}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
            {tr(lang, 'Guardado de', 'Saved from')}{' '}
            <span className="text-white/65 font-semibold">@{workout.sourceUser}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/45">
          <Bookmark className="h-4 w-4" />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 mt-4">
        <SavedWorkoutStat label={tr(lang, 'Ejer', 'Ex')} value={workout.stats.exercises} />
        <SavedWorkoutStat label={tr(lang, 'Dur', 'Dur')} value={workout.stats.duration} />
        <SavedWorkoutStat label={tr(lang, 'Cal', 'Cal')} value={workout.stats.calories} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <OutlineButton onClick={onCopyAppend} className="flex-1 py-2.5 text-[11px]">
          {tr(lang, 'Añadir', 'Append')}
        </OutlineButton>
        <PrimaryButton onClick={onCopyReplace} className="flex-1 py-2.5 text-[11px]">
          {copiedState ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              {tr(lang, 'Copiado', 'Copied')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <ClipboardCopy className="h-4 w-4" />
              {tr(lang, 'Copiar', 'Copy')}
            </span>
          )}
        </PrimaryButton>
      </div>

      <div className="text-[10px] text-white/40 mt-3">
        <span className="font-semibold text-white/55">{workout.exercises.length}</span>{' '}
        {tr(lang, 'ejercicios en la plantilla', 'exercises in template')}
      </div>
    </Card>
  );
}

export default function CreateSession() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [params] = useSearchParams();
  const [zones, setZones] = useState([]);
  const [types, setTypes] = useState([]);
  const [activity, setActivity] = useState('gym'); // gym | football | padel | running
  const [muscleGroup, setMuscleGroup] = useState('full_body');
  const [workoutType, setWorkoutType] = useState('strength');
  const [sessionName, setSessionName] = useState('');
  const [search, setSearch] = useState('');
  const [savedQuery, setSavedQuery] = useState('');
  const [copiedWorkoutId, setCopiedWorkoutId] = useState(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [exerciseResults, setExerciseResults] = useState([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [catalogError, setCatalogError] = useState('');

  const dateKey = useMemo(() => {
    const raw = params.get('date');
    if (!raw) return getDateKey(new Date());
    // Expect YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return getDateKey(new Date());
    const d = new Date(`${raw}T12:00:00`);
    if (Number.isNaN(d.getTime())) return getDateKey(new Date());
    return getDateKey(d);
  }, [params]);

  const workoutDateLabel = useMemo(() => {
    const base = new Date(`${dateKey}T12:00:00`);
    const locale = lang === 'en' ? 'en-US' : 'es-ES';
    return base.toLocaleDateString(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [dateKey, lang]);

  useEffect(() => {
    let alive = true;
    setCatalogError('');
    Promise.all([listZones(), listWorkoutTypes()])
      .then(([z, t]) => {
        if (!alive) return;
        setZones(Array.isArray(z?.items) ? z.items : []);
        setTypes(Array.isArray(t?.items) ? t.items : []);
      })
      .catch((e) => {
        if (!alive) return;
        setZones([]);
        setTypes([]);
        setCatalogError(
          e?.message || tr(lang, 'No se pudieron cargar zonas y tipos', 'Could not load zones and types')
        );
      });
    return () => {
      alive = false;
    };
  }, [lang]);

  const activityOptions = useMemo(
    () => [
      { value: 'gym', label: tr(lang, 'GIMNASIO', 'GYM') },
      { value: 'football', label: tr(lang, 'FÚTBOL', 'FOOTBALL') },
      { value: 'padel', label: tr(lang, 'PÁDEL', 'PADEL') },
      { value: 'running', label: tr(lang, 'RUNNING', 'RUNNING') },
    ],
    [lang]
  );

  const filteredZones = useMemo(() => {
    const all = Array.isArray(zones) ? zones : [];
    if (!all.length) return [];
    const keysByActivity = {
      gym: null,
      football: ['legs', 'calves', 'glutes', 'abs'],
      padel: ['arms', 'shoulders', 'abs', 'legs'],
      running: ['legs', 'calves', 'glutes'],
    };
    const keys = keysByActivity[activity] || null;
    if (!keys) return all;
    return all.filter((z) => keys.includes(String(z?.key)));
  }, [activity, zones]);

  const filteredTypes = useMemo(() => {
    const all = Array.isArray(types) ? types : [];
    if (!all.length) return [];
    const keysByActivity = {
      gym: null,
      football: ['cardio', 'hiit', 'mobility'],
      padel: ['cardio', 'strength', 'mobility'],
      running: ['cardio', 'hiit', 'mobility'],
    };
    const keys = keysByActivity[activity] || null;
    if (!keys) return all;
    return all.filter((t) => keys.includes(String(t?.key)));
  }, [activity, types]);

  useEffect(() => {
    // Keep selected values valid when activity changes or when catalog loads.
    if (filteredZones.length && !filteredZones.some((z) => String(z?.key) === String(muscleGroup))) {
      setMuscleGroup(String(filteredZones[0]?.key || 'full_body'));
    }
    if (filteredTypes.length && !filteredTypes.some((t) => String(t?.key) === String(workoutType))) {
      setWorkoutType(String(filteredTypes[0]?.key || 'strength'));
    }
  }, [filteredZones, filteredTypes, muscleGroup, workoutType]);

  const zoneLabel = useMemo(() => {
    const source = filteredZones.length ? filteredZones : zones;
    const z = source.find((x) => String(x?.key) === String(muscleGroup));
    if (!z) return '';
    return lang === 'en' ? z.label_en : z.label_es;
  }, [filteredZones, lang, muscleGroup, zones]);

  const typeLabel = useMemo(() => {
    const source = filteredTypes.length ? filteredTypes : types;
    const t = source.find((x) => String(x?.key) === String(workoutType));
    if (!t) return '';
    return lang === 'en' ? t.label_en : t.label_es;
  }, [filteredTypes, lang, types, workoutType]);

  useEffect(() => {
    if (!sessionName.trim()) {
      const next = [zoneLabel, typeLabel].filter(Boolean).join(' · ');
      if (next) setSessionName(next);
    }
  }, [sessionName, typeLabel, zoneLabel]);

  useEffect(() => {
    let alive = true;
    const q = search.trim();
    setExerciseError('');
    setExerciseLoading(true);

    const timer = window.setTimeout(() => {
      searchCatalogExercises({ search: q, zoneKey: muscleGroup, typeKey: workoutType })
        .then((data) => {
          if (!alive) return;
          setExerciseResults(Array.isArray(data?.items) ? data.items : []);
        })
        .catch((e) => {
          if (!alive) return;
          setExerciseResults([]);
          setExerciseError(e?.message || tr(lang, 'Error buscando ejercicios', 'Error searching exercises'));
        })
        .finally(() => {
          if (!alive) return;
          setExerciseLoading(false);
        });
    }, 180);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [lang, muscleGroup, search, workoutType]);

  const results = useMemo(() => {
    if (exerciseLoading) return [];
    return (Array.isArray(exerciseResults) ? exerciseResults : [])
      .slice(0, 6)
      .map((x) => ({
        id: String(x?._id || x?.id || ''),
        name: String(x?.nombre || '').toUpperCase(),
      }))
      .filter((x) => x.id && x.name);
  }, [exerciseLoading, exerciseResults]);

  const savedWorkouts = useMemo(
    () => [
      {
        id: 'sw_1',
        title: 'Pierna completo',
        sourceUser: 'JUAN_FITNESS',
        stats: { exercises: 8, duration: '65m', calories: 420 },
        muscleGroup: 'legs',
        workoutType: 'strength',
        exercises: [
          { name: 'SENTADILLA', setsCount: 4 },
          { name: 'PESO MUERTO', setsCount: 3 },
          { name: 'PRENSA', setsCount: 4 },
          { name: 'ZANCADAS', setsCount: 3 },
        ],
      },
      {
        id: 'sw_2',
        title: 'HIIT rápido',
        sourceUser: 'ANA_STRONG',
        stats: { exercises: 6, duration: '30m', calories: 420 },
        muscleGroup: 'full_body',
        workoutType: 'hiit',
        exercises: [
          { name: 'BURPEES', setsCount: 5 },
          { name: 'SPRINT', setsCount: 5 },
          { name: 'SALTOS', setsCount: 5 },
        ],
      },
      {
        id: 'sw_3',
        title: 'Pecho + tríceps',
        sourceUser: 'COACH_MIGUEL',
        stats: { exercises: 7, duration: '55m', calories: 410 },
        muscleGroup: 'chest',
        workoutType: 'strength',
        exercises: [
          { name: 'PRESS BANCA PLANO', setsCount: 4 },
          { name: 'PRESS BANCA INCLINADO', setsCount: 4 },
          { name: 'APERTURAS CON MANCUERNAS', setsCount: 3 },
          { name: 'FONDOS', setsCount: 3 },
        ],
      },
    ],
    []
  );

  const filteredSavedWorkouts = useMemo(() => {
    const q = savedQuery.trim().toLowerCase();
    if (!q) return savedWorkouts;
    return savedWorkouts.filter(
      (w) => w.title.toLowerCase().includes(q) || w.muscleGroup.toLowerCase().includes(q)
    );
  }, [savedQuery, savedWorkouts]);

  const [added, setAdded] = useState(() => [
    {
      id: makeId('ex'),
      name: 'PRESS BANCA PLANO',
      sets: [
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
      ],
    },
    {
      id: makeId('ex'),
      name: 'PRESS BANCA INCLINADO',
      sets: [
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
      ],
    },
    {
      id: makeId('ex'),
      name: 'PRESS BANCA DECLINADO',
      sets: [
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
        { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' },
      ],
    },
  ]);

  const toAddedExercises = (savedWorkout) => {
    return savedWorkout.exercises.map((exercise) => ({
      id: makeId('ex'),
      name: exercise.name,
      sets: Array.from({ length: Math.max(1, exercise.setsCount || 1) }).map(() => ({
        id: makeId('set'),
        reps: '',
        weight: '',
        option: 'OPCIONES',
      })),
    }));
  };

  const copySavedWorkout = (savedWorkout, mode) => {
    const nextExercises = toAddedExercises(savedWorkout);
    setMuscleGroup(savedWorkout.muscleGroup);
    setWorkoutType(savedWorkout.workoutType);

    if (mode === 'append') {
      setAdded((prev) => {
        const existingNames = new Set(prev.map((ex) => ex.name));
        const merged = [...prev];
        nextExercises.forEach((ex) => {
          if (!existingNames.has(ex.name)) merged.push(ex);
        });
        return merged;
      });
    } else {
      setAdded(nextExercises);
    }

    setCopiedWorkoutId(savedWorkout.id);
    window.setTimeout(() => setCopiedWorkoutId(null), 1500);
  };

  const addExercise = (exercise) => {
    const catalogId = String(exercise?.id || '');
    const name = String(exercise?.name || '').trim();
    if (!catalogId || !name) return;
    setAdded((prev) => {
      if (prev.some((ex) => ex.catalogId === catalogId || ex.name === name)) return prev;
      return [
        ...prev,
        {
          id: makeId('ex'),
          name,
          catalogId,
          sets: [{ id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' }],
        },
      ];
    });
  };

  const removeExercise = (exerciseId) => {
    setAdded((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const addSet = (exerciseId) => {
    setAdded((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { id: makeId('set'), reps: '', weight: '', option: 'OPCIONES' }] }
          : ex
      )
    );
  };

  const updateSet = (exerciseId, setId, patch) => {
    setAdded((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
            }
          : ex
      )
    );
  };

  const removeSet = (exerciseId, setId) => {
    setAdded((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((set) => set.id !== setId) } : ex
      )
    );
  };

  const handleSave = async () => {
    setSaveError('');
    if (saving) return;
    const id = makeId('session');
    const createdAt = Date.now();
    const totalSets = added.reduce((acc, ex) => acc + (Array.isArray(ex.sets) ? ex.sets.length : 0), 0);
    const session = {
      id,
      dateKey,
      createdAt,
      title: sessionName.trim() ? sessionName.trim() : `${muscleGroup} · ${workoutType}`,
      date: workoutDateLabel,
      duration: '60 MIN',
      muscleGroup,
      workoutType,
      exercisesCount: added.length,
      series: totalSets,
      volume: totalSets ? `${totalSets * 40} KG` : '0 KG',
      exercises: added.map((ex) => ({
        name: ex.name,
        sets: Array.isArray(ex.sets)
          ? ex.sets.map((s, idx) => ({
              number: idx + 1,
              reps: s.reps === '' ? 0 : Number.isFinite(Number(s.reps)) ? Number(s.reps) : 0,
              weight: s.weight ?? '',
              option: s.option ?? 'OPCIONES',
            }))
          : [],
      })),
    };

    setSaving(true);
    try {
      const apiPayload = {
        fecha: `${dateKey}T12:00:00.000Z`,
        tipo_rutina: sessionName.trim() ? sessionName.trim() : `${muscleGroup} · ${workoutType}`,
        ejercicios_realizados: added.map((ex, idx) => ({
          ejercicio_id: ex.catalogId || idx + 1,
          nombre_ejercicio: ex.name,
          sets: Array.isArray(ex.sets)
            ? ex.sets.map((s) => ({
                reps: s.reps === '' ? 0 : Number.isFinite(Number(s.reps)) ? Number(s.reps) : 0,
                peso:
                  s.weight === '' || s.weight === undefined || s.weight === null
                    ? 0
                    : Number.isFinite(Number(s.weight))
                      ? Number(s.weight)
                      : 0,
                rpe: null,
              }))
            : [],
        })),
        notas: '',
        duracion_minutos: 60,
      };

      const created = await createSession(apiPayload);
      // Keep local cache for UI/offline while we migrate the rest.
      upsertSession(session);

      navigate('/entrenamientos', { state: { createdSession: created?.session } });
    } catch (e) {
      setSaveError(e?.message || tr(lang, 'No se pudo guardar la sesión', 'Could not save the session'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-6 md:py-7 xl:py-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold tracking-wide text-white/95 uppercase">
                {tr(lang, 'CREAR NUEVA SESIÓN', 'CREATE NEW SESSION')}
              </h1>
              <div className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-white/45 mt-1">
                {workoutDateLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSavedPanelOpen(true)}
              className="hidden md:inline-flex h-[64px] w-[360px] max-w-[38vw] rounded-lg border border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/35 transition items-center justify-center gap-2 text-[12px] font-semibold text-white/80"
              aria-label={tr(lang, 'Abrir entrenos guardados', 'Open saved workouts')}
              title={tr(lang, 'Entrenos guardados', 'Saved workouts')}
            >
              <Bookmark className="h-4 w-4 text-white/60" />
              {tr(lang, 'ENTRENOS GUARDADOS', 'SAVED WORKOUTS')}
            </button>
          </div>

          <Card className="p-5 sm:p-6 md:p-7 border-white/15">
            <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest text-white/85">
              {tr(lang, 'CONFIGURACIÓN', 'SETTINGS')}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <FieldLabel>{tr(lang, 'NOMBRE DE LA SESIÓN', 'SESSION NAME')}</FieldLabel>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={tr(lang, 'Ej: Pecho pesado', 'e.g. Heavy chest')}
                />
              </div>
              <div>
                <FieldLabel>{tr(lang, 'ACTIVIDAD', 'ACTIVITY')}</FieldLabel>
                <Select value={activity} onChange={setActivity} options={activityOptions} />
              </div>
              <div>
                <FieldLabel>{tr(lang, 'ZONA A ENTRENAR', 'MUSCLE GROUP')}</FieldLabel>
                <Select
                  value={muscleGroup}
                  onChange={setMuscleGroup}
                  options={
                    filteredZones.length
                      ? filteredZones.map((z) => ({
                          value: z.key,
                          label: (lang === 'en' ? z.label_en : z.label_es).toUpperCase(),
                        }))
                      : [{ value: 'full_body', label: tr(lang, 'CUERPO COMPLETO', 'FULL BODY') }]
                  }
                />
              </div>
              <div>
                <FieldLabel>{tr(lang, 'TIPO DE ENTRENO', 'WORKOUT TYPE')}</FieldLabel>
                <Select
                  value={workoutType}
                  onChange={setWorkoutType}
                  options={
                    filteredTypes.length
                      ? filteredTypes.map((t) => ({
                          value: t.key,
                          label: (lang === 'en' ? t.label_en : t.label_es).toUpperCase(),
                        }))
                      : [{ value: 'strength', label: tr(lang, 'FUERZA', 'STRENGTH') }]
                  }
                />
              </div>
            </div>

            {catalogError ? (
              <div className="mt-4 rounded-lg border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">
                {catalogError}
              </div>
            ) : null}

            <div className="mt-6">
              <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wide text-white/85">
                {tr(lang, 'AÑADIR EJERCICIO', 'ADD EXERCISE')}
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_140px] gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={tr(lang, 'BUSCAR EJERCICIO (EJ: PRESS BANCA, FONDOS...)', 'SEARCH EXERCISE (E.G. BENCH PRESS, DIPS...)')}
                    className="pl-11"
                  />
                </div>
                <OutlineButton className="py-3">{tr(lang, 'BUSCAR', 'SEARCH')}</OutlineButton>
              </div>

              <div className="h-px w-full bg-white/10 my-5" />

              <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/45 mb-3">
                {tr(lang, 'RESULTADOS', 'RESULTS')}
              </div>
              <div className="space-y-3">
                {exerciseError ? (
                  <div className="rounded-lg border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">
                    {exerciseError}
                  </div>
                ) : null}
                {exerciseLoading ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-white/60">
                    {tr(lang, 'Buscando...', 'Searching...')}
                  </div>
                ) : null}
                {results.map((ex) => (
                  <ResultRow key={ex.id} label={ex.name} onAdd={() => addExercise(ex)} />
                ))}
              </div>
            </div>
          </Card>

          <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest text-white/85">
            {tr(lang, 'EJERCICIOS AÑADIDOS', 'ADDED EXERCISES')}
          </div>

          <div className="space-y-5 sm:space-y-6">
            {added.map((exercise) => (
              <AddedExerciseCard
                key={exercise.id}
                exercise={exercise}
                onRemoveExercise={() => removeExercise(exercise.id)}
                onAddSet={() => addSet(exercise.id)}
                onUpdateSet={(setId, patch) => updateSet(exercise.id, setId, patch)}
                onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              />
            ))}
          </div>

          {saveError ? (
            <div className="rounded-lg border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">
              {saveError}
            </div>
          ) : null}

          <div className="pt-2 flex items-center justify-center gap-4">
            <OutlineButton onClick={() => navigate(-1)} className="min-w-[160px]">
              {tr(lang, 'CANCELAR', 'CANCEL')}
            </OutlineButton>
            <PrimaryButton
              onClick={handleSave}
              className={cx('min-w-[180px]', saving ? 'opacity-70 cursor-not-allowed' : '')}
              disabled={saving}
            >
              {saving ? tr(lang, 'GUARDANDO...', 'SAVING...') : tr(lang, 'GUARDAR SESIÓN', 'SAVE SESSION')}
            </PrimaryButton>
          </div>
        </div>
      </div>

      {isSavedPanelOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsSavedPanelOpen(false)}
            aria-label={tr(lang, 'Cerrar', 'Close')}
          />

          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-[#1e1e1e] border-l border-white/10 shadow-2xl">
            <div className="h-[56px] sm:h-[64px] border-b border-white/10 flex items-center justify-between px-4 sm:px-5">
              <div className="text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-white/85">
                {tr(lang, 'Entrenos guardados', 'Saved workouts')}
              </div>
              <button
                type="button"
                onClick={() => setIsSavedPanelOpen(false)}
                className="h-10 w-10 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center text-white/70"
                aria-label={tr(lang, 'Cerrar panel', 'Close panel')}
                title={tr(lang, 'Cerrar', 'Close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-auto h-[calc(100%-56px)] sm:h-[calc(100%-64px)]">
              <div className="relative">
                <Search className="h-4 w-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
                <Input
                  value={savedQuery}
                  onChange={(e) => setSavedQuery(e.target.value)}
                  placeholder={tr(lang, 'Buscar (pecho, pierna, hiit...)', 'Search (chest, legs, hiit...)')}
                  className="pl-11 py-2.5"
                />
              </div>

              <div className="space-y-3">
                {filteredSavedWorkouts.map((workout) => (
                  <SavedWorkoutCard
                    key={workout.id}
                    workout={workout}
                    copiedState={copiedWorkoutId === workout.id}
                    onCopyReplace={() => {
                      copySavedWorkout(workout, 'replace');
                      setIsSavedPanelOpen(false);
                    }}
                    onCopyAppend={() => {
                      copySavedWorkout(workout, 'append');
                      setIsSavedPanelOpen(false);
                    }}
                  />
                ))}

                {filteredSavedWorkouts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 text-[12px] text-white/55">
                    No hay entrenos guardados que coincidan.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
