import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Clock, Pencil, Plus, Share2, Settings, Trash2, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';

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

function ExerciseSet({ number, reps, weight }) {
  const { lang } = useI18n();
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/20 bg-white/[0.04] text-[11px] sm:text-[12px] font-bold text-white/70">
        {number}
      </div>
      <div className="flex gap-6 sm:gap-8 flex-1">
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">Reps</span>
          <span className="text-[12px] sm:text-[13px] font-semibold text-white/85">{reps}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">{tr(lang, 'Peso', 'Weight')}</span>
          <span className="text-[12px] sm:text-[13px] font-semibold text-white/85">
            {String(weight).toUpperCase()} {typeof weight === 'number' || /^\d/.test(String(weight)) ? 'KG' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

function ExerciseSection({ name, sets }) {
  const { lang } = useI18n();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] hover:bg-white/[0.06] rounded-lg border border-white/10 transition"
      >
        <h3 className="text-[13px] sm:text-[14px] md:text-[15px] font-bold text-white/95 uppercase tracking-wide">
          {name}
        </h3>
        <span className="text-[11px] sm:text-[12px] font-semibold text-[#ff7849]">
          {sets.length} {tr(lang, 'SERIES', 'SETS')}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2.5 pl-2">
          {sets.map((set, idx) => (
            <ExerciseSet key={idx} number={set.number} reps={set.reps} weight={set.weight} />
          ))}
        </div>
      )}
    </div>
  );
}

function normalizeExerciseDraft(exercise) {
  return {
    name: typeof exercise?.name === 'string' ? exercise.name : '',
    sets: Array.isArray(exercise?.sets)
      ? exercise.sets.map((set, idx) => ({
          number: idx + 1,
          reps: Number.isFinite(Number(set?.reps)) ? Number(set.reps) : 0,
          weight: set?.weight ?? '',
        }))
      : [],
  };
}

function EditInput({ className, ...props }) {
  return (
    <input
      {...props}
      className={cx(
        'w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-[12px] sm:text-[13px] text-white/90 placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.06]',
        className
      )}
    />
  );
}

function EditButton({ children, className, ...props }) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] sm:text-[12px] font-semibold text-white/75 hover:bg-white/[0.08] hover:text-white/90 transition',
        className
      )}
    >
      {children}
    </button>
  );
}

