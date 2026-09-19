/** Página pública DISTANCIAS: yardas y par por mesa de salida activa. */
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import DistanciasReport from '@/components/distancias/DistanciasReport';
import horariosHero from '@/assets/horarios-hero.jpg';

/** Presenta el reporte oficial del torneo activo. */
const Distancias = () => (
  <Layout>
    <PageHero
      title="Distancias"
      subtitle="Yardas y par por mesa de salida"
      backgroundImage={horariosHero}
      backgroundPosition="center 60%"
    />
    <section className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-3 sm:px-4">
        <DistanciasReport />
      </div>
    </section>
  </Layout>
);

export default Distancias;
