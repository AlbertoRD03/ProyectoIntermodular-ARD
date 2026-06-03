import React, { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Dumbbell, Flame, Send, Target, Timer, Trophy, UserPlus, X } from 'lucide-react';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { createChallenge, listChallenges, updateChallengeStatus } from '../services/challengeApi';
import { listFollowing } from '../services/socialApi';
import { listSessionHistory } from '../services/sessionsApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
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

function Card({ children, className }) {
  return (
    <section className={cx('rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_24px_70px_-55px_rgba(0,0,0,0.95)]', className)}>
      {children}
    </section>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-11 rounded-xl border px-4 text-[11px] font-bold uppercase tracking-wide transition',
        active ? 'border-[#ff7849] bg-[#ff7849] text-white' : 'border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.07] hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cx('h-11 w-full rounded-xl border border-white/15 bg-[#1e1e1e] px-4 text-[12px] font-semibold text-white/85 placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/60 focus:ring-2 focus:ring-[#ff7849]/15', className)}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-xl border border-white/15 bg-[#1e1e1e] px-4 text-[12px] font-semibold text-white/85 outline-none transition focus:border-[#ff7849]/60 focus:ring-2 focus:ring-[#ff7849]/15"
    >
      {children}
    </select>
  );
}

function getSessionDate(session) {
  const date = new Date(session?.fecha || session?.date || session?.createdAt || Date.now());
  return Number.isNaN(date.getTime()) ? null : date;
}

function getExercises(session) {
  return Array.isArray(session?.ejercicios_realizados) ? session.ejercicios_realizados : [];
}

function getSessionStats(session) {
  return getExercises(session).reduce((acc, exercise) => {
    const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
    sets.forEach((set) => {
      const reps = Number(set?.reps || 0);
      const weight = Number(set?.peso || 0);
      if (!Number.isFinite(reps) || !Number.isFinite(weight)) return;
      acc.volume += reps * weight;
      acc.maxWeight = Math.max(acc.maxWeight, weight);
    });
    return acc;
  }, { volume: 0, maxWeight: 0 });
}

function calculateChallengeProgress(challenge, sessions) {
  const createdAt = new Date(challenge?.acceptedAt || challenge?.createdAt || Date.now());
  const relevantSessions = sessions.filter((session) => {
    const date = getSessionDate(session);
    return date && date >= createdAt;
  });

  if (challenge.type === 'sessions') return relevantSessions.length;
  if (challenge.type === 'duration') {
    return relevantSessions.reduce((sum, session) => sum + (Number(session?.duracion_minutos || 0) || 0), 0);
  }
  if (challenge.type === 'exercise_max') {
    const needle = String(challenge.exerciseName || '').trim().toLowerCase();
    return relevantSessions.reduce((max, session) => {
      const exerciseMax = getExercises(session)
        .filter((exercise) => String(exercise?.nombre_ejercicio || '').toLowerCase().includes(needle))
        .reduce((exerciseAcc, exercise) => {
          const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
          return Math.max(exerciseAcc, ...sets.map((set) => Number(set?.peso || 0)).filter(Number.isFinite));
        }, 0);
      return Math.max(max, exerciseMax);
    }, 0);
  }
  return relevantSessions.reduce((sum, session) => sum + getSessionStats(session).volume, 0);
}

function ChallengeIcon({ type }) {
  const map = {
    volume: Dumbbell,
    sessions: Flame,
    duration: Timer,
    exercise_max: Target,
  };
  const Icon = map[type] || Trophy;
  return <Icon className="h-5 w-5" />;
}

function StatusBadge({ status, lang }) {
  const labels = {
    pending: tr(lang, 'Pendiente', 'Pending'),
    accepted: tr(lang, 'Aceptado', 'Accepted'),
    declined: tr(lang, 'Rechazado', 'Declined'),
    completed: tr(lang, 'Completado', 'Completed'),
  };
  return (
    <span className={cx(
      'rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest',
      status === 'accepted' ? 'border-blue-300/30 bg-blue-400/10 text-blue-200' :
        status === 'completed' ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' :
          status === 'declined' ? 'border-red-300/30 bg-red-400/10 text-red-200' :
            'border-[#ff7849]/35 bg-[#ff7849]/10 text-[#ff7849]'
    )}>
      {labels[status] || status}
    </span>
  );
}

function ChallengeCard({ challenge, currentUserId, sessions, onStatus, lang }) {
  const isReceiver = String(challenge.targetId) === String(currentUserId);
  const opponent = isReceiver ? challenge.creator : challenge.target;
  const progress = calculateChallengeProgress(challenge, sessions);
  const target = Math.max(1, Number(challenge.targetValue || 1));
  const percent = Math.min(100, Math.round((progress / target) * 100));
  const unit = challenge.unit ? ` ${challenge.unit}` : '';
  const canComplete = challenge.status === 'accepted' && isReceiver && progress >= target;

  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#ff7849]/35 bg-[#ff7849]/10 text-[#ff7849]">
            <ChallengeIcon type={challenge.type} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={challenge.status} lang={lang} />
              <span className="text-[10px] uppercase tracking-widest text-white/35">
                {isReceiver ? tr(lang, 'Recibido', 'Received') : tr(lang, 'Enviado', 'Sent')}
              </span>
            </div>
            <h3 className="mt-2 truncate text-[16px] font-bold uppercase tracking-wide text-white/95">{challenge.title}</h3>
            <p className="mt-1 line-clamp-2 text-[12px] text-white/50">{challenge.description || tr(lang, 'Reto de FitTrack', 'FitTrack challenge')}</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-widest text-white/35">{isReceiver ? tr(lang, 'Te reta', 'From') : tr(lang, 'Retado', 'Target')}</div>
          <div className="mt-1 text-[12px] font-bold text-white/80">@{opponent?.apodo || opponent?.nombre || 'usuario'}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40">
          <span>{tr(lang, 'Progreso', 'Progress')}</span>
          <span className="font-semibold text-white/75">{Math.round(progress)}/{target}{unit}</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-black/25">
          <div className="h-full rounded-full bg-[#ff7849]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-white/40">
          {challenge.deadline ? `${tr(lang, 'Fecha límite', 'Deadline')}: ${new Date(challenge.deadline).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES')}` : tr(lang, 'Sin fecha límite', 'No deadline')}
        </div>
        <div className="flex items-center gap-2">
          {challenge.status === 'pending' && isReceiver ? (
            <>
              <button type="button" onClick={() => onStatus(challenge.id, 'declined')} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/70 hover:bg-white/[0.08]">
                <X className="h-4 w-4" />
                {tr(lang, 'Rechazar', 'Decline')}
              </button>
              <button type="button" onClick={() => onStatus(challenge.id, 'accepted')} className="inline-flex items-center gap-2 rounded-lg border border-[#ff7849]/45 bg-[#ff7849]/10 px-3 py-2 text-[11px] font-bold text-[#ff7849] hover:bg-[#ff7849]/20">
                <Check className="h-4 w-4" />
                {tr(lang, 'Aceptar', 'Accept')}
              </button>
            </>
          ) : null}
          {canComplete ? (
            <button type="button" onClick={() => onStatus(challenge.id, 'completed')} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold text-emerald-200 hover:bg-emerald-400/20">
              <Trophy className="h-4 w-4" />
              {tr(lang, 'Completar', 'Complete')}
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function Challenges() {
  const { lang } = useI18n();
  const currentUser = useMemo(readCurrentUser, []);
  const currentUserId = currentUser?.id || currentUser?._id || '';
  const [tab, setTab] = useState('active');
  const [challenges, setChallenges] = useState([]);
  const [following, setFollowing] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'volume',
    targetValue: '5000',
    unit: 'kg',
    exerciseName: '',
    deadline: '',
    targetId: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [challengeData, sessionData, followingData] = await Promise.all([
      listChallenges().catch(() => ({ challenges: [] })),
      listSessionHistory().catch(() => ({ items: [] })),
      currentUserId ? listFollowing(currentUserId).catch(() => ({ users: [] })) : Promise.resolve({ users: [] }),
    ]);
    setChallenges(Array.isArray(challengeData?.challenges) ? challengeData.challenges : []);
    setSessions(Array.isArray(sessionData?.items) ? sessionData.items : []);
    const users = Array.isArray(followingData?.users) ? followingData.users : [];
    setFollowing(users);
    setForm((prev) => ({ ...prev, targetId: prev.targetId || users[0]?.id || '' }));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const active = challenges.filter((challenge) => challenge.status === 'accepted').length;
    const pending = challenges.filter((challenge) => challenge.status === 'pending' && String(challenge.targetId) === String(currentUserId)).length;
    const completed = challenges.filter((challenge) => challenge.status === 'completed').length;
    return { active, pending, completed };
  }, [challenges, currentUserId]);

  const visibleChallenges = useMemo(() => {
    if (tab === 'requests') return challenges.filter((challenge) => challenge.status === 'pending' && String(challenge.targetId) === String(currentUserId));
    if (tab === 'sent') return challenges.filter((challenge) => String(challenge.creatorId) === String(currentUserId));
    if (tab === 'completed') return challenges.filter((challenge) => challenge.status === 'completed');
    return challenges.filter((challenge) => ['accepted', 'pending'].includes(challenge.status));
  }, [challenges, currentUserId, tab]);

  const setType = (type) => {
    const unitMap = { volume: 'kg', sessions: 'sesiones', duration: 'min', exercise_max: 'kg' };
    const targetMap = { volume: '5000', sessions: '5', duration: '180', exercise_max: '100' };
    setForm((prev) => ({ ...prev, type, unit: unitMap[type], targetValue: targetMap[type] }));
  };

  const handleCreate = async () => {
    if (!form.targetId || !form.title.trim()) {
      setMessage(tr(lang, 'Selecciona un amigo y escribe un título.', 'Select a friend and write a title.'));
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await createChallenge({
        ...form,
        title: form.title.trim(),
        targetValue: Number(form.targetValue),
        deadline: form.deadline || undefined,
      });
      setForm((prev) => ({ ...prev, title: '', description: '', exerciseName: '', deadline: '' }));
      setTab('sent');
      await loadData();
      setMessage(tr(lang, 'Reto enviado correctamente.', 'Challenge sent successfully.'));
    } catch (error) {
      setMessage(error?.message || tr(lang, 'No se pudo crear el reto.', 'Could not create challenge.'));
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (challengeId, status) => {
    await updateChallengeStatus(challengeId, status).catch((error) => setMessage(error?.message || tr(lang, 'No se pudo actualizar el reto.', 'Could not update challenge.')));
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />
      <main className="w-full px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1300px] space-y-5 sm:space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-[#ff7849]">FitTrack Challenges</div>
              <h1 className="mt-2 text-[28px] sm:text-[34px] font-bold uppercase tracking-wide text-white/95">
                {tr(lang, 'Retos', 'Challenges')}
              </h1>
              <p className="mt-2 max-w-[780px] text-[13px] sm:text-[14px] text-white/50">
                {tr(lang, 'Crea objetivos competitivos, reta a tus amigos de FitGram y sigue el progreso automáticamente con tus sesiones.', 'Create competitive goals, challenge your FitGram friends, and track progress automatically from your sessions.')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:min-w-[460px]">
              <Card className="p-4"><div className="text-[10px] uppercase tracking-widest text-white/40">Activos</div><div className="mt-2 text-[26px] font-bold">{stats.active}</div></Card>
              <Card className="p-4"><div className="text-[10px] uppercase tracking-widest text-white/40">Solicitudes</div><div className="mt-2 text-[26px] font-bold">{stats.pending}</div></Card>
              <Card className="p-4"><div className="text-[10px] uppercase tracking-widest text-white/40">Completados</div><div className="mt-2 text-[26px] font-bold">{stats.completed}</div></Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#ff7849]/35 bg-[#ff7849]/10 text-[#ff7849]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold uppercase text-white/95">{tr(lang, 'Crear reto', 'Create challenge')}</h2>
                  <p className="text-[11px] text-white/45">{tr(lang, 'Solo puedes retar a usuarios que sigues.', 'You can only challenge users you follow.')}</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <Field label={tr(lang, 'Amigo', 'Friend')}>
                  <Select value={form.targetId} onChange={(e) => setForm((prev) => ({ ...prev, targetId: e.target.value }))}>
                    {following.length ? following.map((user) => (
                      <option key={user.id} value={user.id}>@{user.apodo || user.nombre || 'usuario'}</option>
                    )) : <option value="">{tr(lang, 'No sigues a nadie todavía', 'You do not follow anyone yet')}</option>}
                  </Select>
                </Field>

                <Field label={tr(lang, 'Título', 'Title')}>
                  <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder={tr(lang, 'Ej: 5.000 kg esta semana', 'e.g. 5,000 kg this week')} />
                </Field>

                <Field label={tr(lang, 'Tipo de reto', 'Challenge type')}>
                  <Select value={form.type} onChange={(e) => setType(e.target.value)}>
                    <option value="volume">{tr(lang, 'Volumen total', 'Total volume')}</option>
                    <option value="sessions">{tr(lang, 'Sesiones completadas', 'Completed sessions')}</option>
                    <option value="duration">{tr(lang, 'Minutos entrenados', 'Training minutes')}</option>
                    <option value="exercise_max">{tr(lang, 'Peso máximo en ejercicio', 'Max weight in exercise')}</option>
                  </Select>
                </Field>

                {form.type === 'exercise_max' ? (
                  <Field label={tr(lang, 'Ejercicio', 'Exercise')}>
                    <Input value={form.exerciseName} onChange={(e) => setForm((prev) => ({ ...prev, exerciseName: e.target.value }))} placeholder={tr(lang, 'Press banca, sentadilla...', 'Bench press, squat...')} />
                  </Field>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <Field label={tr(lang, 'Meta', 'Target')}>
                    <Input value={form.targetValue} onChange={(e) => setForm((prev) => ({ ...prev, targetValue: e.target.value }))} inputMode="numeric" />
                  </Field>
                  <Field label={tr(lang, 'Unidad', 'Unit')}>
                    <Input value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
                  </Field>
                </div>

                <Field label={tr(lang, 'Fecha límite', 'Deadline')}>
                  <Input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} />
                </Field>

                <Field label={tr(lang, 'Mensaje', 'Message')}>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/15 bg-[#1e1e1e] px-4 py-3 text-[12px] font-semibold text-white/85 placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/60 focus:ring-2 focus:ring-[#ff7849]/15"
                    placeholder={tr(lang, 'Añade una motivación para tu amigo...', 'Add motivation for your friend...')}
                  />
                </Field>

                {message ? <div className="rounded-xl border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-[12px] text-white/85">{message}</div> : null}

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving || !following.length}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ff7849]/55 bg-[#ff7849] px-4 text-[12px] font-bold uppercase tracking-wide text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {saving ? tr(lang, 'Enviando...', 'Sending...') : tr(lang, 'Enviar reto', 'Send challenge')}
                </button>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <TabButton active={tab === 'active'} onClick={() => setTab('active')}>{tr(lang, 'Activos', 'Active')}</TabButton>
                <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>{tr(lang, 'Solicitudes', 'Requests')}</TabButton>
                <TabButton active={tab === 'sent'} onClick={() => setTab('sent')}>{tr(lang, 'Enviados', 'Sent')}</TabButton>
                <TabButton active={tab === 'completed'} onClick={() => setTab('completed')}>{tr(lang, 'Completados', 'Completed')}</TabButton>
              </div>

              {loading ? (
                <Card className="p-8 text-center text-[13px] text-white/55">{tr(lang, 'Cargando retos...', 'Loading challenges...')}</Card>
              ) : visibleChallenges.length ? (
                <div className="grid grid-cols-1 gap-4">
                  {visibleChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={currentUserId}
                      sessions={sessions}
                      onStatus={handleStatus}
                      lang={lang}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Clock className="mx-auto h-8 w-8 text-white/25" />
                  <div className="mt-3 text-[14px] font-bold uppercase text-white/80">{tr(lang, 'Sin retos en esta sección', 'No challenges in this section')}</div>
                  <div className="mt-1 text-[12px] text-white/45">{tr(lang, 'Crea uno nuevo o acepta una solicitud para empezar a competir.', 'Create one or accept a request to start competing.')}</div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
