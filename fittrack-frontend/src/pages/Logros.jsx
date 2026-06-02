import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listSessionHistory } from '../services/sessionsApi';
import { getUserPosts } from '../services/fitgramApi';
import { getPublicProfile } from '../services/socialApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-[44px] min-w-[140px] sm:min-w-[180px] rounded-lg border px-4 text-[11px] sm:text-[12px] font-semibold tracking-wide transition',
        active
          ? 'bg-white text-black border-white'
          : 'bg-transparent text-white/85 border-white/35 hover:border-white/55 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function ProgressBar({ value, max, gradient = 'from-white to-white', completed = false }) {
  const safeMax = Number(max) || 0;
  const safeValue = Math.max(0, Number(value) || 0);
  const percent = safeMax > 0 ? Math.min(100, (safeValue / safeMax) * 100) : 0;

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25">
      <div
        className={cx(
          'h-full rounded-2xl bg-gradient-to-r shadow-[0_0_28px_rgba(255,120,73,0.35)] transition-all duration-700',
          gradient,
          completed ? 'opacity-100' : 'opacity-90'
        )}
        style={{ width: `${completed ? 100 : percent}%` }}
      />
    </div>
  );
}

function AchievementCard({
  emoji,
  title,
  subtitle,
  value,
  max,
  unit,
  unlockedDate,
  type,
  gradient,
  accent,
  progressLabel = 'PROGRESO',
}) {
  const hasDate = Boolean(unlockedDate);
  const safeMax = Number(max) || 1;
  const safeValue = Math.max(0, Number(value) || 0);
  const completed = hasDate || safeValue >= safeMax;
  const remaining = Math.max(0, safeMax - safeValue);
  const percent = Math.min(100, Math.round((safeValue / safeMax) * 100));
  const unitLabel = unit ? ` ${unit}` : '';
  const rightLabel = completed
    ? unlockedDate || 'COMPLETO'
    : `${safeValue}/${safeMax}${unitLabel}`;

  return (
    <section
      className={cx(
        'group relative overflow-hidden rounded-2xl border bg-white/[0.045] p-4 sm:p-5 shadow-[0_24px_70px_-55px_rgba(0,0,0,0.9)]',
        completed ? 'border-white/25' : 'border-white/10 hover:border-white/20'
      )}
    >
      <div className={cx('absolute inset-0 opacity-10 bg-gradient-to-r', gradient)} />
      <div className={cx('absolute inset-y-0 left-0 w-1 bg-gradient-to-b', gradient)} />

      <div className="relative flex items-center gap-4">
        <div className={cx('grid h-14 w-14 shrink-0 place-items-center rounded-xl border bg-black/20', accent)}>
          <span className="text-[26px] leading-none">{emoji}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cx('rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest', accent)}>
              {type}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/35">{percent}%</span>
          </div>
          <div className="mt-1 truncate text-[15px] font-bold uppercase tracking-wide text-white/95">
            {title}
          </div>
          <div className="mt-1 line-clamp-2 text-[12px] text-white/50">{subtitle}</div>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-[18px] font-bold text-white/95">{rightLabel}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-white/35">
            {completed ? 'Meta alcanzada' : `Faltan ${remaining}${unitLabel}`}
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40">
          <span>{progressLabel}</span>
          <span className="font-semibold text-white/75 sm:hidden">{rightLabel}</span>
        </div>
        <div className="h-4">
          <ProgressBar value={safeValue} max={safeMax} gradient={gradient} completed={completed} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
          <span>{completed ? 'Completado' : `Actual: ${safeValue}${unitLabel}`}</span>
          <span>Meta: {safeMax}{unitLabel}</span>
        </div>
      </div>
    </section>
  );
}

function MiniAchievementCard({ emoji, title, subtitle }) {
  return (
    <section className="rounded-xl border border-white/25 bg-white/[0.02] px-5 sm:px-6 py-6 sm:py-7 text-center">
      <div className="mx-auto grid h-[54px] w-[86px] place-items-center border border-white/35 bg-black/10">
        <span className="text-[24px] leading-none">{emoji}</span>
      </div>
      <div
        className="mt-5 text-[13px] font-bold tracking-wide text-white/95"
        style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
      >
        {title.toUpperCase()}
      </div>
      <div className="mt-2 text-[11px] text-white/40">{subtitle}</div>
    </section>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/45">
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-2 h-[46px] w-full rounded-lg border border-white/35 bg-transparent px-4 text-[13px] text-white/85 placeholder:text-white/25 outline-none focus:border-white/60"
    />
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={5}
      className="mt-2 w-full resize-none rounded-lg border border-white/35 bg-transparent px-4 py-3 text-[13px] text-white/85 placeholder:text-white/25 outline-none focus:border-white/60"
    />
  );
}

