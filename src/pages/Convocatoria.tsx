import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import CategoryTable from '@/components/convocatoria/CategoryTable';
import { eligibilityText, notesText, tournamentInfo } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const Convocatoria = () => {
  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return `Del ${startDate.toLocaleDateString('es-MX', options)} al ${endDate.toLocaleDateString('es-MX', { ...options, year: 'numeric' })}`;
  };

  return (
    <Layout>
      <PageHero 
        title="Convocatoria"
        subtitle="Información completa sobre inscripciones, categorías y requisitos"
        backgroundImage="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1920&q=80"
      />

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Tournament Logo/Info */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-3xl shadow-elevated">
                51°
              </div>
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Torneo Anual de Golf
                </h2>
                <p className="text-lg font-display italic text-muted-foreground">
                  Club Campestre Torreón
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg text-accent">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {formatDate(tournamentInfo.startDate, tournamentInfo.endDate)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Eligibility */}
            <Card className="lg:col-span-1 shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Elegibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {eligibilityText}
                </p>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="lg:col-span-2 shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  Notas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {notesText.map((note, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Categories Section */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Categorías
              </h2>
              <p className="text-muted-foreground">
                Consulta los requisitos y formato de cada categoría
              </p>
            </div>
            <CategoryTable />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Convocatoria;
