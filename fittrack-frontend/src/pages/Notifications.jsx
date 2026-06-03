import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarCheck, CheckCheck, Dumbbell, MessageCircle, UserPlus, Weight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationApi';
import { useI18n, tr } from '../i18n/I18nProvider';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const TYPE_META = {
  new_follower: { icon: UserPlus, tone: 'text-sky-200', label: 'Social' },
  post_comment: { icon: MessageCircle, tone: 'text-[#ff7849]', label: 'FitGram' },
  workout_copied: { icon: Dumbbell, tone: 'text-emerald-200', label: 'Entrenos' },
  planner_reminder: { icon: CalendarCheck, tone: 'text-purple-200', label: 'Planificador' },
  physical_data_reminder: { icon: Weight, tone: 'text-amber-200', label: 'Perfil físico' },
  system: { icon: Bell, tone: 'text-white/70', label: 'Sistema' },
};

function formatRelative(value, lang) {
  const timestamp = new Date(value || Date.now()).getTime();
  if (!Number.isFinite(timestamp)) return '';
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return tr(lang, 'Ahora', 'Now');
  if (minutes < 60) return tr(lang, `Hace ${minutes} min`, `${minutes} min ago`);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return tr(lang, `Hace ${hours} h`, `${hours} h ago`);
  const days = Math.floor(hours / 24);
  return tr(lang, `Hace ${days} d`, `${days} d ago`);
}

function NotificationCard({ item, onOpen }) {
  const { lang } = useI18n();
  const meta = TYPE_META[item.type] || TYPE_META.system;
  const Icon = meta.icon;
  const actorName = item.actor?.apodo || item.actor?.nombre || '';
  const unread = !item.readAt;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cx(
        'w-full rounded-xl border p-4 text-left transition',
        unread
          ? 'border-[#ff7849]/35 bg-[#ff7849]/10 hover:bg-[#ff7849]/15'
          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] flex items-center justify-center">
          {item.actor?.photo_url ? (
            <img src={item.actor.photo_url} alt={actorName || item.title} className="h-full w-full object-cover" />
          ) : (
            <Icon className={cx('h-5 w-5', meta.tone)} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{meta.label}</span>
            {unread ? <span className="h-2 w-2 rounded-full bg-[#ff7849]" /> : null}
            <span className="text-[11px] text-white/35">{formatRelative(item.createdAt, lang)}</span>
          </div>
          <div className="mt-1 text-[14px] font-bold text-white/90">{item.title}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-white/65">{item.message}</div>
        </div>
      </div>
    </button>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(() => [
    { key: 'all', label: tr(lang, 'Todas', 'All') },
    { key: 'social', label: 'Social' },
    { key: 'training', label: tr(lang, 'Entrenos', 'Training') },
    { key: 'planner', label: tr(lang, 'Planificador', 'Planner') },
    { key: 'profile', label: tr(lang, 'Perfil físico', 'Physical profile') },
  ], [lang]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await listNotifications({ limit: 80 });
        if (!alive) return;
        setItems((data?.items || []).filter((item) => item.type !== 'challenge_request'));
        setUnreadCount(Number(data?.unreadCount || 0));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || tr(lang, 'No se pudieron cargar las notificaciones.', 'Could not load notifications.'));
        setItems([]);
        setUnreadCount(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang]);

  const visibleItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    if (activeFilter === 'social') return items.filter((item) => ['new_follower', 'post_comment'].includes(item.type));
    if (activeFilter === 'training') return items.filter((item) => item.type === 'workout_copied');
    if (activeFilter === 'planner') return items.filter((item) => item.type === 'planner_reminder');
    if (activeFilter === 'profile') return items.filter((item) => item.type === 'physical_data_reminder');
    return items;
  }, [activeFilter, items]);

  const handleOpenNotification = async (item) => {
    if (!item.readAt) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationRead(item.id).catch(() => {});
    }
    if (item.link) navigate(item.link);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // optimistic UI is enough; next refresh will reconcile.
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold uppercase tracking-wide text-white/95">
                {tr(lang, 'Notificaciones', 'Notifications')}
              </h1>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-[#ff7849] px-2 py-0.5 text-[11px] font-bold text-white">{unreadCount}</span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] text-white/45">
              {tr(lang, 'Actividad social, entrenos guardados y avisos de tu perfil.', 'Social activity, saved workouts and profile reminders.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={!unreadCount}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2 text-[12px] font-semibold text-white/75 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              {tr(lang, 'Marcar todo leído', 'Mark all read')}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.03] text-white/70 transition hover:bg-white/[0.08]"
              aria-label={tr(lang, 'Cerrar', 'Close')}
              title={tr(lang, 'Cerrar', 'Close')}
            >
              <X className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" data-tour="notifications-filters">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={cx(
                'rounded-lg border px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition',
                activeFilter === filter.key
                  ? 'border-[#ff7849] bg-[#ff7849] text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white/85'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <section className="mt-5 space-y-3" data-tour="notifications-list">
          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-[13px] text-white/55">
              {tr(lang, 'Cargando notificaciones...', 'Loading notifications...')}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#ff7849]/25 bg-[#ff7849]/10 p-5 text-[13px] text-white/80">{error}</div>
          ) : visibleItems.length ? (
            visibleItems.map((item) => (
              <NotificationCard key={item.id} item={item} onOpen={handleOpenNotification} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-white/35" />
              <div className="mt-3 text-[14px] font-bold uppercase tracking-wide text-white/75">
                {tr(lang, 'Sin notificaciones', 'No notifications')}
              </div>
              <div className="mt-1 text-[12px] text-white/45">
                {tr(lang, 'Cuando haya actividad importante aparecerá aquí.', 'Important activity will appear here.')}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
