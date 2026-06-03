import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n } from '../i18n/I18nProvider';
import { API_BASE } from '../config/apiBase';
import { getAuthToken } from '../services/authToken';
import { readPrivacySettings, subscribePrivacySettings } from '../services/privacySettings';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-[44px] min-w-[150px] sm:min-w-[190px] rounded-lg border px-4 text-[11px] sm:text-[12px] font-semibold tracking-wide transition',
        active
          ? 'bg-white text-black border-white'
          : 'bg-transparent text-white/85 border-white/35 hover:border-white/55 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-white/35 bg-white/[0.02] px-6 sm:px-8 py-7 sm:py-8 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]">
      <div className="text-[12px] font-bold tracking-wide text-white/80">{title}</div>
      <div className="mt-4 h-px w-full bg-white/15" />
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, readOnly = true, type = 'text', className }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      readOnly={readOnly}
      type={type}
      className={cx(
        'mt-2 h-[44px] w-full rounded-lg border border-white/35 bg-transparent px-4 text-[13px] text-white/85 outline-none',
        className
      )}
    />
  );
}

function Select({ value, onChange, disabled, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cx(
        'mt-2 h-[44px] w-full appearance-none rounded-lg border px-4 text-[13px] outline-none transition focus:ring-2 focus:ring-[#ff7849]/15',
        disabled
          ? 'border-white/10 bg-white/[0.02] text-white/45'
          : 'border-white/15 bg-[#1e1e1e] text-white/85 hover:border-white/25 focus:border-[#ff7849]/70'
      )}
    >
      {children}
    </select>
  );
}

function ProgressBar({ percent }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="mt-3 h-[10px] w-full overflow-hidden rounded-md bg-white/10">
      <div className="h-full bg-white/90" style={{ width: `${p}%` }} />
    </div>
  );
}

function ActionButton({ variant = 'secondary', children, onClick }) {
  const cls =
    variant === 'primary'
      ? 'border-white bg-white text-black hover:bg-white/90'
      : variant === 'danger'
        ? 'border-red-500/80 text-red-400 hover:border-red-400'
        : 'border-white/45 text-white/90 hover:border-white/70';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-[46px] min-w-[180px] rounded-lg border px-6 text-[12px] font-bold tracking-wide transition',
        cls
      )}
    >
      {children}
    </button>
  );
}

