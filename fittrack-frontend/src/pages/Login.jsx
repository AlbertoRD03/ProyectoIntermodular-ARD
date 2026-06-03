import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/apiBase';
import { useI18n } from '../i18n/I18nProvider';
import LanguageSelect from '../components/LanguageSelect';

function GoogleMark({ className }) {
  // Simple Google "G" mark; kept inline to avoid extra deps/assets.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className={className}
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.653 32.657 29.246 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.155 7.96 3.04l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.155 7.96 3.04l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.213 35.091 26.715 36 24 36c-5.223 0-9.615-3.318-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.806 2.279-2.296 4.208-4.084 5.565l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Put your original images in `fittrack-frontend/public/` and keep these names,
  // or change the paths to whatever you want.
  const leftImageSrc = '/login-left.jpg';
  const rightImageSrc = '/login-right.jpg';

  const canSubmit = useMemo(() => {
    if (!identifier.trim() || !password) return false;
    // Same behavior as the screenshot: keep validation light and defer to backend.
    return true;
  }, [identifier, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status >= 500) {
          setError(t('Ha ocurrido un error. Inténtalo de nuevo más tarde.'));
          return;
        }
        setError(data?.error || data?.message || t('No se pudo iniciar sesión.'));
        return;
      }

      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.accessToken;

      if (token) {
        localStorage.setItem('fittrack_token', token);
        // Compatibility with common setups.
        localStorage.setItem('authToken', token);
      }
      if (data?.user) localStorage.setItem('fittrack_user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(t('Error de conexión. Inténtalo de nuevo.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // If your backend supports it, this will start the OAuth flow.
    window.location.href = `${API_BASE}/auth/google`;
  };

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
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-[14px] font-medium text-white/90 transition hover:bg-white/15"
            >
              <UserPlus className="h-4 w-4" />
              {t('Registro')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[30%_40%_30%]">
        {/* Left photo */}
        <div className="relative hidden lg:block">
          <img
            src={leftImageSrc}
            alt="Fondo izquierda"
            className="h-full w-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        </div>

        {/* Center */}
        <main className="flex items-center justify-center px-5 py-16 sm:px-8 lg:px-6 xl:px-8">
          <div className="w-full max-w-none">
            <header className="text-center">
              <h1
                className="text-[clamp(36px,4.1vw,64px)] font-bold tracking-[0.055em] leading-[1.03]"
                style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
              >
                {t('Bienvenido a')} <span className="text-[#ff7849]">FITTRACK</span>
              </h1>
              <p className="mt-4 text-[clamp(15px,1.2vw,18px)] text-white/60">
                {t('Inicia sesión para continuar')}
              </p>
            </header>

            <form onSubmit={handleLogin} className="mx-auto mt-12 w-full max-w-[640px] space-y-5 lg:max-w-none">
              <input
                type="text"
                placeholder={t('Email o apodo')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="h-14 w-full rounded-md border border-white/15 bg-transparent px-6 text-[16px] text-[#f5f5f5] placeholder:text-white/35 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('Contraseña')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-14 w-full rounded-md border border-white/15 bg-transparent px-6 pr-16 text-[16px] text-[#f5f5f5] placeholder:text-white/35 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/40 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#ff7849]/30"
                  aria-label={showPassword ? t('Ocultar contraseña') : t('Mostrar contraseña')}
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </button>
              </div>

              {error ? (
                <div className="rounded-md border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-sm text-[#f5f5f5]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="mt-3 h-14 w-full rounded-md bg-[#ff7849] text-[15px] font-semibold tracking-[0.24em] text-white shadow-[0_16px_38px_-14px_rgba(255,120,73,0.92)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t('Cargando...') : t('Iniciar sesión')}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-md border border-white/15 bg-transparent text-[15px] font-medium text-[#f5f5f5] transition hover:border-white/25"
              >
                <GoogleMark className="h-5 w-5" />
                {t('Continuar con Google')}
              </button>

              <div className="pt-2 text-center text-[14px] text-white/55">
                {t('¿No tienes cuenta?')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-[#ff7849] underline-offset-4 hover:underline"
                >
                  {t('Regístrate')}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/password-recovery')}
                className="mx-auto block pt-1 text-center text-[13px] text-white/45 hover:text-white/70"
              >
                {t('He olvidado mi contraseña')}
              </button>
            </form>
          </div>
        </main>

        {/* Right photo */}
        <div className="relative hidden lg:block">
          <img
            src={rightImageSrc}
            alt="Fondo derecha"
            className="h-full w-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/35 to-transparent" />
        </div>
      </div>
    </div>
  );
}
