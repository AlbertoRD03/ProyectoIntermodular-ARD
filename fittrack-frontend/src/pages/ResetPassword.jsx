import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://albertoramirez-pi-back.onrender.com/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reuse the same assets as PasswordRecovery by default.
  const leftImageSrc = '/recuperar-left.jpg';
  const rightImageSrc = '/recuperar-right.jpg';

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!token) return false;
    return password.length > 0 && password2.length > 0 && password === password2;
  }, [loading, password, password2, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('El enlace no es válido o ha expirado.');
      return;
    }
    if (!password || !password2) {
      setError('Completa ambos campos.');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // Endpoint to implement in backend later.
      const res = await fetch(`${API_BASE}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || 'No se pudo actualizar la contraseña.');
        return;
      }

      setSuccess('Contraseña actualizada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Inténtalo de nuevo.');
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

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-[14px] font-medium text-white/90 transition hover:bg-white/15"
          >
            <LogIn className="h-4 w-4" />
            Log In
          </button>
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
        <main className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-7 xl:px-10">
          <div className="w-full max-w-[560px]">
            <header className="text-center">
              <h1
                className="text-[clamp(26px,2.4vw,34px)] font-bold tracking-[0.08em] leading-[1.08]"
                style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
              >
                RESTABLECER CONTRASEÑA
              </h1>
              <p className="mx-auto mt-3 max-w-[36ch] text-[14px] text-white/55">
                Crea una nueva contraseña para tu cuenta
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 pr-14 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/35 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#ff7849]/30"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Repetir contraseña"
                  type={showPassword2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 pr-14 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-white/35 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#ff7849]/30"
                  aria-label={showPassword2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {password2 && password && password !== password2 ? (
                <div className="-mt-2 text-left text-[12px] text-[#ff7849]/90">
                  Las contraseñas no coinciden.
                </div>
              ) : null}

              {!token ? (
                <div className="rounded-md border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-3 text-sm text-[#f5f5f5]">
                  Falta el token del enlace. Usa el link del correo (ej. `/reset-password?token=...`).
                </div>
              ) : null}

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
                type="submit"
                disabled={!canSubmit}
                className="mt-2 h-12 w-full rounded-md bg-[#ff7849] text-[14px] font-semibold text-white shadow-[0_14px_34px_-14px_rgba(255,120,73,0.9)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Aceptar'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mx-auto block pt-2 text-[13px] text-white/50 hover:text-white/70"
              >
                Volver al inicio de sesión
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