export default function Perfil() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useI18n();
  const initial = params.get('tab') === 'fisico' ? 'fisico' : 'usuario';
  const [tab, setTab] = useState(initial);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingPhysical, setIsEditingPhysical] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const fileInputRef = useRef(null);

  const [photoDataUrl, setPhotoDataUrl] = useState(() => {
    try {
      return window.localStorage.getItem('fittrack_profile_photo') || '';
    } catch {
      return '';
    }
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');

  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSaving, setUserSaving] = useState(false);
  const [userSaveError, setUserSaveError] = useState('');
  const [userSaveSuccess, setUserSaveSuccess] = useState('');

  const [user, setUser] = useState(() => ({
    nombre: '',
    apodo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
  }));

	  const [physical, setPhysical] = useState(() => {
	    const defaults = {
	      pesoActual: { value: '--', unit: 'KG' },
	      altura: { value: '--', unit: 'CM' },
	      imc: { value: '--', badge: '---', percent: 0 },
	      grasa: { value: '--', unit: '%' },
	      masa: { value: '--', unit: 'KG' },
	      ultimaActualizacion: '',
	      objetivos: {
	        pesoObjetivo: '--',
	        tipo: '',
	        progresoLeft: '--',
	        progresoPercent: 0,
	        fecha: '',
	      },
	      actividad: {
	        nivel: '',
	        metaSemanal: '',
	        preferida: '',
	      },
	    };
	    return defaults;
	  });

  const [physicalLoading, setPhysicalLoading] = useState(false);
  const [physicalError, setPhysicalError] = useState('');
  const [physicalSaving, setPhysicalSaving] = useState(false);
  const [physicalSaveError, setPhysicalSaveError] = useState('');
  const [physicalSaveSuccess, setPhysicalSaveSuccess] = useState('');

  const [privacy, setPrivacy] = useState(() => readPrivacySettings());

  useEffect(() => {
    setPrivacy(readPrivacySettings());
    return subscribePrivacySettings(setPrivacy);
  }, []);

  useEffect(() => {
    if (tab !== 'usuario') return;
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;
    setUserError('');
    setUserLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setUserError(data?.error || data?.message || t('No se pudo cargar el perfil.'));
          return;
        }

        const u = data?.user || data?.data?.user || null;
        if (u) {
          try {
            window.localStorage.setItem('fittrack_user', JSON.stringify(u));
          } catch {
            // ignore
          }
        }

        const photoUrl = String(u?.photo_url || u?.photoUrl || '').trim();
        if (photoUrl) {
          setPhotoDataUrl(photoUrl);
        }

        setUser({
          nombre: String(u?.nombre || ''),
          apodo: String(u?.apodo || u?.nickname || ''),
          email: String(u?.email || ''),
          telefono: String(u?.telefono || ''),
          fecha_nacimiento: (() => {
            const raw = u?.fecha_nacimiento || u?.fechaNacimiento || '';
            const date = new Date(String(raw || ''));
            if (!Number.isFinite(date.getTime())) return '';
            const yyyy = String(date.getFullYear()).padStart(4, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          })(),
          genero: String(u?.genero || ''),
        });
      } catch {
        if (!cancelled) setUserError(t('Error de conexión. Inténtalo de nuevo.'));
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, navigate, t]);

  useEffect(() => {
    try {
      window.localStorage.setItem('fittrack_profile_photo', photoDataUrl || '');
    } catch {
      // ignore
    }
  }, [photoDataUrl]);

  const isEditing = tab === 'usuario' ? isEditingUser : isEditingPhysical;

  const fmtDate = (input) => {
    const date = input instanceof Date ? input : new Date(String(input || ''));
    if (!Number.isFinite(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return '';
    }
  };

  const calcBmi = (weightKg, heightCm) => {
    const w = Number(weightKg);
    const h = Number(heightCm);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return { value: '--', badge: '---', percent: 0 };
    }
    const bmi = w / Math.pow(h / 100, 2);
    const rounded = Math.round(bmi * 10) / 10;
    let badge = 'NORMAL';
    if (rounded < 18.5) badge = 'BAJO';
    else if (rounded < 25) badge = 'NORMAL';
    else if (rounded < 30) badge = 'SOBREPESO';
    else badge = 'OBESIDAD';
    const percent = Math.max(0, Math.min(100, Math.round(((rounded - 15) / (35 - 15)) * 100)));
    return { value: rounded, badge, percent };
  };

  const parseFirstNumber = (value) => {
    if (value === null || value === undefined) return NaN;
    if (typeof value === 'number') return value;
    const match = String(value).replace(',', '.').match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  };

  const toISODate = (input) => {
    if (!input) return '';
    const date = input instanceof Date ? input : new Date(String(input));
    if (!Number.isFinite(date.getTime())) return '';
    const yyyy = String(date.getFullYear()).padStart(4, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatISODateForDisplay = (iso) => {
    if (!iso) return '';
    return fmtDate(new Date(String(iso)));
  };

  const computeGoalProgress = ({ currentKg, targetKg, goalType, startKg }) => {
    if (!Number.isFinite(currentKg) || !Number.isFinite(targetKg)) {
      return { leftText: '--', percent: 0 };
    }

    const goal = String(goalType || '').toLowerCase();
    const direction = goal.includes('ganar') ? 'up' : 'down';

    const remainingKg =
      direction === 'up' ? Math.max(0, targetKg - currentKg) : Math.max(0, currentKg - targetKg);

    const totalKg = Number.isFinite(startKg)
      ? direction === 'up'
        ? Math.max(0.0001, targetKg - startKg)
        : Math.max(0.0001, startKg - targetKg)
      : Math.max(0.0001, remainingKg);

    const progressedKg = Math.max(0, totalKg - remainingKg);
    const percent = Math.max(0, Math.min(100, Math.round((progressedKg / totalKg) * 100)));

    const pretty = (n) => Math.round(n * 10) / 10;
    const deltaKg = direction === 'up' ? targetKg - currentKg : currentKg - targetKg;
    const absDelta = Math.abs(deltaKg);

    let leftText = '';
    if (absDelta <= 0.05) {
      leftText = 'OBJETIVO ALCANZADO';
    } else if (direction === 'down') {
      if (goal.includes('perder')) leftText = `Te faltan ${pretty(absDelta)} kg para tu objetivo`;
      else leftText = `Aún quedan ${pretty(absDelta)} kg por bajar`;
    } else {
      if (goal.includes('ganar')) leftText = `Te faltan ${pretty(absDelta)} kg por ganar`;
      else leftText = `Aún quedan ${pretty(absDelta)} kg por subir`;
    }

    return { leftText, percent };
  };

  const getGoalStorageKey = () => {
    try {
      const raw = window.localStorage.getItem('fittrack_user');
      if (!raw) return 'fittrack_goal_progress';
      const u = JSON.parse(raw);
      return `fittrack_goal_progress:${u?.id || u?.email || 'anon'}`;
    } catch {
      return 'fittrack_goal_progress';
    }
  };

  const readGoalProgressState = () => {
    try {
      const raw = window.localStorage.getItem(getGoalStorageKey());
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeGoalProgressState = (state) => {
    try {
      window.localStorage.setItem(getGoalStorageKey(), JSON.stringify(state));
    } catch {
      // ignore
    }
  };

  const savePhysicalProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return false;
    }

    setPhysicalSaveError('');
    setPhysicalSaveSuccess('');
    setPhysicalSaving(true);
    try {
      const pesoKg = parseFirstNumber(physical.pesoActual.value);
      const alturaCm = parseFirstNumber(physical.altura.value);
      const targetKg = parseFirstNumber(physical.objetivos.pesoObjetivo);

      const payload = {
        peso_kg: Number.isFinite(parseFirstNumber(physical.pesoActual.value))
          ? Number(parseFirstNumber(physical.pesoActual.value))
          : undefined,
        altura_cm: Number.isFinite(parseFirstNumber(physical.altura.value))
          ? Number(parseFirstNumber(physical.altura.value))
          : undefined,
        nivel_actividad: physical.actividad.nivel || undefined,
        // Fallback naming used by some backends (MySQL uses nivel_experiencia)
        nivel_experiencia: physical.actividad.nivel || undefined,
        objetivo_principal: physical.objetivos.tipo || undefined,
        peso_objetivo_kg: Number.isFinite(parseFirstNumber(physical.objetivos.pesoObjetivo))
          ? Number(parseFirstNumber(physical.objetivos.pesoObjetivo))
          : undefined,
        fecha_objetivo: physical.objetivos.fecha || undefined,
        meta_semanal: physical.actividad.metaSemanal || undefined,
        actividad_preferida: physical.actividad.preferida || undefined,
        grasa_pct: Number.isFinite(parseFirstNumber(physical.grasa.value))
          ? Number(parseFirstNumber(physical.grasa.value))
          : undefined,
        masa_muscular_kg: Number.isFinite(parseFirstNumber(physical.masa.value))
          ? Number(parseFirstNumber(physical.masa.value))
          : undefined,
      };

      const res = await fetch(`${API_BASE}/users/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhysicalSaveError(data?.error || data?.message || t('No se pudieron guardar los datos.'));
        return false;
      }

      const userFromApi = data?.user || data?.data?.user || null;
      if (userFromApi) {
        try {
          window.localStorage.setItem('fittrack_user', JSON.stringify(userFromApi));
        } catch {
          // ignore
        }
      }

      const bmi = calcBmi(payload.peso_kg, payload.altura_cm);

      if (Number.isFinite(pesoKg) && Number.isFinite(targetKg)) {
        const prev = readGoalProgressState();
        const shouldResetStart = !prev || Number(prev?.targetKg) !== targetKg;
        const next = {
          targetKg,
          startKg: shouldResetStart ? pesoKg : Number(prev?.startKg),
          goalType: physical.objetivos.tipo || '',
        };
        writeGoalProgressState(next);
      }

      const progressState = readGoalProgressState();
      const progress = computeGoalProgress({
        currentKg: Number.isFinite(pesoKg) ? pesoKg : NaN,
        targetKg: Number.isFinite(targetKg) ? targetKg : NaN,
        goalType: physical.objetivos.tipo,
        startKg: Number(progressState?.startKg),
      });

      setPhysical((p) => ({
        ...p,
        imc: bmi,
        objetivos: {
          ...p.objetivos,
          progresoLeft: progress.leftText,
          progresoPercent: progress.percent,
        },
        ultimaActualizacion: fmtDate(new Date()),
      }));
      setPhysicalSaveSuccess(t('Datos guardados correctamente.'));
      return true;
    } catch (e) {
      setPhysicalSaveError(t('Error de conexión. Inténtalo de nuevo.'));
      return false;
    } finally {
      setPhysicalSaving(false);
    }
  };

  const liveGoalProgress = useMemo(() => {
    const currentKg = parseFirstNumber(physical.pesoActual.value);
    const targetKg = parseFirstNumber(physical.objetivos.pesoObjetivo);
    const prev = readGoalProgressState();
    const startKg =
      prev && Number(prev?.targetKg) === targetKg ? Number(prev?.startKg) : currentKg;
    return computeGoalProgress({
      currentKg,
      targetKg,
      goalType: physical.objetivos.tipo,
      startKg,
    });
  }, [physical.objetivos.pesoObjetivo, physical.objetivos.tipo, physical.pesoActual.value]);

  useEffect(() => {
    if (tab !== 'fisico') return;
    if (isEditingPhysical) return;

    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;
    setPhysicalError('');
    setPhysicalLoading(true);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) {
          setPhysicalError(data?.error || data?.message || t('No se pudieron cargar tus datos físicos.'));
          return;
        }

        const userFromApi = data?.user || data?.data?.user || null;
        if (userFromApi) {
          try {
            window.localStorage.setItem('fittrack_user', JSON.stringify(userFromApi));
          } catch {
            // ignore
          }
        }

        const source = userFromApi?.physicalProfile || userFromApi || {};
        const peso = source?.peso_kg ?? source?.pesoKg ?? '--';
        const altura = source?.altura_cm ?? source?.alturaCm ?? '--';
        const grasa = source?.grasa_pct ?? source?.grasa ?? source?.grasa_corporal ?? source?.body_fat ?? '--';
        const masa =
          source?.masa_muscular_kg ??
          source?.masa_muscular ??
          source?.muscle_mass ??
          '--';
        const actividad = source?.nivel_actividad ?? source?.nivel_experiencia ?? source?.nivelActividad ?? '--';
        const objetivo = source?.objetivo_principal ?? source?.objetivoPrincipal ?? '--';
        const pesoObjetivo = source?.peso_objetivo_kg ?? source?.peso_objetivo ?? '--';
        const fechaObjetivoIso = source?.fecha_objetivo ? toISODate(source.fecha_objetivo) : '';
        const metaSemanal = source?.meta_semanal ?? '--';
        const preferida = source?.actividad_preferida ?? '--';
        const last =
          userFromApi?.updatedAt ||
          userFromApi?.updated_at ||
          userFromApi?.createdAt ||
          userFromApi?.created_at ||
          '';

        const bmi = calcBmi(peso, altura);

        const currentKg = parseFirstNumber(peso);
        const targetKg = parseFirstNumber(pesoObjetivo);
        const prevProgress = readGoalProgressState();
        const startKg =
          prevProgress && Number(prevProgress?.targetKg) === targetKg
            ? Number(prevProgress?.startKg)
            : currentKg;
        if (Number.isFinite(currentKg) && Number.isFinite(targetKg)) {
          writeGoalProgressState({ targetKg, startKg, goalType: objetivo || '' });
        }

        const progress = computeGoalProgress({
          currentKg,
          targetKg,
          goalType: objetivo,
          startKg,
        });

	        setPhysical((p) => ({
	          ...p,
	          pesoActual: { ...p.pesoActual, value: peso === null || peso === undefined ? '--' : peso },
	          altura: { ...p.altura, value: altura === null || altura === undefined ? '--' : altura },
	          imc: bmi,
	          grasa: { ...p.grasa, value: grasa === null || grasa === undefined ? '--' : grasa },
	          masa: { ...p.masa, value: masa === null || masa === undefined ? '--' : masa },
	          ultimaActualizacion: fmtDate(last),
	          objetivos: {
	            ...p.objetivos,
	            tipo: objetivo || '',
	            pesoObjetivo: pesoObjetivo === null || pesoObjetivo === undefined ? '--' : pesoObjetivo,
	            fecha: fechaObjetivoIso || '',
	            progresoLeft: progress.leftText,
	            progresoPercent: progress.percent,
	          },
	          actividad: {
	            ...p.actividad,
	            nivel: actividad || '',
	            metaSemanal: metaSemanal || '',
	            preferida: preferida || '',
	          },
	        }));
      } catch (e) {
        if (!cancelled) setPhysicalError(t('Error de conexión. Inténtalo de nuevo.'));
      } finally {
        if (!cancelled) setPhysicalLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, isEditingPhysical, navigate, t, lang]);

  useEffect(() => {
    if (!showLogoutConfirm) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLogoutConfirm]);

  useEffect(() => {
    if (!showDeleteConfirm) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowDeleteConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showDeleteConfirm]);

  const confirmDeleteAccount = async () => {
    const token = getAuthToken();
    if (!token) return navigate('/login', { replace: true });

    setDeleteError('');
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data?.error || data?.message || t('No se pudo eliminar la cuenta.'));
        return;
      }

      // Clear local state and go to login.
      try {
        window.localStorage.removeItem('fittrack_token');
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('fittrack_user');
      } catch {
        // ignore
      }
      setShowDeleteConfirm(false);
      navigate('/login', { replace: true });
    } catch {
      setDeleteError(t('Error de conexión. Inténtalo de nuevo.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (tab === 'usuario') setIsEditingUser(true);
    else {
      setPhysicalSaveError('');
      setPhysicalSaveSuccess('');
      setIsEditingPhysical(true);
    }
  };

  const handleSave = async () => {
    if (tab === 'usuario') {
      const token = getAuthToken();
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setUserSaveError('');
      setUserSaveSuccess('');
      setUserSaving(true);
      try {
        const payload = {
          nombre: user.nombre,
          apodo: user.apodo,
          email: user.email,
          telefono: user.telefono,
          fecha_nacimiento: user.fecha_nacimiento || undefined,
          genero: user.genero || undefined,
        };
        const res = await fetch(`${API_BASE}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setUserSaveError(data?.error || data?.message || t('No se pudo guardar el perfil.'));
          return;
        }

        const u = data?.user || data?.data?.user;
        if (u) {
          try {
            window.localStorage.setItem('fittrack_user', JSON.stringify(u));
          } catch {
            // ignore
          }
          setUser({
            nombre: String(u?.nombre || ''),
            apodo: String(u?.apodo || ''),
            email: String(u?.email || ''),
            telefono: String(u?.telefono || ''),
            fecha_nacimiento: (() => {
              const raw = u?.fecha_nacimiento || u?.fechaNacimiento || '';
              const date = new Date(String(raw || ''));
              if (!Number.isFinite(date.getTime())) return '';
              const yyyy = String(date.getFullYear()).padStart(4, '0');
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
            })(),
            genero: String(u?.genero || ''),
          });
        }

        setUserSaveSuccess(t('Perfil actualizado.'));
        setIsEditingUser(false);
      } catch {
        setUserSaveError(t('Error de conexión. Inténtalo de nuevo.'));
      } finally {
        setUserSaving(false);
      }
      return;
    }

    const ok = await savePhysicalProfile();
    if (ok) setIsEditingPhysical(false);
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) return;
    setPhotoUploadError('');

    const token = getAuthToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Instant preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setPhotoDataUrl(previewUrl);

    setPhotoUploading(true);
    try {
      const publicId = `profile_${Date.now()}`;
      const sigRes = await fetch(
        `${API_BASE}/uploads/cloudinary-signature?public_id=${encodeURIComponent(publicId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sig = await sigRes.json().catch(() => ({}));
      if (!sigRes.ok) {
        console.error('[profile-photo] signature failed', {
          status: sigRes.status,
          body: sig,
        });
        setPhotoUploadError(t('Fallo al subir la foto. Inténtalo de nuevo más tarde.'));
        return;
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/image/upload`;
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('signature', sig.signature);
      if (sig.folder) form.append('folder', sig.folder);
      if (sig.publicId) form.append('public_id', sig.publicId);

      const upRes = await fetch(uploadUrl, { method: 'POST', body: form });
      const upData = await upRes.json().catch(() => ({}));
      if (!upRes.ok) {
        console.error('[profile-photo] cloudinary upload failed', {
          status: upRes.status,
          cloudName: sig.cloudName,
          publicId: sig.publicId,
          folder: sig.folder,
          body: upData,
        });
        setPhotoUploadError(t('Fallo al subir la foto. Inténtalo de nuevo más tarde.'));
        return;
      }

      const url = String(upData?.secure_url || upData?.url || '').trim();
      if (!url) {
        console.error('[profile-photo] cloudinary upload missing URL', {
          status: upRes.status,
          body: upData,
        });
        setPhotoUploadError(t('Fallo al subir la foto. Inténtalo de nuevo más tarde.'));
        return;
      }

      setPhotoDataUrl(url);

      // Persist in user profile so it can be reused anywhere.
      const saveRes = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photo_url: url }),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (saveRes.ok) {
        const u = saveData?.user || saveData?.data?.user;
        if (u) {
          try {
            window.localStorage.setItem('fittrack_user', JSON.stringify(u));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error(err);
      setPhotoUploadError(t('Fallo al subir la foto. Inténtalo de nuevo más tarde.'));
    } finally {
      // Allow selecting the same file again
      try {
        event.target.value = '';
      } catch {
        // ignore
      }
      // Cleanup preview object URL if it was used
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
        // ignore
      }
      setPhotoUploading(false);
    }
  };

  const doLogout = () => {
    try {
      window.localStorage.removeItem('fittrack_token');
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('fittrack_user');
    } catch {
      // ignore
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <TabButton active={tab === 'usuario'} onClick={() => setTab('usuario')}>
              {t('profile_user_tab').toUpperCase()}
            </TabButton>
            <TabButton active={tab === 'fisico'} onClick={() => setTab('fisico')}>
              {t('profile_physical_tab').toUpperCase()}
            </TabButton>
          </div>

          <div className="mt-10 sm:mt-12">
            <div className="flex items-start justify-between gap-4">
              <div
                className="text-[22px] sm:text-[26px] font-bold tracking-wide text-white/95"
                style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
              >
                {tab === 'usuario' ? t('profile_user_title').toUpperCase() : t('profile_physical_title').toUpperCase()}
              </div>

              {isEditing ? (
                <ActionButton variant="primary" onClick={handleSave}>
                  {t('profile_save').toUpperCase()}
                </ActionButton>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <ActionButton onClick={handleEditToggle}>{t('profile_edit').toUpperCase()}</ActionButton>
                  <ActionButton variant="danger" onClick={() => setShowLogoutConfirm(true)}>
                    {t('Cerrar sesión').toUpperCase()}
                  </ActionButton>
                </div>
              )}
            </div>

            {tab === 'usuario' ? (
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/35 bg-white/[0.02] p-5 sm:p-6">
                    <div className="mx-auto grid h-[170px] w-full place-items-center rounded-lg border border-white/35 bg-black/10">
                      {photoDataUrl ? (
                        <img
                          src={photoDataUrl}
                          alt={t('profile_photo')}
                          className="h-[140px] w-[140px] rounded-full object-cover border border-white/25"
                        />
                      ) : (
                        <span className="text-[64px] leading-none">👤</span>
                      )}
                    </div>
                    <div className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-white/35">
                      {t('profile_photo').toUpperCase()}
                    </div>
                  <div className="mt-3 flex justify-center">
                    <ActionButton onClick={handleChangePhotoClick}>
                      {photoUploading ? t('Subiendo...') : t('profile_change_photo').toUpperCase()}
                    </ActionButton>
                  </div>
                  {photoUploading ? (
                    <div className="mt-3 text-center text-[12px] text-white/55">{t('Guardando...')}</div>
                  ) : null}
                  {photoUploadError ? (
                    <div className="mt-3 text-center text-[12px] text-[#ff7849]/90">{photoUploadError}</div>
                  ) : null}
                    <div className="mt-6 text-center text-[10px] uppercase tracking-[0.25em] text-white/35">
                      {t('profile_language').toUpperCase()}
                    </div>
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={toggleLang}
                        className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-black/10 px-4 py-2 transition hover:border-white/60"
                        aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a español'}
                      >
                        <span className="text-[13px] font-bold tracking-[0.22em] text-white/85">
                          {lang === 'es' ? 'EN' : 'ES'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <Section title={t('profile_personal_data').toUpperCase()}>
                    {userLoading ? (
                      <div className="text-[13px] text-white/60">{t('Cargando...')}</div>
                    ) : userError ? (
                      <div className="text-[13px] text-[#ff7849]/90">{userError}</div>
                    ) : null}
                    {isEditingUser && userSaving ? (
                      <div className="mt-2 text-[13px] text-white/60">{t('Guardando...')}</div>
                    ) : null}
                    {isEditingUser && userSaveError ? (
                      <div className="mt-2 text-[13px] text-[#ff7849]/90">{userSaveError}</div>
                    ) : null}
                    {userSaveSuccess ? (
                      <div className="mt-2 text-[13px] text-emerald-300/90">{userSaveSuccess}</div>
                    ) : null}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <Label>{t('profile_name').toUpperCase()}</Label>
                        <Input value={user.nombre} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, nombre: e.target.value }))} />
                      </div>
                      <div>
                        <Label>{t('Apodo').toUpperCase()}</Label>
                        <Input
                          value={user.apodo}
                          readOnly={!isEditingUser}
                          onChange={(e) => setUser((p) => ({ ...p, apodo: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>{t('profile_birthdate').toUpperCase()}</Label>
                        <Input
                          value={user.fecha_nacimiento}
                          type="date"
                          readOnly={!isEditingUser}
                          onChange={(e) => setUser((p) => ({ ...p, fecha_nacimiento: e.target.value }))}
                          className={isEditingUser ? 'border-white/15 bg-[#1e1e1e] text-white/85 focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15' : ''}
                        />
                      </div>
                      <div>
                        <Label>{t('profile_gender').toUpperCase()}</Label>
                        {isEditingUser ? (
                          <Select
                            value={user.genero}
                            onChange={(e) => setUser((p) => ({ ...p, genero: e.target.value }))}
                          >
                            <option value="" disabled>
                              {t('Selecciona tu género')}
                            </option>
                            <option value="Masculino">{t('Masculino')}</option>
                            <option value="Femenino">{t('Femenino')}</option>
                            <option value="Otro">{t('Otro')}</option>
                          </Select>
                        ) : (
                          <Input value={user.genero || '--'} readOnly />
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Label>{t('profile_email').toUpperCase()}</Label>
                        <Input value={user.email} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))} type="email" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>{t('profile_phone').toUpperCase()}</Label>
                        <Input
                          value={user.telefono}
                          readOnly={!isEditingUser}
                          onChange={(e) => setUser((p) => ({ ...p, telefono: e.target.value }))}
                        />
                      </div>
                    </div>
                  </Section>

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-center text-[12px] font-bold tracking-wide text-white/80">
                      {t('profile_account_config').toUpperCase()}
                    </div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                    <ActionButton onClick={() => navigate('/password-recovery')}>{t('profile_change_password').toUpperCase()}</ActionButton>
                    <ActionButton onClick={() => navigate('/privacy-settings')}>{t('profile_privacy_settings').toUpperCase()}</ActionButton>
                    <ActionButton variant="danger" onClick={() => { setDeleteError(''); setShowDeleteConfirm(true); }}>
                      {t('profile_delete_account').toUpperCase()}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('physical_current_metrics').toUpperCase()}>
                  {physicalLoading ? (
                    <div className="text-[13px] text-white/60">{t('Cargando...')}</div>
                  ) : physicalError ? (
                    <div className="text-[13px] text-[#ff7849]/90">{physicalError}</div>
                  ) : null}
                  {isEditingPhysical && physicalSaving ? (
                    <div className="mt-2 text-[13px] text-white/60">{t('Guardando...')}</div>
                  ) : null}
                  {isEditingPhysical && physicalSaveError ? (
                    <div className="mt-2 text-[13px] text-[#ff7849]/90">{physicalSaveError}</div>
                  ) : null}
                  {isEditingPhysical && physicalSaveSuccess ? (
                    <div className="mt-2 text-[13px] text-emerald-300/90">{physicalSaveSuccess}</div>
                  ) : null}
                  {privacy.hidePhysicalProfile ? (
                    <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-4 text-[13px] text-white/65">
                      <div className="font-semibold text-white/80">{t('Perfil físico oculto')}</div>
                      <div className="mt-1">{t('Puedes cambiar esta opción en Configuración de privacidad.')}</div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => navigate('/privacy-settings')}
                          className="h-10 rounded-lg border border-white/15 bg-white/[0.02] px-4 text-[12px] font-bold tracking-wide text-white/80 transition hover:border-white/25 hover:bg-white/[0.03]"
                        >
                          {t('Abrir privacidad').toUpperCase()}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/35 bg-black/10 p-5 text-center">
                          <Label>{t('physical_weight').toUpperCase()}</Label>
                          {isEditingPhysical ? (
                            <input
                              value={physical.pesoActual.value}
                              onChange={(e) =>
                                setPhysical((p) => ({
                                  ...p,
                                  pesoActual: { ...p.pesoActual, value: e.target.value },
                                }))
                              }
                              className="mt-4 w-full bg-transparent text-center text-[28px] font-bold text-white/95 outline-none"
                              inputMode="decimal"
                            />
                          ) : (
                            <div className="mt-4 text-[28px] font-bold text-white/95">{physical.pesoActual.value}</div>
                          )}
                          <div className="text-[11px] tracking-wide text-white/40">{physical.pesoActual.unit}</div>
                        </div>
                        <div className="rounded-xl border border-white/35 bg-black/10 p-5 text-center">
                          <Label>{t('physical_height').toUpperCase()}</Label>
                          {isEditingPhysical ? (
                            <input
                              value={physical.altura.value}
                              onChange={(e) =>
                                setPhysical((p) => ({
                                  ...p,
                                  altura: { ...p.altura, value: e.target.value },
                                }))
                              }
                              className="mt-4 w-full bg-transparent text-center text-[28px] font-bold text-white/95 outline-none"
                              inputMode="numeric"
                            />
                          ) : (
                            <div className="mt-4 text-[28px] font-bold text-white/95">{physical.altura.value}</div>
                          )}
                          <div className="text-[11px] tracking-wide text-white/40">{physical.altura.unit}</div>
                        </div>
                      </div>

                  <div className="mt-6 rounded-xl border border-white/35 bg-black/10 p-5">
                    <Label>{t('physical_bmi').toUpperCase()}</Label>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="text-[26px] font-bold text-white/95">{physical.imc.value}</div>
                      <div className="rounded-md border border-white/35 bg-black/20 px-3 py-1 text-[10px] font-bold tracking-wide text-white/90">
                        {physical.imc.badge}
                      </div>
                    </div>
                    <ProgressBar percent={physical.imc.percent} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/35 bg-black/10 p-5 text-center">
                      <Label>{t('physical_body_fat').toUpperCase()}</Label>
                      {isEditingPhysical ? (
                        <input
                          value={physical.grasa.value}
                          onChange={(e) =>
                            setPhysical((p) => ({ ...p, grasa: { ...p.grasa, value: e.target.value } }))
                          }
                          className="mt-4 w-full bg-transparent text-center text-[28px] font-bold text-white/95 outline-none"
                          inputMode="decimal"
                        />
                      ) : (
                        <div className="mt-4 text-[28px] font-bold text-white/95">{physical.grasa.value}</div>
                      )}
                      <div className="text-[11px] tracking-wide text-white/40">{physical.grasa.unit}</div>
                    </div>
                    <div className="rounded-xl border border-white/35 bg-black/10 p-5 text-center">
                      <Label>{t('physical_muscle_mass').toUpperCase()}</Label>
                      {isEditingPhysical ? (
                        <input
                          value={physical.masa.value}
                          onChange={(e) =>
                            setPhysical((p) => ({ ...p, masa: { ...p.masa, value: e.target.value } }))
                          }
                          className="mt-4 w-full bg-transparent text-center text-[28px] font-bold text-white/95 outline-none"
                          inputMode="decimal"
                        />
                      ) : (
                        <div className="mt-4 text-[28px] font-bold text-white/95">{physical.masa.value}</div>
                      )}
                      <div className="text-[11px] tracking-wide text-white/40">{physical.masa.unit}</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/15 bg-[#1e1e1e] px-4 py-4 text-[12px] text-white/65">
                    <div className="font-semibold text-white/80">{t('Recordatorio')}</div>
                    <div className="mt-1">
                      {t('Los valores de % de grasa y masa muscular deben ser medidos por ti (báscula de impedancia, pliegues, etc.) y guardados aquí para llevar un mejor control de tus entrenamientos.')}
                    </div>
                  </div>

                      <div className="mt-8 text-[10px] uppercase tracking-[0.25em] text-white/35">
                        {t('physical_last_update').toUpperCase()}: {physical.ultimaActualizacion || '--'}
                      </div>
                    </>
                  )}
                </Section>

                <div className="space-y-6">
                  <Section title={t('physical_goals').toUpperCase()}>
                    {privacy.hidePhysicalProfile ? (
                      <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-4 text-[13px] text-white/65">
                        <div className="font-semibold text-white/80">{t('Perfil físico oculto')}</div>
                        <div className="mt-1">{t('Puedes cambiar esta opción en Configuración de privacidad.')}</div>
                      </div>
                    ) : (
                    <div className="space-y-5">
	                      <div>
	                        <Label>{t('physical_target_weight').toUpperCase()}</Label>
                        <Input
                          value={physical.objetivos.pesoObjetivo}
                          readOnly={!isEditingPhysical}
                          onChange={(e) =>
                            setPhysical((p) => ({
                              ...p,
                              objetivos: { ...p.objetivos, pesoObjetivo: e.target.value },
                            }))
                          }
                        />
                      </div>
	                      <div>
	                        <Label>{t('physical_goal_type').toUpperCase()}</Label>
	                        {isEditingPhysical ? (
	                          <Select
	                            value={physical.objetivos.tipo}
	                            onChange={(e) =>
	                              setPhysical((p) => ({
	                                ...p,
	                                objetivos: { ...p.objetivos, tipo: e.target.value },
	                              }))
	                            }
	                          >
	                            <option value="" disabled>
	                              {t('Selecciona tu objetivo')}
	                            </option>
	                            <option value="Perder peso">{t('Perder peso')}</option>
	                            <option value="Ganar músculo">{t('Ganar músculo')}</option>
	                            <option value="Mejorar resistencia">{t('Mejorar resistencia')}</option>
	                            <option value="Mantenerme saludable">{t('Mantenerme saludable')}</option>
	                          </Select>
	                        ) : (
	                          <Input value={physical.objetivos.tipo || '--'} readOnly />
	                        )}
	                      </div>
	                      <div>
	                        <Label>{t('physical_progress').toUpperCase()}</Label>
	                        <div className="mt-2 rounded-xl border border-white/35 bg-black/10 px-5 py-4">
	                          <div className="flex items-center justify-between text-[10px] font-bold tracking-wide text-white/80">
	                            <span>{liveGoalProgress.leftText}</span>
	                            <span>{liveGoalProgress.percent}%</span>
	                          </div>
	                          <ProgressBar percent={liveGoalProgress.percent} />
	                        </div>
	                      </div>
	                      <div>
	                        <Label>{t('physical_goal_date').toUpperCase()}</Label>
	                        {isEditingPhysical ? (
	                          <Input
	                            value={physical.objetivos.fecha}
	                            type="date"
	                            readOnly={false}
	                            className="border-white/15 bg-[#1e1e1e] text-white/85 focus:border-[#ff7849]/70 focus:ring-2 focus:ring-[#ff7849]/15"
	                            onChange={(e) =>
	                              setPhysical((p) => ({
	                                ...p,
	                                objetivos: { ...p.objetivos, fecha: e.target.value },
	                              }))
	                            }
	                          />
	                        ) : (
	                          <Input value={formatISODateForDisplay(physical.objetivos.fecha) || '--'} readOnly />
	                        )}
	                      </div>
                    </div>
                    )}
                  </Section>

                  <Section title={t('physical_activity_level').toUpperCase()}>
                    {privacy.hidePhysicalProfile ? (
                      <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-4 text-[13px] text-white/65">
                        <div className="font-semibold text-white/80">{t('Perfil físico oculto')}</div>
                        <div className="mt-1">{t('Puedes cambiar esta opción en Configuración de privacidad.')}</div>
                      </div>
                    ) : (
                    <div className="space-y-5">
	                      <div>
	                        <Label>{t('physical_current_level').toUpperCase()}</Label>
	                        {isEditingPhysical ? (
	                          <Select
	                            value={physical.actividad.nivel}
	                            onChange={(e) =>
	                              setPhysical((p) => ({
	                                ...p,
	                                actividad: { ...p.actividad, nivel: e.target.value },
	                              }))
	                            }
	                          >
	                            <option value="" disabled>
	                              {t('Selecciona tu nivel')}
	                            </option>
	                            <option value="Principiante">{t('Principiante')}</option>
	                            <option value="Intermedio">{t('Intermedio')}</option>
	                            <option value="Avanzado">{t('Avanzado')}</option>
	                          </Select>
	                        ) : (
	                          <Input value={physical.actividad.nivel || '--'} readOnly />
	                        )}
	                      </div>
	                      <div>
	                        <Label>{t('physical_weekly_goal').toUpperCase()}</Label>
	                        {isEditingPhysical ? (
	                          <Select
	                            value={physical.actividad.metaSemanal}
	                            onChange={(e) =>
	                              setPhysical((p) => ({
	                                ...p,
	                                actividad: { ...p.actividad, metaSemanal: e.target.value },
	                              }))
	                            }
	                          >
	                            <option value="" disabled>
	                              {t('Selecciona una meta')}
	                            </option>
	                            <option value="1–2 entrenamientos">{t('1–2 entrenamientos')}</option>
	                            <option value="3–4 entrenamientos">{t('3–4 entrenamientos')}</option>
	                            <option value="4–5 entrenamientos">{t('4–5 entrenamientos')}</option>
	                            <option value="6+ entrenamientos">{t('6+ entrenamientos')}</option>
	                          </Select>
	                        ) : (
	                          <Input value={physical.actividad.metaSemanal || '--'} readOnly />
	                        )}
	                      </div>
	                      <div>
	                        <Label>{t('physical_preferred_activity').toUpperCase()}</Label>
	                        {isEditingPhysical ? (
	                          <Select
	                            value={physical.actividad.preferida}
	                            onChange={(e) =>
	                              setPhysical((p) => ({
	                                ...p,
	                                actividad: { ...p.actividad, preferida: e.target.value },
	                              }))
	                            }
	                          >
	                            <option value="" disabled>
	                              {t('Selecciona una actividad')}
	                            </option>
	                            <option value="Gimnasio">{t('Gimnasio')}</option>
	                            <option value="Cardio">{t('Cardio')}</option>
	                            <option value="HIIT">{t('HIIT')}</option>
	                            <option value="Calistenia">{t('Calistenia')}</option>
	                            <option value="Yoga / Movilidad">{t('Yoga / Movilidad')}</option>
	                            <option value="Outdoor">{t('Outdoor')}</option>
	                            <option value="Mixto">{t('Mixto')}</option>
	                          </Select>
	                        ) : (
	                          <Input value={physical.actividad.preferida || '--'} readOnly />
	                        )}
	                      </div>
                    </div>
                    )}
                  </Section>
                </div>

                <div className="lg:col-span-2 pt-4 border-t border-white/10">
                  <div className="text-center text-[10px] uppercase tracking-[0.25em] text-white/35">
                    {t('physical_history_stats').toUpperCase()}
                  </div>
	                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
	                    <ActionButton onClick={() => navigate('/evolucion-peso')}>{t('physical_see_weight').toUpperCase()}</ActionButton>
	                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label={t('Cerrar')}
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-[520px] rounded-2xl border border-white/15 bg-[#121212] p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
            <div
              className="text-[18px] font-bold tracking-wide text-white/95"
              style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
            >
              {t('¿Seguro que quieres cerrar sesión?')}
            </div>
            <div className="mt-2 text-[13px] text-white/60">
              {t('Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.')}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton onClick={() => setShowLogoutConfirm(false)}>
                {t('Cancelar').toUpperCase()}
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  doLogout();
                }}
              >
                {t('Cerrar sesión').toUpperCase()}
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label={t('Cerrar')}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-[560px] rounded-2xl border border-red-500/20 bg-[#121212] p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
            <div
              className="text-[18px] font-bold tracking-wide text-white/95"
              style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
            >
              {t('Eliminar cuenta').toUpperCase()}
            </div>
            <div className="mt-2 text-[13px] text-white/65">
              {t('Esta acción elimina todos tus datos y no es reversible.')}
            </div>
            <div className="mt-3 text-[12px] text-white/55">
              {t('Se eliminarán tus sesiones, registros de peso y perfil.')}
            </div>

            {deleteError ? (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-200">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton onClick={() => setShowDeleteConfirm(false)}>
                {t('Cancelar').toUpperCase()}
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={confirmDeleteAccount}
              >
                {deleteLoading ? t('Eliminando...') : t('Confirmar eliminación')}
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
