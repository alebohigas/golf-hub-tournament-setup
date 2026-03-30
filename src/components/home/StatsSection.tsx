/**
 * StatsSection Component
 * Displays historical tournament statistics ribbon
 * Subtitle: "años de nuestra historia"
 * Stats: total historical players, premios (pending), years of history, max categories
 */

import { useTournamentStats } from '@/hooks/useTournamentData';

const StatsSection = () => {
  const { data: stats } = useTournamentStats();

  if (!stats) return null;

  /** Stats display configuration */
  const statsData = [
    { value: `${stats.totalHistoricalPlayers.toLocaleString()}+`, label: 'Participantes Registrados' },
    { value: stats.yearsHistoryDisplay, label: 'Años de Historia' },
    { value: `${stats.maxCategories}+`, label: 'Categorías en un Torneo' },
  ];

  return (
    <section className="gradient-stats py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Subtitle */}
        <h2 className="text-center text-primary-foreground/90 font-display text-xl md:text-2xl font-semibold mb-10 tracking-wide uppercase">
          Años de Nuestra Historia
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {statsData.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center animate-count-up opacity-0"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              <span className="stats-number block mb-2">
                {stat.value}
              </span>
              <span className="text-primary-foreground/80 text-sm md:text-base font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
