import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5 md:p-6 text-center">
      <p className="text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-widest text-white/50 mb-2 sm:mb-3">
        {label}
      </p>
      <p className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-white/95">
        {value}
      </p>
    </div>
  );
}

function WorkoutBadge({ type, onClick }) {
  const colorMap = {
    pecho: 'bg-[#ff7849]/20 text-[#ff7849]',
    espalda: 'bg-blue-500/20 text-blue-400',
    pierna: 'bg-purple-500/20 text-purple-400',
    cardio: 'bg-red-500/20 text-red-400',
    hombros: 'bg-green-500/20 text-green-400',
    yoga: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/20',
        colorMap[type.toLowerCase()] || 'bg-white/10 text-white/60'
      )}
      aria-label={`Abrir entrenamiento: ${type}`}
      title="Abrir detalle"
    >
      {type}
    </button>
  );
}

export default function Calendario() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // Enero 2025 como en el mockup

  // Datos de entrenamientos por día
  const workoutsByDay = useMemo(() => {
    return {
      3: ['Pecho'],
      5: ['Pierna'],
      6: ['Espalda'],
      8: ['Cardio'],
      10: ['Pecho'],
      12: ['Pierna'],
      13: ['Hombros'],
      17: ['Espalda'],
      19: ['Pierna'],
      20: ['Pecho'],
      22: ['Cardio'],
      23: ['Pierna'],
      24: ['Espalda'],
      25: ['Hombros'],
      27: ['Yoga'],
      30: ['Pecho'],
    };
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajustar para que lunes sea 0

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const openWorkoutDetail = (day, type) => {
    const normalizedType = String(type).trim();
    const typeKey = normalizedType.toLowerCase();

    const dateObj = new Date(year, monthIndex, day);
    const dateLabel = dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const durationByType = {
      cardio: '30 MIN',
      yoga: '35 MIN',
      pecho: '45 MIN',
      espalda: '50 MIN',
      pierna: '60 MIN',
      hombros: '40 MIN',
    };

    const workout = {
      id: `${year}-${monthIndex + 1}-${day}-${typeKey}`,
      title: `Entrenamiento de ${normalizedType}`,
      duration: durationByType[typeKey] || '45 MIN',
      date: dateLabel,
      series: typeKey === 'cardio' ? 10 : 24,
      volume: typeKey === 'cardio' ? '350 KCAL' : '2400 KG',
      muscleGroup: ['pecho', 'espalda', 'pierna', 'hombros'].includes(typeKey) ? [typeKey] : [],
    };

    navigate(`/sessiondetail/${workout.id}`, { state: { workout } });
  };

  // Contar entrenamientos totales (simulado)
  const totalWorkouts = 203;
  const monthWorkouts = Object.keys(workoutsByDay).length;

  const days = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      {/* Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-7">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            <StatCard label="Días entrenados en total" value={totalWorkouts} />
            <div className="flex items-center justify-center">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center min-w-[220px]">
                <div className="text-[20px] sm:text-[24px] md:text-[28px] font-bold tracking-widest text-white/95">
                  {monthName}
                </div>
                <div className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-white/60 mt-1">
                  {year}
                </div>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <StatCard label="Días entrenados este mes" value={monthWorkouts} />
          </div>

          {/* Calendar */}
          <div className="rounded-lg border border-white/10 bg-white/[0.04] overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.03]">
              {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map((day) => (
                <div
                  key={day}
                  className="p-3 sm:p-4 text-center text-[11px] sm:text-[12px] md:text-[13px] font-bold uppercase tracking-wider text-white/50 border-r border-white/10 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="divide-y divide-white/10">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7">
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={cx(
                        'aspect-square p-2 sm:p-3 md:p-4 border-r border-white/10 last:border-r-0 flex flex-col',
                        day ? 'bg-white/[0.02] hover:bg-white/[0.06] transition cursor-pointer' : 'bg-black/20'
                      )}
                    >
                      {day && (
                        <>
                          <div className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-white/60 mb-1 sm:mb-1.5">
                            {day}
                          </div>
                          {workoutsByDay[day] && (
                            <div className="space-y-1 flex-1 flex flex-col justify-center">
                              {workoutsByDay[day].map((workout, idx) => (
                                <WorkoutBadge
                                  key={idx}
                                  type={workout}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openWorkoutDetail(day, workout);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
