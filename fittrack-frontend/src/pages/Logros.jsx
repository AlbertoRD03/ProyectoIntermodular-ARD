import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

function ProgressBar({ value, max }) {
  const safeMax = Number(max) || 0;
  const safeValue = Math.max(0, Number(value) || 0);
  const percent = safeMax > 0 ? Math.min(100, (safeValue / safeMax) * 100) : 0;

  return (
    <div className="h-[8px] w-full border border-white/35 bg-transparent">
      <div className="h-full bg-white/90" style={{ width: `${percent}%` }} />
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
  highlight,
  progressLabel = 'PROGRESO',
}) {
  const hasDate = Boolean(unlockedDate);
  const rightLabel = hasDate ? unlockedDate : unit ? `${value}/${max}${unit}` : `${value}/${max}`;

  return (
    <section
      className={cx(
        'rounded-xl border px-6 sm:px-8 py-7 sm:py-9 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]',
        highlight ? 'bg-[#c9f7a9] border-black/80' : 'bg-white/[0.02] border-white/35'
      )}
    >
      <div
        className={cx(
          'mx-auto grid h-[64px] w-[96px] place-items-center border bg-black/10',
          highlight ? 'border-black/60' : 'border-white/55'
        )}
      >
        <span className="text-[28px] leading-none">{emoji}</span>
      </div>

      <div className="mt-6 sm:mt-7 text-center">
        <div
          className={cx(
            'text-[15px] sm:text-[16px] font-bold tracking-wide',
            highlight ? 'text-black' : 'text-white/95'
          )}
          style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
        >
          {title.toUpperCase()}
        </div>
        <div className={cx('mt-2 text-[12px] sm:text-[13px]', highlight ? 'text-black/70' : 'text-white/45')}>
          {subtitle}
        </div>
      </div>

      <div className={cx('mt-6 border-t', highlight ? 'border-black/25' : 'border-white/15')} />

      <div className="mt-4">
        <div
          className={cx(
            'flex items-center justify-between text-[10px] sm:text-[11px] tracking-wide',
            highlight ? 'text-black/70' : 'text-white/45'
          )}
        >
          <span>{progressLabel}</span>
          <span className={cx('font-semibold', highlight ? 'text-black' : 'text-white/80')}>{rightLabel}</span>
        </div>
        <div className="mt-2">
          <div className={cx(highlight ? 'opacity-90' : '')}>
            <ProgressBar value={hasDate ? max : value} max={max} />
          </div>
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

  const fitgramAchievements = useMemo(() => {
    // Mock UI based on `views/Logros.png`
    return [
      {
        emoji: '🥇',
        title: tr(lang, 'Primer Paso', 'First Step'),
        subtitle: tr(lang, 'Completa tu primera sesión de entrenamiento', 'Complete your first workout session'),
        value: 0,
        max: 1,
        unit: '',
      },
      {
        emoji: '🔥',
        title: tr(lang, 'Racha Semanal', 'Weekly Streak'),
        subtitle: tr(lang, 'Entrena 7 días consecutivos sin fallar', 'Train 7 days in a row without missing'),
        value: 0,
        max: 7,
        unit: '',
      },
      {
        emoji: '💪',
        title: tr(lang, 'Fuerza Bruta', 'Raw Strength'),
        subtitle: tr(lang, 'Levanta un total de 100kg en una sesión', 'Lift a total of 100kg in one session'),
        value: 0,
        max: 100,
        unit: 'kg',
      },
      {
        emoji: '⭐',
        title: tr(lang, 'Dedicación', 'Dedication'),
        subtitle: tr(lang, 'Completa 10 sesiones de entrenamiento', 'Complete 10 workout sessions'),
        value: 0,
        max: 10,
        unit: '',
      },
      {
        emoji: '❤️',
        title: tr(lang, 'Cardio Warrior', 'Cardio Warrior'),
        subtitle: tr(lang, 'Completa 30 minutos de cardio en una sesión', 'Complete 30 minutes of cardio in one session'),
        value: 0,
        max: 30,
        unit: 'min',
      },
      {
        emoji: '🎯',
        title: tr(lang, 'Versátil', 'Versatile'),
        subtitle: tr(lang, 'Practica 3 tipos diferentes de entrenamiento', 'Do 3 different types of training'),
        value: 0,
        max: 3,
        unit: '',
      },
      {
        emoji: '🌅',
        title: tr(lang, 'Madrugador', 'Early Bird'),
        subtitle: tr(lang, 'Entrena antes de las 7:00 AM cinco veces', 'Train before 7:00 AM five times'),
        value: 0,
        max: 5,
        unit: '',
      },
      {
        emoji: '🏆',
        title: tr(lang, 'Mes Completo', 'Full Month'),
        subtitle: tr(lang, 'Entrena 30 días consecutivos sin fallar', 'Train 30 days in a row without missing'),
        value: 0,
        max: 30,
        unit: '',
      },
      {
        emoji: '👥',
        title: tr(lang, 'Social', 'Social'),
        subtitle: tr(lang, 'Sigue a 10 usuarios en FitGram', 'Follow 10 users on FitGram'),
        value: 0,
        max: 10,
        unit: '',
      },
    ];
  }, [lang]);

  const myAchievements = useMemo(() => {
    // Mock UI based on `views/Mis Logros.png`
    if (demoEmpty) return [];
    return [
      {
        emoji: '🥇',
        title: tr(lang, 'Primer Paso', 'First Step'),
        subtitle: tr(lang, 'Completa tu primera sesión de entrenamiento', 'Complete your first workout session'),
        value: 1,
        max: 1,
        unit: '',
        unlockedDate: '15/01/2026',
        highlight: true,
      },
      {
        emoji: '🔥',
        title: tr(lang, 'Racha Semanal', 'Weekly Streak'),
        subtitle: tr(lang, 'Entrena 7 días consecutivos sin fallar', 'Train 7 days in a row without missing'),
        value: 1,
        max: 7,
        unit: '',
      },
      {
        emoji: '💪',
        title: tr(lang, 'Fuerza Bruta', 'Raw Strength'),
        subtitle: tr(lang, 'Levanta un total de 100kg en una sesión', 'Lift a total of 100kg in one session'),
        value: 30,
        max: 100,
        unit: 'kg',
      },
      {
        emoji: '⭐',
        title: tr(lang, 'Dedicación', 'Dedication'),
        subtitle: tr(lang, 'Completa 10 sesiones de entrenamiento', 'Complete 10 workout sessions'),
        value: 1,
        max: 10,
        unit: '',
      },
      {
        emoji: '❤️',
        title: tr(lang, 'Cardio Warrior', 'Cardio Warrior'),
        subtitle: tr(lang, 'Completa 30 minutos de cardio en una sesión', 'Complete 30 minutes of cardio in one session'),
        value: 13,
        max: 30,
        unit: 'min',
      },
      {
        emoji: '🎯',
        title: tr(lang, 'Versátil', 'Versatile'),
        subtitle: tr(lang, 'Practica 3 tipos diferentes de entrenamiento', 'Do 3 different types of training'),
        value: 0,
        max: 3,
        unit: '',
      },
    ];
  }, [demoEmpty, lang]);

  const completedCount = useMemo(
    () => myAchievements.filter((a) => a.unlockedDate).length,
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
                {completedCount === 0 ? (
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
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:gap-7 lg:grid-cols-3">
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
                        highlight={a.highlight}
                        progressLabel={t('ach_progress').toUpperCase()}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:gap-7 lg:grid-cols-3">
                {fitgramAchievements.map((a) => (
                  <AchievementCard
                    key={a.title}
                    emoji={a.emoji}
                    title={a.title}
                    subtitle={a.subtitle}
                    value={a.value}
                    max={a.max}
                    unit={a.unit}
                    progressLabel={t('ach_progress').toUpperCase()}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
