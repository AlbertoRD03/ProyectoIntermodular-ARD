import React, { useEffect, useState } from 'react';
import { Shield, EyeOff, Lock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import { useI18n } from '../i18n/I18nProvider';
import { getAuthToken } from '../services/authToken';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/15 bg-white/[0.02] p-6 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] font-bold tracking-[0.22em] text-white/70">{title}</div>
        {Icon ? <Icon className="h-5 w-5 text-[#ff7849]/90" /> : null}
      </div>
      <div className="mt-4 h-px w-full bg-white/10" />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ToggleRow({ title, description, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/10 px-4 py-4">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-white/90">{title}</div>
        <div className="mt-1 text-[12px] text-white/55">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cx(
          'relative h-7 w-12 rounded-full border transition',
          value ? 'border-[#ff7849]/60 bg-[#ff7849]/80' : 'border-white/15 bg-white/5'
        )}
        aria-pressed={value}
      >
        <span
          className={cx(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition',
            value ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}

const STORAGE_KEY = 'fittrack_privacy_settings_v1';

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [settings, setSettings] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            hideWeight: false,
            hidePhysicalProfile: false,
            analyticsOptOut: false,
          };
    } catch {
      return { hideWeight: false, hidePhysicalProfile: false, analyticsOptOut: false };
    }
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[980px]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[22px] sm:text-[28px] font-bold tracking-wide text-white/95" style={{ fontFamily: 'Arimo, Poppins, system-ui' }}>
                {t('Configuración de privacidad').toUpperCase()}
              </div>
              <div className="mt-1 text-[13px] text-white/55">
                {t('Controla qué información se muestra y cómo se usa dentro de la app.')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="h-11 rounded-lg border border-white/15 bg-white/[0.02] px-4 text-[12px] font-bold tracking-wide text-white/80 transition hover:border-white/25 hover:bg-white/[0.03]"
            >
              {t('Volver').toUpperCase()}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <Section title={t('Visibilidad').toUpperCase()} icon={EyeOff}>
              <div className="space-y-3">
                <ToggleRow
                  title={t('Ocultar peso corporal')}
                  description={t('Evita que tu peso se muestre en pantallas y gráficos compartidos dentro de la app.')}
                  value={Boolean(settings.hideWeight)}
                  onChange={(v) => setSettings((p) => ({ ...p, hideWeight: v }))}
                />
                <ToggleRow
                  title={t('Ocultar perfil físico')}
                  description={t('Oculta medidas como altura, IMC, grasa o masa muscular en la vista de perfil.')}
                  value={Boolean(settings.hidePhysicalProfile)}
                  onChange={(v) => setSettings((p) => ({ ...p, hidePhysicalProfile: v }))}
                />
              </div>
            </Section>

            <Section title={t('Datos y seguridad').toUpperCase()} icon={Shield}>
              <div className="space-y-3">
                <ToggleRow
                  title={t('Desactivar analíticas')}
                  description={t('Desactiva el envío de eventos de uso para mejorar el producto (si aplica en tu despliegue).')}
                  value={Boolean(settings.analyticsOptOut)}
                  onChange={(v) => setSettings((p) => ({ ...p, analyticsOptOut: v }))}
                />

                <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-semibold text-white/90">{t('Seguridad')}</div>
                    <Lock className="h-5 w-5 text-white/45" />
                  </div>
                  <div className="mt-2 text-[12px] text-white/55">
                    {t('Recomendación: usa una contraseña única y activa la verificación en tu correo si está disponible.')}
                  </div>
                </div>
              </div>
            </Section>

            <Section title={t('Zona peligrosa').toUpperCase()} icon={Trash2}>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-4">
                <div className="text-[13px] font-semibold text-red-200">{t('Eliminar cuenta')}</div>
                <div className="mt-2 text-[12px] text-red-100/70">
                  {t('Esta acción es permanente. Puedes hacerlo desde el perfil cuando lo habilitemos por completo.')}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

