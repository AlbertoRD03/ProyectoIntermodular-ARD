import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">
          Dashboard <span className="text-[#ff7849]">FitTrack</span>
        </h1>
        <p className="mt-2 text-white/60">
          {t('Ruta placeholder para evitar pantalla en blanco tras el login.')}
        </p>

        <div className="mt-10 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          >
            {t('Volver a login')}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('fittrack_token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('fittrack_user');
              navigate('/login');
            }}
            className="rounded-md bg-[#ff7849] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            {t('Cerrar sesión')}
          </button>
        </div>
      </div>
    </div>
  );
}
