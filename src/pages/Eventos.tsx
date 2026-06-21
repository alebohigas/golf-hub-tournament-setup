/**
 * Eventos Page
 * Displays tournament event schedule by day
 * Data fetched from eventos.php via useEventos hook
 */

import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import AtraccionesSection from '@/components/eventos/AtraccionesSection';
import SocialesSection from '@/components/eventos/SocialesSection';
import CalendarioEventosTable from '@/components/eventos/CalendarioEventosTable';

/**
 * Hostnames donde el calendario matriz es válido.
 * Por ahora es exclusivo de Terralta (torneo 349). Si en el futuro
 * otros torneos requieren su propio calendario, conviene mover esta
 * data a la BD y reemplazar este gate por un fetch por torneoid.
 */
const CALENDARIO_HOSTS = ['terralta.speitour.com.mx'];
import { getEventosSocialesByTorneo } from '@/data/mockData';
import { useTorneoId } from '@/hooks/useTorneoId';
// Hero background: terraza de gala con escenario y campo de golf al atardecer.
import eventosHero from '@/assets/eventos-hero.jpg';

const Eventos = () => {
  // Active tournament — social events are strictly tournament-scoped so we
  // never bleed Atlas (354) lifestyle data into Valle Alto (346) or others.
  const { torneoId } = useTorneoId();
  const eventosSociales = getEventosSocialesByTorneo(torneoId);

  // ----- Section visibility flags -----
  // Atracciones: posters are hardcoded for the current tournament — keep visible.
  // In the future, when posters become tournament-specific via DB/config, swap
  // this flag for that data check.
  const hasAtracciones = true;
  const hasSociales = eventosSociales.length > 0;
  const hasAnyContent = hasAtracciones || hasSociales;

  // Mostrar la matriz del calendario únicamente en el dominio de Terralta.
  // `window` no existe en SSR, pero esta app es SPA pura así que es seguro.
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const showCalendarioMatriz = CALENDARIO_HOSTS.includes(host);

  return (
    <Layout>
      <PageHero 
        title="Calendario de Eventos"
        subtitle="Programa de actividades del torneo"
        backgroundImage={eventosHero}
      />
      {/* Matriz interactiva del calendario — encabezado de fechas y
          columna de áreas con sticky-positioning para una lectura clara
          en desktop y mobile. */}
      {showCalendarioMatriz && <CalendarioEventosTable />}
      {/* Visual posters of daily attractions (concerts, raffles, food, etc.).
          Hidden automatically when there are no posters configured. */}
      {hasAtracciones && <AtraccionesSection />}
      {/* Social/lifestyle events (cocktail, gala, themed nights, ceremony).
          Hidden when no social events are defined for the active tournament. */}
      {hasSociales && <SocialesSection data={eventosSociales} />}

      {/* Generic fallback when neither subsection has content to show. */}
      {!hasAnyContent && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              Próximamente
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Aún no hay eventos publicados para este torneo. Vuelve pronto para
              conocer el programa de actividades, atracciones y eventos sociales.
            </p>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Eventos;
