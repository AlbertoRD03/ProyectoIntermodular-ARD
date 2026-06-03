import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n, tr } from '../i18n/I18nProvider';
import { getAuthToken } from '../services/authToken';

const STORAGE_KEY = 'fittrack_guided_tours_v1';

const TOUR_DEFINITIONS = {
  dashboard: {
    match: (path) => path === '/dashboard',
    steps: [
      {
        title: ['Bienvenido a Inicio', 'Welcome to Home'],
        body: [
          'Aquí tienes tu resumen semanal, la sesión de hoy, tus logros más cercanos y una vista rápida de FitGram.',
          'Here you can see your weekly summary, today session, closest achievements and a quick FitGram preview.',
        ],
      },
      {
        title: ['Flujo recomendado', 'Recommended flow'],
        body: [
          'Si hoy no tienes sesión, crea una desde el bloque central. Si ya la tienes, podrás abrirla o crear otra.',
          'If you have no session today, create one from the center card. If you already have one, you can open it or create another.',
        ],
      },
    ],
  },
  calendario: {
    match: (path) => path === '/calendario',
    steps: [
      {
        title: ['Calendario', 'Calendar'],
        body: [
          'Usa esta pantalla para revisar tus entrenamientos por fecha y encontrar rápidamente qué hiciste cada día.',
          'Use this screen to review workouts by date and quickly see what you did each day.',
        ],
      },
      {
        title: ['Crear desde una fecha', 'Create from a date'],
        body: [
          'Al elegir un día sin entreno puedes preparar una sesión para esa fecha. Si es futura, FitTrack te avisará.',
          'When you select a day without a workout, you can prepare a session for that date. If it is future, FitTrack warns you.',
        ],
      },
    ],
  },
  entrenamientos: {
    match: (path) => path === '/entrenamientos',
    steps: [
      {
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
        title: ['FitGram', 'FitGram'],
        body: [
          'Comparte publicaciones, descubre usuarios y guarda entrenos de otras personas para copiarlos en tus sesiones.',
          'Share posts, discover users and save other people’s workouts to copy them into your own sessions.',
        ],
      },
      {
        title: ['Para ti, comunidad y perfil', 'For you, community and profile'],
        body: [
          'Para ti mezcla contenido general, Mi comunidad muestra usuarios seguidos y Mi perfil concentra tus publicaciones.',
          'For you mixes general content, My community shows followed users and My profile gathers your own posts.',
        ],
      },
    ],
  },
  logros: {
    match: (path) => path === '/logros',
    steps: [
      {
        title: ['Logros', 'Achievements'],
        body: [
          'Los logros se actualizan automáticamente con tus sesiones y tu actividad en FitGram.',
          'Achievements update automatically from your sessions and FitGram activity.',
        ],
      },
      {
        title: ['Completados', 'Completed'],
        body: [
          'Cuando completes uno, aparecerá en Logros completados y podrás publicarlo en FitGram.',
          'When you complete one, it appears in Completed achievements and you can publish it to FitGram.',
        ],
      },
    ],
  },
  planificador: {
    match: (path) => path === '/planificador',
    steps: [
      {
        title: ['Planificador', 'Planner'],
        body: [
          'Define cuántos días entrenas, aplica un preset recomendado y edita cada sesión según tu rutina.',
          'Define how many days you train, apply a recommended preset and edit each session to fit your routine.',
        ],
      },
      {
        title: ['Conexión con crear sesión', 'Create session connection'],
        body: [
          'Cuando crees una sesión en un día planificado, FitTrack te ofrecerá usar esa sesión directamente.',
          'When you create a session on a planned day, FitTrack offers that planned session directly.',
        ],
      },
    ],
  },
  estadisticas: {
    match: (path) => path === '/estadisticas',
    steps: [
      {
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
        title: ['Perfil', 'Profile'],
        body: [
          'Gestiona tus datos de usuario, foto, privacidad, idioma y configuración de cuenta.',
          'Manage user data, photo, privacy, language and account settings.',
        ],
      },
      {
        title: ['Perfil físico', 'Physical profile'],
        body: [
          'En Mi perfil físico se guardan tus métricas, objetivo, nivel y preferencias de entrenamiento.',
          'Your physical profile stores metrics, goal, level and training preferences.',
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

  if (!activeDefinition) return null;

  const steps = activeDefinition.steps || [];
  const currentStep = steps[stepIndex] || steps[0];
  if (!currentStep) return null;

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

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-4 py-5 backdrop-blur-[2px] sm:items-center">
      <section className="w-full max-w-[560px] rounded-2xl border border-white/15 bg-[#181818] p-5 text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
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
