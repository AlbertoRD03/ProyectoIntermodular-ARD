import React, { useMemo, useState } from 'react';
import {
  X,
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

function WorkoutCard({ title, duration, date, exercisesCount, series, volume, type }) {
  const { lang } = useI18n();
  return (
    <Card className="p-4 sm:p-5 md:p-6 hover:border-white/20 transition cursor-pointer">
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
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">{tr(lang, 'Ejercicios', 'Exercises')}</span>
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 mt-1">{exercisesCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">{tr(lang, 'Series', 'Sets')}</span>
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 mt-1">{series}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/45 uppercase tracking-wide">{tr(lang, 'Volumen', 'Volume')}</span>
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-white/85 mt-1">{volume}</span>
        </div>
      </div>
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

export default function WorkoutHistory() {
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

  const workouts = useMemo(() => {
    return [
      {
        id: 1,
        title: tr(lang, 'Entrenamiento de Pecho', 'Chest workout'),
        duration: '45 MIN',
        date: tr(lang, 'Lunes, 20 Ene 2025', 'Monday, Jan 20, 2025'),
        exercisesCount: 8,
        series: 24,
        volume: '2480 KG',
        type: 'strength',
      },
      {
        id: 2,
        title: tr(lang, 'Cardio Intenso', 'Intense cardio'),
        duration: '30 MIN',
        date: tr(lang, 'Martes, 21 Ene 2025', 'Tuesday, Jan 21, 2025'),
        exercisesCount: 5,
        series: 10,
        volume: '350 KCAL',
        type: 'cardio',
      },
      {
        id: 3,
        title: tr(lang, 'Pierna Completa', 'Leg day'),
        duration: '60 MIN',
        date: tr(lang, 'Jueves, 23 Ene 2025', 'Thursday, Jan 23, 2025'),
        exercisesCount: 10,
        series: 32,
        volume: '3268 KG',
        type: 'strength',
      },
      {
        id: 4,
        title: tr(lang, 'Espalda y Bíceps', 'Back & biceps'),
        duration: '50 MIN',
        date: tr(lang, 'Viernes, 24 Ene 2025', 'Friday, Jan 24, 2025'),
        exercisesCount: 9,
        series: 28,
        volume: '2880 KG',
        type: 'strength',
      },
      {
        id: 5,
        title: tr(lang, 'Hombros y Tríceps', 'Shoulders & triceps'),
        duration: '40 MIN',
        date: tr(lang, 'Sábado, 25 Ene 2025', 'Saturday, Jan 25, 2025'),
        exercisesCount: 7,
        series: 22,
        volume: '1980 KG',
        type: 'strength',
      },
      {
        id: 6,
        title: tr(lang, 'Yoga y Movilidad', 'Yoga & mobility'),
        duration: '35 MIN',
        date: tr(lang, 'Domingo, 26 Ene 2025', 'Sunday, Jan 26, 2025'),
        exercisesCount: 12,
        series: 15,
        volume: '+15%',
        type: 'flexibility',
      },
    ];
  }, [lang]);

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
              {workouts.length} {tr(lang, 'ENTRENAMIENTOS', 'WORKOUTS')}
            </div>
          </div>

          {/* Workouts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                title={workout.title}
                duration={workout.duration}
                date={workout.date}
                exercisesCount={workout.exercisesCount}
                series={workout.series}
                volume={workout.volume}
                type={workout.type}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
