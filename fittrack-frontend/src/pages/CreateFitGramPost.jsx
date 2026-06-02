import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ClipboardCopy, Image as ImageIcon, Plus, Save, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { uploadImageToCloudinary } from '../services/cloudinaryUpload';
import { useI18n, tr } from '../i18n/I18nProvider';
import { createPost as apiCreatePost } from '../services/fitgramApi';
import { API_BASE } from '../config/apiBase';
import { getAuthToken } from '../services/authToken';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ children, className }) {
  return (
    <section
      className={cx(
        'rounded-lg sm:rounded-lg md:rounded-xl border border-white/10 bg-white/[0.06] shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)] overflow-hidden',
        className
      )}
    >
      {children}
    </section>
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

function Textarea({ className, ...props }) {
  return (
    <textarea
      {...props}
      className={cx(
        'w-full min-h-[120px] rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-[12px] sm:text-[13px] text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 focus:bg-white/[0.06] resize-none',
        className
      )}
    />
  );
}

function FieldLabel({ children }) {
  return <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/45 mb-2">{children}</p>;
}

function OutlineButton({ children, className, ...props }) {
  return (
    <button
      {...props}
      type={props.type || 'button'}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.02] px-4 py-3 text-[12px] sm:text-[13px] font-semibold text-white/75 hover:text-white/90 hover:border-white/35 hover:bg-white/[0.05] transition',
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
        'inline-flex items-center justify-center gap-2 rounded-lg border border-[#2c4c73] bg-[#1e3a5f] px-5 py-3 text-[12px] sm:text-[13px] font-semibold text-white/90 hover:bg-[#24466f] transition disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {children}
    </button>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center rounded-lg border px-4 py-2 text-[11px] sm:text-[12px] font-semibold transition',
        active
          ? 'border-white/25 bg-white/[0.06] text-white/90'
          : 'border-white/15 bg-white/[0.02] text-white/65 hover:bg-white/[0.05] hover:text-white/85'
      )}
    >
      {children}
    </button>
  );
}

function SavedWorkoutStat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="text-[13px] font-bold text-white/90">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

