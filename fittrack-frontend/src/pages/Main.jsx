import React, { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Plus,
  Dumbbell,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n } from '../i18n/I18nProvider';
import { getDateKey, getSessionForDate, getSessionsForDate } from '../services/sessionStore';
import { listSessionHistory } from '../services/sessionsApi';
import { getExplore, getUserPosts } from '../services/fitgramApi';
import { getPublicProfile } from '../services/socialApi';

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

function CardTitle({ children }) {
  return (
    <div className="px-4 sm:px-5 pt-4 sm:pt-5">
      <h2 className="text-[13px] sm:text-[15px] md:text-[17px] lg:text-[18px] font-semibold tracking-wide text-white/90" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
        {children}
      </h2>
    </div>
  );
}

function PlusEmpty({ label, onClick }) {
  return (
    <div className="flex h-full min-h-[160px] sm:min-h-[200px] md:min-h-[240px] items-center justify-center">
      <button
        type="button"
        className="group inline-flex flex-col items-center gap-3"
        aria-label={label}
        onClick={onClick}
      >
        <span className="grid h-12 sm:h-13 md:h-14 w-12 sm:w-13 md:w-14 place-items-center rounded-full border border-white/20 text-white/70 transition group-hover:border-white/30 group-hover:text-white/90">
          <Plus className="h-5 sm:h-6 w-5 sm:w-6" />
        </span>
      </button>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#ff7849]/15 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] md:text-[11px] font-medium text-[#ff7849] whitespace-nowrap">
      {children}
    </span>
  );
}

function WeeklyWorkoutBadge({ type }) {
  const { t } = useI18n();
  const colorMap = {
    pecho: 'bg-[#ff7849]/20 text-[#ff7849]',
    espalda: 'bg-blue-500/20 text-blue-400',
    pierna: 'bg-purple-500/20 text-purple-400',
    cardio: 'bg-red-500/20 text-red-400',
    hombros: 'bg-green-500/20 text-green-400',
    yoga: 'bg-cyan-500/20 text-cyan-400',
    brazos: 'bg-amber-500/20 text-amber-300',
  };

  const normalized = String(type || '').trim();
  const key = normalized.toLowerCase();

  return (
    <span
      className={cx(
        'inline-flex items-center justify-center px-2 py-1 rounded text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide',
        colorMap[key] || 'bg-white/10 text-white/70'
      )}
      title={t('Abrir detalle')}
    >
      {t(normalized)}
    </span>
  );
}

function toWorkoutLabel(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+$/.test(s)) return s;
  const upper = s.toUpperCase();
  const map = {
    PECHO: 'Pecho',
    ESPALDA: 'Espalda',
    PIERNA: 'Pierna',
    PIERNAS: 'Pierna',
    CARDIO: 'Cardio',
    HOMBROS: 'Hombros',
    YOGA: 'Yoga',
    BRAZOS: 'Brazos',
  };
  return map[upper] || s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function getApiSessionKey(session) {
  const rawDate = session?.fecha || session?.date || session?.createdAt;
  if (!rawDate) return '';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '';
  return getDateKey(date);
}

function getApiSessionVolume(session) {
  const exercises = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
  return exercises.reduce((total, exercise) => {
    const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
    return total + sets.reduce((setTotal, set) => {
      const reps = Number(set?.reps) || 0;
      const weight = Number(set?.peso ?? set?.weight) || 0;
      return setTotal + reps * weight;
    }, 0);
  }, 0);
}

function getApiSessionSets(session) {
  const exercises = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
  return exercises.reduce((total, exercise) => total + (Array.isArray(exercise?.sets) ? exercise.sets.length : 0), 0);
}

function formatShortDate(value, lang) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short' }).format(date);
}

