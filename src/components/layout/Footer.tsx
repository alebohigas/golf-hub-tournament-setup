/**
 * Footer Component
 * Tournament info, contact, and stats in footer
 * Data fetched from API via React Query hooks
 */

import { useTournamentInfo, useTournamentStats } from '@/hooks/useTournamentData';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const { data: tournamentInfo } = useTournamentInfo();
  const { data: tournamentStats } = useTournamentStats();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tournament Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center font-display font-bold text-xl">
                {tournamentInfo?.id || '51'}
              </div>
              <div>
                <h3 className="font-display font-semibold">Torneo Anual de Golf</h3>
                <p className="text-sm text-primary-foreground/70">{tournamentInfo?.venue || 'Club Campestre Torreón'}</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              El torneo amateur de golf más prestigioso de la región con más de 50 años de tradición.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>{tournamentInfo?.venue || 'Club Campestre Torreón'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                <span>Tel: {tournamentInfo?.phone || ''}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 text-secondary" />
                <span>info@torneoanual.com</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">En Números</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.totalParticipants || '—'}+</span>
                <p className="text-sm text-primary-foreground/70">Participantes</p>
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.holes || '18'}</span>
                <p className="text-sm text-primary-foreground/70">Hoyos</p>
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.categories || '—'}</span>
                <p className="text-sm text-primary-foreground/70">Categorías</p>
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.yearsHistory || '—'}</span>
                <p className="text-sm text-primary-foreground/70">Años con Speitour</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Club Campestre Torreón. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
