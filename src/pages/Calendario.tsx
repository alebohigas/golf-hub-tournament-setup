import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  TournamentDay, 
  CategorySchedule, 
  TimeSlot,
  fetchTournamentDays, 
  fetchCategorySchedules 
} from '@/data/calendarioData';

const schedule = [
  {
    date: 'Martes 30 de Septiembre',
    events: [
      { time: '8:00 AM - 5:00 PM', title: 'Registro de Jugadores', desc: 'Casa Club' },
      { time: '5:00 PM', title: 'Práctica', desc: 'Campo disponible' },
      { time: '7:00 PM', title: 'Cóctel de Bienvenida', desc: 'Terraza Principal' },
    ]
  },
  {
    date: 'Miércoles 1 de Octubre',
    events: [
      { time: '6:30 AM', title: 'Desayuno', desc: 'Restaurante' },
      { time: '7:00 AM', title: 'Primera Ronda', desc: 'Salida Hoyo 1 y 10' },
      { time: '2:00 PM', title: 'Comida', desc: 'Terraza' },
    ]
  },
  {
    date: 'Jueves 2 de Octubre',
    events: [
      { time: '6:30 AM', title: 'Desayuno', desc: 'Restaurante' },
      { time: '7:00 AM', title: 'Segunda Ronda', desc: 'Salida Hoyo 1 y 10' },
      { time: '2:00 PM', title: 'Comida', desc: 'Terraza' },
    ]
  },
  {
    date: 'Viernes 3 de Octubre',
    events: [
      { time: '6:30 AM', title: 'Desayuno', desc: 'Restaurante' },
      { time: '7:00 AM', title: 'Tercera Ronda', desc: 'Salida Hoyo 1 y 10' },
      { time: '2:00 PM', title: 'Comida', desc: 'Terraza' },
    ]
  },
  {
    date: 'Sábado 4 de Octubre',
    events: [
      { time: '6:00 PM', title: 'Ceremonia de Premiación', desc: 'Salón Principal' },
      { time: '8:00 PM', title: 'Cena de Clausura', desc: 'Salón Principal' },
    ]
  },
];

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
        title="Calendario"
        subtitle="Fechas importantes y programa del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Schedule Table */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-6">
              Calendario por Categoría
            </h2>
            
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

          {/* Daily Schedule */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-6">
              Programa General
            </h2>
            <div className="space-y-8">
              {schedule.map((day, idx) => (
                <Card key={idx} className="border-border/50 overflow-hidden">
                  <div className="bg-primary px-6 py-4">
                    <h3 className="font-display font-semibold text-lg text-primary-foreground flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {day.date}
                    </h3>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {day.events.map((event, eventIdx) => (
                        <div key={eventIdx} className="p-4 flex items-start gap-4">
                          <span className="text-sm font-medium text-accent min-w-[120px]">{event.time}</span>
                          <div>
                            <h4 className="font-medium text-foreground">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Calendario;
