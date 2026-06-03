import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n, tr } from '../i18n/I18nProvider';
import { getAuthToken } from '../services/authToken';

const STORAGE_KEY = 'fittrack_guided_tours_v2';

const TOUR_DEFINITIONS = {
  dashboard: {
    match: (path) => path === '/dashboard',
    steps: [
      {
        selector: '[data-tour="main-weekly"]',
        placement: 'bottom',
        title: ['Resumen semanal', 'Weekly summary'],
        body: [
          'Este bloque resume tu semana. Cada día es clickable: si tiene entreno abre el detalle; si está vacío te lleva a crear sesión para ese día.',
          'This block summarizes your week. Each day is clickable: with a workout it opens details; empty days take you to create a session for that date.',
        ],
      },
      {
        selector: '[data-tour="main-today"]',
        placement: 'right',
        title: ['Sesión de hoy', 'Today session'],
        body: [
          'Aquí se muestra el entreno del día. Si no hay sesión, puedes crearla; si ya existe, puedes abrirla o añadir otra.',
          'Today’s workout appears here. If there is no session, you can create it; if it exists, you can open it or add another.',
        ],
      },
      {
        selector: '[data-tour="main-achievements"]',
        placement: 'left',
        title: ['Logros cercanos', 'Closest achievements'],
        body: [
          'Se muestran los logros con más progreso para que sepas qué objetivo está más cerca de completarse.',
          'This shows achievements with the highest progress so you know which goal is closest to completion.',
        ],
      },
      {
        selector: '[data-tour="main-fitgram"]',
        placement: 'left',
        title: ['FitGram rápido', 'Quick FitGram'],
        body: [
          'Vista previa de publicaciones. Entra aquí para descubrir usuarios, comentar o guardar entrenos compartidos.',
          'Post preview. Open it to discover users, comment or save shared workouts.',
        ],
      },
    ],
  },
  calendario: {
    match: (path) => path === '/calendario',
    steps: [
      {
        selector: '[data-tour="calendar-stats"]',
        placement: 'bottom',
        title: ['Resumen del calendario', 'Calendar summary'],
        body: [
          'Estos datos te dan contexto del mes: días entrenados y carga general antes de entrar al detalle.',
          'These stats give monthly context: trained days and general activity before checking details.',
        ],
      },
      {
        selector: '[data-tour="calendar-grid"]',
        placement: 'top',
        title: ['Calendario', 'Calendar'],
        body: [
          'Usa esta pantalla para revisar tus entrenamientos por fecha y encontrar rápidamente qué hiciste cada día.',
          'Use this screen to review workouts by date and quickly see what you did each day.',
        ],
      },
    ],
  },
  entrenamientos: {
    match: (path) => path === '/entrenamientos',
    steps: [
      {
        selector: '[data-tour="workouts-list"]',
        placement: 'top',
        title: ['Entrenamientos', 'Workouts'],
        body: [
          'Aquí se agrupan tus sesiones registradas para consultar detalles, volumen, duración y ejercicios.',
          'Your logged sessions are grouped here so you can review details, volume, duration and exercises.',
        ],
      },
    ],
  },
  fitgram: {
    match: (path) => path === '/fitgram',
    steps: [
      {
        selector: '[data-tour="fitgram-search"]',
        placement: 'bottom',
        title: ['Buscar usuarios', 'Search users'],
        body: [
          'Usa la búsqueda para encontrar perfiles por nombre o apodo y empezar a seguir a otros usuarios.',
          'Use search to find profiles by name or handle and start following other users.',
        ],
      },
      {
        selector: '[data-tour="fitgram-tabs"]',
        placement: 'bottom',
        title: ['Secciones de FitGram', 'FitGram sections'],
        body: [
          'Para ti muestra contenido general, Mi comunidad filtra seguidos y Mi perfil muestra tus publicaciones.',
          'For you shows general content, My community filters followed users and My profile shows your posts.',
        ],
      },
      {
        selector: '[data-tour="fitgram-feed"]',
        placement: 'top',
        title: ['FitGram', 'FitGram'],
        body: [
          'Comparte publicaciones, descubre usuarios y guarda entrenos de otras personas para copiarlos en tus sesiones.',
          'Share posts, discover users and save other people’s workouts to copy them into your own sessions.',
        ],
      },
    ],
  },
  logros: {
    match: (path) => path === '/logros',
    steps: [
      {
        selector: '[data-tour="achievements-tabs"]',
        placement: 'bottom',
        title: ['Tipos de logros', 'Achievement types'],
        body: [
          'Alterna entre tus logros de entrenamiento y los logros sociales de FitGram.',
          'Switch between workout achievements and social FitGram achievements.',
        ],
      },
      {
        selector: '[data-tour="achievements-content"]',
        placement: 'top',
        title: ['Logros', 'Achievements'],
        body: [
          'Los logros se actualizan automáticamente con tus sesiones y tu actividad en FitGram.',
          'Achievements update automatically from your sessions and FitGram activity.',
        ],
      },
    ],
  },
  planificador: {
    match: (path) => path === '/planificador',
    steps: [
      {
        selector: '[data-tour="planner-preset"]',
        placement: 'bottom',
        title: ['Preset recomendado', 'Recommended preset'],
        body: [
          'Elige cuántos días entrenas y FitTrack propone una distribución semanal editable.',
          'Choose how many days you train and FitTrack suggests an editable weekly split.',
        ],
      },
      {
        selector: '[data-tour="planner-sessions"]',
        placement: 'top',
        title: ['Planificador', 'Planner'],
        body: [
          'Define cuántos días entrenas, aplica un preset recomendado y edita cada sesión según tu rutina.',
          'Define how many days you train, apply a recommended preset and edit each session to fit your routine.',
        ],
      },
    ],
  },
  estadisticas: {
    match: (path) => path === '/estadisticas',
    steps: [
      {
        selector: '[data-tour="stats-summary"]',
        placement: 'bottom',
        title: ['Resumen de rendimiento', 'Performance summary'],
        body: [
          'Estas tarjetas resumen volumen, sesiones, duración media y fuerza estimada del periodo seleccionado.',
          'These cards summarize volume, sessions, average duration and estimated strength for the selected period.',
        ],
      },
      {
        selector: '[data-tour="stats-charts"]',
        placement: 'top',
        title: ['Estadísticas', 'Statistics'],
        body: [
          'Analiza mejoras por rango de tiempo, ejercicio y rendimiento para entender tu progreso real.',
          'Analyze improvements by time range, exercise and performance to understand your real progress.',
        ],
      },
    ],
  },
  notificaciones: {
    match: (path) => path === '/notificaciones',
    steps: [
      {
        selector: '[data-tour="notifications-filters"]',
        placement: 'bottom',
        title: ['Filtros de notificaciones', 'Notification filters'],
        body: [
          'Filtra por tipo para separar actividad social, entrenos, planificador y perfil físico.',
          'Filter by type to separate social activity, workouts, planner and physical profile alerts.',
        ],
      },
      {
        selector: '[data-tour="notifications-list"]',
        placement: 'top',
        title: ['Notificaciones', 'Notifications'],
        body: [
          'Aquí llegan avisos sociales, entrenos copiados, recordatorios del planificador y datos físicos pendientes.',
          'Social alerts, copied workouts, planner reminders and pending physical data appear here.',
        ],
      },
    ],
  },
  perfil: {
    match: (path) => path === '/perfil',
    steps: [
      {
        selector: '[data-tour="profile-user"]',
        placement: 'top',
        title: ['Perfil', 'Profile'],
        body: [
          'Gestiona tus datos de usuario, foto, privacidad, idioma y configuración de cuenta.',
          'Manage user data, photo, privacy, language and account settings.',
        ],
      },
      {
        selector: '[data-tour="profile-tabs"]',
        placement: 'bottom',
        title: ['Perfil físico', 'Physical profile'],
        body: [
          'Desde estas pestañas puedes cambiar a Mi perfil físico, donde se guardan métricas, objetivos y preferencias.',
          'Use these tabs to open your physical profile, where metrics, goals and preferences are stored.',
        ],
      },
    ],
  },
};

