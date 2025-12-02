import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import SponsorRibbon from './SponsorRibbon';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SponsorRibbon />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
