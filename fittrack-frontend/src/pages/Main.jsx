import React, { useMemo } from 'react';
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
import { useSearchParams } from 'react-router-dom';
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

function CardTitle({ children }) {
  return (
    <div className="px-4 sm:px-5 pt-4 sm:pt-5">
      <h2 className="text-[13px] sm:text-[15px] md:text-[17px] lg:text-[18px] font-semibold tracking-wide text-white/90" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
        {children}
      </h2>
    </div>
  );
}

function PlusEmpty({ label }) {
  return (
    <div className="flex h-full min-h-[160px] sm:min-h-[200px] md:min-h-[240px] items-center justify-center">
      <button
        type="button"
        className="group inline-flex flex-col items-center gap-3"
        aria-label={label}
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

function ExerciseRow({ name, series, reps }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4">
      <div className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85">{name}</div>
      <div className="mt-1.5 sm:mt-2 md:mt-2.5 flex gap-2 sm:gap-2.5 flex-wrap">
        <span className="rounded-md bg-black/30 px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-[10px] text-white/45">
          {series} SERIES
        </span>
        <span className="rounded-md bg-black/30 px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-[10px] text-white/45">
          {reps} REPS
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
        <div className="ml-auto text-[11px] sm:text-[12px] md:text-[13px] text-white/60 whitespace-nowrap">{likes} me gusta</div>
      </div>
    </div>
  );
}

export default function Main() {
  const [params] = useSearchParams();
  const demo = params.get('demo') === '1';

  const weekly = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Ajustar para que lunes sea 0 (getDay devuelve 0 para domingo)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Calcular el lunes de esta semana
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayIndex);
    
    const days = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateNum = date.getDate();
      
      weekDays.push({
        label: days[i],
        date: dateNum,
        dayIndex: i,
        isToday: i === dayIndex,
        items: demo && i <= dayIndex ? (i === 0 ? ['Rutina Pecho', 'Cardio'] : i === 1 ? ['Rutina Espalda'] : i === 2 ? ['Rutina Pierna'] : i === 3 ? ['Rutina Brazo'] : []) : []
      });
    }
    
    return weekDays;
  }, [demo]);

  const todayExercises = useMemo(() => {
    if (!demo) return [];
    return [
      { name: 'Sentadillas', series: 3, reps: 12 },
      { name: 'Press de Banca', series: 4, reps: 8 },
      { name: 'Peso muerto', series: 3, reps: 15 },
      { name: 'Hip Trust', series: 4, reps: 10 },
    ];
  }, [demo]);

  const achievements = useMemo(() => {
    if (!demo) return [];
    return [
      { icon: Trophy, title: '7 DÍAS', subtitle: 'CONSECUTIVOS', meta: 'Completado el 15/01' },
      { icon: Dumbbell, title: '50', subtitle: 'Entrenamientos', meta: 'Completado el 10/01' },
      { icon: Star, title: 'Primer Mes', subtitle: 'Completo', meta: 'Completado el 31/12' },
      { icon: Flame, title: 'Racha de 30', subtitle: 'Días', meta: 'En progreso 21 / 30' },
    ];
  }, [demo]);

  const fitgram = useMemo(() => {
    if (!demo) return [];
    return [
      { username: 'usuario1', likes: 32 },
      { username: 'usuario2', likes: 18 },
    ];
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
                RESUMEN SEMANAL
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
                          ? d.items.slice(0, 2).map((it) => <Chip key={it}>{it}</Chip>)
                          : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
            <Card className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]">
              <CardTitle>SESIÓN DE HOY</CardTitle>
              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5">
                {!todayExercises.length ? (
                  <PlusEmpty label="Crear sesión de hoy" />
                ) : (
                  <>
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

                    <div className="mt-4 sm:mt-5 md:mt-6 flex justify-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-medium text-white/75 transition hover:border-white/25 hover:text-white/90"
                      >
                        <Plus className="h-4 w-4" />
                        Detalle
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]">
              <CardTitle>LOGROS</CardTitle>
              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5">
                {!achievements.length ? (
                  <PlusEmpty label="Crear logro" />
                ) : (
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {achievements.map((a, i) => (
                      <AchievementRow
                        key={`${a.subtitle}-${i}`}
                        icon={a.icon}
                        title={a.title}
                        subtitle={a.subtitle}
                        meta={a.meta}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right */}
        <Card className="h-auto min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] xl:min-h-[800px] overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
            <h2 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-bold tracking-wide text-white/90" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
              FITGRAM
            </h2>
          </div>

          <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-3 sm:pt-4 md:pt-5 h-full">
            {!fitgram.length ? (
              <div className="flex h-full items-center justify-center min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[600px]">
                <button
                  type="button"
                  className="grid h-11 sm:h-12 w-11 sm:w-12 place-items-center rounded-full border border-white/20 text-white/70 hover:border-white/30 hover:text-white/90 transition"
                  aria-label="Crear publicación"
                >
                  <Plus className="h-5 w-5" />
                </button>
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
      </div>
    </div>
  );
}

