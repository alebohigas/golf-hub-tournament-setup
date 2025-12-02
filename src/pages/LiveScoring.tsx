import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Radio, Clock } from 'lucide-react';

const LiveScoring = () => {
  return (
    <Layout>
      <PageHero 
        title="Live Scoring"
        subtitle="Resultados en tiempo real durante el torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Radio className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Próximamente
              </h2>
              <p className="text-muted-foreground mb-6">
                El live scoring estará disponible durante las fechas del torneo.
              </p>
              <div className="flex items-center justify-center gap-2 text-accent">
                <Clock className="h-5 w-5" />
                <span className="font-medium">30 Sep - 4 Oct 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default LiveScoring;
