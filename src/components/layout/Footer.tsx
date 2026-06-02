/**
 * Footer Component
 * Tournament info, contact, and stats in footer
 * Data fetched from API via React Query hooks
 * Shows: tournament name (parsed), logo, location (city/state), phone, email, stats
 */

import { useTournamentInfo, useTournamentStats } from '@/hooks/useTournamentData';
import { MapPin, Phone, Mail } from 'lucide-react';

/** Parse Roman numeral prefix from tournament name */
const parseTournamentName = (name: string) => {
  const match = name?.match(/^([IVXLCDM]+)\s+(.+)$/i);
  return match ? { numeral: match[1], rest: match[2] } : { numeral: '', rest: name || '' };
};

const Footer = () => {
  const { data: tournamentInfo } = useTournamentInfo();
  const { data: tournamentStats } = useTournamentStats();

  const { numeral, rest } = parseTournamentName(tournamentInfo?.name || '');

  /** Build location string from city and state */
  const location = [tournamentInfo?.city, tournamentInfo?.state].filter(Boolean).join(', ');

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tournament Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* Tournament logo or fallback */}
              {tournamentInfo?.logoUrl ? (
                <img
                  src={tournamentInfo.logoUrl}
                  alt="Logo del torneo"
                  className="w-12 h-12 rounded-lg object-contain bg-primary-foreground/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center font-display font-bold text-xl text-secondary">
                  {numeral || '⛳'}
                </div>
              )}
              <div>
                <h3 className="font-display font-semibold">
                  {numeral && <span className="text-secondary">{numeral} </span>}
                  {rest}
                </h3>
                <p className="text-sm text-primary-foreground/70">{tournamentInfo?.club || ''}</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              El torneo de golf amateur más importante del país.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              {/* Location: city, state */}
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-secondary flex-shrink-0" />
                <span>{location || tournamentInfo?.club || ''}</span>
              </div>
              {/* Phone from torneo.telefono */}
              {tournamentInfo?.phone && (
                <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                  <Phone className="h-4 w-4 text-secondary flex-shrink-0" />
                  <span>Tel: {tournamentInfo.phone}</span>
                </div>
              )}
              {/* Email from torneo.correotorne */}
              {tournamentInfo?.email && (
                <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                  <Mail className="h-4 w-4 text-secondary flex-shrink-0" />
                  <span>{tournamentInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">En Números</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.totalHistoricalPlayers?.toLocaleString() || '—'}+</span>
                <p className="text-sm text-primary-foreground/70">Participantes Históricos</p>
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.yearsHistoryDisplay || '—'}</span>
                <p className="text-sm text-primary-foreground/70">Años de Historia</p>
              </div>
              <div>
                <span className="text-2xl font-display font-bold text-secondary">{tournamentStats?.maxCategories || '—'}+</span>
                <p className="text-sm text-primary-foreground/70">Categorías en un Torneo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright with club name */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} {tournamentInfo?.club || 'Club Campestre'}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
