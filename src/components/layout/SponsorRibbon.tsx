/**
 * SponsorRibbon Component
 * Infinite scrolling ribbon of sponsor logos
 * Data fetched from sponsors.php via useSponsors hook
 */

import { useSponsors } from '@/hooks/useTournamentData';

const SponsorRibbon = () => {
  const { data: sponsors = [] } = useSponsors();

  if (sponsors.length === 0) return null;

  // Duplicate sponsors for infinite scroll effect
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <div className="bg-muted/50 border-y border-border py-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="fade-edge-left">
          <div className="flex items-center sponsor-scroll">
            {duplicatedSponsors.map((sponsor, index) => (
              <div
                key={`${sponsor.id}-${index}`}
                className="flex-shrink-0 mx-8 opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                {sponsor.websiteUrl ? (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="h-12 md:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </a>
                ) : (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    className="h-12 md:h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorRibbon;
