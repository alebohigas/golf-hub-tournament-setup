/**
 * StatsSection Component
 * Displays tournament statistics (participants, holes, categories, years)
 * Data fetched from tournament.php via useTournamentStats hook
 */

import { useTournamentStats } from '@/hooks/useTournamentData';

const StatsSection = () => {
  const { data: stats } = useTournamentStats();

  if (!stats) return null;

  /** Stats display configuration */
  const statsData = [
    { value: `${stats.totalParticipants}+`, label: 'Participantes' },
    { value: stats.holes.toString(), label: 'Hoyos' },
    { value: stats.categories.toString(), label: 'Categorías' },
    { value: stats.yearsHistory.toString(), label: 'Años de Historia con Speitour' },
  ];

  return (
    <section className="gradient-stats py-16 md:py-20">
      <div className="container mx-auto px-4">
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
