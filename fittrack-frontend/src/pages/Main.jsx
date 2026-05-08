import React, { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  LayoutGrid,
  MessageCircle,
  Plus,
  Trophy,
  Dumbbell,
  Flame,
  Star,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n } from '../i18n/I18nProvider';
import { getDateKey, getSessionForDate, getSessionsForDate } from '../services/sessionStore';

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

function WeeklyWorkoutBadge({ type, onClick }) {
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
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center px-2 py-1 rounded text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/20',
        colorMap[key] || 'bg-white/10 text-white/70'
      )}
      aria-label={`${t('Abrir entrenamiento')}: ${t(normalized)}`}
      title={t('Abrir detalle')}
    >
      {t(normalized)}
    </button>
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

function AchievementRow({ icon: Icon, title, subtitle, meta }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 rounded-lg border border-white/10 bg-white/[0.06] px-3 sm:px-4 md:px-5 py-3 sm:py-4 md:py-5">
      <div className="grid h-10 sm:h-11 md:h-12 w-10 sm:w-11 md:w-12 flex-shrink-0 place-items-center rounded-lg border border-[#ff7849]/70 text-[#ff7849]">
        <Icon className="h-5 sm:h-5 md:h-6 w-5 sm:w-5 md:w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold uppercase tracking-wide text-white/75">{title}</div>
        <div className="mt-0.5 truncate text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/90">{subtitle}</div>
        <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] md:text-[11px] text-white/45 truncate">{meta}</div>
      </div>
    </div>
  );
}

function FitgramPost({ username, likes }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.06]">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 border-b border-white/10 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
        <div className="h-4 sm:h-5 w-4 sm:w-5 rounded-full border-2 border-[#ff7849] opacity-90 flex-shrink-0" />
        <div className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 truncate">@{username}</div>
      </div>

      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#ff7849]/25 via-white/5 to-black/10">
        <div className="absolute inset-0 grid place-items-center">
          <Dumbbell className="h-8 sm:h-9 md:h-10 w-8 sm:w-9 md:w-10 text-white/15" />
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 text-white/55">
        <Heart className="h-4 w-4 flex-shrink-0" />
        <MessageCircle className="h-4 w-4 flex-shrink-0" />
        <div className="ml-auto text-[11px] sm:text-[12px] md:text-[13px] text-white/60 whitespace-nowrap">
          {likes} {t('me gusta')}
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

  useEffect(() => {
    setTodaySession(typeof window === 'undefined' ? null : getSessionForDate(todayKey));
  }, [todayKey]);

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
        items: storedItems.length ? storedItems : demoItems.map((x, idx) => ({ id: `demo_${i}_${idx}`, label: x, session: null })),
      });
    }
    
    return weekDays;
  }, [demo, lang, t]);

  const todayExercises = useMemo(() => {
    if (todaySession?.exercises?.length) {
      return todaySession.exercises
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
  }, [demo, t, todaySession]);

  const achievements = useMemo(() => {
    if (!demo) return [];
    // "Más cercanos de conseguir" (demo): prioriza los que están en progreso.
    return [
      { icon: Flame, title: t('Racha de 30'), subtitle: t('Días'), meta: t('En progreso 21 / 30') },
      { icon: Trophy, title: t('7 DÍAS'), subtitle: t('CONSECUTIVOS'), meta: t('Completado el 15/01') },
      { icon: Dumbbell, title: '50', subtitle: t('Entrenamientos'), meta: t('Completado el 10/01') },
    ];
  }, [demo, t]);

  const basicFittrackAchievements = useMemo(
    () => [
      { icon: Trophy, title: t('7 DÍAS'), subtitle: t('CONSECUTIVOS'), meta: t('Crear sesión de hoy') },
      { icon: Star, title: t('Primer Mes'), subtitle: t('Completo'), meta: t('Logros') },
      { icon: Dumbbell, title: '10', subtitle: t('Entrenamientos'), meta: t('Entrenamientos') },
    ],
    [t]
  );

  const hasUserAchievements = achievements.length > 0;

  const fitgram = useMemo(() => {
    if (demo) {
      return [
        { username: 'usuario1', likes: 32 },
        { username: 'usuario2', likes: 18 },
      ];
    }
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem('fittrack_following');
    const following = raw ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : [];
    return Array.isArray(following) && following.length ? [{ username: following[0], likes: 12 }] : [];
  }, [demo]);

  const isFollowingAnyone = useMemo(() => {
    if (demo) return true;
    if (typeof window === 'undefined') return false;
    const raw = window.localStorage.getItem('fittrack_following');
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }, [demo]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      {/* Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4 md:px-6 lg:px-7 xl:px-8 2xl:px-10 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        {/* Left */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <Card className="p-0">
            <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
              <div className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold tracking-wide text-white/85" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                {t('Resumen semanal').toUpperCase()}
              </div>
            </div>

            <div className="mt-4 sm:mt-5 md:mt-6 overflow-x-auto px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                {weekly.map((d) => {
                  return (
                    <div
                      key={`${d.label}-${d.date}`}
                      className={cx(
                        'flex flex-col rounded-lg sm:rounded-xl border bg-white/[0.04] p-2 sm:p-3 transition-all flex-shrink-0',
                        'w-[85px] h-[105px] sm:w-[100px] sm:h-[120px] md:w-[110px] md:h-[130px] lg:w-[120px] lg:h-[140px]',
                        d.isToday ? 'border-white/70 bg-white/[0.08]' : 'border-white/10'
                      )}
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
                                  onClick={() => navigate(`/sessiondetail/${it.session.id}`, { state: { workout: it.session } })}
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
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
            <Card className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]">
              <CardTitle>{t('Sesión de hoy').toUpperCase()}</CardTitle>
              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5">
                {!todayExercises.length ? (
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
                        onClick={() => (todaySession ? setSessionActionOpen(true) : navigate(`/crear-sesion?date=${todayKey}`))}
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
                    {(hasUserAchievements ? achievements : basicFittrackAchievements).map((a, i) => (
                      <AchievementRow
                        key={`${a.subtitle}-${i}`}
                        icon={a.icon}
                        title={a.title}
                        subtitle={a.subtitle}
                        meta={a.meta}
                      />
                    ))}
                  </div>
                </div>
              </button>
            </Card>
          </div>
        </div>

        {/* Right */}
        <button type="button" onClick={() => navigate('/fitgram')} className="w-full text-left">
          <Card className="h-auto min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] xl:min-h-[800px] overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
              <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-bold tracking-wide text-white/90" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                {t('FitGram').toUpperCase()}
              </h2>
            </div>

            <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5 h-full">
              {!isFollowingAnyone ? (
                <div className="flex h-full items-center justify-center min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[600px]">
                  <div className="max-w-[360px] text-center text-white/60 text-[12px] sm:text-[13px]">
                    {lang === 'en'
                      ? "You're not following anyone yet. Take your first steps in FitGram."
                      : 'Todavía no sigues a nadie. Da tus primeros pasos en FitGram.'}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-180px)] overflow-auto pr-1.5 md:pr-2">
                  {fitgram.map((p) => (
                    <FitgramPost key={p.username} username={p.username} likes={p.likes} />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </button>
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
                  if (todaySession) navigate(`/sessiondetail/${todaySession.id}`, { state: { workout: todaySession } });
                }}
                disabled={!todaySession}
                className={cx(
                  'w-full rounded-xl border px-4 py-3 text-left transition',
                  todaySession ? 'border-white/15 bg-white/[0.03] hover:bg-white/[0.06] text-white/85' : 'border-white/10 bg-white/[0.02] text-white/35 cursor-not-allowed'
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
