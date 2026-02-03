/**
 * Header Component
 * Main navigation header with responsive mobile menu
 * Supports grouped navigation with dropdown menus
 * Respects page visibility settings from admin context
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, ChevronDown } from 'lucide-react';
import { fetchTournamentInfo, TournamentInfo, MenuItem } from '@/data/mockData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ============= Types =============

/** Navigation item that can be a single link or a group with children */
interface NavItem {
  type: 'link' | 'group';
  id: string;
  label: string;
  path?: string;
  children?: MenuItem[];
  /** Whether to wrap text (display words stacked) */
  wrapText?: boolean;
}

// ============= Component =============

const Header = () => {
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const location = useLocation();
  
  // Get visible menu items and groups from context
  const { 
    getVisibleMenuItems, 
    isAdmin, 
    menuGroups, 
    pageGroupAssignments,
    isPageVisible,
  } = usePageVisibility();
  const allVisibleItems = getVisibleMenuItems();

  useEffect(() => {
    const loadData = async () => {
      const info = await fetchTournamentInfo();
      setTournamentInfo(info);
    };
    loadData();
  }, []);

  /**
   * Build navigation structure with groups and standalone items
   * Groups appear where their first page would be in the menu order
   */
  const buildNavItems = (): NavItem[] => {
    const navItems: NavItem[] = [];
    const processedPages = new Set<string>();
    const processedGroups = new Set<string>();

    // Sort items by order
    const sortedItems = [...allVisibleItems].sort((a, b) => a.order - b.order);

    for (const item of sortedItems) {
      if (processedPages.has(item.id)) continue;

      const groupId = pageGroupAssignments[item.id];
      
      if (groupId && !processedGroups.has(groupId)) {
        // Find the group configuration
        const group = menuGroups.find(g => g.id === groupId);
        
        // Only show group if it's visible
        if (group && group.visible !== false) {
          // Get all visible pages in this group
          const groupPages = sortedItems.filter(
            p => pageGroupAssignments[p.id] === groupId && isPageVisible(p.id)
          );
          
          if (groupPages.length > 0) {
            navItems.push({
              type: 'group',
              id: groupId,
              label: group.name,
              children: groupPages,
              wrapText: group.wrapText,
            });
            
            // Mark all pages in this group as processed
            groupPages.forEach(p => processedPages.add(p.id));
          }
        }
        processedGroups.add(groupId);
      } else if (!groupId) {
        // Standalone item (not in any group)
        navItems.push({
          type: 'link',
          id: item.id,
          label: item.label,
          path: item.path,
        });
        processedPages.add(item.id);
      }
    }

    return navItems;
  };

  const navItems = buildNavItems();

  /**
   * Check if any child route in a group is active
   */
  const isGroupActive = (children: MenuItem[]): boolean => {
    return children.some(child => location.pathname === child.path);
  };

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

          {/* Desktop Navigation with NavigationMenu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.type === 'link' ? (
                    // Single link item
                    <Link
                      to={item.path!}
                      className={cn(
                        "nav-link text-foreground/80 hover:text-primary px-4 py-2",
                        location.pathname === item.path && "text-primary active"
                      )}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    // Group with dropdown
                    <>
                      <NavigationMenuTrigger
                        className={cn(
                          "bg-transparent hover:bg-transparent data-[state=open]:bg-transparent",
                          "text-foreground/80 hover:text-primary data-[state=open]:text-primary",
                          isGroupActive(item.children!) && "text-primary",
                          item.wrapText && "flex-col leading-tight text-center h-auto py-1 min-h-[40px]"
                        )}
                      >
                        {item.wrapText ? (
                          <span className="flex flex-col items-center text-xs">
                            {item.label.split(' ').map((word, i) => (
                              <span key={i}>{word}</span>
                            ))}
                          </span>
                        ) : (
                          item.label
                        )}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-1 p-2">
                          {item.children!.map((child) => (
                            <li key={child.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={child.path}
                                  className={cn(
                                    "block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    location.pathname === child.path && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
              {/* Admin indicator and link */}
              {isAdmin && (
                <NavigationMenuItem>
                  <Link
                    to="/admin"
                    className={cn(
                      "nav-link flex items-center gap-1 px-4 py-2",
                      location.pathname === '/admin' 
                        ? "text-primary" 
                        : "text-foreground/80 hover:text-primary"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

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
              {navItems.map((item) => (
                item.type === 'link' ? (
                  // Single link item
                  <Link
                    key={item.id}
                    to={item.path!}
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
                ) : (
                  // Group with collapsible submenu
                  <Collapsible
                    key={item.id}
                    open={openMobileGroup === item.id}
                    onOpenChange={(open) => setOpenMobileGroup(open ? item.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                          isGroupActive(item.children!)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-muted"
                        )}
                      >
                        <span>{item.wrapText ? item.label.split(' ').join('\n') : item.label}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          openMobileGroup === item.id && "rotate-180"
                        )} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-border pl-4">
                        {item.children!.map((child) => (
                          <Link
                            key={child.id}
                            to={child.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "px-3 py-2 text-sm rounded-lg transition-colors",
                              location.pathname === child.path
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground/70 hover:bg-muted"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
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
