import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarDays,
  Home,
  LayoutGrid,
  BarChart3,
  Target,
  Trophy,
  UserRound,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { listNotifications } from '../services/notificationApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function NavItem({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'group inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-lg px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] md:text-[13px] font-medium transition',
        active ? 'text-[#ff7849]' : 'text-white/65 hover:text-white/90'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={cx('h-4 w-4 flex-shrink-0', active ? 'text-[#ff7849]' : 'text-white/55 group-hover:text-white/80')} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function NavDropdown({ icon: Icon, label, isOpen, onToggle, onSelect, itemCalendarLabel, itemWorkoutsLabel }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className={cx(
          'group inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 rounded-lg px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[12px] md:text-[13px] font-medium transition',
          isOpen ? 'text-[#ff7849]' : 'text-white/65 hover:text-white/90'
        )}
      >
        <Icon className={cx('h-4 w-4 flex-shrink-0', isOpen ? 'text-[#ff7849]' : 'text-white/55 group-hover:text-white/80')} />
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown className={cx('h-3 w-3 transition-transform', isOpen ? 'rotate-180' : '')} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-lg z-50">
          <button
            type="button"
            onClick={() => onSelect('/calendario')}
            className="block w-full px-4 py-2 text-left text-[12px] text-white/80 hover:bg-white/10 rounded-lg first:rounded-t-lg last:rounded-b-lg transition"
          >
            {itemCalendarLabel}
          </button>
          <button
            type="button"
            onClick={() => onSelect('/entrenamientos')}
            className="block w-full px-4 py-2 text-left text-[12px] text-white/80 hover:bg-white/10 rounded-lg first:rounded-t-lg last:rounded-b-lg transition"
          >
            {itemWorkoutsLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userNickname, setUserNickname] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleDropdownSelect = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const pathname = location?.pathname || '';
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  useEffect(() => {
    const readUserNickname = () => {
      try {
        const raw = window.localStorage.getItem('fittrack_user');
        if (!raw) return setUserNickname('');
        const user = JSON.parse(raw);
        const nicknameCandidate =
          user?.apodo ||
          user?.nickname ||
          user?.nombre ||
          user?.name ||
          (typeof user?.email === 'string' ? user.email.split('@')[0] : '');
        setUserNickname(String(nicknameCandidate || '').trim());
      } catch {
        setUserNickname('');
      }
    };

    readUserNickname();
    window.addEventListener('storage', readUserNickname);
    return () => window.removeEventListener('storage', readUserNickname);
  }, [pathname]);

  useEffect(() => {
    let alive = true;
    const loadUnreadCount = async () => {
      try {
        const data = await listNotifications({ limit: 1, unread: true });
        if (alive) setUnreadNotifications(Number(data?.unreadCount || 0));
      } catch {
        if (alive) setUnreadNotifications(0);
      }
    };

    loadUnreadCount();
    return () => {
      alive = false;
    };
  }, [pathname]);

  return (
    <div className="h-[56px] sm:h-[64px] border-b border-white/10 sticky top-0 z-50 bg-[#1e1e1e]">
      <div className="grid h-full w-full items-center gap-2 px-3 sm:px-4 md:px-6 lg:px-8 grid-cols-[auto,1fr,auto] md:grid-cols-[auto,1fr,auto,1fr,auto]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-[18px] sm:text-[22px] font-bold tracking-wide text-[#ff7849] transition hover:text-[#ff8d66]"
            style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
            aria-label={t('nav_home')}
            title={t('nav_home')}
          >
            FitTrack
          </button>
        </div>

        {userNickname ? (
          <div className="min-w-0 justify-self-center pointer-events-none">
            <div className="max-w-[38vw] md:max-w-[22vw] truncate text-[12px] sm:text-[13px] text-white/70">
              {t('welcome')}{' '}
              <span className="font-semibold text-white/85">{userNickname}</span>
            </div>
          </div>
        ) : null}

        <nav className="hidden items-center gap-1 sm:gap-2 md:flex justify-self-center">
          <NavItem active={isActive('/dashboard')} icon={Home} label={t('nav_home')} onClick={() => navigate('/dashboard')} />
          <NavDropdown
            icon={CalendarDays}
            label={t('nav_calendar')}
            isOpen={isDropdownOpen}
            onToggle={setIsDropdownOpen}
            onSelect={handleDropdownSelect}
            itemCalendarLabel={t('nav_calendar_calendar')}
            itemWorkoutsLabel={t('nav_calendar_workouts')}
          />
          <NavItem active={isActive('/fitgram')} icon={LayoutGrid} label={t('nav_fitgram')} onClick={() => navigate('/fitgram')} />
          <NavItem active={isActive('/logros')} icon={Trophy} label={t('nav_achievements')} onClick={() => navigate('/logros')} />
          <NavItem active={isActive('/retos')} icon={Target} label={t('nav_challenges')} onClick={() => navigate('/retos')} />
          <NavItem active={isActive('/estadisticas')} icon={BarChart3} label={t('nav_stats')} onClick={() => navigate('/estadisticas')} />
        </nav>

        <div className="hidden md:block" />

        <div className="justify-self-end flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/notificaciones')}
            className={cx(
              'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]',
              isActive('/notificaciones') ? 'text-[#ff7849]' : 'text-white/80'
            )}
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#ff7849] px-1 text-[9px] font-bold leading-4 text-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-medium text-white/90 transition hover:bg-white/15"
          >
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav_profile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