function ExerciseEditor({ draft, onChangeDraft, onCancel, onSave }) {
  const { lang } = useI18n();
  const setName = (value) => onChangeDraft((prev) => ({ ...prev, name: value }));

  const setSetValue = (idx, key, value) => {
    onChangeDraft((prev) => {
      const nextSets = prev.sets.map((set, index) => (index === idx ? { ...set, [key]: value } : set));
      return { ...prev, sets: nextSets };
    });
  };

  const addSet = () => {
    onChangeDraft((prev) => ({
      ...prev,
      sets: [...prev.sets, { number: prev.sets.length + 1, reps: 0, weight: '' }],
    }));
  };

  const removeSet = (idx) => {
    onChangeDraft((prev) => {
      const nextSets = prev.sets.filter((_, index) => index !== idx).map((set, index) => ({ ...set, number: index + 1 }));
      return { ...prev, sets: nextSets };
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide">
          {tr(lang, 'Nombre del ejercicio', 'Exercise name')}
        </p>
        <EditInput value={draft.name} onChange={(e) => setName(e.target.value)} placeholder={tr(lang, 'Ej. Press banca plano', 'e.g. Bench press')} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide">Series</p>
          <EditButton type="button" onClick={addSet}>
            <Plus className="h-4 w-4" />
            {tr(lang, 'Añadir serie', 'Add set')}
          </EditButton>
        </div>

        <div className="space-y-2">
          {draft.sets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 text-[12px] text-white/50">
              {tr(lang, 'No hay series. Añade al menos una.', 'No sets yet. Add at least one.')}
            </div>
          ) : (
            draft.sets.map((set, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] text-[11px] font-bold text-white/70">
                  {idx + 1}
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <EditInput
                    inputMode="numeric"
                    value={String(set.reps)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const parsed = raw === '' ? '' : Number(raw);
                      setSetValue(idx, 'reps', raw === '' ? 0 : Number.isFinite(parsed) ? parsed : 0);
                    }}
                    placeholder="Reps"
                  />
                  <EditInput
                    value={String(set.weight ?? '')}
                    onChange={(e) => setSetValue(idx, 'weight', e.target.value)}
                    placeholder={tr(lang, 'Peso (KG o texto)', 'Weight (kg or text)')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSet(idx)}
                  className="p-2 rounded-lg border border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.08] hover:text-white/80 transition"
                  aria-label={tr(lang, 'Eliminar serie', 'Remove set')}
                  title={tr(lang, 'Eliminar serie', 'Remove set')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <EditButton type="button" onClick={onCancel} className="text-white/60">
          <X className="h-4 w-4" />
          {tr(lang, 'Cancelar', 'Cancel')}
        </EditButton>
        <EditButton type="button" onClick={onSave} className="border-white/20 bg-white/[0.06] text-white/90">
          <Check className="h-4 w-4" />
          {tr(lang, 'Guardar', 'Save')}
        </EditButton>
      </div>
    </div>
  );
}

export default function SessionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { lang } = useI18n();

  const sessionData = useMemo(
    () => ({
      title: 'ENTRENAMIENTO DE PECHO',
      date: 'Lunes, 28 de Enero 2025',
      time: '14:35',
      duration: '45',
      muscleGroup: 'PECHO Y TRÍCEPS',
      totalVolume: '2400',
      totalSeries: '24',
      exercises: [
        {
          name: 'PRESS FRANCÉS',
          sets: [
            { number: 1, reps: 12, weight: 30 },
            { number: 2, reps: 10, weight: 35 },
            { number: 3, reps: 8, weight: 40 },
            { number: 4, reps: 8, weight: 40 },
          ],
        },
        {
          name: 'PRESS BANCA PLANO',
          sets: [
            { number: 1, reps: 12, weight: 80 },
            { number: 2, reps: 10, weight: 85 },
            { number: 3, reps: 8, weight: 90 },
            { number: 4, reps: 8, weight: 90 },
          ],
        },
        {
          name: 'PRESS INCLINADO',
          sets: [
            { number: 1, reps: 12, weight: 70 },
            { number: 2, reps: 10, weight: 75 },
            { number: 3, reps: 8, weight: 80 },
            { number: 4, reps: 8, weight: 80 },
          ],
        },
        {
          name: 'APERTURAS CON MANCUERNAS',
          sets: [
            { number: 1, reps: 15, weight: 15 },
            { number: 2, reps: 15, weight: 15 },
            { number: 3, reps: 12, weight: 17.5 },
            { number: 4, reps: 12, weight: 17.5 },
          ],
        },
        {
          name: 'FONDOS EN PARALELAS',
          sets: [
            { number: 1, reps: 12, weight: 'CORPORAL' },
            { number: 2, reps: 10, weight: '+10' },
            { number: 3, reps: 8, weight: '+20' },
            { number: 4, reps: 8, weight: '+20' },
          ],
        },
        {
          name: 'EXTENSIONES DE TRÍCEPS',
          sets: [
            { number: 1, reps: 15, weight: 25 },
            { number: 2, reps: 12, weight: 30 },
            { number: 3, reps: 12, weight: 30 },
            { number: 4, reps: 10, weight: 35 },
          ],
        },
      ],
    }),
    []
  );

  const activeSession = useMemo(() => {
    const fromState = location.state?.session ?? location.state?.workout ?? null;
    if (!fromState) return sessionData;

    return {
      ...sessionData,
      id: fromState.id ?? id,
      title: fromState.title ? String(fromState.title).toUpperCase() : sessionData.title,
      date: fromState.date ?? sessionData.date,
      duration: fromState.duration ? String(fromState.duration).replace(/\s*MIN\s*$/i, '') : sessionData.duration,
      muscleGroup: Array.isArray(fromState.muscleGroup)
        ? fromState.muscleGroup.join(' Y ').toUpperCase()
        : fromState.muscleGroup
          ? String(fromState.muscleGroup).toUpperCase()
          : sessionData.muscleGroup,
      totalVolume: fromState.volume ?? sessionData.totalVolume,
      totalSeries: fromState.series ?? sessionData.totalSeries,
      exercises: Array.isArray(fromState.exercises) ? fromState.exercises : sessionData.exercises,
    };
  }, [id, location.state, sessionData]);

  const [exercises, setExercises] = useState(() => activeSession.exercises);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [exerciseDraft, setExerciseDraft] = useState(() => normalizeExerciseDraft(activeSession.exercises?.[0]));

  const formattedTotalVolume = useMemo(() => {
    const value = activeSession.totalVolume;
    if (value === null || value === undefined) return '';

    const text = String(value).trim();
    if (!text) return '';
    if (/%/.test(text) || /\b(kcal|kg)\b/i.test(text)) return text;
    if (/^\d+(\.\d+)?$/.test(text)) return `${text} KG`;
    return text;
  }, [activeSession.totalVolume]);

  const exercisesGridClassName = useMemo(() => {
    const exerciseCount = exercises.length;
    const enableThreeColumns = exerciseCount >= 6;

    return cx(
      'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start',
      enableThreeColumns && 'xl:grid-cols-3'
    );
  }, [exercises.length]);

  const startEditingExercise = (idx) => {
    setEditingExerciseIndex(idx);
    setExerciseDraft(normalizeExerciseDraft(exercises[idx]));
  };

  const cancelEditingExercise = () => {
    setEditingExerciseIndex(null);
  };

  const saveExercise = () => {
    if (editingExerciseIndex === null) return;

    const trimmedName = exerciseDraft.name.trim();
    if (!trimmedName) return;

    setExercises((prev) =>
      prev.map((exercise, idx) =>
        idx === editingExerciseIndex
          ? {
              ...exercise,
              name: trimmedName,
              sets: exerciseDraft.sets.map((set, index) => ({
                number: index + 1,
                reps: Number.isFinite(Number(set.reps)) ? Number(set.reps) : 0,
                weight: set.weight ?? '',
              })),
            }
          : exercise
      )
    );
    setEditingExerciseIndex(null);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/entrenamientos')}
            className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-white/60 hover:text-white/90 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr(lang, 'VOLVER AL HISTORIAL', 'BACK TO HISTORY')}
          </button>

          {/* Session Header Card */}
          <Card className="p-5 sm:p-6 md:p-7 border-white/20">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold tracking-wide text-white/95 uppercase">
                    {activeSession.title}
                  </h1>
                  <p className="text-[11px] sm:text-[12px] text-white/45 mt-2">
                    📅 {activeSession.date} - {activeSession.time}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 rounded-lg bg-white/[0.06] px-3 sm:px-4 py-2 sm:py-2.5 border border-white/10">
                  <Clock className="h-4 w-4 text-[#ff7849] flex-shrink-0" />
                  <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">
                      {tr(lang, 'Duración', 'Duration')}
                    </p>
                    <p className="text-[14px] sm:text-[16px] font-bold text-white/95">{activeSession.duration} MIN</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-lg bg-white/[0.04] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide mb-2">
                    {tr(lang, 'Zona entrenada', 'Muscle group')}
                  </p>
                  <p className="text-[13px] sm:text-[14px] font-bold text-white/85">
                    {activeSession.muscleGroup}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide mb-2">
                    {tr(lang, 'Volumen total', 'Total volume')}
                  </p>
                  <p className="text-[13px] sm:text-[14px] font-bold text-white/85">
                    {formattedTotalVolume}
                  </p>
                </div>
                <div className="rounded-lg bg-white/[0.04] p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide mb-2">
                    {tr(lang, 'Series totales', 'Total sets')}
                  </p>
                  <p className="text-[13px] sm:text-[14px] font-bold text-white/85">
                    {activeSession.totalSeries} {tr(lang, 'SERIES', 'SETS')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {}}
                  className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white/90"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {}}
                  className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white/90"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Exercises Detail */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-[14px] sm:text-[15px] md:text-[16px] font-bold uppercase tracking-wide text-white/75 mb-4">
                {tr(lang, 'DETALLE DE EJERCICIOS', 'EXERCISE DETAILS')}
              </h2>
              <div className="space-y-4 sm:space-y-5">
                <div className={exercisesGridClassName}>
                  {exercises.map((exercise, idx) => (
                    <Card key={idx} className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide">
                          {editingExerciseIndex === idx ? tr(lang, 'Editando', 'Editing') : tr(lang, 'Ejercicio', 'Exercise')}
                        </p>
                        {editingExerciseIndex === idx ? null : (
                          <EditButton type="button" onClick={() => startEditingExercise(idx)}>
                            <Pencil className="h-4 w-4" />
                            {tr(lang, 'Editar', 'Edit')}
                          </EditButton>
                        )}
                      </div>

                      {editingExerciseIndex === idx ? (
                        <ExerciseEditor
                          draft={exerciseDraft}
                          onChangeDraft={setExerciseDraft}
                          onCancel={cancelEditingExercise}
                          onSave={saveExercise}
                        />
                      ) : (
                        <ExerciseSection name={exercise.name} sets={exercise.sets} />
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
