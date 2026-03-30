/**
 * Header Component
 * Main navigation header with responsive mobile menu
 * Supports grouped navigation with dropdown menus
 * Implements dynamic overflow detection: when menu items exceed
 * available space, excess items are collapsed into the hamburger menu
 * Respects page visibility settings from admin context
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useTournamentInfo } from '@/hooks/useTournamentData';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MenuItem } from '@/data/mockData';
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

// ============= Hook: useOverflowMenu =============

/**
 * Custom hook that measures nav items and determines how many fit
 * in the available space. Returns the split index for visible vs overflow.
 */
const useOverflowMenu = (
  navRef: React.RefObject<HTMLDivElement>,
  logoRef: React.RefObject<HTMLDivElement>,
  itemCount: number,
) => {
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const measure = useCallback(() => {
    const nav = navRef.current;
    const logo = logoRef.current;
    if (!nav || !logo) return;

    const headerWidth = nav.parentElement?.clientWidth ?? window.innerWidth;
    const logoWidth = logo.offsetWidth + 24; // logo + gap
    const adminBtnWidth = 80; // reserve space for admin badge
    const overflowBtnWidth = 48; // "..." button width
    const availableWidth = headerWidth - logoWidth - adminBtnWidth - 32; // padding

    // Measure each nav item's width
    const items = nav.querySelectorAll<HTMLElement>('[data-nav-item]');
    let totalWidth = 0;
    let fitCount = 0;

    for (let i = 0; i < items.length; i++) {
      const itemWidth = items[i].offsetWidth + 4; // + gap
      if (totalWidth + itemWidth + (i < items.length - 1 ? overflowBtnWidth : 0) <= availableWidth) {
        totalWidth += itemWidth;
        fitCount++;
      } else {
        break;
      }
    }

    setVisibleCount(fitCount);
  }, [navRef, logoRef, itemCount]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Re-measure when item count changes
  useEffect(() => {
    // Small delay to let DOM render
    const t = setTimeout(measure, 100);
    return () => clearTimeout(t);
  }, [itemCount, measure]);

  return visibleCount;
};

// ============= Component =============

const Header = () => {
  const { data: tournamentInfo } = useTournamentInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Get visible menu items and groups from context
  const { 
    getVisibleMenuItems, 
    isAdmin, 
    menuGroups, 
    pageGroupAssignments,
    isPageVisible,
  } = usePageVisibility();
  const allVisibleItems = getVisibleMenuItems();

  /**
   * Build navigation structure with groups and standalone items
   * Groups appear where their first page would be in the menu order
   */
  const buildNavItems = (): NavItem[] => {
    const navItems: NavItem[] = [];
    const processedPages = new Set<string>();
    const processedGroups = new Set<string>();

    const sortedItems = [...allVisibleItems].sort((a, b) => a.order - b.order);

    for (const item of sortedItems) {
      if (processedPages.has(item.id)) continue;

      const groupId = pageGroupAssignments[item.id];
      
      if (groupId && !processedGroups.has(groupId)) {
        const group = menuGroups.find(g => g.id === groupId);
        
        if (group && group.visible !== false) {
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
            groupPages.forEach(p => processedPages.add(p.id));
          }
        }
        processedGroups.add(groupId);
      } else if (!groupId) {
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

  // Overflow detection: determine how many items fit in the header
  const visibleCount = useOverflowMenu(navRef, logoRef, navItems.length);
  const visibleNavItems = navItems.slice(0, visibleCount);
  const overflowNavItems = navItems.slice(visibleCount);

  /** Check if any child route in a group is active */
  const isGroupActive = (children: MenuItem[]): boolean => {
    return children.some(child => location.pathname === child.path);
  };

  /** Render a single desktop nav item (link or group trigger) */
  const renderDesktopNavItem = (item: NavItem) => {
    if (item.type === 'link') {
      return (
        <Link
          to={item.path!}
          className={cn(
            "nav-link text-foreground/80 hover:text-primary px-3 py-2 text-sm whitespace-nowrap",
            location.pathname === item.path && "text-primary active"
          )}
        >
          {item.label}
        </Link>
      );
    }
    return (
      <>
        <NavigationMenuTrigger
          className={cn(
            "bg-transparent hover:bg-transparent data-[state=open]:bg-transparent",
            "text-foreground/80 hover:text-primary data-[state=open]:text-primary text-sm",
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
    );
  };

  /** Render a mobile nav item (link or collapsible group) */
  const renderMobileNavItem = (item: NavItem) => {
    if (item.type === 'link') {
      return (
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
      );
    }
    return (
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
            <span>{item.label}</span>
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
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div ref={logoRef} className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-3">
              {(tournamentInfo?.logoHeaderUrl || tournamentInfo?.logoUrl) ? (
                <img 
                  src={tournamentInfo.logoHeaderUrl || tournamentInfo.logoUrl} 
                  alt={tournamentInfo.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-contain"
                />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                  {tournamentInfo?.id || ''}
                </div>
              )}
              <div className="hidden sm:block">
                <span className="text-sm font-display font-semibold text-primary leading-tight block">
                  {tournamentInfo?.name?.split(' ').slice(0, 2).join(' ') || 'TORNEO'}
                </span>
                <span className="text-xs text-muted-foreground">DE GOLF</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation with overflow detection */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-end min-w-0">
            {/* Invisible measurement container - renders all items to measure widths */}
            <div
              ref={navRef}
              className="absolute opacity-0 pointer-events-none flex items-center gap-1"
              aria-hidden="true"
            >
              {navItems.map((item) => (
                <div key={item.id} data-nav-item className="px-3 py-2 text-sm whitespace-nowrap">
                  {item.label}
                </div>
              ))}
            </div>

            {/* Visible navigation items */}
            <NavigationMenu>
              <NavigationMenuList>
                {visibleNavItems.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    {renderDesktopNavItem(item)}
                  </NavigationMenuItem>
                ))}

                {/* Overflow dropdown - shows excess items */}
                {overflowNavItems.length > 0 && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-foreground/80 hover:text-primary data-[state=open]:text-primary"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[220px] gap-1 p-2">
                        {overflowNavItems.map((item) => (
                          item.type === 'link' ? (
                            <li key={item.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.path!}
                                  className={cn(
                                    "block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    location.pathname === item.path && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  {item.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ) : (
                            <li key={item.id} className="space-y-1">
                              <span className="block px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {item.label}
                              </span>
                              {item.children!.map((child) => (
                                <NavigationMenuLink key={child.id} asChild>
                                  <Link
                                    to={child.path}
                                    className={cn(
                                      "block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors pl-5",
                                      "hover:bg-accent hover:text-accent-foreground",
                                      location.pathname === child.path && "bg-accent text-accent-foreground"
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </li>
                          )
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Admin indicator and link */}
                {isAdmin && (
                  <NavigationMenuItem>
                    <Link
                      to="/admin"
                      className={cn(
                        "nav-link flex items-center gap-1 px-3 py-2 text-sm",
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
          </div>

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
              className="!h-14 !w-14"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="!h-9 !w-9" strokeWidth={2.5} /> : <Menu className="!h-9 !w-9" strokeWidth={2.5} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - includes ALL items + overflow items */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => renderMobileNavItem(item))}
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