function TypeCard({ active, emoji, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-[96px] sm:h-[104px] rounded-xl border px-4 sm:px-5 transition text-center',
        active
          ? 'bg-white text-black border-white'
          : 'bg-transparent text-white/85 border-white/35 hover:border-white/55 hover:text-white'
      )}
    >
      <div className={cx('mx-auto mt-3 grid h-[40px] w-[56px] place-items-center border bg-black/5', active ? 'border-black/25' : 'border-white/35')}>
        <span className="text-[22px] leading-none">{emoji}</span>
      </div>
      <div className={cx('mt-3 text-[11px] font-bold tracking-wide', active ? 'text-black' : 'text-white/90')}>
        {label.toUpperCase()}
      </div>
    </button>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[46px] min-w-[160px] rounded-lg border border-white bg-white px-6 text-[12px] font-bold tracking-wide text-black transition hover:bg-white/90"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[46px] min-w-[160px] rounded-lg border border-white/45 bg-transparent px-6 text-[12px] font-bold tracking-wide text-white/90 transition hover:border-white/70"
    >
      {children}
    </button>
  );
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

function getSessionDate(session) {
  const date = new Date(session?.fecha || session?.date || session?.createdAt || Date.now());
  return Number.isFinite(date.getTime()) ? date : null;
}

function getSessionVolume(session) {
  const exercises = Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
  return exercises.reduce((sum, exercise) => {
    const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
    return sum + sets.reduce((setSum, set) => {
      const reps = Number(set?.reps || 0);
      const weight = Number(set?.peso || 0);
      return setSum + (Number.isFinite(reps) && Number.isFinite(weight) ? reps * weight : 0);
    }, 0);
  }, 0);
}

