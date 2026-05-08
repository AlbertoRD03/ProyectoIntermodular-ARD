import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelect from '../components/LanguageSelect';
import { useI18n, tr } from '../i18n/I18nProvider';

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-[12px] sm:text-[13px] font-bold tracking-wide text-white/90 uppercase">{title}</h2>
      <div className="mt-3 text-[12px] sm:text-[13px] leading-relaxed text-white/60 space-y-3">{children}</div>
    </section>
  );
}

export default function Privacy() {
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
              {tr(lang, 'POLÍTICA DE PRIVACIDAD', 'PRIVACY POLICY')}
            </h1>
            <p className="mx-auto mt-3 max-w-[72ch] text-[12px] sm:text-[13px] text-white/55">
              {tr(
                lang,
                'Esta política explica qué datos se recopilan y cómo se usan en FitTrack.',
                'This policy explains what data is collected and how it is used in FitTrack.'
              )}
            </p>
          </header>

          <Section title={tr(lang, '1. Datos que recopilamos', '1. Data we collect')}>
            <p>
              {tr(
                lang,
                'Podemos recopilar datos que proporcionas (por ejemplo: email, nombre, apodo) y datos de uso (por ejemplo: sesiones registradas, interacciones con FitGram).',
                'We may collect data you provide (e.g., email, name, nickname) and usage data (e.g., logged sessions, FitGram interactions).'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Si completas tu perfil físico, puedes introducir información como edad, altura o peso. Estos datos se usan para mejorar tu experiencia.',
                'If you complete your physical profile, you may enter information such as age, height, or weight. This data is used to improve your experience.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '2. Cómo usamos tus datos', '2. How we use your data')}>
            <p>
              {tr(
                lang,
                'Usamos los datos para: permitir el acceso a tu cuenta, guardar tus entrenamientos, mostrar métricas y mejorar el producto.',
                'We use data to: provide account access, store your workouts, show metrics, and improve the product.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Podemos usar datos agregados y anónimos para análisis y mejoras.',
                'We may use aggregated and anonymized data for analytics and improvements.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '3. FitGram y contenido público', '3. FitGram and public content')}>
            <p>
              {tr(
                lang,
                'Si publicas contenido en FitGram, puede ser visible para otros usuarios según la configuración de privacidad y el funcionamiento del feed.',
                'If you post on FitGram, it may be visible to other users depending on privacy settings and how the feed works.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Evita compartir información sensible en publicaciones o comentarios.',
                'Avoid sharing sensitive information in posts or comments.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '4. Cookies y almacenamiento local', '4. Cookies and local storage')}>
            <p>
              {tr(
                lang,
                'Podemos almacenar preferencias en tu dispositivo (por ejemplo, el idioma) usando almacenamiento local del navegador.',
                'We may store preferences on your device (e.g., language) using browser local storage.'
              )}
            </p>
          </Section>

          <Section title={tr(lang, '5. Tus derechos', '5. Your rights')}>
            <p>
              {tr(
                lang,
                'Puedes solicitar acceso, rectificación o eliminación de tus datos según corresponda.',
                'You may request access, correction, or deletion of your data as applicable.'
              )}
            </p>
            <p>
              {tr(
                lang,
                'Para ello, usa los canales de contacto del proyecto.',
                "To do so, use the project's contact channels."
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