function SavedWorkoutPickerCard({ workout, selected, onSelect }) {
  const { lang } = useI18n();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        'w-full text-left rounded-xl border p-4 sm:p-5 transition',
        selected
          ? 'border-white/25 bg-white/[0.06]'
          : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/25'
      )}
      aria-label={`${tr(lang, 'Seleccionar entreno', 'Select workout')}: ${workout.title}`}
      title={tr(lang, 'Seleccionar', 'Select')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] sm:text-[13px] font-bold text-white/90 uppercase tracking-wide truncate">
            {workout.title}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{workout.dateLabel}</div>
        </div>
        <div
          className={cx(
            'h-8 w-8 rounded-lg border flex items-center justify-center',
            selected ? 'border-[#ff7849]/40 bg-[#ff7849]/15' : 'border-white/15 bg-white/[0.02]'
          )}
        >
          {selected ? <Check className="h-4 w-4 text-[#ff7849]" /> : <ClipboardCopy className="h-4 w-4 text-white/50" />}
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 mt-4">
        <SavedWorkoutStat label={tr(lang, 'Ejer', 'Ex')} value={workout.stats.exercises} />
        <SavedWorkoutStat label={tr(lang, 'Dur', 'Dur')} value={workout.stats.duration} />
        <SavedWorkoutStat label={tr(lang, 'Cal', 'Cal')} value={workout.stats.calories} />
      </div>

      {workout.tags?.length ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {workout.tags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/65"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

function TagEditor({ value, onChange }) {
  const { lang } = useI18n();
  const addTag = (tag) => {
    const normalized = tag.trim().replace(/^#/, '');
    if (!normalized) return;
    const existing = new Set(value);
    if (existing.has(normalized.toUpperCase())) return;
    onChange([...value, normalized.toUpperCase()]);
  };

  const [draft, setDraft] = useState('');

  return (
    <div>
      <FieldLabel>TAGS</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={tr(lang, 'Ej: pecho, fuerza, hiit...', 'e.g. chest, strength, hiit...')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(draft);
              setDraft('');
            }
          }}
        />
        <OutlineButton
          className="px-3 py-3"
          onClick={() => {
            addTag(draft);
            setDraft('');
          }}
          aria-label={tr(lang, 'Añadir tag', 'Add tag')}
          title={tr(lang, 'Añadir tag', 'Add tag')}
        >
          <Plus className="h-4 w-4" />
        </OutlineButton>
      </div>

      {value.length ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="text-white/45 hover:text-white/80 transition"
                aria-label={`${tr(lang, 'Eliminar tag', 'Remove tag')} ${tag}`}
                title={tr(lang, 'Eliminar', 'Remove')}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CreateFitGramPost() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [postType, setPostType] = useState('workout'); // workout | info
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const [savedWorkoutQuery, setSavedWorkoutQuery] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const mapSession = (session) => {
      const exercisesRaw = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
      const exercises = exercisesRaw.map((exercise) => {
        const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
        const volumeKg = sets.reduce((sum, set) => {
          const reps = Number(set?.reps || 0);
          const weight = Number(set?.peso || 0);
          return sum + (Number.isFinite(reps) && Number.isFinite(weight) ? reps * weight : 0);
        }, 0);
        return {
          name: exercise?.nombre_ejercicio || tr(lang, 'Ejercicio', 'Exercise'),
          sets: sets.length,
          setDetails: sets.map((set) => ({
            reps: Number(set?.reps || 0) || 0,
            peso: Number(set?.peso || 0) || 0,
            rpe: Number(set?.rpe || 0) || undefined,
          })),
          volumeKg,
        };
      });
      const volumeKg = exercises.reduce((sum, exercise) => sum + (Number(exercise.volumeKg) || 0), 0);
      const date = session?.fecha ? new Date(session.fecha) : null;
      const dateLabel = date && Number.isFinite(date.getTime())
        ? date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
        : '';
      const title = session?.tipo_rutina || tr(lang, 'Entreno', 'Workout');
      return {
        id: String(session?._id || session?.id || `${title}-${dateLabel}`),
        title,
        dateLabel,
        stats: {
          exercises: exercises.length,
          duration: session?.duracion_minutos ? `${session.duracion_minutos}m` : '--',
          calories: volumeKg ? `${Math.round(volumeKg / 10)} kcal` : '--',
          volumeKg,
        },
        tags: [title, ...exercises.slice(0, 3).map((exercise) => exercise.name)].filter(Boolean).map((tag) => String(tag).toUpperCase()),
        exercises,
      };
    };

    (async () => {
      try {
        setWorkoutsLoading(true);
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/sesiones/historial`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || data?.error || 'Error');
        if (mounted) setSavedWorkouts((data?.items || []).map(mapSession));
      } catch {
        if (mounted) setSavedWorkouts([]);
      } finally {
        if (mounted) setWorkoutsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [lang]);

  const filteredSavedWorkouts = useMemo(() => {
    const q = savedWorkoutQuery.trim().toLowerCase();
    if (!q) return savedWorkouts;
    return savedWorkouts.filter(
      (w) => w.title.toLowerCase().includes(q) || w.tags?.some((t) => String(t).toLowerCase().includes(q))
    );
  }, [savedWorkoutQuery, savedWorkouts]);

  const selectedWorkout = useMemo(() => {
    if (!selectedWorkoutId) return null;
    return savedWorkouts.find((w) => w.id === selectedWorkoutId) || null;
  }, [savedWorkouts, selectedWorkoutId]);

  const canPublish = useMemo(() => {
    if (isPublishing) return false;
    if (!imageFile) return false;
    if (!caption.trim()) return false;
    if (postType === 'workout') {
      return Boolean(selectedWorkout);
    }
    return true;
  }, [caption, imageFile, isPublishing, postType, selectedWorkout]);

  const handlePickImage = (file) => {
    if (isPublishing) return;
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const handlePublish = () => {
    if (!canPublish || isPublishing) return;

    setError('');
    setIsPublishing(true);

    let currentUsername = 'USER';
    let currentUserId = '';
    let currentPhotoUrl = '';
    try {
      const raw = window.localStorage.getItem('fittrack_user');
      const user = raw ? JSON.parse(raw) : null;
      currentUsername =
        String(user?.apodo || user?.nickname || user?.nombre || user?.name || 'USER')
          .trim()
          .toUpperCase() || 'USER';
      currentUserId = String(user?.id || user?._id || '').trim();
      currentPhotoUrl = String(user?.photo_url || '').trim();
    } catch {
      // ignore
    }
    (async () => {
      try {
        const { url } = await uploadImageToCloudinary({ file: imageFile, publicIdPrefix: 'fitgram', folderHint: 'fittrack/fitgram' });
        const workoutSnapshot = selectedWorkout
          ? {
              workoutId: selectedWorkout.id,
              title: selectedWorkout.title,
              dateLabel: selectedWorkout.dateLabel,
              stats: selectedWorkout.stats,
              exercises: selectedWorkout.exercises,
            }
          : undefined;
        const created = await apiCreatePost({
          image_url: url,
          caption: caption.trim(),
          tags,
          type: postType === 'workout' ? 'workout' : 'photo',
          workoutSnapshot,
        });
        const createdPost = {
          id: created?.post?.id || `new_${Date.now()}`,
          type: postType === 'workout' ? 'workout' : 'photo',
          image_url: url,
          avatarLabel: (currentUsername[0] || 'U').toUpperCase(),
          authorPhotoUrl: currentPhotoUrl,
          username: currentUsername,
          userId: currentUserId || created?.post?.authorId,
          timeAgo: tr(lang, 'AHORA', 'NOW'),
          caption: caption.trim(),
          tags,
          workoutSnapshot,
          stats: workoutSnapshot?.stats,
          comments: [],
          metrics: { likes: 0, comments: 0 },
        };

        navigate('/fitgram?tab=profile', { state: { createdPost } });
      } catch (e) {
        setError(tr(lang, 'No se pudo publicar. Inténtalo de nuevo más tarde.', 'Could not publish. Please try again later.'));
        setIsPublishing(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-white/60 hover:text-white/90 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              {tr(lang, 'VOLVER', 'BACK')}
            </button>

            <div className="flex items-center gap-2">
              <OutlineButton disabled={isPublishing} onClick={() => navigate('/fitgram')} className="px-4 py-2.5 text-[11px]">
                {tr(lang, 'Cancelar', 'Cancel')}
              </OutlineButton>
              <PrimaryButton
                onClick={handlePublish}
                className={cx('px-5 py-2.5 text-[11px]', !canPublish && 'opacity-50 cursor-not-allowed')}
                disabled={!canPublish}
              >
                <Save className="h-4 w-4" />
                {isPublishing ? tr(lang, 'Publicando...', 'Publishing...') : tr(lang, 'Publicar', 'Publish')}
              </PrimaryButton>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold tracking-wide text-white/95 uppercase">
                {tr(lang, 'Crear publicación', 'Create post')}
              </h1>
              <div className="text-[11px] sm:text-[12px] text-white/45 mt-1">
                {tr(lang, 'Foto obligatoria · Estilo FitTrack', 'Required photo · FitTrack style')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill
                active={postType === 'workout'}
                onClick={() => {
                  if (isPublishing) return;
                  setPostType('workout');
                }}
              >
                {tr(lang, 'Entreno', 'Workout')}
              </Pill>
              <Pill
                active={postType === 'info'}
                onClick={() => {
                  if (isPublishing) return;
                  setPostType('info');
                }}
              >
                {tr(lang, 'Informativa', 'Info')}
              </Pill>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 sm:gap-5 md:gap-6 items-start">
            <Card className="border-white/15">
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
                <div className="text-[12px] font-bold uppercase tracking-widest text-white/80">
                  {tr(lang, 'Imagen', 'Image')}
                </div>
                {imageFile ? (
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/70">
                    <Check className="h-4 w-4 text-[#ff7849]" />
                    {tr(lang, 'Lista', 'Ready')}
                  </div>
                ) : null}
              </div>

              <div className="p-4 sm:p-5">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isPublishing}
                    className="hidden"
                    onChange={(e) => handlePickImage(e.target.files?.[0])}
                  />

                  <div
                    className={cx(
                      'h-[360px] w-full rounded-xl border border-white/15 bg-white/[0.02] overflow-hidden flex items-center justify-center cursor-pointer',
                      imagePreviewUrl ? 'p-0' : 'p-6'
                    )}
                  >
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt={tr(lang, 'Previsualización', 'Preview')}
                  className="h-full w-full object-cover"
                />
              ) : (
                      <div className="text-center space-y-3">
                        <div className="mx-auto h-16 w-16 rounded-xl border border-white/15 bg-white/[0.03] flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-white/70" />
                        </div>
                  <div className="text-[12px] font-semibold text-white/80">{tr(lang, 'Sube una foto', 'Upload a photo')}</div>
                  <div className="text-[11px] text-white/45">{tr(lang, 'PNG/JPG · Obligatoria', 'PNG/JPG · Required')}</div>
                </div>
              )}
            </div>
          </label>
        </div>
      </Card>

      <div className="space-y-4 sm:space-y-5">
        <Card className="p-4 sm:p-5 md:p-6 border-white/15">
          <div className="text-[12px] font-bold uppercase tracking-widest text-white/80">
            {tr(lang, 'Contenido', 'Content')}
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <FieldLabel>{tr(lang, 'Descripción', 'Description')}</FieldLabel>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={isPublishing}
                placeholder={
                  postType === 'workout'
                    ? tr(lang, 'Cuenta cómo ha ido el entreno, sensaciones, PRs...', 'Tell how the workout went, feelings, PRs...')
                    : tr(lang, 'Comparte tu publicación con la comunidad...', 'Share your post with the community...')
                }
              />
            </div>

                  <TagEditor value={tags} onChange={isPublishing ? () => {} : setTags} />
                </div>
              </Card>

      {postType === 'workout' ? (
        <Card className="p-4 sm:p-5 md:p-6 border-white/15">
          <div className="text-[12px] font-bold uppercase tracking-widest text-white/80">
            {tr(lang, 'Seleccionar entreno realizado', 'Select completed workout')}
          </div>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="h-4 w-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
              <Input
                value={savedWorkoutQuery}
                onChange={(e) => setSavedWorkoutQuery(e.target.value)}
                disabled={isPublishing}
                placeholder={tr(lang, 'Busca un entreno por nombre o tag...', 'Search a workout by name or tag...')}
                className="pl-11"
              />
            </div>

                    <div className="mt-4 space-y-3">
                      {workoutsLoading ? (
                        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 text-[12px] text-white/55">
                          {tr(lang, 'Cargando entrenos realizados...', 'Loading completed workouts...')}
                        </div>
                      ) : null}

                      {!workoutsLoading && filteredSavedWorkouts.map((workout) => (
                        <SavedWorkoutPickerCard
                          key={workout.id}
                          workout={workout}
                          selected={workout.id === selectedWorkoutId}
                          onSelect={() => {
                            if (isPublishing) return;
                            setSelectedWorkoutId(workout.id);
                            if (tags.length === 0 && workout.tags?.length) {
                              setTags(workout.tags.map((t) => String(t).toUpperCase()));
                            }
                          }}
                        />
                      ))}

                      {!workoutsLoading && filteredSavedWorkouts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4 text-[12px] text-white/55">
                      {tr(lang, 'No tienes entrenos guardados que coincidan.', "You don't have matching saved workouts.")}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="text-[11px] text-white/45 mt-3">
                {tr(lang, 'Solo podrás publicar entrenos que ya hayas realizado (vendrán de tu historial).', 'You can only publish workouts you have already completed (from your history).')}
              </div>
            </Card>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
              {error}
            </div>
          ) : null}

          <div className="text-[11px] text-white/45">
            {tr(lang, 'Al publicar se guardará en FitGram y será visible para otros usuarios.', 'When you publish, it will be saved in FitGram and visible to other users.')}
          </div>
        </div>
      </div>
        </div>
      </div>
      {isPublishing ? (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-white/15 bg-[#242424] px-6 py-5 text-center shadow-xl">
            <div className="mx-auto h-10 w-10 rounded-lg border border-[#ff7849]/40 bg-[#ff7849]/10 flex items-center justify-center">
              <Save className="h-5 w-5 text-[#ff7849]" />
            </div>
            <div className="mt-3 text-[13px] font-semibold text-white/90">
              {tr(lang, 'Publicando...', 'Publishing...')}
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              {tr(lang, 'Subiendo imagen y guardando publicación.', 'Uploading image and saving post.')}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
