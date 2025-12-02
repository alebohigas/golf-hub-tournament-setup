import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

const mockEvents = [
  { id: 1, title: 'Registro de Jugadores', date: '30 Sep 2025', time: '8:00 AM - 5:00 PM', location: 'Casa Club' },
  { id: 2, title: 'Cóctel de Bienvenida', date: '30 Sep 2025', time: '7:00 PM', location: 'Terraza Principal' },
  { id: 3, title: 'Ronda 1', date: '1 Oct 2025', time: '7:00 AM', location: 'Campo de Golf' },
  { id: 4, title: 'Ronda 2', date: '2 Oct 2025', time: '7:00 AM', location: 'Campo de Golf' },
  { id: 5, title: 'Ronda 3', date: '3 Oct 2025', time: '7:00 AM', location: 'Campo de Golf' },
  { id: 6, title: 'Ceremonia de Premiación', date: '4 Oct 2025', time: '6:00 PM', location: 'Salón Principal' },
];

const Eventos = () => {
  return (
    <Layout>
      <PageHero 
        title="Eventos"
        subtitle="Calendario de actividades y eventos del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <Card key={event.id} className="card-hover border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.location}</span>
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

export default Eventos;
