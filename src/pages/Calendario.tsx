import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

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

const Calendario = () => {
  return (
    <Layout>
      <PageHero 
        title="Calendario"
        subtitle="Fechas importantes y programa del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
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
      </section>
    </Layout>
  );
};

export default Calendario;
