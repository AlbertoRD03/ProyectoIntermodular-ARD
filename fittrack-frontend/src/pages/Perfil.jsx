import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n } from '../i18n/I18nProvider';

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

function Input({ value, onChange, placeholder, readOnly = true, type = 'text' }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      readOnly={readOnly}
      type={type}
      className="mt-2 h-[44px] w-full rounded-lg border border-white/35 bg-transparent px-4 text-[13px] text-white/85 outline-none"
    />
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
  const fileInputRef = useRef(null);

  const [photoDataUrl, setPhotoDataUrl] = useState(() => {
    try {
      return window.localStorage.getItem('fittrack_profile_photo') || '';
    } catch {
      return '';
    }
  });

  const [user, setUser] = useState(() => {
    // Mock UI based on `views/Perfil.png` (with localStorage persistence)
    const defaults = {
      nombre: 'Carlos',
      apellidos: 'Fernández García',
      email: 'carlos.fernandez@email.com',
      nacimiento: '15/03/1990',
      genero: 'Masculino',
      telefono: '+34 612 345 678',
      ciudad: 'Madrid',
      pais: 'España',
    };
    try {
      const stored = window.localStorage.getItem('fittrack_user_profile');
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  const [physical, setPhysical] = useState(() => {
    // Mock UI based on `views/PhysicalProfileScreen.png` (with localStorage persistence)
    const defaults = {
      pesoActual: { value: 78, unit: 'KG' },
      altura: { value: 175, unit: 'CM' },
      imc: { value: 25.4, badge: 'NORMAL', percent: 55 },
      grasa: { value: 18, unit: '%' },
      masa: { value: 64, unit: 'KG' },
      ultimaActualizacion: '20/01/2026',
      objetivos: {
        pesoObjetivo: '75 KG',
        tipo: 'PÉRDIDA DE PESO',
        progresoLeft: '3 KG RESTANTES',
        progresoPercent: 50,
        fecha: '30/03/2026',
      },
      actividad: {
        nivel: 'MODERADO',
        metaSemanal: '4–5 ENTRENAMIENTOS',
        preferida: 'GIMNASIO + CARDIO',
      },
    };
    try {
      const stored = window.localStorage.getItem('fittrack_physical_profile');
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('fittrack_user_profile', JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      window.localStorage.setItem('fittrack_physical_profile', JSON.stringify(physical));
    } catch {
      // ignore
    }
  }, [physical]);

  useEffect(() => {
    try {
      window.localStorage.setItem('fittrack_profile_photo', photoDataUrl || '');
    } catch {
      // ignore
    }
  }, [photoDataUrl]);

  const isEditing = tab === 'usuario' ? isEditingUser : isEditingPhysical;

  useEffect(() => {
    if (!showLogoutConfirm) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLogoutConfirm]);

  const handleEditToggle = () => {
    if (tab === 'usuario') setIsEditingUser(true);
    else setIsEditingPhysical(true);
  };

  const handleSave = () => {
    if (tab === 'usuario') setIsEditingUser(false);
    else setIsEditingPhysical(false);
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
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
                      <ActionButton onClick={handleChangePhotoClick}>{t('profile_change_photo').toUpperCase()}</ActionButton>
                    </div>
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
                        <span className="text-[30px] leading-none">{lang === 'es' ? '🇬🇧' : '🇪🇸'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <Section title={t('profile_personal_data').toUpperCase()}>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <Label>{t('profile_name').toUpperCase()}</Label>
                        <Input value={user.nombre} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, nombre: e.target.value }))} />
                      </div>
                      <div>
                        <Label>{t('profile_lastname').toUpperCase()}</Label>
                        <Input
                          value={user.apellidos}
                          readOnly={!isEditingUser}
                          onChange={(e) => setUser((p) => ({ ...p, apellidos: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>{t('profile_email').toUpperCase()}</Label>
                        <Input value={user.email} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))} type="email" />
                      </div>
                      <div>
                        <Label>{t('profile_birthdate').toUpperCase()}</Label>
                        <Input
                          value={user.nacimiento}
                          readOnly={!isEditingUser}
                          onChange={(e) => setUser((p) => ({ ...p, nacimiento: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>{t('profile_gender').toUpperCase()}</Label>
                        <Input value={user.genero} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, genero: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>{t('profile_phone').toUpperCase()}</Label>
                        <Input
                          value={user.telefono}
                          readOnly={!isEditingUser}
                          onChange={(e) => setUser((p) => ({ ...p, telefono: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>{t('profile_city').toUpperCase()}</Label>
                        <Input value={user.ciudad} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, ciudad: e.target.value }))} />
                      </div>
                      <div>
                        <Label>{t('profile_country').toUpperCase()}</Label>
                        <Input value={user.pais} readOnly={!isEditingUser} onChange={(e) => setUser((p) => ({ ...p, pais: e.target.value }))} />
                      </div>
                    </div>
                  </Section>

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-center text-[12px] font-bold tracking-wide text-white/80">
                      {t('profile_account_config').toUpperCase()}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                      <ActionButton>{t('profile_change_password').toUpperCase()}</ActionButton>
                      <ActionButton>{t('profile_privacy_settings').toUpperCase()}</ActionButton>
                      <ActionButton variant="danger">{t('profile_delete_account').toUpperCase()}</ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('physical_current_metrics').toUpperCase()}>
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
                        <div className="mt-4 text-[28px] font-bold text-white/95">
                          {physical.pesoActual.value}
                        </div>
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
                        <div className="mt-4 text-[28px] font-bold text-white/95">
                          {physical.altura.value}
                        </div>
                      )}
                      <div className="text-[11px] tracking-wide text-white/40">{physical.altura.unit}</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/35 bg-black/10 p-5">
                    <Label>{t('physical_bmi').toUpperCase()}</Label>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      {isEditingPhysical ? (
                        <input
                          value={physical.imc.value}
                          onChange={(e) =>
                            setPhysical((p) => ({ ...p, imc: { ...p.imc, value: e.target.value } }))
                          }
                          className="w-[120px] bg-transparent text-[26px] font-bold text-white/95 outline-none"
                          inputMode="decimal"
                        />
                      ) : (
                        <div className="text-[26px] font-bold text-white/95">{physical.imc.value}</div>
                      )}
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
                        <div className="mt-4 text-[28px] font-bold text-white/95">
                          {physical.grasa.value}
                        </div>
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
                        <div className="mt-4 text-[28px] font-bold text-white/95">
                          {physical.masa.value}
                        </div>
                      )}
                      <div className="text-[11px] tracking-wide text-white/40">{physical.masa.unit}</div>
                    </div>
                  </div>

                  <div className="mt-8 text-[10px] uppercase tracking-[0.25em] text-white/35">
                    {t('physical_last_update').toUpperCase()}: {physical.ultimaActualizacion}
                  </div>
                </Section>

                <div className="space-y-6">
                  <Section title={t('physical_goals').toUpperCase()}>
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
                        <Input
                          value={physical.objetivos.tipo}
                          readOnly={!isEditingPhysical}
                          onChange={(e) =>
                            setPhysical((p) => ({
                              ...p,
                              objetivos: { ...p.objetivos, tipo: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>{t('physical_progress').toUpperCase()}</Label>
                        <div className="mt-2 rounded-xl border border-white/35 bg-black/10 px-5 py-4">
                          <div className="flex items-center justify-between text-[10px] font-bold tracking-wide text-white/80">
                            <span>{physical.objetivos.progresoLeft}</span>
                            <span>{physical.objetivos.progresoPercent}%</span>
                          </div>
                          <ProgressBar percent={physical.objetivos.progresoPercent} />
                        </div>
                      </div>
                      <div>
                        <Label>{t('physical_goal_date').toUpperCase()}</Label>
                        <Input
                          value={physical.objetivos.fecha}
                          readOnly={!isEditingPhysical}
                          onChange={(e) =>
                            setPhysical((p) => ({
                              ...p,
                              objetivos: { ...p.objetivos, fecha: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </Section>

                  <Section title={t('physical_activity_level').toUpperCase()}>
                    <div className="space-y-5">
                      <div>
                        <Label>{t('physical_current_level').toUpperCase()}</Label>
                        <Input
                          value={physical.actividad.nivel}
                          readOnly={!isEditingPhysical}
                          onChange={(e) =>
                            setPhysical((p) => ({ ...p, actividad: { ...p.actividad, nivel: e.target.value } }))
                          }
                        />
                      </div>
                      <div>
                        <Label>{t('physical_weekly_goal').toUpperCase()}</Label>
                        <Input
                          value={physical.actividad.metaSemanal}
                          readOnly={!isEditingPhysical}
                          onChange={(e) =>
                            setPhysical((p) => ({
                              ...p,
                              actividad: { ...p.actividad, metaSemanal: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>{t('physical_preferred_activity').toUpperCase()}</Label>
                        <Input
                          value={physical.actividad.preferida}
                          readOnly={!isEditingPhysical}
                          onChange={(e) =>
                            setPhysical((p) => ({
                              ...p,
                              actividad: { ...p.actividad, preferida: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </Section>
                </div>

                <div className="lg:col-span-2 pt-4 border-t border-white/10">
                  <div className="text-center text-[10px] uppercase tracking-[0.25em] text-white/35">
                    {t('physical_history_stats').toUpperCase()}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                    <ActionButton>{t('physical_see_weight').toUpperCase()}</ActionButton>
                    <ActionButton>{t('physical_measures_history').toUpperCase()}</ActionButton>
                    <ActionButton variant="primary">{t('physical_new_measure').toUpperCase()}</ActionButton>
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
    </div>
  );
}
