import React, { useMemo, useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://albertoramirez-pi-back.onrender.com/api';

export default function PasswordRecovery() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Put your original images in `fittrack-frontend/public/` and keep these names,
  // or change the paths.
  const leftImageSrc = '/recuperar-left.jpg';
  const rightImageSrc = '/recuperar-right.jpg';

  const canSubmit = useMemo(() => {
    if (loading) return false;
    return email.trim().length > 0;
  }, [email, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!canSubmit) return;

    setLoading(true);
    try {
      // Backend endpoint not implemented yet in your repo; wire it later.
      const url = `${API_BASE}/auth/password/forgot`;
      const body = { email: email.trim() };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || 'No se pudo completar la operación.');
        return;
      }

      setSuccess('Si el email existe, te enviaremos un enlace de recuperación.');
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
                RECUPERAR CONTRASEÑA
              </h1>
              <p className="mx-auto mt-3 max-w-[34ch] text-[14px] text-white/55">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
              </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                autoComplete="email"
                className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
              />

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
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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
