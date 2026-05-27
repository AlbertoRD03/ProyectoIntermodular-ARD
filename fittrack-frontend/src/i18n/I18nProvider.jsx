import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'fittrack_lang';

const translations = {
  es: {
    welcome: 'Bienvenido',
    nav_home: 'Inicio',
    nav_calendar: 'Calendario',
    nav_calendar_calendar: 'Calendario',
    nav_calendar_workouts: 'Entrenamientos',
    nav_fitgram: 'FitGram',
    nav_achievements: 'Logros',
    nav_ai_chat: 'Chat IA',
    nav_profile: 'Perfil',

    profile_user_tab: 'Usuario',
    profile_physical_tab: 'Mi perfil físico',
    profile_edit: 'Editar perfil',
    profile_save: 'Guardar datos',
    profile_photo: 'Foto de perfil',
    profile_change_photo: 'Cambiar foto',
    profile_language: 'Idioma',
    profile_user_title: 'Mi perfil de usuario',
    profile_physical_title: 'Mi perfil físico',
    profile_personal_data: 'Datos personales',
    profile_account_config: 'Configuración de cuenta',
    profile_change_password: 'Cambiar contraseña',
    profile_privacy_settings: 'Configuración de privacidad',
    profile_delete_account: 'Eliminar cuenta',

    profile_name: 'Nombre',
    profile_lastname: 'Apellidos',
    profile_email: 'Email',
    profile_birthdate: 'Fecha de nacimiento',
    profile_gender: 'Género',
    profile_phone: 'Teléfono',
    profile_city: 'Ciudad',
    profile_country: 'País',

    physical_current_metrics: 'Métricas actuales',
    physical_weight: 'Peso actual',
    physical_height: 'Altura',
    physical_bmi: 'IMC',
    physical_body_fat: 'Grasa corporal',
    physical_muscle_mass: 'Masa muscular',
    physical_last_update: 'Última actualización',
    physical_goals: 'Objetivos',
    physical_target_weight: 'Peso objetivo',
    physical_goal_type: 'Tipo de objetivo',
    physical_progress: 'Progreso',
    physical_goal_date: 'Fecha objetivo',
    physical_activity_level: 'Nivel de actividad',
    physical_current_level: 'Nivel actual',
    physical_weekly_goal: 'Meta semanal',
    physical_preferred_activity: 'Actividad preferida',
    physical_history_stats: 'Historial y estadísticas',
    physical_see_weight: 'Ver evolución de peso',
    physical_measures_history: 'Historial de medidas',
    physical_new_measure: 'Registrar nueva medida',

    ach_tab_my: 'Mis logros',
    ach_tab_fitgram: 'Logros de FitGram',
    ach_tab_create: 'Crear logro',
    ach_summary_completed: 'Logros completados',
    ach_summary_in_progress: 'En progreso',
    ach_summary_total: 'Logros totales',
    ach_progress: 'Progreso',
    ach_empty_title: 'No has conseguido logros aún',
    ach_empty_subtitle: 'Empieza a entrenar y completar retos para desbloquear logros.',
    ach_empty_first: 'Primeros logros para desbloquear',
    ach_empty_view_fitgram: 'Ver logros de FitGram',
    ach_empty_register: 'Registrar entrenamiento',
    ach_create_title: 'Crear nuevo logro',
    ach_create_subtitle: 'Define tu propio objetivo personalizado y conviértelo en logro',
    ach_create_goal_title: 'Título del logro*',
    ach_create_type: 'Tipo de logro*',
    ach_create_desc: 'Descripción del objetivo*',
    ach_create_numeric: 'Meta numérica (opcional)',
    ach_create_target: 'Valor objetivo',
    ach_create_unit: 'Unidad',
    ach_cancel: 'Cancelar',
    ach_create: 'Crear logro',

    fitia_title: 'FitIA',
    fitia_subtitle: 'Chat con IA para ayudarte con entrenamientos y nutrición',
    fitia_placeholder: 'Escribe tu mensaje…',
    fitia_send: 'Enviar',
    fitia_clear: 'Borrar chat',
    fitia_disclaimer: 'Consejo orientativo. No sustituye a un profesional de la salud.',
    fitia_empty_hint: 'Escribe un mensaje para empezar.',
    fitia_typing: 'FitIA está escribiendo…',
    fitia_suggestions: 'Sugerencias',
    fitia_integration_title: 'Integración',
    fitia_integration_body: 'Esta pantalla está lista para conectar con tu backend/IA. Sustituye el servicio de `src/services/fitiaClient.js` por una llamada real.',
  },
  en: {
    welcome: 'Welcome',
    nav_home: 'Home',
    nav_calendar: 'Calendar',
    nav_calendar_calendar: 'Calendar',
    nav_calendar_workouts: 'Workouts',
    nav_fitgram: 'FitGram',
    nav_achievements: 'Achievements',
    nav_ai_chat: 'AI Chat',
    nav_profile: 'Profile',

    profile_user_tab: 'User',
    profile_physical_tab: 'My physical profile',
    profile_edit: 'Edit profile',
    profile_save: 'Save',
    profile_photo: 'Profile photo',
    profile_change_photo: 'Change photo',
    profile_language: 'Language',
    profile_user_title: 'My user profile',
    profile_physical_title: 'My physical profile',
    profile_personal_data: 'Personal data',
    profile_account_config: 'Account settings',
    profile_change_password: 'Change password',
    profile_privacy_settings: 'Privacy settings',
    profile_delete_account: 'Delete account',

    profile_name: 'Name',
    profile_lastname: 'Last name',
    profile_email: 'Email',
    profile_birthdate: 'Date of birth',
    profile_gender: 'Gender',
    profile_phone: 'Phone',
    profile_city: 'City',
    profile_country: 'Country',

    physical_current_metrics: 'Current metrics',
    physical_weight: 'Current weight',
    physical_height: 'Height',
    physical_bmi: 'BMI',
    physical_body_fat: 'Body fat',
    physical_muscle_mass: 'Muscle mass',
    physical_last_update: 'Last update',
    physical_goals: 'Goals',
    physical_target_weight: 'Target weight',
    physical_goal_type: 'Goal type',
    physical_progress: 'Progress',
    physical_goal_date: 'Target date',
    physical_activity_level: 'Activity level',
    physical_current_level: 'Current level',
    physical_weekly_goal: 'Weekly goal',
    physical_preferred_activity: 'Preferred activity',
    physical_history_stats: 'History & stats',
    physical_see_weight: 'See weight progress',
    physical_measures_history: 'Measurements history',
    physical_new_measure: 'Add new measurement',

    ach_tab_my: 'My achievements',
    ach_tab_fitgram: 'FitGram achievements',
    ach_tab_create: 'Create achievement',
    ach_summary_completed: 'Completed',
    ach_summary_in_progress: 'In progress',
    ach_summary_total: 'Total',
    ach_progress: 'Progress',
    ach_empty_title: "You don't have achievements yet",
    ach_empty_subtitle: 'Start training and completing challenges to unlock achievements.',
    ach_empty_first: 'First achievements to unlock',
    ach_empty_view_fitgram: 'See FitGram achievements',
    ach_empty_register: 'Log workout',
    ach_create_title: 'Create new achievement',
    ach_create_subtitle: 'Define a custom goal and turn it into an achievement',
    ach_create_goal_title: 'Achievement title*',
    ach_create_type: 'Achievement type*',
    ach_create_desc: 'Goal description*',
    ach_create_numeric: 'Numeric goal (optional)',
    ach_create_target: 'Target value',
    ach_create_unit: 'Unit',
    ach_cancel: 'Cancel',
    ach_create: 'Create achievement',

    fitia_title: 'FitIA',
    fitia_subtitle: 'AI chat to help with training and nutrition',
    fitia_placeholder: 'Type your message…',
    fitia_send: 'Send',
    fitia_clear: 'Clear chat',
    fitia_disclaimer: 'General guidance only. Not medical advice.',
    fitia_empty_hint: 'Type a message to get started.',
    fitia_typing: 'FitIA is typing…',
    fitia_suggestions: 'Suggestions',
    fitia_integration_title: 'Integration',
    fitia_integration_body: 'This screen is ready to connect to your backend/AI. Replace `src/services/fitiaClient.js` with a real API call.',

    // Login / auth common (Spanish-literal keys)
    'Registro': 'Sign up',
    'Bienvenido a': 'Welcome to',
    'Inicia sesión para continuar': 'Sign in to continue',
    'Email': 'Email',
    'Contraseña': 'Password',
    'Ocultar contraseña': 'Hide password',
    'Mostrar contraseña': 'Show password',
    'Cargando...': 'Loading...',
    'Iniciar sesión': 'Log in',
    'Continuar con Google': 'Continue with Google',
    '¿No tienes cuenta?': "Don't have an account?",
    'Regístrate': 'Sign up',
    'He olvidado mi contraseña': 'Forgot my password',
    'No se pudo iniciar sesión.': 'Could not sign in.',
    'Error de conexión. Inténtalo de nuevo.': 'Connection error. Please try again.',
    'Completa todos los campos obligatorios.': 'Fill in all required fields.',
    'Las contraseñas no coinciden.': "Passwords don't match.",
    'Debes aceptar los términos y condiciones.': 'You must accept the terms and conditions.',
    'No se pudo crear la cuenta.': 'Could not create the account.',
    'Cuenta creada. Ahora puedes iniciar sesión.': 'Account created. You can now sign in.',
    'Crear cuenta': 'Create account',
    'Únete a FitTrack y comienza tu transformación': 'Join FitTrack and start your transformation',
    'Nombre completo': 'Full name',
    'Apodo': 'Nickname',
    'Teléfono': 'Phone',
    'Repetir contraseña': 'Repeat password',
    'Acepto los': 'I accept the',
    'términos y condiciones': 'terms and conditions',
    'y la': 'and the',
    'política de privacidad': 'privacy policy',
    'Enlaza aquí tus términos y condiciones.': 'Link your terms and conditions here.',
    'Enlaza aquí tu política de privacidad.': 'Link your privacy policy here.',
    'Creando...': 'Creating...',
    'No se pudo completar la operación.': 'Could not complete the operation.',
    'Si el email existe, te enviaremos un enlace de recuperación.': "If the email exists, we'll send you a recovery link.",
    'Recuperar contraseña': 'Recover password',
    'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña': "Enter your email and we'll send you a link to reset your password.",
    'Enviando...': 'Sending...',
    'Enviar enlace de recuperación': 'Send recovery link',
    'Volver al inicio de sesión': 'Back to sign in',
    'Restablecer contraseña': 'Reset password',
    'Crea una nueva contraseña para tu cuenta': 'Create a new password for your account',
    'Nueva contraseña': 'New password',
    'El enlace no es válido o ha expirado.': 'The link is invalid or has expired.',
    'Completa ambos campos.': 'Fill in both fields.',
    'No se pudo actualizar la contraseña.': 'Could not update the password.',
    'Contraseña actualizada. Ya puedes iniciar sesión.': 'Password updated. You can now sign in.',
    'Falta el token del enlace. Usa el link del correo (ej. `/reset-password?token=...`).': 'Missing token. Use the link from the email (e.g. `/reset-password?token=...`).',
    'Guardar datos': 'Save data',
    'Guardar datos': 'Save data',
    'Datos físicos': 'Physical data',
    'Completa tu perfil para obtener recomendaciones personalizadas': 'Complete your profile to get personalized recommendations',
    'Edad': 'Age',
    'Ej: 25': 'e.g. 25',
    'Género': 'Gender',
    'Selecciona tu género': 'Select your gender',
    'Masculino': 'Male',
    'Femenino': 'Female',
    'Otro': 'Other',
    'Altura (cm)': 'Height (cm)',
    'Peso (kg)': 'Weight (kg)',
    'Ej: 70': 'e.g. 70',
    'Nivel de actividad física': 'Physical activity level',
    'Selecciona tu nivel': 'Select your level',
    'Principiante': 'Beginner',
    'Intermedio': 'Intermediate',
    'Avanzado': 'Advanced',
    'Objetivo principal': 'Main goal',
    'Selecciona tu objetivo': 'Select your goal',
    'Perder peso': 'Lose weight',
    'Ganar músculo': 'Gain muscle',
    'Mejorar resistencia': 'Improve endurance',
    'Mantenerme saludable': 'Stay healthy',
    'Tip:': 'Tip:',
    'Estos datos nos ayudarán a calcular tu IMC, gasto calórico y crear rutinas adaptadas a tu condición física actual.':
      'This data helps us calculate your BMI, calorie expenditure, and create routines tailored to your current fitness level.',
    'Completa todos los campos con valores válidos.': 'Fill in all fields with valid values.',
    'No se pudieron guardar los datos.': 'Could not save the data.',
    'Datos guardados correctamente.': 'Data saved successfully.',

    // Calendar
    'Abrir entrenamiento': 'Open workout',
    'Abrir detalle': 'Open details',
    'Entrenamiento de': 'Workout:',
    'Días entrenados en total': 'Total training days',
    'Días entrenados este mes': 'Training days this month',
    'Pecho': 'Chest',
    'Pierna': 'Legs',
    'Espalda': 'Back',
    'Cardio': 'Cardio',
    'Hombros': 'Shoulders',
    'Yoga': 'Yoga',

    // Main / dashboard
    'Series': 'Sets',
    'Repeticiones': 'Reps',
    'me gusta': 'likes',
    'Rutina Pecho': 'Chest routine',
    'Rutina Espalda': 'Back routine',
    'Rutina Pierna': 'Leg routine',
    'Rutina Brazo': 'Arm routine',
    'Sentadillas': 'Squats',
    'Press de Banca': 'Bench press',
    'Peso muerto': 'Deadlift',
    'Hip Trust': 'Hip thrust',
    'Entrenamientos': 'Workouts',
    'Primer Mes': 'First month',
    'Completo': 'Completed',
    'Días': 'Days',
    'Racha de 30': '30-day streak',
    'En progreso 21 / 30': 'In progress 21 / 30',
    'Completado el 15/01': 'Completed on 01/15',
    'Completado el 10/01': 'Completed on 01/10',
    'Completado el 31/12': 'Completed on 12/31',
    '7 DÍAS': '7 DAYS',
    'CONSECUTIVOS': 'IN A ROW',
    'Resumen semanal': 'Weekly summary',
    'Sesión de hoy': "Today's session",
    'Crear sesión de hoy': "Create today's session",
    'Detalle': 'Details',
    'Crear logro': 'Create achievement',
    'Crear publicación': 'Create post',
    'Logros': 'Achievements',
    'Ruta placeholder para evitar pantalla en blanco tras el login.': 'Placeholder route to avoid a blank screen after login.',
    'Volver a login': 'Back to login',
    'Cerrar sesión': 'Log out',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return stored === 'en' ? 'en' : 'es';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key) => {
    const table = translations[lang] || translations.es;
    if (table[key]) return table[key];
    // If a key exists only in Spanish table, use it as fallback.
    if (translations.es[key]) return translations.es[key];
    // If missing in EN, surface a neutral placeholder to avoid leaking Spanish.
    if (lang === 'en') return key;
    return key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, t, toggleLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider />');
  return ctx;
}

// Simple inline helper for full-coverage translations:
// tr(lang, 'Texto ES', 'Text EN')
export function tr(lang, esText, enText) {
  return lang === 'en' ? enText : esText;
}
