/**
 * Eventos Page
 * Displays tournament event schedule by day
 * Data fetched from eventos.php via useEventos hook
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import AtraccionesSection from '@/components/eventos/AtraccionesSection';
// Hero background: terraza de gala con escenario y campo de golf al atardecer.
import eventosHero from '@/assets/eventos-hero.jpg';

const Eventos = () => {
  return (
    <Layout>
      <PageHero 
        title="Calendario de Eventos"
        subtitle="Programa de actividades del torneo"
        backgroundImage={eventosHero}
      />
      {/* Visual posters of daily attractions (concerts, raffles, food, etc.) */}
      <AtraccionesSection />
    </Layout>
  );
};

export default Eventos;