function readCurrentUserKey() {
  if (typeof window === 'undefined') return 'anon';
  try {
    const raw = window.localStorage.getItem('fittrack_user');
    const user = raw ? JSON.parse(raw) : null;
    return String(user?.id || user?._id || user?.email || 'anon');
  } catch {
    return 'anon';
  }
}

function readCompletedTours() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCompletedTour(userKey, tourKey) {
  const completed = readCompletedTours();
  const userTours = completed[userKey] && typeof completed[userKey] === 'object' ? completed[userKey] : {};
  completed[userKey] = { ...userTours, [tourKey]: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

export default function GuidedTour() {
  const location = useLocation();
  const { lang } = useI18n();
  const [activeTourKey, setActiveTourKey] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const pathname = location.pathname || '';
  const activeDefinition = useMemo(() => {
    if (!activeTourKey) return null;
    return TOUR_DEFINITIONS[activeTourKey] || null;
  }, [activeTourKey]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setActiveTourKey('');
      return;
    }

    const tourKey = Object.entries(TOUR_DEFINITIONS).find(([, definition]) => definition.match(pathname))?.[0] || '';
    if (!tourKey) {
      setActiveTourKey('');
      return;
    }

    const userKey = readCurrentUserKey();
    const completed = readCompletedTours();
    if (completed?.[userKey]?.[tourKey]) {
      setActiveTourKey('');
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex(0);
      setActiveTourKey(tourKey);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const steps = activeDefinition?.steps || [];
  const currentStep = steps[stepIndex] || steps[0] || null;

  useEffect(() => {
    if (!currentStep?.selector) {
      setTargetRect(null);
      return undefined;
    }

    const updateRect = (shouldScroll = false) => {
      const element = document.querySelector(currentStep.selector);
      if (!element) {
        setTargetRect(null);
        return;
      }
      if (shouldScroll) element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      window.setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: Math.max(8, rect.top - 8),
          left: Math.max(8, rect.left - 8),
          width: Math.min(window.innerWidth - 16, rect.width + 16),
          height: Math.min(window.innerHeight - 16, rect.height + 16),
        });
      }, 220);
    };

    updateRect(true);
    const refreshRect = () => updateRect(false);
    window.addEventListener('resize', refreshRect);
    window.addEventListener('scroll', refreshRect, true);
    return () => {
      window.removeEventListener('resize', refreshRect);
      window.removeEventListener('scroll', refreshRect, true);
    };
  }, [currentStep]);

  if (!activeDefinition || !currentStep) return null;

  const closeTour = () => {
    const userKey = readCurrentUserKey();
    writeCompletedTour(userKey, activeTourKey);
    setActiveTourKey('');
    setStepIndex(0);
  };

  const nextStep = () => {
    if (stepIndex >= steps.length - 1) {
      closeTour();
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const panelStyle = (() => {
    if (!targetRect) return {};
    const preferred = currentStep.placement || 'bottom';
    const panelWidth = Math.min(560, window.innerWidth - 32);
    const left = Math.min(window.innerWidth - panelWidth - 16, Math.max(16, targetRect.left + (targetRect.width / 2) - (panelWidth / 2)));
    if (preferred === 'top') return { width: panelWidth, left, top: Math.max(16, targetRect.top - 250) };
    if (preferred === 'left') return { width: panelWidth, left: Math.max(16, targetRect.left - panelWidth - 18), top: Math.min(window.innerHeight - 250, Math.max(16, targetRect.top)) };
    if (preferred === 'right') return { width: panelWidth, left: Math.min(window.innerWidth - panelWidth - 16, targetRect.left + targetRect.width + 18), top: Math.min(window.innerHeight - 250, Math.max(16, targetRect.top)) };
    return { width: panelWidth, left, top: Math.min(window.innerHeight - 250, targetRect.top + targetRect.height + 18) };
  })();

  const overlayPieces = targetRect
    ? [
        { top: 0, left: 0, width: '100vw', height: targetRect.top },
        { top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height },
        {
          top: targetRect.top,
          left: targetRect.left + targetRect.width,
          width: Math.max(0, window.innerWidth - targetRect.left - targetRect.width),
          height: targetRect.height,
        },
        {
          top: targetRect.top + targetRect.height,
          left: 0,
          width: '100vw',
          height: Math.max(0, window.innerHeight - targetRect.top - targetRect.height),
        },
      ]
    : [];

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] px-4 py-5">
      {targetRect ? (
        overlayPieces.map((piece, index) => (
          <div
            key={index}
            className="pointer-events-auto fixed bg-black/55 backdrop-blur-[2px]"
            style={piece}
          />
        ))
      ) : (
        <div className="pointer-events-auto fixed inset-0 bg-black/55 backdrop-blur-[2px]" />
      )}

      {targetRect ? (
        <div
          className="pointer-events-none fixed rounded-2xl border-2 border-[#ff7849] shadow-[0_0_35px_rgba(255,120,73,0.45)]"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      ) : null}

      <section
        className={`pointer-events-auto fixed w-full max-w-[560px] rounded-2xl border border-white/15 bg-[#181818] p-5 text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)] ${targetRect ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}`}
        style={panelStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff7849]">
              {tr(lang, 'Tour rápido', 'Quick tour')}
            </div>
            <h2 className="mt-2 text-[20px] font-bold uppercase tracking-wide text-white/95">
              {tr(lang, currentStep.title[0], currentStep.title[1])}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTour}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white/55 hover:bg-white/[0.08] hover:text-white"
          >
            {tr(lang, 'Saltar', 'Skip')}
          </button>
        </div>

        <p className="mt-4 text-[14px] leading-relaxed text-white/65">
          {tr(lang, currentStep.body[0], currentStep.body[1])}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all ${index === stepIndex ? 'w-7 bg-[#ff7849]' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextStep}
            className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-xl border border-[#ff7849]/55 bg-[#ff7849] px-5 text-[12px] font-bold uppercase tracking-wide text-white transition hover:brightness-105"
          >
            {stepIndex >= steps.length - 1 ? tr(lang, 'Entendido', 'Got it') : tr(lang, 'Siguiente', 'Next')}
          </button>
        </div>
      </section>
    </div>
  );
}