function formatSessionForDetail(session, lang) {
  const date = new Date(session?.fecha || session?.date || Date.now());
  const exercises = Array.isArray(session?.ejercicios_realizados)
    ? session.ejercicios_realizados.map((exercise) => ({
        name: exercise?.nombre_ejercicio || exercise?.name || '',
        sets: Array.isArray(exercise?.sets)
          ? exercise.sets.map((set, index) => ({
              number: index + 1,
              reps: Number(set?.reps) || 0,
              weight: set?.peso ?? set?.weight ?? '',
            }))
          : [],
      }))
    : [];

  return {
    id: session?.id || session?._id,
    title: toWorkoutLabel(session?.tipo_rutina || session?.title || (lang === 'en' ? 'Workout' : 'Entrenamiento')),
    date: Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date),
    time: Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' }).format(date),
    duration: String(session?.duracion_minutos || session?.duration || ''),
    muscleGroup: toWorkoutLabel(session?.tipo_rutina || session?.muscleGroup || ''),
    volume: String(Math.round(getApiSessionVolume(session))),
    series: String(getApiSessionSets(session)),
    exercises,
  };
}

function calculateStreak(sessions) {
  const keys = new Set((sessions || []).map(getApiSessionKey).filter(Boolean));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = getDateKey(cursor);
    if (!keys.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function isFutureDateKey(dateKey) {
  const target = new Date(`${dateKey}T12:00:00`);
  const today = new Date(`${getDateKey(new Date())}T12:00:00`);
  if (Number.isNaN(target.getTime())) return false;
  return target.getTime() > today.getTime();
}

function readCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('fittrack_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readCustomAchievements() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('fittrack_custom_achievements');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSessionDuration(session) {
  return Number(session?.duracion_minutos || session?.duration || 0) || 0;
}

function getSessionHour(session) {
  const date = new Date(session?.fecha || session?.date || session?.createdAt || Date.now());
  return Number.isNaN(date.getTime()) ? null : date.getHours();
}

const ACHIEVEMENT_STYLE = {
  fuerza: {
    type: 'Fuerza',
    fillClass: 'bg-blue-400',
    surfaceClass: 'bg-blue-500',
    accent: 'border-blue-300/35 text-blue-200 bg-blue-400/10',
  },
  constancia: {
    type: 'Constancia',
    fillClass: 'bg-orange-400',
    surfaceClass: 'bg-orange-500',
    accent: 'border-orange-300/35 text-orange-200 bg-orange-400/10',
  },
  cardio: {
    type: 'Cardio',
    fillClass: 'bg-teal-400',
    surfaceClass: 'bg-teal-500',
    accent: 'border-teal-300/35 text-teal-200 bg-teal-400/10',
  },
  social: {
    type: 'Social',
    fillClass: 'bg-purple-400',
    surfaceClass: 'bg-purple-500',
    accent: 'border-purple-300/35 text-purple-200 bg-purple-400/10',
  },
  elite: {
    type: 'Élite',
    fillClass: 'bg-indigo-400',
    surfaceClass: 'bg-indigo-500',
    accent: 'border-indigo-300/35 text-indigo-200 bg-indigo-400/10',
  },
};

function normalizePost(post, lang) {
  const username = post?.author?.apodo || post?.author?.nombre || 'usuario';
  const createdAt = post?.createdAt ? new Date(post.createdAt) : null;
  const comments = post?.commentsCount ?? post?.comments?.length ?? 0;
  return {
    id: post?.id || post?._id || `${username}-${post?.createdAt || Math.random()}`,
    username,
    imageUrl: post?.image_url || '',
    avatarUrl: post?.author?.photo_url || '',
    caption: post?.caption || (lang === 'en' ? 'Community post' : 'Publicación de la comunidad'),
    likes: post?.likesCount ?? post?.likes ?? 0,
    comments,
    tags: Array.isArray(post?.tags) ? post.tags : [],
    type: post?.type || 'photo',
    dateLabel: createdAt && !Number.isNaN(createdAt.getTime()) ? formatShortDate(createdAt, lang).toUpperCase() : '',
  };
}

function ExerciseRow({ name, series, reps }) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
      <div className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85">{name}</div>
      <div className="mt-1.5 sm:mt-2 md:mt-2.5 flex gap-2 sm:gap-2.5 flex-wrap">
        <span className="rounded-md bg-black/30 px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-[10px] text-white/45">
          {series} {t('Series').toUpperCase()}
        </span>
        <span className="rounded-md bg-black/30 px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-[10px] text-white/45">
          {reps} {t('Repeticiones').toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function AchievementRow({ achievement }) {
  const style = achievement.style || ACHIEVEMENT_STYLE.constancia;
  const safeMax = Math.max(1, Number(achievement.max) || 1);
  const safeValue = Math.max(0, Number(achievement.value) || 0);
  const completed = safeValue >= safeMax;
  const percent = Math.min(100, Math.round((safeValue / safeMax) * 100));
  const remaining = Math.max(0, safeMax - safeValue);
  const unitLabel = achievement.unit ? ` ${achievement.unit}` : '';
  return (
    <div className={cx(
      'relative overflow-hidden rounded-2xl border bg-white/[0.045] p-3 sm:p-4 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]',
      completed ? 'border-white/25' : 'border-white/10 hover:border-white/20'
    )}>
      <div className={cx('absolute inset-0 opacity-15', completed ? 'bg-emerald-500' : style.surfaceClass)} />
      <div className={cx('absolute inset-y-0 left-0 w-1', completed ? 'bg-emerald-400' : style.fillClass)} />

      <div className="relative flex items-center gap-3">
        <div className={cx(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-black/20',
          completed ? 'border-emerald-300/35 text-emerald-200 bg-emerald-400/10' : style.accent
        )}>
          <span className="text-[22px] leading-none">{achievement.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cx(
              'rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest',
              completed ? 'border-emerald-300/35 text-emerald-200 bg-emerald-400/10' : style.accent
            )}>
              {style.type}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/35">{percent}%</span>
          </div>
          <div className="mt-1 truncate text-[13px] font-bold uppercase tracking-wide text-white/95">
            {achievement.title}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-white/45">
            {completed ? 'Meta alcanzada' : `Faltan ${remaining}${unitLabel}`}
          </div>
        </div>
      </div>

      <div className="relative mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-widest text-white/40">
          <span>Progreso</span>
          <span className="font-semibold text-white/70">{safeValue}/{safeMax}{unitLabel}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25">
          <div
            className={cx('h-full rounded-2xl transition-all duration-700', completed ? 'bg-emerald-300' : style.fillClass)}
            style={{ width: `${completed ? 100 : percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function FitgramPost({ post }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.06]">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 border-b border-white/10 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
        <div className="h-7 w-7 rounded-lg border border-[#ff7849]/60 bg-white/[0.04] overflow-hidden flex-shrink-0">
          {post.avatarUrl ? <img src={post.avatarUrl} alt={post.username} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 truncate">@{post.username}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/35">{post.dateLabel || t('FitGram')}</div>
        </div>
      </div>

      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#ff7849]/25 via-white/5 to-black/10">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.caption || post.username} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Dumbbell className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 text-white/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="px-3 sm:px-4 md:px-5 py-3">
        <p className="line-clamp-2 text-[11px] sm:text-[12px] text-white/70">
          <span className="font-semibold text-white/85">@{post.username}</span> {post.caption}
        </p>
        <div className="mt-3 flex items-center gap-3 text-white/55">
          <Heart className="h-4 w-4 flex-shrink-0" />
          <span className="text-[11px]">{post.likes}</span>
          <MessageCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-[11px]">{post.comments}</span>
          <div className="ml-auto text-[10px] uppercase tracking-widest text-white/35">
            {post.type === 'workout' ? t('Entreno') : `${post.tags.length} tags`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Main() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { lang, t } = useI18n();
  const demo = params.get('demo') === '1';
  const todayKey = useMemo(() => getDateKey(new Date()), []);
  const [todaySession, setTodaySession] = useState(() => (typeof window === 'undefined' ? null : getSessionForDate(todayKey)));
  const [sessionActionOpen, setSessionActionOpen] = useState(false);
  const [apiSessions, setApiSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [fitgramPosts, setFitgramPosts] = useState([]);
  const [fitgramLoading, setFitgramLoading] = useState(false);
  const [ownFitgramPosts, setOwnFitgramPosts] = useState([]);
  const [socialStats, setSocialStats] = useState({ followers: 0, following: 0, posts: 0 });

  useEffect(() => {
    setTodaySession(typeof window === 'undefined' ? null : getSessionForDate(todayKey));
  }, [todayKey]);

  useEffect(() => {
    let cancelled = false;
    setSessionsLoading(true);
    listSessionHistory()
      .then((data) => {
        if (!cancelled) setApiSessions(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setApiSessions([]);
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const currentUser = readCurrentUser();
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return undefined;

    Promise.all([
      getUserPosts(userId, { limit: 120 }).catch(() => ({ posts: [] })),
      getPublicProfile(userId).catch(() => null),
    ]).then(([postsData, profileData]) => {
      if (cancelled) return;
      setOwnFitgramPosts(Array.isArray(postsData?.posts) ? postsData.posts : []);
      setSocialStats(profileData?.stats || { followers: 0, following: 0, posts: 0 });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFitgramLoading(true);
    getExplore({ limit: 6 })
      .then((data) => {
        if (!cancelled) setFitgramPosts(Array.isArray(data?.posts) ? data.posts : []);
      })
      .catch(() => {
        if (!cancelled) setFitgramPosts([]);
      })
      .finally(() => {
        if (!cancelled) setFitgramLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const todayApiSession = useMemo(
    () => apiSessions.find((session) => getApiSessionKey(session) === todayKey) || null,
    [apiSessions, todayKey]
  );

  const activeTodaySession = todayApiSession || todaySession;

  const weekly = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Ajustar para que lunes sea 0 (getDay devuelve 0 para domingo)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Calcular el lunes de esta semana
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayIndex);
    
    const days = lang === 'en'
      ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
      : ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateNum = date.getDate();

      const dateKey = getDateKey(date);
      const storedSessions = typeof window === 'undefined' ? [] : getSessionsForDate(dateKey);
      const storedItems = storedSessions.map((s) => ({
        id: String(s.id),
        label: toWorkoutLabel(s.muscleGroup || (s.title || '').split('·')[0]),
        session: s,
        source: 'local',
      }));
      const apiItems = apiSessions
        .filter((session) => getApiSessionKey(session) === dateKey)
        .map((session) => ({
          id: String(session.id || session._id),
          label: toWorkoutLabel(session.tipo_rutina || session.title),
          session,
          source: 'api',
        }));

      const demoItems =
        demo && i <= dayIndex
          ? i === 0
            ? [t('Rutina Pecho'), t('Cardio')]
            : i === 1
              ? [t('Rutina Espalda')]
              : i === 2
                ? [t('Rutina Pierna')]
                : i === 3
                  ? [t('Rutina Brazo')]
                  : []
          : [];

      weekDays.push({
        label: days[i],
        date: dateNum,
        dateKey,
        dayIndex: i,
        isToday: i === dayIndex,
        items: apiItems.length || storedItems.length
          ? [...apiItems, ...storedItems]
          : demoItems.map((x, idx) => ({ id: `demo_${i}_${idx}`, label: x, session: null, source: 'demo' })),
      });
    }
    
    return weekDays;
  }, [apiSessions, demo, lang, t]);

  const todayExercises = useMemo(() => {
    if (todayApiSession?.ejercicios_realizados?.length) {
      return todayApiSession.ejercicios_realizados
        .slice(0, 4)
        .map((ex) => ({
          name: String(ex.nombre_ejercicio || ex.name || ''),
          series: Array.isArray(ex.sets) ? ex.sets.length : 0,
          reps: Array.isArray(ex.sets) ? (ex.sets[0]?.reps ?? 0) : 0,
        }));
    }
    if (activeTodaySession?.exercises?.length) {
      return activeTodaySession.exercises
        .slice(0, 4)
        .map((ex) => ({ name: String(ex.name || ''), series: ex.sets?.length || 0, reps: ex.sets?.[0]?.reps ?? 0 }));
    }
    if (!demo) return [];
    return [
      { name: t('Sentadillas'), series: 3, reps: 12 },
      { name: t('Press de Banca'), series: 4, reps: 8 },
      { name: t('Peso muerto'), series: 3, reps: 15 },
      { name: t('Hip Trust'), series: 4, reps: 10 },
    ];
  }, [activeTodaySession, demo, t, todayApiSession]);

  const achievements = useMemo(() => {
    const sessionsCount = apiSessions.length;
    const volumes = apiSessions.map(getApiSessionVolume);
    const maxVolume = volumes.length ? Math.max(...volumes) : 0;
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);
    const maxDuration = apiSessions.reduce((max, session) => Math.max(max, getSessionDuration(session)), 0);
    const uniqueTrainingTypes = new Set(apiSessions.map((session) => String(session?.tipo_rutina || '').trim().toLowerCase()).filter(Boolean)).size;
    const earlySessions = apiSessions.filter((session) => {
      const hour = getSessionHour(session);
      return hour !== null && hour < 7;
    }).length;
    const copiedWorkouts = apiSessions.filter((session) => (
      session?.copiedFrom?.postId || String(session?.notas || '').toLowerCase().includes('copiada desde fitgram')
    )).length;
    const workoutPosts = ownFitgramPosts.filter((post) => post.type === 'workout').length;
    const totalComments = ownFitgramPosts.reduce((sum, post) => sum + (post.commentsCount ?? post.comments?.length ?? 0), 0);
    const streak = calculateStreak(apiSessions);
    const custom = readCustomAchievements();
    const baseAchievements = [
      {
        emoji: '🥇',
        title: lang === 'en' ? 'First Step' : 'Primer Paso',
        value: sessionsCount,
        max: 1,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
      {
        emoji: '🔥',
        title: lang === 'en' ? 'Electric streak' : 'Racha eléctrica',
        value: streak,
        max: 7,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
      {
        emoji: '💪',
        title: lang === 'en' ? 'Raw strength' : 'Fuerza bruta',
        value: Math.round(maxVolume),
        max: 2000,
        unit: 'kg',
        style: ACHIEVEMENT_STYLE.fuerza,
      },
      {
        emoji: '⭐',
        title: lang === 'en' ? 'Dedication' : 'Dedicación',
        value: sessionsCount,
        max: 10,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
      {
        emoji: '❤️',
        title: 'Cardio Warrior',
        value: maxDuration,
        max: 45,
        unit: 'min',
        style: ACHIEVEMENT_STYLE.cardio,
      },
      {
        emoji: '🎯',
        title: lang === 'en' ? 'Versatile' : 'Versátil',
        value: uniqueTrainingTypes,
        max: 3,
        unit: '',
        style: ACHIEVEMENT_STYLE.elite,
      },
      {
        emoji: '🚀',
        title: lang === 'en' ? 'Total engine' : 'Motor total',
        value: Math.round(totalVolume),
        max: 25000,
        unit: 'kg',
        style: ACHIEVEMENT_STYLE.fuerza,
      },
      {
        emoji: '🌅',
        title: lang === 'en' ? 'Early Bird' : 'Madrugador',
        value: earlySessions,
        max: 5,
        unit: '',
        style: ACHIEVEMENT_STYLE.cardio,
      },
      {
        emoji: '📸',
        title: lang === 'en' ? 'First post' : 'Primera publicación',
        value: ownFitgramPosts.length,
        max: 1,
        unit: '',
        style: ACHIEVEMENT_STYLE.social,
      },
      {
        emoji: '🏋️',
        title: lang === 'en' ? 'Public coach' : 'Entrenador público',
        value: workoutPosts,
        max: 5,
        unit: '',
        style: ACHIEVEMENT_STYLE.fuerza,
      },
      {
        emoji: '👥',
        title: lang === 'en' ? 'Active community' : 'Comunidad activa',
        value: Number(socialStats.following || 0),
        max: 10,
        unit: '',
        style: ACHIEVEMENT_STYLE.social,
      },
      {
        emoji: '⚡',
        title: lang === 'en' ? 'Influence' : 'Influencia',
        value: Number(socialStats.followers || 0),
        max: 25,
        unit: '',
        style: ACHIEVEMENT_STYLE.elite,
      },
      {
        emoji: '💬',
        title: lang === 'en' ? 'Conversation' : 'Conversación',
        value: totalComments,
        max: 15,
        unit: '',
        style: ACHIEVEMENT_STYLE.social,
      },
      {
        emoji: '📥',
        title: lang === 'en' ? 'FitGram library' : 'Biblioteca FitGram',
        value: copiedWorkouts,
        max: 3,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
    ];

    const customAchievements = custom.map((goal) => {
      const target = Math.max(1, Number(goal.target || 1));
      const unit = goal.unit || '';
      let value = 0;
      if (unit === 'kg') value = goal.type === 'fuerza' ? Math.round(totalVolume) : Math.round(maxVolume);
      else if (unit === 'min') value = maxDuration;
      else if (unit === 'sesiones') value = sessionsCount;
      else if (goal.type === 'racha') value = streak;
      else if (goal.type === 'cardio') value = maxDuration;
      else if (goal.type === 'fuerza') value = Math.round(totalVolume);
      else value = sessionsCount;

      const style = goal.type === 'cardio'
        ? ACHIEVEMENT_STYLE.cardio
        : goal.type === 'racha'
          ? ACHIEVEMENT_STYLE.constancia
          : goal.type === 'fuerza'
            ? ACHIEVEMENT_STYLE.fuerza
            : ACHIEVEMENT_STYLE.elite;

      return {
        emoji: goal.type === 'cardio' ? '❤️' : goal.type === 'racha' ? '🔥' : goal.type === 'fuerza' ? '💪' : '⭐',
        title: goal.title,
        value,
        max: target,
        unit,
        style,
      };
    });

    const allAchievements = [...baseAchievements, ...customAchievements];
    const byProgressDesc = (a, b) => {
      const progressA = Number(a.value || 0) / Math.max(1, Number(a.max || 1));
      const progressB = Number(b.value || 0) / Math.max(1, Number(b.max || 1));
      return progressB - progressA;
    };
    const incomplete = allAchievements.filter((achievement) => Number(achievement.value || 0) < Number(achievement.max || 1));
    const source = incomplete.length ? incomplete : allAchievements;
    return [...source].sort(byProgressDesc).slice(0, 3);
  }, [apiSessions, lang, ownFitgramPosts, socialStats]);

  const hasUserAchievements = achievements.length > 0;

  const fitgram = useMemo(() => {
    if (demo) {
      return [
        { id: 'demo-1', username: 'usuario1', likes: 32, comments: 4, tags: ['PECHO'], caption: t('Entreno compartido'), type: 'workout', imageUrl: '', avatarUrl: '', dateLabel: 'DEMO' },
        { id: 'demo-2', username: 'usuario2', likes: 18, comments: 1, tags: ['CARDIO'], caption: t('Publicación de la comunidad'), type: 'photo', imageUrl: '', avatarUrl: '', dateLabel: 'DEMO' },
      ];
    }
    return fitgramPosts.map((post) => normalizePost(post, lang));
  }, [demo, fitgramPosts, lang, t]);

  const openWeeklyDay = (day) => {
    const firstSession = day.items.find((item) => item.session);
    if (firstSession) {
      const workout = firstSession.source === 'api'
        ? formatSessionForDetail(firstSession.session, lang)
        : firstSession.session;
      navigate(`/sessiondetail/${workout.id || firstSession.id}`, { state: { workout } });
      return;
    }

    const future = isFutureDateKey(day.dateKey);
    navigate(`/crear-sesion?date=${day.dateKey}${future ? '&future=1' : ''}`, {
      state: {
        futureSession: future,
        infoMessage: future
          ? (lang === 'en'
              ? 'You are creating a session for a future date.'
              : 'Estás creando una sesión para una fecha futura.')
          : '',
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      {/* Layout */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4 md:px-6 lg:px-7 xl:px-8 2xl:px-10 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        {/* Left */}
        <div className="min-w-0 space-y-4 sm:space-y-5 md:space-y-6">
          <Card className="p-0">
            <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
              <div className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold tracking-wide text-white/85" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                {t('Resumen semanal').toUpperCase()}
              </div>
            </div>

            <div className="mt-4 sm:mt-5 md:mt-6 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
              <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                {weekly.map((d) => {
                  return (
                    <button
                      type="button"
                      key={`${d.label}-${d.date}`}
                      onClick={() => openWeeklyDay(d)}
                      className={cx(
                        'flex min-h-[120px] sm:min-h-[132px] w-full min-w-0 flex-col rounded-lg sm:rounded-xl border bg-white/[0.04] p-2.5 sm:p-3 text-left transition-all',
                        'hover:border-[#ff7849]/60 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#ff7849]/25',
                        d.isToday ? 'border-white/70 bg-white/[0.08]' : 'border-white/10',
                        isFutureDateKey(d.dateKey) && !d.items.length ? 'border-white/10 border-dashed' : ''
                      )}
                      aria-label={
                        d.items.length
                          ? `${t('Abrir entrenamiento')}: ${d.label} ${d.date}`
                          : `${t('Crear sesión de hoy')}: ${d.label} ${d.date}`
                      }
                    >
                      <div className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-white/45">
                        {d.label}
                      </div>
                      <div className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-white/60 mt-0.5">
                        {d.date}
                      </div>
                      <div className="mt-2 flex flex-1 flex-col gap-1 sm:gap-1.5 overflow-hidden">
                        {d.items.length
                          ? d.items.slice(0, 2).map((it) =>
                              it.session ? (
                                <WeeklyWorkoutBadge
                                  key={it.id}
                                  type={it.label}
                                />
                              ) : (
                                <Chip key={it.id}>{it.label}</Chip>
                              )
                            )
                          : null}
                        {d.items.length > 2 ? (
                          <div className="text-[9px] sm:text-[10px] text-white/35">+{d.items.length - 2}</div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
            <Card className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]">
              <CardTitle>{t('Sesión de hoy').toUpperCase()}</CardTitle>
              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5">
                {sessionsLoading && !todayExercises.length ? (
                  <div className="flex min-h-[180px] items-center justify-center text-[12px] text-white/45">
                    {lang === 'en' ? 'Loading sessions...' : 'Cargando sesiones...'}
                  </div>
                ) : !todayExercises.length ? (
                  <PlusEmpty label={t('Crear sesión de hoy')} onClick={() => navigate(`/crear-sesion?date=${todayKey}`)} />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSessionActionOpen(true)}
                      className="w-full text-left"
                      aria-label={t('Abrir detalle')}
                    >
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      {todayExercises.map((ex) => (
                        <ExerciseRow
                          key={ex.name}
                          name={ex.name}
                          series={ex.series}
                          reps={ex.reps}
                        />
                      ))}
                      </div>
                    </button>

                    <div className="mt-4 sm:mt-5 md:mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => (activeTodaySession ? setSessionActionOpen(true) : navigate(`/crear-sesion?date=${todayKey}`))}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-medium text-white/75 transition hover:border-white/25 hover:text-white/90"
                      >
                        <Plus className="h-4 w-4" />
                        {t('Detalle')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]">
              <button
                type="button"
                onClick={() => navigate(hasUserAchievements ? '/logros?tab=mis' : '/logros?tab=fitgram')}
                className="w-full text-left"
                aria-label={t('Logros')}
              >
                <CardTitle>{t('Logros').toUpperCase()}</CardTitle>
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5">
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {achievements.map((a, i) => (
                      <AchievementRow
                        key={`${a.title}-${i}`}
                        achievement={a}
                      />
                    ))}
                  </div>
                </div>
              </button>
            </Card>
          </div>
        </div>

        {/* Right */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/fitgram')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') navigate('/fitgram');
          }}
          className="w-full min-w-0 cursor-pointer text-left"
        >
          <Card className="h-auto min-h-[400px] sm:min-h-[500px] md:min-h-[600px] xl:min-h-[800px] overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
              <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-bold tracking-wide text-white/90" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                {t('FitGram').toUpperCase()}
              </h2>
            </div>

            <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5 h-full">
              {fitgramLoading ? (
                <div className="flex h-full items-center justify-center min-h-[320px] sm:min-h-[400px] md:min-h-[480px]">
                  <div className="max-w-[360px] text-center text-white/60 text-[12px] sm:text-[13px]">
                    {lang === 'en' ? 'Loading FitGram posts...' : 'Cargando publicaciones de FitGram...'}
                  </div>
                </div>
              ) : !fitgram.length ? (
                <div className="flex h-full items-center justify-center min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[600px]">
                  <div className="max-w-[360px] text-center text-white/60 text-[12px] sm:text-[13px]">
                    {lang === 'en'
                      ? 'There are no FitGram posts yet. Create the first one from your profile.'
                      : 'Todavía no hay publicaciones en FitGram. Crea la primera desde tu perfil.'}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4 xl:max-h-[calc(100vh-180px)] xl:overflow-auto xl:pr-2">
                  {fitgram.map((p) => (
                    <FitgramPost key={p.id} post={p} />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {sessionActionOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-[0_30px_120px_-60px_rgba(0,0,0,0.95)]">
            <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="text-[14px] sm:text-[15px] font-bold text-white/90 uppercase tracking-wide">
                {lang === 'en' ? "Today's session" : 'Sesión de hoy'}
              </div>
              <button
                type="button"
                onClick={() => setSessionActionOpen(false)}
                className="text-white/55 hover:text-white/85 transition text-[12px] font-semibold"
              >
                {lang === 'en' ? 'Close' : 'Cerrar'}
              </button>
            </div>

            <div className="px-5 sm:px-6 py-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSessionActionOpen(false);
                  if (activeTodaySession) {
                    const workout = todayApiSession ? formatSessionForDetail(todayApiSession, lang) : activeTodaySession;
                    navigate(`/sessiondetail/${workout.id || activeTodaySession.id}`, { state: { workout } });
                  }
                }}
                disabled={!activeTodaySession}
                className={cx(
                  'w-full rounded-xl border px-4 py-3 text-left transition',
                  activeTodaySession ? 'border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-white/85' : 'border-white/10 bg-white/[0.02] text-white/35 cursor-not-allowed'
                )}
              >
                <div className="text-[12px] font-bold uppercase tracking-wide">{lang === 'en' ? 'Edit session' : 'Editar sesión'}</div>
                <div className="mt-1 text-[11px] text-white/45">{lang === 'en' ? 'Open details and edit sets.' : 'Abre el detalle y edita las series.'}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSessionActionOpen(false);
                  navigate(`/crear-sesion?date=${todayKey}`);
                }}
                className="w-full rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] px-4 py-3 text-left transition text-white/85"
              >
                <div className="text-[12px] font-bold uppercase tracking-wide">{lang === 'en' ? 'New session for today' : 'Nueva sesión para hoy'}</div>
                <div className="mt-1 text-[11px] text-white/45">{lang === 'en' ? 'Create another session for today.' : 'Crea otra sesión para hoy.'}</div>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
