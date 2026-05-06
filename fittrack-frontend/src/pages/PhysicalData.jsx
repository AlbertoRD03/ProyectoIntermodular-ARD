import React, { useMemo, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://albertoramirez-pi-back.onrender.com/api';

export default function PhysicalData() {
  const navigate = useNavigate();

  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');
  const [alturaCm, setAlturaCm] = useState('');
  const [pesoKg, setPesoKg] = useState('');
  const [nivelActividad, setNivelActividad] = useState('');
  const [objetivo, setObjetivo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Put your original images in `fittrack-frontend/public/` and keep these names,
  // or change the paths.
  const leftImageSrc = '/fisico-left.jpg';
  const rightImageSrc = '/fisico-right.jpg';

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!edad || !genero || !alturaCm || !pesoKg || !nivelActividad || !objetivo) return false;
    const e = Number(edad);
    const h = Number(alturaCm);
    const p = Number(pesoKg);
    if (!Number.isFinite(e) || e < 10 || e > 110) return false;
    if (!Number.isFinite(h) || h < 100 || h > 230) return false;
    if (!Number.isFinite(p) || p < 30 || p > 250) return false;
    return true;
  }, [alturaCm, edad, genero, loading, nivelActividad, objetivo, pesoKg]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!canSubmit) {
      setError('Completa todos los campos con valores válidos.');
      return;
    }

    setLoading(true);
    try {
      // Endpoint to implement later (per your project instructions).
      // We'll send the fields using your backend's naming conventions where possible.
      const token = localStorage.getItem('fittrack_token') || localStorage.getItem('authToken');

      const res = await fetch(`${API_BASE}/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          edad: Number(edad),
          genero,
          altura_cm: Number(alturaCm),
          peso_kg: Number(pesoKg),
          nivel_actividad: nivelActividad,
          objetivo_principal: objetivo,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || 'No se pudieron guardar los datos.');
        return;
      }

      setSuccess('Datos guardados correctamente.');
      // Next step could be dashboard or next onboarding step.
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      {/* Body */}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[30%_40%_30%]">
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
          <div className="w-full max-w-[720px]">
            <header className="text-center">
              <h1
                className="text-[clamp(28px,2.6vw,40px)] font-bold tracking-[0.08em] leading-[1.08]"
                style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
              >
                DATOS FÍSICOS
              </h1>
              <p className="mx-auto mt-2 max-w-[52ch] text-[14px] text-white/55">
                Completa tu perfil para obtener recomendaciones personalizadas
              </p>
            </header>

            <form onSubmit={handleSave} className="mx-auto mt-10 w-full max-w-[760px] space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[12px] text-white/55">Edad</label>
                  <input
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ej: 25"
                    inputMode="numeric"
                    className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] text-white/55">Género</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="h-12 w-full appearance-none rounded-md border border-white/15 bg-[#1e1e1e] px-5 text-[15px] text-[#f5f5f5] outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                  >
                    <option value="" disabled>
                      Selecciona tu género
                    </option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] text-white/55">Altura (cm)</label>
                  <input
                    value={alturaCm}
                    onChange={(e) => setAlturaCm(e.target.value)}
                    placeholder="175"
                    inputMode="numeric"
                    className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] text-white/55">Peso (kg)</label>
                  <input
                    value={pesoKg}
                    onChange={(e) => setPesoKg(e.target.value)}
                    placeholder="Ej: 70"
                    inputMode="decimal"
                    className="h-12 w-full rounded-md border border-white/15 bg-transparent px-5 text-[15px] text-[#f5f5f5] placeholder:text-white/30 outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] text-white/55">Nivel de Actividad Física</label>
                <select
                  value={nivelActividad}
                  onChange={(e) => setNivelActividad(e.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-white/15 bg-[#1e1e1e] px-5 text-[15px] text-[#f5f5f5] outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                >
                  <option value="" disabled>
                    Selecciona tu Nivel
                  </option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] text-white/55">Objetivo Principal</label>
                <select
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  className="h-12 w-full appearance-none rounded-md border border-white/15 bg-[#1e1e1e] px-5 text-[15px] text-[#f5f5f5] outline-none transition focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
                >
                  <option value="" disabled>
                    Selecciona tu Objetivo
                  </option>
                  <option value="Perder peso">Perder peso</option>
                  <option value="Ganar músculo">Ganar músculo</option>
                  <option value="Mejorar resistencia">Mejorar resistencia</option>
                  <option value="Mantenerme saludable">Mantenerme saludable</option>
                </select>
              </div>

              <div className="rounded-md border border-[#ff7849]/25 bg-[#ff7849]/10 px-4 py-4 text-[12px] text-white/70">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 text-[#ff7849]" />
                  <div>
                    <span className="font-semibold text-white/80">Tip:</span>{' '}
                    Estos datos nos ayudarán a calcular tu IMC, gasto calórico y crear rutinas
                    adaptadas a tu condición física actual.
                  </div>
                </div>
              </div>

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
                {loading ? 'Guardando...' : 'Guardar Datos'}
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
