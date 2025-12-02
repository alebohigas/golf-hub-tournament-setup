import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  TournamentDay, 
  CategorySchedule, 
  TimeSlot,
  fetchTournamentDays, 
  fetchCategorySchedules 
} from '@/data/calendarioData';
import calendarioHero from '@/assets/calendario-hero.jpg';

const TimeSlotCell = ({ slot, shortName }: { slot: TimeSlot; shortName: string }) => {
  if (!slot) {
    return <td className="border border-border/30 bg-muted/20 p-2 text-center text-muted-foreground/30">-</td>;
  }
  
  return (
    <td className={`border border-border/30 p-2 text-center font-medium ${
      slot === 'AM' 
        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
        : 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
    }`}>
      {shortName}
    </td>
  );
};

const Calendario = () => {
  const [days, setDays] = useState<TournamentDay[]>([]);
  const [categories, setCategories] = useState<CategorySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [daysData, categoriesData] = await Promise.all([
        fetchTournamentDays(),
        fetchCategorySchedules()
      ]);
      setDays(daysData);
      setCategories(categoriesData);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Layout>
      <PageHero 
        title="Calendario de Juego"
        subtitle="Días de juego por categoría"
        backgroundImage={calendarioHero}
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Schedule Table */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Calendario por Categoría
            </h2>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                <Sun className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm text-muted-foreground">AM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                <Moon className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground">PM</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Cargando calendario...</div>
          ) : (
            <Card className="border-border/50 overflow-hidden max-w-5xl mx-auto">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary">
                      <th className="border border-border/30 p-3 text-left text-primary-foreground font-bold">
                        Categoría
                      </th>
                      {days.map(day => (
                        <th key={day.dayId} className="border border-border/30 p-3 text-center text-primary-foreground font-bold min-w-[80px]">
                          {day.shortName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, idx) => (
                      <tr 
                        key={category.categoryId}
                        className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      >
                        <td className="border border-border/30 p-3 font-medium text-foreground">
                          {category.categoryName}
                        </td>
                        {days.map(day => (
                          <TimeSlotCell 
                            key={day.dayId} 
                            slot={category.schedule[day.dayId]} 
                            shortName={category.shortName}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Calendario;
