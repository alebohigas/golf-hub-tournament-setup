import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { fetchMenuConfig, fetchTournamentInfo, MenuItem, TournamentInfo } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const [items, info] = await Promise.all([
        fetchMenuConfig(),
        fetchTournamentInfo()
      ]);
      setMenuItems(items);
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
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
