import React, { useMemo, useState } from 'react';
import { Bookmark, Check, ChevronDown, ClipboardCopy, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

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
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
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
  return (
    <div className="grid grid-cols-[44px_1fr_1fr_1fr_44px] gap-3 items-center">
      <div className="h-10 w-10 rounded-lg border border-white/20 bg-white/[0.02] flex items-center justify-center text-[12px] font-semibold text-white/80">
        {index + 1}
      </div>

      <Input
        value={reps}
        onChange={(e) => onChange({ reps: e.target.value })}
        placeholder="REPETICIONES"
        className="py-2.5"
        inputMode="numeric"
      />

      <Input
        value={weight}
        onChange={(e) => onChange({ weight: e.target.value })}
        placeholder="PESO (KG)"
        className="py-2.5"
        inputMode="decimal"
      />

      <div className="relative">
        <select
          value={option}
          onChange={(e) => onChange({ option: e.target.value })}
          className="appearance-none w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 pr-10 text-[12px] text-white/70 outline-none focus:border-white/30 focus:bg-white/[0.06]"
        >
          <option value="OPCIONES">OPCIONES</option>
          <option value="NORMAL">NORMAL</option>
          <option value="FALLO">FALLO</option>
          <option value="DROPSET">DROPSET</option>
          <option value="PAUSA">PAUSA</option>
        </select>
        <ChevronDown className="h-4 w-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="h-10 w-10 rounded-lg border border-white/20 bg-white/[0.02] text-white/70 hover:bg-white/[0.06] hover:text-white/90 transition flex items-center justify-center"
        aria-label="Eliminar serie"
        title="Eliminar serie"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddedExerciseCard({ exercise, onRemoveExercise, onUpdateSet, onAddSet, onRemoveSet }) {
  return (
    <Card className="p-5 sm:p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[14px] sm:text-[15px] md:text-[16px] font-bold text-white/90 uppercase tracking-wide">
          {exercise.name}
        </div>
        <OutlineButton onClick={onRemoveExercise} className="px-4 py-2 text-[11px]">
          ELIMINAR
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
          + AÑADIR
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
  return (
    <Card className="p-4 sm:p-5 border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] sm:text-[13px] font-bold text-white/90 uppercase tracking-wide truncate">
            {workout.title}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
            Guardado de <span className="text-white/65 font-semibold">@{workout.sourceUser}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/45">
          <Bookmark className="h-4 w-4" />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 mt-4">
        <SavedWorkoutStat label="Ejer" value={workout.stats.exercises} />
        <SavedWorkoutStat label="Dur" value={workout.stats.duration} />
        <SavedWorkoutStat label="Cal" value={workout.stats.calories} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <OutlineButton onClick={onCopyAppend} className="flex-1 py-2.5 text-[11px]">
          Añadir
        </OutlineButton>
        <PrimaryButton onClick={onCopyReplace} className="flex-1 py-2.5 text-[11px]">
          {copiedState ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              Copiado
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <ClipboardCopy className="h-4 w-4" />
              Copiar
            </span>
          )}
        </PrimaryButton>
      </div>

      <div className="text-[10px] text-white/40 mt-3">
        <span className="font-semibold text-white/55">{workout.exercises.length}</span> ejercicios en la plantilla
      </div>
    </Card>
  );
}

export default function CreateSession() {
  const navigate = useNavigate();
  const [muscleGroup, setMuscleGroup] = useState('PECHO');
  const [workoutType, setWorkoutType] = useState('FUERZA');
  const [search, setSearch] = useState('');
  const [savedQuery, setSavedQuery] = useState('');
  const [copiedWorkoutId, setCopiedWorkoutId] = useState(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const workoutDateLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const allExercises = useMemo(
    () => [
      'PRESS BANCA PLANO',
      'PRESS BANCA INCLINADO',
      'PRESS BANCA DECLINADO',
      'APERTURAS CON MANCUERNAS',
      'PRESS MILITAR',
      'ELEVACIONES LATERALES',
      'DOMINADAS',
      'REMO CON BARRA',
      'SENTADILLA',
      'PESO MUERTO',
    ],
    []
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allExercises.slice(0, 3);
    return allExercises.filter((x) => x.toLowerCase().includes(q)).slice(0, 6);
  }, [allExercises, search]);

  const savedWorkouts = useMemo(
    () => [
      {
        id: 'sw_1',
        title: 'Pierna completo',
        sourceUser: 'JUAN_FITNESS',
        stats: { exercises: 8, duration: '65m', calories: 420 },
        muscleGroup: 'PIERNA',
        workoutType: 'FUERZA',
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
        muscleGroup: 'CARDIO',
        workoutType: 'HIIT',
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
        muscleGroup: 'PECHO',
        workoutType: 'FUERZA',
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

  const addExercise = (name) => {
    setAdded((prev) => {
      if (prev.some((ex) => ex.name === name)) return prev;
      return [
        ...prev,
        {
          id: makeId('ex'),
          name,
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

  const handleSave = () => {
    // UI only (mock). Hook this to backend later.
    navigate('/entrenamientos', {
      state: {
        createdSession: {
          muscleGroup,
          workoutType,
          exercises: added,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-6 md:py-7 xl:py-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-semibold tracking-wide text-white/95 uppercase">
                CREAR NUEVA SESIÓN
              </h1>
              <div className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-white/45 mt-1">
                {workoutDateLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSavedPanelOpen(true)}
              className="hidden md:inline-flex h-[64px] w-[360px] max-w-[38vw] rounded-lg border border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/35 transition items-center justify-center gap-2 text-[12px] font-semibold text-white/80"
              aria-label="Abrir entrenos guardados"
              title="Entrenos guardados"
            >
              <Bookmark className="h-4 w-4 text-white/60" />
              ENTRENOS GUARDADOS
            </button>
          </div>

          <Card className="p-5 sm:p-6 md:p-7 border-white/15">
            <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest text-white/85">
              CONFIGURACIÓN
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <FieldLabel>ZONA A ENTRENAR</FieldLabel>
                <Select value={muscleGroup} onChange={setMuscleGroup} options={['PECHO', 'ESPALDA', 'PIERNA', 'HOMBROS', 'BRAZOS']} />
              </div>
              <div>
                <FieldLabel>TIPO DE ENTRENO</FieldLabel>
                <Select value={workoutType} onChange={setWorkoutType} options={['FUERZA', 'CARDIO', 'HIIT', 'MOVILIDAD']} />
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-wide text-white/85">
                AÑADIR EJERCICIO
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_140px] gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="BUSCAR EJERCICIO (EJ: PRESS BANCA, FONDOS...)"
                    className="pl-11"
                  />
                </div>
                <OutlineButton className="py-3">BUSCAR</OutlineButton>
              </div>

              <div className="h-px w-full bg-white/10 my-5" />

              <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/45 mb-3">RESULTADOS</div>
              <div className="space-y-3">
                {results.map((name) => (
                  <ResultRow key={name} label={name} onAdd={() => addExercise(name)} />
                ))}
              </div>
            </div>
          </Card>

          <div className="text-[13px] sm:text-[14px] font-bold uppercase tracking-widest text-white/85">
            EJERCICIOS AÑADIDOS
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

          <div className="pt-2 flex items-center justify-center gap-4">
            <OutlineButton onClick={() => navigate(-1)} className="min-w-[160px]">
              CANCELAR
            </OutlineButton>
            <PrimaryButton onClick={handleSave} className="min-w-[180px]">
              GUARDAR SESIÓN
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
            aria-label="Cerrar"
          />

          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-[#1e1e1e] border-l border-white/10 shadow-2xl">
            <div className="h-[56px] sm:h-[64px] border-b border-white/10 flex items-center justify-between px-4 sm:px-5">
              <div className="text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-white/85">
                Entrenos guardados
              </div>
              <button
                type="button"
                onClick={() => setIsSavedPanelOpen(false)}
                className="h-10 w-10 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center text-white/70"
                aria-label="Cerrar panel"
                title="Cerrar"
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
                  placeholder="Buscar (pecho, pierna, hiit...)"
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
