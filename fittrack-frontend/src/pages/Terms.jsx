import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n, tr } from '../i18n/I18nProvider';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-[12px] sm:text-[13px] font-bold tracking-wide text-white/90 uppercase">{title}</h2>
      <div className="mt-3 text-[12px] sm:text-[13px] leading-relaxed text-white/60 space-y-3">{children}</div>
    </section>
  );
}

export default function Terms() {
  const navigate = useNavigate();
  const { lang } = useI18n();

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      {/* Top bar */}
      <div className="h-[64px] border-b border-white/10">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-6">
          <div
            className="text-[22px] font-bold tracking-wide text-[#ff7849]"
            style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
          >
            FitTrack
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelect />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-[14px] font-medium text-white/90 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              {tr(lang, 'Volver', 'Back')}
            </button>
          </div>
        </div>
      </div>

      <main className="w-full px-6 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <header className="text-center">
            <h1
              className="text-[clamp(26px,2.4vw,34px)] font-bold tracking-[0.08em] leading-[1.08]"
              style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
            >
              {tr(lang, 'TÉRMINOS Y CONDICIONES', 'TERMS & CONDITIONS')}
            </h1>
            <p className="mx-auto mt-3 max-w-[70ch] text-[12px] sm:text-[13px] text-white/55">
              {tr(
                lang,
                'Estos términos regulan el uso de FitTrack. Al crear una cuenta o utilizar la app, aceptas estas condiciones.',
                'These terms govern your use of FitTrack. By creating an account or using the app, you agree to these conditions.'
              )}
            </p>
          </header>

          <Section title={tr(lang, '1. Uso del servicio', '1. Use of the service')}>
            <p>
              {tr(
                lang,
                'FitTrack ofrece herramientas para registrar entrenamientos, visualizar progreso y acceder a funcionalidades sociales. El servicio se proporciona “tal cual” y puede cambiar con el tiempo.',
                'FitTrack provides tools to log workouts, visualize progress, and access social features. The service is provided “as is” and may change over time.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Te comprometes a usar la aplicación de forma responsable y a no realizar actividades que afecten a la seguridad o al funcionamiento del servicio.',
                'You agree to use the app responsibly and not engage in activities that harm the security or operation of the service.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '2. Cuenta y seguridad', '2. Account and security')}>
            <p>
              {tr(
                lang,
                'Eres responsable de la confidencialidad de tus credenciales y de la actividad realizada en tu cuenta.',
                'You are responsible for keeping your credentials confidential and for activity performed under your account.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Si detectas un uso no autorizado, notifícalo lo antes posible.',
                'If you notice unauthorized use, notify us as soon as possible.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '3. Contenido y FitGram', '3. Content and FitGram')}>
            <p>
              {tr(
                lang,
                'Si publicas contenido en FitGram, declaras tener derecho a publicarlo y a que no infringe derechos de terceros.',
                'If you post content on FitGram, you represent that you have the right to post it and that it does not infringe third-party rights.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'No está permitido publicar contenido ofensivo, ilegal, engañoso o que suponga acoso.',
                'You must not post content that is offensive, illegal, misleading, or harassing.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '4. Salud y responsabilidad', '4. Health and responsibility')}>
            <p>
              {tr(
                lang,
                'FitTrack no sustituye el asesoramiento médico. Cualquier recomendación o contenido es orientativo.',
                'FitTrack does not replace medical advice. Any recommendations or content are for general guidance only.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Antes de iniciar un plan de entrenamiento o nutrición, consulta con un profesional si lo necesitas.',
                'Before starting a training or nutrition plan, consult a professional if needed.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '5. Cambios y contacto', '5. Changes and contact')}>
            <p>
              {tr(
                lang,
                'Podemos actualizar estos términos para reflejar cambios legales o funcionales. Publicaremos la versión vigente en esta página.',
                'We may update these terms to reflect legal or functional changes. We will publish the current version on this page.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Para consultas, utiliza los canales de contacto del proyecto.',
                "For questions, use the project's contact channels."
              )}
            </p>
          </Section>

          <div className="text-center text-[11px] text-white/35">
            {tr(lang, 'Última actualización: ', 'Last updated: ')}
            {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES')}
          </div>
        </div>
      </main>
    </div>
  );
}

