import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/apiBase';
import { useI18n } from '../i18n/I18nProvider';
import LanguageSelect from '../components/LanguageSelect';

function GoogleMark({ className }) {
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

export default function Register() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [nombre, setNombre] = useState('');
  const [apodo, setApodo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Put your original images in `fittrack-frontend/public/` and keep these names,
  // or change the paths.
  const leftImageSrc = '/registro-left.jpg';
  const rightImageSrc = '/registro-right.jpg';

  const canSubmit = useMemo(() => {
    return (
      nombre.trim() &&
      email.trim() &&
      password &&
      password2 &&
      password === password2 &&
      acceptTerms &&
      !loading
    );
  }, [nombre, email, password, password2, acceptTerms, loading]);

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombre.trim() || !email.trim() || !password || !password2) {
      setError(t('Completa todos los campos obligatorios.'));
      return;
    }
    if (password !== password2) {
      setError(t('Las contraseñas no coinciden.'));
      return;
    }
    if (!acceptTerms) {
      setError(t('Debes aceptar los términos y condiciones.'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Backend expects at least: nombre, email, password
          nombre: nombre.trim(),
          email: email.trim(),
          password,
          // Optional fields (ignored by backend if not present in the model)
          apodo: apodo.trim() || undefined,
          telefono: telefono.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status >= 500) {
          setError(t('Ha ocurrido un error. Inténtalo de nuevo más tarde.'));
          return;
        }
        setError(data?.error || data?.message || t('No se pudo crear la cuenta.'));
        return;
      }

      // Auto-login after register so onboarding can be completed immediately.
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        // Even if auto-login fails (e.g., auth service hiccup), force the onboarding route.
        setSuccess(t('Cuenta creada. Completa tus datos físicos para continuar.'));
        setTimeout(() => navigate('/physical-data', { replace: true }), 400);
        return;
      }

      const token =
        loginData?.token ||
        loginData?.accessToken ||
        loginData?.data?.token ||
        loginData?.data?.accessToken;

      if (token) {
        localStorage.setItem('fittrack_token', token);
        localStorage.setItem('authToken', token);
      }
      if (loginData?.user) localStorage.setItem('fittrack_user', JSON.stringify(loginData.user));

      setSuccess(t('Cuenta creada. Completa tus datos físicos para continuar.'));
      setTimeout(() => navigate('/physical-data', { replace: true }), 400);
    } catch (err) {
      console.error(err);
      setError(t('Error de conexión. Inténtalo de nuevo.'));
    } finally {
      setLoading(false);
    }
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
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-[14px] font-medium text-white/90 transition hover:bg-white/15"
            >
              <LogIn className="h-4 w-4" />
              {t('Iniciar sesión')}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[30%_40%_30%]">
        {/* Left image */}
        <div className="relative hidden lg:block">
          <img
            src={leftImageSrc}
            alt="Fondo izquierda"
            className="h-full w-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        </div>

        {/* Center */}
        <main className="relative flex items-center justify-center px-6 py-12 sm:px-10 lg:px-7 xl:px-10">
          <div className="w-full max-w-[520px]">
            <header className="text-center">
              <h1
                className="text-[clamp(28px,2.6vw,38px)] font-bold tracking-[0.06em] leading-[1.08]"
                style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
              >
                {t('Crear cuenta').toUpperCase()}
              </h1>
              <p className="mt-2 text-[14px] text-white/55">
                {t('Únete a FitTrack y comienza tu transformación')}
              </p>
            </header>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={t('Nombre completo')}
                className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
              />

              <input
                value={apodo}
                onChange={(e) => setApodo(e.target.value)}
                placeholder={t('Apodo')}
                className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
              />

              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder={t('Teléfono')}
                inputMode="tel"
                className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Email')}
                type="email"
                autoComplete="email"
                className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
              />

              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('Contraseña')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 pr-14 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/35 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#ff7849]/30"
                  aria-label={showPassword ? t('Ocultar contraseña') : t('Mostrar contraseña')}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder={t('Repetir contraseña')}
                  type={showPassword2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 pr-14 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/35 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#ff7849]/30"
                  aria-label={showPassword2 ? t('Ocultar contraseña') : t('Mostrar contraseña')}
                >
                  {showPassword2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {password2 && password && password !== password2 ? (
                <div className="-mt-2 text-left text-[12px] text-[#ff7849]/90">
                  {t('Las contraseñas no coinciden.')}
                </div>
              ) : null}

              <label className="flex items-start gap-3 pt-1 text-[12px] text-white/55">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent accent-[#ff7849]"
                />
                <span>
                  {t('Acepto los')}{' '}
                  <button
                    type="button"
                    className="text-[#ff7849] hover:underline"
                    onClick={() => navigate('/terms')}
                  >
                    {t('términos y condiciones')}
                  </button>{' '}
                  {t('y la')}{' '}
                  <button
                    type="button"
                    className="text-[#ff7849] hover:underline"
                    onClick={() => navigate('/privacy')}
                  >
                    {t('política de privacidad')}
                  </button>
                </span>
              </label>

              {error ? (
                <div className="rounded-md border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-sm text-[#f5f5f5]">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-[#f5f5f5]">
                  {success}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGoogleRegister}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-white/15 bg-transparent text-[14px] font-medium text-[#f5f5f5] transition hover:border-white/25"
              >
                <GoogleMark className="h-5 w-5" />
                {t('Continuar con Google')}
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 h-12 w-full rounded-md bg-[#ff7849] text-[14px] font-semibold text-white shadow-[0_14px_34px_-14px_rgba(255,120,73,0.9)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t('Creando...') : t('Crear cuenta')}
              </button>
            </form>
          </div>
        </main>

        {/* Right image */}
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
