import { useEffect, useState } from 'react';
import { fetchTournamentStats, TournamentStats } from '@/data/mockData';

const StatsSection = () => {
  const [stats, setStats] = useState<TournamentStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchTournamentStats();
      setStats(data);
    };
    loadStats();
  }, []);

  if (!stats) return null;

  const statsData = [
    { value: `${stats.totalParticipants}+`, label: 'Participantes' },
    { value: stats.holes.toString(), label: 'Hoyos' },
    { value: stats.categories.toString(), label: 'Categorías' },
    { value: stats.yearsHistory.toString(), label: 'Años de Historia' },
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
