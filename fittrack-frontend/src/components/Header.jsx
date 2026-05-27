import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarDays,
  Home,
  LayoutGrid,
  MessageSquareText,
  Trophy,
  UserRound,
  ChevronDown,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

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
  const [userName, setUserName] = useState('');

  const handleDropdownSelect = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const pathname = location?.pathname || '';
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  useEffect(() => {
    const readUserName = () => {
      try {
        const raw = window.localStorage.getItem('fittrack_user');
        if (!raw) return setUserName('');
        const user = JSON.parse(raw);
        const nameCandidate =
          user?.nombre ||
          user?.apodo ||
          user?.name ||
          (typeof user?.email === 'string' ? user.email.split('@')[0] : '');
        setUserName(String(nameCandidate || '').trim());
      } catch {
        setUserName('');
      }
    };

    readUserName();
    window.addEventListener('storage', readUserName);
    return () => window.removeEventListener('storage', readUserName);
  }, [pathname]);

  return (
    <div className="h-[56px] sm:h-[64px] border-b border-white/10 sticky top-0 z-50 bg-[#1e1e1e]">
      <div className="flex h-full w-full items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="text-[18px] sm:text-[22px] font-bold tracking-wide text-[#ff7849]"
            style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
          >
            FitTrack
          </div>
          {userName ? (
            <div className="hidden sm:block truncate text-[12px] sm:text-[13px] text-white/70">
              {t('welcome')} {userName}
            </div>
          ) : null}
        </div>

        <nav className="hidden items-center gap-1 sm:gap-2 md:flex">
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
          <NavItem active={isActive('/fitia')} icon={MessageSquareText} label={t('nav_ai_chat')} onClick={() => navigate('/fitia')} />
        </nav>

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
  );
}
