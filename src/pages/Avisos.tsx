import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockAvisos = [
  {
    id: 1,
    title: 'Apertura de Inscripciones',
    date: '15 Ago 2025',
    content: 'Las inscripciones para el 51° Torneo Anual de Golf están oficialmente abiertas. Los socios tendrán prioridad hasta el 1 de septiembre.',
    important: true,
  },
  {
    id: 2,
    title: 'Actualización del Reglamento',
    date: '20 Ago 2025',
    content: 'Se han actualizado algunas reglas locales para el torneo. Por favor revise la sección de Reglas para más detalles.',
    important: false,
  },
  {
    id: 3,
    title: 'Información de Hospedaje',
    date: '25 Ago 2025',
    content: 'Hemos acordado tarifas especiales con hoteles de la zona para participantes foráneos. Contacte a la oficina del torneo para más información.',
    important: false,
  },
];

const Avisos = () => {
  return (
    <Layout>
      <PageHero 
        title="Avisos"
        subtitle="Comunicados y noticias importantes del torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {mockAvisos.map((aviso) => (
              <Card key={aviso.id} className="border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 font-display text-xl">
                      <Bell className={`h-5 w-5 ${aviso.important ? 'text-accent' : 'text-muted-foreground'}`} />
                      {aviso.title}
                    </CardTitle>
                    {aviso.important && (
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        Importante
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {aviso.date}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{aviso.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Avisos;
