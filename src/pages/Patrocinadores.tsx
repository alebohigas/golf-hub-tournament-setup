import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { sponsors } from '@/data/mockData';

const Patrocinadores = () => {
  return (
    <Layout>
      <PageHero 
        title="Patrocinadores"
        subtitle="Empresas que hacen posible este torneo"
      />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Patrocinadores Oficiales
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Agradecemos a todas las empresas y marcas que apoyan el 51° Torneo Anual de Golf.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sponsors.map((sponsor) => (
              <Card key={sponsor.id} className="card-hover border-border/50">
                <CardContent className="p-8 flex items-center justify-center h-40">
                  <img 
                    src={sponsor.logoUrl} 
                    alt={sponsor.name}
                    className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-xl font-display font-semibold text-foreground mb-4">
              ¿Desea ser patrocinador?
            </h3>
            <p className="text-muted-foreground mb-6">
              Contáctenos para conocer los beneficios de patrocinar el torneo de golf más prestigioso de la región.
            </p>
            <a 
              href="mailto:patrocinios@torneoanual.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contactar
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Patrocinadores;
