import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, ChevronDown, ClipboardCopy, Plus, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { getDateKey, upsertSession } from '../services/sessionStore';
import { createSession } from '../services/sessionsApi';
import { listZones, searchCatalogExercises } from '../services/catalogApi';

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
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  const normalized = useMemo(() => {
    return options.map((opt) => {
      const isString = typeof opt === 'string';
      return {
        value: String(isString ? opt : opt.value),
        label: String(isString ? opt : opt.label),
      };
    });
  }, [options]);

  const selected = useMemo(() => {
    const found = normalized.find((o) => o.value === String(value));
    return found?.label || (normalized[0]?.label ?? '');
  }, [normalized, value]);

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 pr-10 text-left text-[12px] sm:text-[13px] text-white/85 outline-none hover:border-white/25 focus:border-white/30 focus:bg-white/[0.06] transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="block truncate">{selected}</span>
        <ChevronDown
          className={cx(
            'h-4 w-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform',
            open ? 'rotate-180' : ''
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-lg border border-white/10 bg-[#2a2a2a] shadow-xl overflow-hidden"
        >
          {normalized.map((opt) => {
            const active = opt.value === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cx(
                  'w-full text-left px-4 py-2.5 text-[12px] sm:text-[13px] transition',
                  active ? 'bg-white/10 text-white/90' : 'text-white/80 hover:bg-[#ff7849]/15 hover:text-white'
                )}
              >
                <span className="block truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
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

function SetRow({ index, reps, weight, option, onChange, onRemove }) {
  const { lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const optionItems = useMemo(
    () => [
      { value: 'OPCIONES', label: tr(lang, 'OPCIONES', 'OPTIONS') },
      { value: 'NORMAL', label: tr(lang, 'NORMAL', 'NORMAL') },
      { value: 'CALENTAMIENTO', label: tr(lang, 'CALENTAMIENTO', 'WARM-UP') },
      { value: 'APROXIMACION', label: tr(lang, 'APROXIMACIÓN', 'RAMP-UP') },
      { value: 'EFECTIVA', label: tr(lang, 'EFECTIVA', 'WORKING SET') },
      { value: 'DROP_SET', label: tr(lang, 'DROP SET', 'DROP SET') },
      { value: 'AL_FALLO', label: tr(lang, 'AL FALLO', 'TO FAILURE') },
    ],
    [lang]
  );

  const selectedLabel = useMemo(() => {
    return optionItems.find((x) => x.value === option)?.label || optionItems[0].label;
  }, [option, optionItems]);

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

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

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 pr-10 text-left text-[12px] text-white/80 outline-none hover:border-white/25 focus:border-white/30 focus:bg-white/[0.06] transition"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="block truncate">{selectedLabel}</span>
          <ChevronDown
            className={cx(
              'h-4 w-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform',
              isOpen ? 'rotate-180' : ''
            )}
          />
        </button>

        {isOpen ? (
          <div
            role="listbox"
            className="absolute z-50 mt-2 w-full rounded-lg border border-white/10 bg-[#2a2a2a] shadow-xl overflow-hidden"
          >
            {optionItems.map((item) => {
              const active = item.value === option;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange({ option: item.value });
                    setIsOpen(false);
                  }}
                  className={cx(
                    'w-full text-left px-4 py-2.5 text-[12px] transition',
                    active ? 'bg-white/10 text-white/90' : 'text-white/80 hover:bg-[#ff7849]/15 hover:text-white'
                  )}
                >
                  <span className="block truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
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
  const [muscleGroups, setMuscleGroups] = useState(['full_body']);
  const [sessionName, setSessionName] = useState('');
  const [savedQuery, setSavedQuery] = useState('');
  const [copiedWorkoutId, setCopiedWorkoutId] = useState(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [zoneExerciseMap, setZoneExerciseMap] = useState({});
  const [zoneExerciseLoading, setZoneExerciseLoading] = useState(false);
  const [zoneExerciseError, setZoneExerciseError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [catalogError, setCatalogError] = useState('');

  const addMuscleGroup = () => setMuscleGroups((prev) => [...prev, 'full_body']);
  const removeMuscleGroup = (index) =>
    setMuscleGroups((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)));
  const updateMuscleGroup = (index, value) =>
    setMuscleGroups((prev) => prev.map((v, idx) => (idx === index ? value : v)));

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
    Promise.all([listZones()])
      .then(([z]) => {
        if (!alive) return;
        setZones(Array.isArray(z?.items) ? z.items : []);
      })
      .catch((e) => {
        if (!alive) return;
        setZones([]);
        setCatalogError(
          e?.message || tr(lang, 'No se pudieron cargar zonas', 'Could not load zones')
        );
      });
    return () => {
      alive = false;
    };
  }, [lang]);

  const filteredZones = useMemo(() => {
    const all = Array.isArray(zones) ? zones : [];
    if (!all.length) return [];
    return all;
  }, [zones]);

  useEffect(() => {
    // Keep selected values valid when activity changes or when catalog loads.
    if (filteredZones.length) {
      setMuscleGroups((prev) =>
        prev.map((k) =>
          filteredZones.some((z) => String(z?.key) === String(k))
            ? k
            : String(filteredZones[0]?.key || 'full_body')
        )
      );
    }
  }, [filteredZones]);

  const zoneLabels = useMemo(() => {
    const source = filteredZones.length ? filteredZones : zones;
    const map = new Map(source.map((z) => [String(z?.key), z]));
    return muscleGroups
      .map((k) => map.get(String(k)))
      .filter(Boolean)
      .map((z) => (lang === 'en' ? z.label_en : z.label_es));
  }, [filteredZones, lang, muscleGroups, zones]);

  const zoneLabelByKey = useMemo(() => {
    const source = filteredZones.length ? filteredZones : zones;
    const map = new Map(source.map((z) => [String(z?.key), z]));
    const result = {};
    const hasFullBody = muscleGroups.some((k) => String(k) === 'full_body');
    const keys = hasFullBody ? Array.from(map.keys()) : muscleGroups.map((k) => String(k));
    keys.forEach((k) => {
      const z = map.get(String(k));
      if (!z) return;
      result[String(k)] = (lang === 'en' ? z.label_en : z.label_es).toUpperCase();
    });
    return result;
  }, [filteredZones, lang, muscleGroups, zones]);

  useEffect(() => {
    if (!sessionName.trim()) {
      const next = zoneLabels.join(' + ');
      if (next) setSessionName(next);
    }
  }, [sessionName, zoneLabels]);

  useEffect(() => {
    let alive = true;
    const hasFullBody = muscleGroups.some((k) => String(k) === 'full_body');
    const allZones = (Array.isArray(zones) ? zones : []).map((z) => String(z?.key)).filter(Boolean);
    const zoneKeys = hasFullBody
      ? allZones.filter((k) => k && k !== 'full_body')
      : muscleGroups.map((k) => String(k)).filter((k) => k && k !== 'full_body');

    if (!zoneKeys.length) {
      setZoneExerciseMap({});
      setZoneExerciseLoading(false);
      setZoneExerciseError('');
      return () => {
        alive = false;
      };
    }

    setZoneExerciseError('');
    setZoneExerciseLoading(true);

    Promise.all(
      zoneKeys.map(async (zoneKey) => {
        const data = await searchCatalogExercises({
          search: '',
          zoneKey,
          // load "full list" but keep it bounded
          limit: 500,
        });
        return [zoneKey, Array.isArray(data?.items) ? data.items : []];
      })
    )
      .then((pairs) => {
        if (!alive) return;
        const next = {};
        pairs.forEach(([k, items]) => {
          next[String(k)] = items;
        });
        setZoneExerciseMap(next);
      })
      .catch((e) => {
        if (!alive) return;
        setZoneExerciseMap({});
        setZoneExerciseError(
          e?.message || tr(lang, 'No se pudieron cargar sugerencias', 'Could not load suggestions')
        );
      })
      .finally(() => {
        if (!alive) return;
        setZoneExerciseLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [lang, muscleGroups, zones]);

  const savedWorkouts = useMemo(() => [], []);

  const filteredSavedWorkouts = useMemo(() => {
    const q = savedQuery.trim().toLowerCase();
    if (!q) return savedWorkouts;
    return savedWorkouts.filter(
      (w) => w.title.toLowerCase().includes(q) || w.muscleGroup.toLowerCase().includes(q)
    );
  }, [savedQuery, savedWorkouts]);

  const [added, setAdded] = useState(() => []);

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
    setMuscleGroups([savedWorkout.muscleGroup]);

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
      title: sessionName.trim()
        ? sessionName.trim()
        : `${muscleGroups.join(' + ')}`,
      date: workoutDateLabel,
      duration: '60 MIN',
      muscleGroups,
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
        tipo_rutina: sessionName.trim()
          ? sessionName.trim()
          : `${muscleGroups.join(' + ')}`,
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
              <div className="md:col-span-2">
                <FieldLabel>{tr(lang, 'NOMBRE DE LA SESIÓN', 'SESSION NAME')}</FieldLabel>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={tr(lang, 'Ej: Pecho pesado', 'e.g. Heavy chest')}
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/45">
                    {tr(lang, 'ZONA A ENTRENAR', 'MUSCLE GROUP')}
                  </p>
                  <button
                    type="button"
                    onClick={addMuscleGroup}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.02] px-3 py-2 text-[11px] font-semibold text-white/75 hover:text-white/90 hover:border-white/35 hover:bg-white/[0.05] transition"
                    aria-label={tr(lang, 'Añadir zona', 'Add muscle group')}
                    title={tr(lang, 'Añadir zona', 'Add muscle group')}
                  >
                    <Plus className="h-4 w-4" />
                    {tr(lang, 'Añadir', 'Add')}
                  </button>
                </div>

                <div className="space-y-3">
                  {muscleGroups.map((mg, idx) => (
                    <div key={`${mg}_${idx}`} className="grid grid-cols-[1fr_44px] gap-3 items-center">
                      <Select
                        value={mg}
                        onChange={(v) => updateMuscleGroup(idx, v)}
                        options={
                          filteredZones.length
                            ? filteredZones.map((z) => ({
                                value: z.key,
                                label: (lang === 'en' ? z.label_en : z.label_es).toUpperCase(),
                              }))
                            : [{ value: 'full_body', label: tr(lang, 'CUERPO COMPLETO', 'FULL BODY') }]
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeMuscleGroup(idx)}
                        disabled={muscleGroups.length <= 1}
                        className={cx(
                          'h-11 w-11 rounded-lg border border-white/20 bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:text-white/90 transition flex items-center justify-center',
                          muscleGroups.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                        )}
                        aria-label={tr(lang, 'Eliminar zona', 'Remove muscle group')}
                        title={tr(lang, 'Eliminar zona', 'Remove muscle group')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
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

              <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/45 mb-3">
                {muscleGroups.some((k) => String(k) === 'full_body')
                  ? tr(lang, 'EJERCICIOS (CUERPO COMPLETO)', 'EXERCISES (FULL BODY)')
                  : tr(lang, 'EJERCICIOS POR ZONA', 'EXERCISES BY ZONE')}
              </div>
              <div>
                {zoneExerciseError ? (
                  <div className="rounded-lg border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">
                    {zoneExerciseError}
                  </div>
                ) : null}
                {zoneExerciseLoading ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-white/60">
                    {tr(lang, 'Cargando ejercicios...', 'Loading exercises...')}
                  </div>
                ) : null}

                {(() => {
                  const hasFullBody = muscleGroups.some((k) => String(k) === 'full_body');
                  const selectedZoneKeys = hasFullBody
                    ? (Array.isArray(zones) ? zones : [])
                        .map((z) => String(z?.key))
                        .filter((k) => k && k !== 'full_body')
                    : muscleGroups.map((k) => String(k)).filter((k) => k && k !== 'full_body');

                  if (!selectedZoneKeys.length) {
                    return (
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] text-white/60">
                        {tr(lang, 'Selecciona una zona para ver ejercicios.', 'Select a muscle group to see exercises.')}
                      </div>
                    );
                  }

                  if (hasFullBody) {
                    return (
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
                        <div className="max-h-[320px] overflow-auto divide-y divide-white/10">
                          {selectedZoneKeys.map((zoneKey) => {
                            const items = Array.isArray(zoneExerciseMap?.[zoneKey]) ? zoneExerciseMap[zoneKey] : [];
                            return (
                              <div key={zoneKey} className="px-4 py-3">
                                <div className="text-[11px] font-bold tracking-widest text-white/75 uppercase mb-2">
                                  {zoneLabelByKey[zoneKey] || zoneKey}
                                </div>
                                {items.length ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {items.map((it) => {
                                      const id = String(it?._id || it?.id || '');
                                      const name = String(it?.nombre || '').trim().toUpperCase();
                                      if (!id || !name) return null;
                                      return (
                                        <button
                                          key={id}
                                          type="button"
                                          onClick={() => addExercise({ id, name })}
                                          className="w-full text-left rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[12px] text-white/80 hover:bg-[#ff7849]/10 hover:text-white transition"
                                          title={name}
                                        >
                                          <span className="block truncate">{name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-[12px] text-white/50">
                                    {tr(lang, 'Sin ejercicios para esta zona.', 'No exercises for this zone.')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${Math.max(1, selectedZoneKeys.length)}, minmax(0, 1fr))`,
                      }}
                    >
                      {selectedZoneKeys.map((zoneKey, idx) => {
                        const key = String(zoneKey);
                        const items = Array.isArray(zoneExerciseMap?.[key]) ? zoneExerciseMap[key] : [];
                        return (
                          <div
                            key={`${key}_${idx}`}
                            className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden"
                          >
                            <div className="px-4 py-3 border-b border-white/10 text-[11px] font-bold tracking-widest text-white/75 uppercase">
                              {zoneLabelByKey[key] || key}
                            </div>
                            <div className="max-h-[260px] overflow-auto">
                              {items.length ? (
                                <div className="divide-y divide-white/5">
                                  {items.map((it) => {
                                    const id = String(it?._id || it?.id || '');
                                    const name = String(it?.nombre || '').trim().toUpperCase();
                                    if (!id || !name) return null;
                                    return (
                                      <button
                                        key={id}
                                        type="button"
                                        onClick={() => addExercise({ id, name })}
                                        className="w-full text-left px-4 py-2.5 text-[12px] text-white/80 hover:bg-[#ff7849]/10 hover:text-white transition"
                                        title={name}
                                      >
                                        <span className="block truncate">{name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="px-4 py-3 text-[12px] text-white/50">
                                  {tr(lang, 'Sin ejercicios para esta zona.', 'No exercises for this zone.')}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>

          <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest text-white/85">
            {tr(lang, 'EJERCICIOS AÑADIDOS', 'ADDED EXERCISES')}
          </div>

          {added.length ? (
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
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4 text-[12px] text-white/60">
              {tr(lang, 'Aún no has añadido ejercicios. Busca arriba y pulsa uno para añadirlo.', 'No exercises added yet. Search above and click one to add it.')}
            </div>
          )}

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
