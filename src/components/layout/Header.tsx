/**
 * Header Component
 * Main navigation header with responsive mobile menu
 * Respects page visibility settings from admin context
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { fetchTournamentInfo, TournamentInfo } from '@/data/mockData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============= Component =============

const Header = () => {
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Get visible menu items from context
  const { getVisibleMenuItems, isAdmin } = usePageVisibility();
  const menuItems = getVisibleMenuItems();

  useEffect(() => {
    const loadData = async () => {
      const info = await fetchTournamentInfo();
      setTournamentInfo(info);
    };
    loadData();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {tournamentInfo?.logoUrl ? (
              <img 
                src={tournamentInfo.logoUrl} 
                alt={tournamentInfo.name}
                className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-contain"
              />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                {tournamentInfo?.id || '51'}
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-sm font-display font-semibold text-primary leading-tight block">
                {tournamentInfo?.name?.split(' ').slice(0, 2).join(' ') || 'TORNEO ANUAL'}
              </span>
              <span className="text-xs text-muted-foreground">DE GOLF</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "nav-link text-foreground/80 hover:text-primary",
                  location.pathname === item.path && "text-primary active"
                )}
              >
                {item.label}
              </Link>
            ))}
            {/* Admin indicator and link */}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "nav-link flex items-center gap-1",
                  location.pathname === '/admin' 
                    ? "text-primary" 
                    : "text-foreground/80 hover:text-primary"
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAdmin && (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {/* Admin link in mobile menu */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                    location.pathname === '/admin'
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Panel de Admin
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
