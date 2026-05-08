import React, { useMemo, useState } from 'react';
import {
  LayoutGrid,
  Trophy,
  MessageSquareText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ children, className }) {
  return (
    <section
      className={cx(
        'rounded-lg sm:rounded-lg md:rounded-xl border border-white/10 bg-white/[0.06] shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </section>
  );
}

function WorkoutCard({ title, duration, date, exercisesCount, series, volume, onClick }) {
  const { lang } = useI18n();
  return (
    <Card
      className="p-4 sm:p-5 md:p-6 hover:border-white/20 transition cursor-pointer focus-within:border-white/25"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left focus:outline-none"
        aria-label={`${tr(lang, 'Abrir sesión', 'Open session')}: ${title}`}
      >
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <h3 className="text-[13px] sm:text-[14px] md:text-[15px] font-bold text-white/95 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-white/45 mt-1">{date}</p>
        </div>
        <span className="inline-flex items-center rounded-lg bg-[#ff7849]/20 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold text-[#ff7849] flex-shrink-0">
          {duration}
        </span>
      </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">
            {tr(lang, 'Ejercicios', 'Exercises')}
          </span>
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 mt-1">{exercisesCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">
            {tr(lang, 'Series', 'Sets')}
          </span>
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 mt-1">{series}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">
            {tr(lang, 'Volumen', 'Volume')}
          </span>
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 mt-1">{volume}</span>
        </div>
      </div>
      </button>
    </Card>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border border-white/20 bg-white/[0.04] accent-[#ff7849] cursor-pointer"
      />
      <span className="text-[12px] sm:text-[13px] text-white/70 group-hover:text-white/90 transition">
        {label}
      </span>
    </label>
  );
}

export default function Entrenamientos() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [filters, setFilters] = useState({
    hoy: false,
    estaSemana: true,
    esteMes: false,
    personalizado: false,
    fuerza: false,
    cardio: false,
    flexibilidad: false,
    hiit: false,
    pecho: false,
    espalda: false,
    piernas: false,
    brazos: false,
    hombros: false,
  });

  // Datos de prueba con campos para filtrado
  const allWorkouts = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 1,
        title: tr(lang, 'Entrenamiento de Pecho', 'Chest workout'),
        duration: '45 MIN',
        date: tr(lang, 'Lunes, 20 Ene 2025', 'Monday, Jan 20, 2025'),
        dateObj: oneWeekAgo,
        exercisesCount: 8,
        series: 24,
        volume: '2480 KG',
        type: 'fuerza',
        muscleGroup: ['pecho', 'brazos'],
      },
      {
        id: 2,
        title: tr(lang, 'Cardio Intenso', 'Intense cardio'),
        duration: '30 MIN',
        date: tr(lang, 'Martes, 21 Ene 2025', 'Tuesday, Jan 21, 2025'),
        dateObj: oneWeekAgo,
        exercisesCount: 5,
        series: 10,
        volume: '350 KCAL',
        type: 'cardio',
        muscleGroup: [],
      },
      {
        id: 3,
        title: tr(lang, 'Pierna Completa', 'Leg day'),
        duration: '60 MIN',
        date: tr(lang, 'Jueves, 23 Ene 2025', 'Thursday, Jan 23, 2025'),
        dateObj: oneWeekAgo,
        exercisesCount: 10,
        series: 32,
        volume: '3268 KG',
        type: 'fuerza',
        muscleGroup: ['piernas'],
      },
      {
        id: 4,
        title: tr(lang, 'Espalda y Bíceps', 'Back & biceps'),
        duration: '50 MIN',
        date: tr(lang, 'Viernes, 24 Ene 2025', 'Friday, Jan 24, 2025'),
        dateObj: oneWeekAgo,
        exercisesCount: 9,
        series: 28,
        volume: '2880 KG',
        type: 'fuerza',
        muscleGroup: ['espalda', 'brazos'],
      },
      {
        id: 5,
        title: tr(lang, 'Hombros y Tríceps', 'Shoulders & triceps'),
        duration: '40 MIN',
        date: tr(lang, 'Sábado, 25 Ene 2025', 'Saturday, Jan 25, 2025'),
        dateObj: oneWeekAgo,
        exercisesCount: 7,
        series: 22,
        volume: '1980 KG',
        type: 'fuerza',
        muscleGroup: ['hombros', 'brazos'],
      },
      {
        id: 6,
        title: tr(lang, 'Yoga y Movilidad', 'Yoga & mobility'),
        duration: '35 MIN',
        date: tr(lang, 'Domingo, 26 Ene 2025', 'Sunday, Jan 26, 2025'),
        dateObj: oneWeekAgo,
        exercisesCount: 12,
        series: 15,
        volume: '+15%',
        type: 'flexibilidad',
        muscleGroup: [],
      },
      {
        id: 7,
        title: tr(lang, 'HIIT Completo', 'Full HIIT'),
        duration: '25 MIN',
        date: tr(lang, 'Lunes, 27 Ene 2025', 'Monday, Jan 27, 2025'),
        dateObj: twoWeeksAgo,
        exercisesCount: 8,
        series: 20,
        volume: '600 KCAL',
        type: 'hiit',
        muscleGroup: [],
      },
      {
        id: 8,
        title: tr(lang, 'Pecho y Espalda', 'Chest & back'),
        duration: '55 MIN',
        date: tr(lang, 'Martes, 28 Ene 2025', 'Tuesday, Jan 28, 2025'),
        dateObj: twoWeeksAgo,
        exercisesCount: 11,
        series: 30,
        volume: '3100 KG',
        type: 'fuerza',
        muscleGroup: ['pecho', 'espalda'],
      },
    ];
  }, [lang]);

  // Función para filtrar entrenamientos
  const filteredWorkouts = useMemo(() => {
    return allWorkouts.filter((workout) => {
      // Filtro por fecha
      const hasDateFilter = filters.hoy || filters.estaSemana || filters.esteMes || filters.personalizado;
      if (hasDateFilter) {
        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        let dateMatch = false;
        if (filters.hoy && workout.dateObj.toDateString() === today.toDateString()) {
          dateMatch = true;
        }
        if (filters.estaSemana && workout.dateObj >= oneWeekAgo) {
          dateMatch = true;
        }
        if (filters.esteMes && workout.dateObj >= oneMonthAgo) {
          dateMatch = true;
        }
        if (filters.personalizado) {
          dateMatch = true;
        }

        if (!dateMatch) return false;
      }

      // Filtro por tipo
      const hasTypeFilter = filters.fuerza || filters.cardio || filters.flexibilidad || filters.hiit;
      if (hasTypeFilter) {
        const typeMatch =
          (filters.fuerza && workout.type === 'fuerza') ||
          (filters.cardio && workout.type === 'cardio') ||
          (filters.flexibilidad && workout.type === 'flexibilidad') ||
          (filters.hiit && workout.type === 'hiit');

        if (!typeMatch) return false;
      }

      // Filtro por grupo muscular
      const hasMuscleGroupFilter = filters.pecho || filters.espalda || filters.piernas || filters.brazos || filters.hombros;
      if (hasMuscleGroupFilter) {
        const muscleMatch =
          (filters.pecho && workout.muscleGroup.includes('pecho')) ||
          (filters.espalda && workout.muscleGroup.includes('espalda')) ||
          (filters.piernas && workout.muscleGroup.includes('piernas')) ||
          (filters.brazos && workout.muscleGroup.includes('brazos')) ||
          (filters.hombros && workout.muscleGroup.includes('hombros'));

        if (!muscleMatch) return false;
      }

      return true;
    });
  }, [filters, allWorkouts]);

  const handleFilterChange = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      hoy: false,
      estaSemana: false,
      esteMes: false,
      personalizado: false,
      fuerza: false,
      cardio: false,
      flexibilidad: false,
      hiit: false,
      pecho: false,
      espalda: false,
      piernas: false,
      brazos: false,
      hombros: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      {/* Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr] 2xl:grid-cols-[300px_1fr] gap-4 sm:gap-5 md:gap-6 px-3 sm:px-4 md:px-6 lg:px-7 xl:px-8 2xl:px-10 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        {/* Sidebar */}
        <aside className="col-span-1 h-fit sticky top-[56px] sm:top-[64px] z-40">
          <div className="space-y-5 sm:space-y-6 md:space-y-7">
            {/* Fecha Filter */}
            <div className="space-y-3">
              <h3 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-white/90 border-b border-white/10 pb-2.5">
                {tr(lang, 'Filtros', 'Filters')}
              </h3>
              <div className="space-y-2.5">
                <h4 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-white/60">
                  {tr(lang, 'Fecha', 'Date')}
                </h4>
                <div className="space-y-2">
                  <FilterCheckbox
                    label={tr(lang, 'Hoy', 'Today')}
                    checked={filters.hoy}
                    onChange={() => handleFilterChange('hoy')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Esta semana', 'This week')}
                    checked={filters.estaSemana}
                    onChange={() => handleFilterChange('estaSemana')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Este mes', 'This month')}
                    checked={filters.esteMes}
                    onChange={() => handleFilterChange('esteMes')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Personalizado', 'Custom')}
                    checked={filters.personalizado}
                    onChange={() => handleFilterChange('personalizado')}
                  />
                </div>
              </div>
            </div>

            {/* Tipo Filter */}
            <div className="space-y-3 border-t border-white/10 pt-5">
              <div className="space-y-2.5">
                <h4 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-white/60">
                  {tr(lang, 'Tipo', 'Type')}
                </h4>
                <div className="space-y-2">
                  <FilterCheckbox
                    label={tr(lang, 'Fuerza', 'Strength')}
                    checked={filters.fuerza}
                    onChange={() => handleFilterChange('fuerza')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Cardio', 'Cardio')}
                    checked={filters.cardio}
                    onChange={() => handleFilterChange('cardio')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Flexibilidad', 'Mobility')}
                    checked={filters.flexibilidad}
                    onChange={() => handleFilterChange('flexibilidad')}
                  />
                  <FilterCheckbox
                    label="HIIT"
                    checked={filters.hiit}
                    onChange={() => handleFilterChange('hiit')}
                  />
                </div>
              </div>
            </div>

            {/* Grupo Muscular Filter */}
            <div className="space-y-3 border-t border-white/10 pt-5">
              <div className="space-y-2.5">
                <h4 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-white/60">
                  {tr(lang, 'Grupo muscular', 'Muscle group')}
                </h4>
                <div className="space-y-2">
                  <FilterCheckbox
                    label={tr(lang, 'Pecho', 'Chest')}
                    checked={filters.pecho}
                    onChange={() => handleFilterChange('pecho')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Espalda', 'Back')}
                    checked={filters.espalda}
                    onChange={() => handleFilterChange('espalda')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Piernas', 'Legs')}
                    checked={filters.piernas}
                    onChange={() => handleFilterChange('piernas')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Brazos', 'Arms')}
                    checked={filters.brazos}
                    onChange={() => handleFilterChange('brazos')}
                  />
                  <FilterCheckbox
                    label={tr(lang, 'Hombros', 'Shoulders')}
                    checked={filters.hombros}
                    onChange={() => handleFilterChange('hombros')}
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border border-white/20 text-[12px] sm:text-[13px] font-semibold text-white/70 hover:text-white/90 hover:border-white/40 transition mt-5 sm:mt-6"
            >
              {tr(lang, 'Limpiar filtros', 'Clear filters')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-1 space-y-5 sm:space-y-6 md:space-y-7">
          {/* Header */}
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-bold tracking-wide text-white/95">
                {tr(lang, 'Historial de entrenamientos', 'Workout history')}
              </h1>
            </div>
            <div className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-white/50 whitespace-nowrap">
              {filteredWorkouts.length} {tr(lang, 'ENTRENAMIENTOS', 'WORKOUTS')}
            </div>
          </div>

          {/* Workouts Grid */}
          {filteredWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  title={workout.title}
                  duration={workout.duration}
                  date={workout.date}
                  exercisesCount={workout.exercisesCount}
                  series={workout.series}
                  volume={workout.volume}
                  onClick={() => navigate(`/sessiondetail/${workout.id}`, { state: { workout } })}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 rounded-xl border border-white/10 bg-white/[0.04]">
              <div className="text-center">
                <p className="text-[14px] sm:text-[16px] text-white/60 mb-2">{tr(lang, 'No se encontraron entrenamientos', 'No workouts found')}</p>
                <p className="text-[12px] sm:text-[13px] text-white/40">{tr(lang, 'Intenta ajustar los filtros', 'Try adjusting the filters')}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