function getCurrentStreak(sessions) {
  const daySet = new Set(
    sessions
      .map(getSessionDate)
      .filter(Boolean)
      .map((date) => date.toISOString().slice(0, 10))
  );
  if (!daySet.size) return 0;

  let cursor = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daySet.has(key)) {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const ACHIEVEMENT_STYLE = {
  fuerza: {
    type: 'Fuerza',
    gradient: 'from-[#00e5ff] via-[#3b82f6] to-[#8b5cf6]',
    accent: 'border-cyan-300/35 text-cyan-200 bg-cyan-400/10',
  },
  constancia: {
    type: 'Constancia',
    gradient: 'from-[#f97316] via-[#ff3d81] to-[#facc15]',
    accent: 'border-orange-300/35 text-orange-200 bg-orange-400/10',
  },
  cardio: {
    type: 'Cardio',
    gradient: 'from-[#22c55e] via-[#14b8a6] to-[#84cc16]',
    accent: 'border-emerald-300/35 text-emerald-200 bg-emerald-400/10',
  },
  social: {
    type: 'Social',
    gradient: 'from-[#a855f7] via-[#ec4899] to-[#6366f1]',
    accent: 'border-fuchsia-300/35 text-fuchsia-200 bg-fuchsia-400/10',
  },
  elite: {
    type: 'Élite',
    gradient: 'from-[#facc15] via-[#fb7185] to-[#a855f7]',
    accent: 'border-yellow-300/35 text-yellow-100 bg-yellow-400/10',
  },
};

export default function Logros() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tabParam = params.get('tab');
  const initialTab = tabParam === 'fitgram' || tabParam === 'crear' || tabParam === 'mis' ? tabParam : 'mis';
  const [tab, setTab] = useState(initialTab); // mis | fitgram | crear
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('fuerza'); // fuerza | cardio | racha | otro
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTarget, setGoalTarget] = useState('10');
  const [goalUnit, setGoalUnit] = useState('');

  const demoEmpty = params.get('empty') === '1';
  const [sessions, setSessions] = useState([]);
  const [fitgramPosts, setFitgramPosts] = useState([]);
  const [socialStats, setSocialStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let alive = true;
    const currentUser = readCurrentUser();
    const userId = currentUser?.id || currentUser?._id;

    (async () => {
      try {
        setLoadingStats(true);
        setStatsError('');
        const [sessionData, postsData, profileData] = await Promise.all([
          listSessionHistory().catch(() => ({ items: [] })),
          userId ? getUserPosts(userId, { limit: 120 }).catch(() => ({ posts: [] })) : Promise.resolve({ posts: [] }),
          userId ? getPublicProfile(userId).catch(() => null) : Promise.resolve(null),
        ]);
        if (!alive) return;
        setSessions(Array.isArray(sessionData?.items) ? sessionData.items : []);
        setFitgramPosts(Array.isArray(postsData?.posts) ? postsData.posts : []);
        setSocialStats(profileData?.stats || { followers: 0, following: 0, posts: 0 });
      } catch (error) {
        if (!alive) return;
        setSessions([]);
        setFitgramPosts([]);
        setSocialStats({ followers: 0, following: 0, posts: 0 });
        setStatsError(error?.message || tr(lang, 'No se pudieron calcular tus logros.', 'Could not calculate your achievements.'));
      } finally {
        if (alive) setLoadingStats(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lang]);

  const achievementMetrics = useMemo(() => {
    const volumes = sessions.map(getSessionVolume);
    const maxVolume = volumes.length ? Math.max(...volumes) : 0;
    const totalVolume = volumes.reduce((sum, value) => sum + value, 0);
    const maxDuration = sessions.reduce((max, session) => Math.max(max, Number(session?.duracion_minutos || 0)), 0);
    const uniqueTrainingTypes = new Set(sessions.map((session) => String(session?.tipo_rutina || '').trim().toLowerCase()).filter(Boolean)).size;
    const earlySessions = sessions.filter((session) => {
      const date = getSessionDate(session);
      return date ? date.getHours() < 7 : false;
    }).length;
    const copiedWorkouts = sessions.filter((session) => (
      session?.copiedFrom?.postId || String(session?.notas || '').toLowerCase().includes('copiada desde fitgram')
    )).length;
    const workoutPosts = fitgramPosts.filter((post) => post.type === 'workout').length;
    const totalComments = fitgramPosts.reduce((sum, post) => sum + (post.commentsCount ?? post.comments?.length ?? 0), 0);

    return {
      sessionsCount: sessions.length,
      streak: getCurrentStreak(sessions),
      maxVolume,
      totalVolume,
      maxDuration,
      uniqueTrainingTypes,
      earlySessions,
      copiedWorkouts,
      workoutPosts,
      totalComments,
      followers: Number(socialStats.followers || 0),
      following: Number(socialStats.following || 0),
      fitgramPosts: fitgramPosts.length,
    };
  }, [fitgramPosts, sessions, socialStats]);

  const fitgramAchievements = useMemo(() => {
    const m = achievementMetrics;
    return [
      {
        emoji: '📸',
        title: tr(lang, 'Primera publicación', 'First post'),
        subtitle: tr(lang, 'Sube tu primera publicación a FitGram', 'Upload your first FitGram post'),
        value: m.fitgramPosts,
        max: 1,
        unit: '',
        style: ACHIEVEMENT_STYLE.social,
      },
      {
        emoji: '🏋️',
        title: tr(lang, 'Entrenador público', 'Public coach'),
        subtitle: tr(lang, 'Comparte 5 entrenos para que otros puedan guardarlos', 'Share 5 workouts others can save'),
        value: m.workoutPosts,
        max: 5,
        unit: '',
        style: ACHIEVEMENT_STYLE.fuerza,
      },
      {
        emoji: '👥',
        title: tr(lang, 'Comunidad activa', 'Active community'),
        subtitle: tr(lang, 'Sigue a 10 usuarios en FitGram', 'Follow 10 users on FitGram'),
        value: m.following,
        max: 10,
        unit: '',
        style: ACHIEVEMENT_STYLE.social,
      },
      {
        emoji: '⚡',
        title: tr(lang, 'Influencia', 'Influence'),
        subtitle: tr(lang, 'Consigue 25 seguidores', 'Reach 25 followers'),
        value: m.followers,
        max: 25,
        unit: '',
        style: ACHIEVEMENT_STYLE.elite,
      },
      {
        emoji: '💬',
        title: tr(lang, 'Conversación', 'Conversation'),
        subtitle: tr(lang, 'Recibe 15 comentarios en tus publicaciones', 'Receive 15 comments on your posts'),
        value: m.totalComments,
        max: 15,
        unit: '',
        style: ACHIEVEMENT_STYLE.social,
      },
      {
        emoji: '📥',
        title: tr(lang, 'Biblioteca FitGram', 'FitGram library'),
        subtitle: tr(lang, 'Guarda 3 entrenos de otros usuarios', 'Save 3 workouts from other users'),
        value: m.copiedWorkouts,
        max: 3,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
    ];
  }, [achievementMetrics, lang]);

  const myAchievements = useMemo(() => {
    if (demoEmpty) return [];
    const m = achievementMetrics;
    return [
      {
        emoji: '🥇',
        title: tr(lang, 'Primer Paso', 'First Step'),
        subtitle: tr(lang, 'Completa tu primera sesión de entrenamiento', 'Complete your first workout session'),
        value: m.sessionsCount,
        max: 1,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
      {
        emoji: '🔥',
        title: tr(lang, 'Racha eléctrica', 'Electric streak'),
        subtitle: tr(lang, 'Entrena 7 días consecutivos sin fallar', 'Train 7 days in a row without missing'),
        value: m.streak,
        max: 7,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
      {
        emoji: '💪',
        title: tr(lang, 'Fuerza bruta', 'Raw strength'),
        subtitle: tr(lang, 'Levanta 2.000 kg de volumen en una sesión', 'Lift 2,000 kg of volume in one session'),
        value: Math.round(m.maxVolume),
        max: 2000,
        unit: 'kg',
        style: ACHIEVEMENT_STYLE.fuerza,
      },
      {
        emoji: '⭐',
        title: tr(lang, 'Dedicación', 'Dedication'),
        subtitle: tr(lang, 'Completa 10 sesiones de entrenamiento', 'Complete 10 workout sessions'),
        value: m.sessionsCount,
        max: 10,
        unit: '',
        style: ACHIEVEMENT_STYLE.constancia,
      },
      {
        emoji: '❤️',
        title: tr(lang, 'Cardio Warrior', 'Cardio Warrior'),
        subtitle: tr(lang, 'Completa 45 minutos en una sesión', 'Complete 45 minutes in one session'),
        value: m.maxDuration,
        max: 45,
        unit: 'min',
        style: ACHIEVEMENT_STYLE.cardio,
      },
      {
        emoji: '🎯',
        title: tr(lang, 'Versátil', 'Versatile'),
        subtitle: tr(lang, 'Practica 3 tipos diferentes de entrenamiento', 'Do 3 different types of training'),
        value: m.uniqueTrainingTypes,
        max: 3,
        unit: '',
        style: ACHIEVEMENT_STYLE.elite,
      },
      {
        emoji: '🚀',
        title: tr(lang, 'Motor total', 'Total engine'),
        subtitle: tr(lang, 'Acumula 25.000 kg de volumen total', 'Accumulate 25,000 kg total volume'),
        value: Math.round(m.totalVolume),
        max: 25000,
        unit: 'kg',
        style: ACHIEVEMENT_STYLE.fuerza,
      },
      {
        emoji: '🌅',
        title: tr(lang, 'Madrugador', 'Early Bird'),
        subtitle: tr(lang, 'Entrena antes de las 7:00 AM cinco veces', 'Train before 7:00 AM five times'),
        value: m.earlySessions,
        max: 5,
        unit: '',
        style: ACHIEVEMENT_STYLE.cardio,
      },
    ];
  }, [achievementMetrics, demoEmpty, lang]);

  const completedCount = useMemo(
    () => myAchievements.filter((a) => Number(a.value || 0) >= Number(a.max || 1)).length,
    [myAchievements]
  );

  const firstUnlocks = useMemo(() => {
    // Mock UI based on `views/Logros Vacio.png`
    return [
      {
        emoji: '🥇',
        title: tr(lang, 'Primer Paso', 'First Step'),
        subtitle: tr(lang, 'Completa tu primera sesión', 'Complete your first session'),
      },
      {
        emoji: '⭐',
        title: tr(lang, 'Dedicación', 'Dedication'),
        subtitle: tr(lang, 'Completa 10 sesiones', 'Complete 10 sessions'),
      },
      {
        emoji: '🔥',
        title: tr(lang, 'Racha Semanal', 'Weekly Streak'),
        subtitle: tr(lang, 'Entrena 7 días seguidos', 'Train 7 days in a row'),
      },
    ];
  }, [lang]);

  const handleCancelCreate = () => {
    setGoalTitle('');
    setGoalType('fuerza');
    setGoalDescription('');
    setGoalTarget('10');
    setGoalUnit('');
    setTab('mis');
  };

  const handleCreate = () => {
    // UI-only for now (no backend wiring requested)
    setTab('mis');
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <TabButton active={tab === 'mis'} onClick={() => setTab('mis')}>
              {t('ach_tab_my').toUpperCase()}
            </TabButton>
            <TabButton active={tab === 'fitgram'} onClick={() => setTab('fitgram')}>
              {t('ach_tab_fitgram').toUpperCase()}
            </TabButton>
            <TabButton active={tab === 'crear'} onClick={() => setTab('crear')}>
              {t('ach_tab_create').toUpperCase()}
            </TabButton>
          </div>

          <div className="mt-10 sm:mt-12">
            {tab === 'crear' ? (
              <div className="mx-auto w-full max-w-[760px]">
                <div className="text-center">
                  <div className="text-[20px] sm:text-[22px] font-bold tracking-wide text-white/95" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                    {t('ach_create_title').toUpperCase()}
                  </div>
                  <div className="mt-2 text-[12px] sm:text-[13px] text-white/45">
                    {t('ach_create_subtitle')}
                  </div>
                </div>

                <div className="mt-8 sm:mt-10 space-y-7 sm:space-y-8">
                  <div>
                    <FieldLabel>{t('ach_create_goal_title').toUpperCase()}</FieldLabel>
                    <Input
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder={tr(lang, 'Ej: Correr 5km sin parar', 'e.g. Run 5km without stopping')}
                    />
                  </div>

                  <div>
                    <FieldLabel>{t('ach_create_type').toUpperCase()}</FieldLabel>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                      <TypeCard
                        active={goalType === 'fuerza'}
                        emoji="💪"
                        label={tr(lang, 'Fuerza', 'Strength')}
                        onClick={() => setGoalType('fuerza')}
                      />
                      <TypeCard
                        active={goalType === 'cardio'}
                        emoji="❤️"
                        label={tr(lang, 'Cardio', 'Cardio')}
                        onClick={() => setGoalType('cardio')}
                      />
                      <TypeCard
                        active={goalType === 'racha'}
                        emoji="🔥"
                        label={tr(lang, 'Racha', 'Streak')}
                        onClick={() => setGoalType('racha')}
                      />
                      <TypeCard
                        active={goalType === 'otro'}
                        emoji="⭐"
                        label={tr(lang, 'Otro', 'Other')}
                        onClick={() => setGoalType('otro')}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>{t('ach_create_desc').toUpperCase()}</FieldLabel>
                    <TextArea
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                      placeholder={tr(lang, 'Describe tu objetivo y cómo quieres conseguirlo...', 'Describe your goal and how you want to achieve it...')}
                    />
                  </div>

                  <div>
                    <FieldLabel>{t('ach_create_numeric').toUpperCase()}</FieldLabel>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{t('ach_create_target').toUpperCase()}</div>
                        <input
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(e.target.value)}
                          className="mt-2 h-[46px] w-full rounded-lg border border-white/35 bg-transparent px-4 text-[13px] text-white/85 outline-none focus:border-white/60"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{t('ach_create_unit').toUpperCase()}</div>
                        <select
                          value={goalUnit}
                          onChange={(e) => setGoalUnit(e.target.value)}
                          className="mt-2 h-[46px] w-full rounded-lg border border-white/35 bg-transparent px-4 text-[13px] text-white/85 outline-none focus:border-white/60"
                        >
                          <option value="" className="bg-[#1e1e1e]">
                            {tr(lang, 'Selecciona…', 'Select…')}
                          </option>
                          <option value="kg" className="bg-[#1e1e1e]">
                            kg
                          </option>
                          <option value="min" className="bg-[#1e1e1e]">
                            min
                          </option>
                          <option value="sesiones" className="bg-[#1e1e1e]">
                            {tr(lang, 'sesiones', 'sessions')}
                          </option>
                          <option value="reps" className="bg-[#1e1e1e]">
                            reps
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-4 sm:gap-6">
                    <SecondaryButton onClick={handleCancelCreate}>{t('ach_cancel').toUpperCase()}</SecondaryButton>
                    <PrimaryButton onClick={handleCreate}>{t('ach_create').toUpperCase()}</PrimaryButton>
                  </div>
                </div>
              </div>
            ) : tab === 'mis' ? (
              <div className="space-y-8 sm:space-y-10">
                {loadingStats ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-[13px] text-white/55">
                    {tr(lang, 'Calculando progreso de logros...', 'Calculating achievement progress...')}
                  </div>
                ) : statsError ? (
                  <div className="rounded-2xl border border-[#ff7849]/25 bg-[#ff7849]/10 p-5 text-[13px] text-white/80">
                    {statsError}
                  </div>
                ) : demoEmpty ? (
                  <div className="pt-2 sm:pt-4">
                    <div className="mx-auto w-full max-w-[760px] text-center">
                      <div className="mx-auto grid h-[88px] w-[120px] place-items-center border border-white/35 bg-black/10">
                        <span className="text-[34px] leading-none">🏆</span>
                      </div>
                      <div
                        className="mt-6 text-[16px] sm:text-[18px] font-bold tracking-wide text-white/95"
                        style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
                      >
                        {t('ach_empty_title').toUpperCase()}
                      </div>
                      <div className="mt-2 text-[12px] sm:text-[13px] text-white/45">
                        {t('ach_empty_subtitle')}
                      </div>

                      <div className="mt-10 rounded-xl border border-white/35 px-5 sm:px-7 py-8 sm:py-9">
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-white/25" />
                          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                            {t('ach_empty_first').toUpperCase()}
                          </div>
                          <div className="h-px flex-1 bg-white/25" />
                        </div>

                        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                          {firstUnlocks.map((a) => (
                            <MiniAchievementCard key={a.title} emoji={a.emoji} title={a.title} subtitle={a.subtitle} />
                          ))}
                        </div>
                      </div>

                      <div className="mt-10 flex items-center justify-center gap-4 sm:gap-6">
                        <SecondaryButton onClick={() => setTab('fitgram')}>{t('ach_empty_view_fitgram').toUpperCase()}</SecondaryButton>
                        <PrimaryButton onClick={() => navigate('/crear-sesion')}>{t('ach_empty_register').toUpperCase()}</PrimaryButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{t('ach_summary_completed')}</div>
                        <div className="mt-2 text-[30px] font-bold text-white/95">{completedCount}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{t('ach_summary_total')}</div>
                        <div className="mt-2 text-[30px] font-bold text-white/95">{myAchievements.length}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{tr(lang, 'Volumen total', 'Total volume')}</div>
                        <div className="mt-2 text-[30px] font-bold text-white/95">{Math.round(achievementMetrics.totalVolume)}kg</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {myAchievements.map((a) => (
                        <AchievementCard
                          key={a.title}
                          emoji={a.emoji}
                          title={a.title}
                          subtitle={a.subtitle}
                          value={a.value}
                          max={a.max}
                          unit={a.unit}
                          unlockedDate={a.unlockedDate}
                          type={a.style?.type}
                          gradient={a.style?.gradient}
                          accent={a.style?.accent}
                          progressLabel={t('ach_progress').toUpperCase()}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {loadingStats ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-[13px] text-white/55">
                    {tr(lang, 'Calculando progreso de FitGram...', 'Calculating FitGram progress...')}
                  </div>
                ) : statsError ? (
                  <div className="rounded-2xl border border-[#ff7849]/25 bg-[#ff7849]/10 p-5 text-[13px] text-white/80">
                    {statsError}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-[10px] uppercase tracking-widest text-white/40">{tr(lang, 'Publicaciones', 'Posts')}</div>
                    <div className="mt-2 text-[30px] font-bold text-white/95">{achievementMetrics.fitgramPosts}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-[10px] uppercase tracking-widest text-white/40">{tr(lang, 'Seguidores', 'Followers')}</div>
                    <div className="mt-2 text-[30px] font-bold text-white/95">{achievementMetrics.followers}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-[10px] uppercase tracking-widest text-white/40">{tr(lang, 'Entrenos guardados', 'Saved workouts')}</div>
                    <div className="mt-2 text-[30px] font-bold text-white/95">{achievementMetrics.copiedWorkouts}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {fitgramAchievements.map((a) => (
                    <AchievementCard
                      key={a.title}
                      emoji={a.emoji}
                      title={a.title}
                      subtitle={a.subtitle}
                      value={a.value}
                      max={a.max}
                      unit={a.unit}
                      type={a.style?.type}
                      gradient={a.style?.gradient}
                      accent={a.style?.accent}
                      progressLabel={t('ach_progress').toUpperCase()}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
