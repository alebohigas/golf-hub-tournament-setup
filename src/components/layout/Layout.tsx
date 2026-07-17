import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import SponsorRibbon from './SponsorRibbon';
import AnnouncementRibbon from './AnnouncementRibbon';
import SitePopup from '@/components/popup/SitePopup';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Scrolling announcement ribbon — configured from Admin > Anuncio.
          Sits between the header and the sponsor ribbon. */}
      <AnnouncementRibbon />
      <SponsorRibbon />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {/* Site-wide POP UP overlay — configured from Admin > POP. */}
      <SitePopup />
    </div>
  );
};

export default Layout;
