/**
 * PageVisibilityContext
 * Manages page visibility state for admin-controlled menu items
 * Uses localStorage for persistence without backend dependency
 * Includes support for page notes and menu groups
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { menuConfig, MenuItem } from '@/data/mockData';
import { LayoutMode, ColumnCount } from '@/components/admin/AdminLayoutSettings';
import { MenuGroup } from '@/components/admin/AdminMenuGroups';

// ============= Types =============

/** Visibility settings for each page by ID */
/** Custom order overrides for menu items */
export interface MenuItemOrder {
  [pageId: string]: number;
}

export interface PageVisibilitySettings {
  [pageId: string]: boolean;
}

/** Notes for each page by ID */
export interface PageNotes {
  [pageId: string]: string;
}

/** Page to group assignments */
export interface PageGroupAssignments {
  [pageId: string]: string;
}

/** Admin layout preferences */
export interface AdminLayoutPreferences {
  layout: LayoutMode;
  columns: ColumnCount;
}

/** Context value interface */
interface PageVisibilityContextType {
  /** Current visibility settings */
  visibilitySettings: PageVisibilitySettings;
  /** Update visibility for a specific page */
  setPageVisibility: (pageId: string, visible: boolean) => void;
  /** Check if a page is visible */
  isPageVisible: (pageId: string) => boolean;
  /** Check if user is admin */
  isAdmin: boolean;
  /** Login as admin */
  loginAsAdmin: (password: string) => boolean;
  /** Logout admin */
  logoutAdmin: () => void;
  /** Get all menu items (for admin view) */
  getAllMenuItems: () => MenuItem[];
  /** Get visible menu items (for user view) */
  getVisibleMenuItems: () => MenuItem[];
  /** Page notes */
  pageNotes: PageNotes;
  /** Update note for a page */
  setPageNote: (pageId: string, note: string) => void;
  /** Menu groups */
  menuGroups: MenuGroup[];
  /** Update menu groups */
  setMenuGroups: (groups: MenuGroup[]) => void;
  /** Page group assignments */
  pageGroupAssignments: PageGroupAssignments;
  /** Assign page to group */
  setPageGroupAssignment: (pageId: string, groupId: string | null) => void;
  /** Admin layout preferences */
  layoutPreferences: AdminLayoutPreferences;
  /** Update layout preferences */
  setLayoutPreferences: (prefs: AdminLayoutPreferences) => void;
  /** Custom menu item order overrides */
  menuItemOrder: MenuItemOrder;
  /** Update menu item order */
  setMenuItemOrder: (order: MenuItemOrder) => void;
}

// ============= Constants =============

/** LocalStorage key for visibility settings */
const STORAGE_KEY = 'tournament_page_visibility';

/** LocalStorage key for admin session */
const ADMIN_SESSION_KEY = 'tournament_admin_session';

/** LocalStorage key for page notes */
const NOTES_STORAGE_KEY = 'tournament_page_notes';

/** LocalStorage key for menu groups */
const GROUPS_STORAGE_KEY = 'tournament_menu_groups';

/** LocalStorage key for page group assignments */
const PAGE_GROUPS_STORAGE_KEY = 'tournament_page_group_assignments';

/** LocalStorage key for admin layout preferences */
const LAYOUT_PREFS_STORAGE_KEY = 'tournament_admin_layout_prefs';

/** LocalStorage key for custom menu item order */
const MENU_ORDER_STORAGE_KEY = 'tournament_menu_item_order';

/** Admin password - in production, this should be more secure */
const ADMIN_PASSWORD = 'admin2025';

// ============= Context =============

const PageVisibilityContext = createContext<PageVisibilityContextType | undefined>(undefined);

// ============= Provider Component =============

interface PageVisibilityProviderProps {
  children: ReactNode;
}

/**
 * PageVisibilityProvider
 * Wraps the app to provide page visibility state management
 */
export const PageVisibilityProvider = ({ children }: PageVisibilityProviderProps) => {
  // Initialize visibility settings from localStorage or defaults
  const [visibilitySettings, setVisibilitySettings] = useState<PageVisibilitySettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parse fails, use defaults
      }
    }
    // Default: all enabled pages are visible
    const defaults: PageVisibilitySettings = {};
    menuConfig.forEach(item => {
      defaults[item.id] = item.enabled;
    });
    return defaults;
  });

  // Admin session state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  // Page notes state
  const [pageNotes, setPageNotes] = useState<PageNotes>(() => {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parse fails, use empty object
      }
    }
    return {};
  });

  // Menu groups state
  const [menuGroups, setMenuGroupsState] = useState<MenuGroup[]>(() => {
    const stored = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parse fails, use empty array
      }
    }
    return [];
  });

  // Page group assignments state
  const [pageGroupAssignments, setPageGroupAssignmentsState] = useState<PageGroupAssignments>(() => {
    const stored = localStorage.getItem(PAGE_GROUPS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parse fails, use empty object
      }
    }
    return {};
  });

  // Admin layout preferences
  const [layoutPreferences, setLayoutPreferencesState] = useState<AdminLayoutPreferences>(() => {
    const stored = localStorage.getItem(LAYOUT_PREFS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parse fails, use defaults
      }
    }
    return { layout: 'grid' as LayoutMode, columns: 3 as ColumnCount };
  });

  // Persist visibility settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibilitySettings));
  }, [visibilitySettings]);

  // Persist admin session to localStorage
  useEffect(() => {
    localStorage.setItem(ADMIN_SESSION_KEY, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Persist page notes to localStorage
  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(pageNotes));
  }, [pageNotes]);

  // Persist menu groups to localStorage
  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(menuGroups));
  }, [menuGroups]);

  // Persist page group assignments to localStorage
  useEffect(() => {
    localStorage.setItem(PAGE_GROUPS_STORAGE_KEY, JSON.stringify(pageGroupAssignments));
  }, [pageGroupAssignments]);

  // Persist layout preferences to localStorage
  useEffect(() => {
    localStorage.setItem(LAYOUT_PREFS_STORAGE_KEY, JSON.stringify(layoutPreferences));
  }, [layoutPreferences]);

  /**
   * Set visibility for a specific page
   */
  const setPageVisibility = (pageId: string, visible: boolean) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [pageId]: visible,
    }));
  };

  /**
   * Check if a page is visible
   */
  const isPageVisible = (pageId: string): boolean => {
    if (isAdmin) return true; // Admins see all pages
    return visibilitySettings[pageId] ?? true;
  };

  /**
   * Login as admin with password
   */
  const loginAsAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  /**
   * Logout admin session
   */
  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  /**
   * Get all menu items (for admin dashboard)
   */
  const getAllMenuItems = (): MenuItem[] => {
    return menuConfig.sort((a, b) => a.order - b.order);
  };

  /**
   * Get visible menu items (for regular navigation)
   */
  const getVisibleMenuItems = (): MenuItem[] => {
    return menuConfig
      .filter(item => isPageVisible(item.id))
      .sort((a, b) => a.order - b.order);
  };

  /**
   * Set note for a specific page
   */
  const setPageNote = (pageId: string, note: string) => {
    setPageNotes(prev => ({
      ...prev,
      [pageId]: note,
    }));
  };

  /**
   * Update menu groups
   */
  const setMenuGroups = (groups: MenuGroup[]) => {
    setMenuGroupsState(groups);
  };

  /**
   * Assign page to group
   */
  const setPageGroupAssignment = (pageId: string, groupId: string | null) => {
    setPageGroupAssignmentsState(prev => {
      if (groupId === null) {
        const { [pageId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [pageId]: groupId };
    });
  };

  /**
   * Update layout preferences
   */
  const setLayoutPreferences = (prefs: AdminLayoutPreferences) => {
    setLayoutPreferencesState(prefs);
  };

  const value: PageVisibilityContextType = {
    visibilitySettings,
    setPageVisibility,
    isPageVisible,
    isAdmin,
    loginAsAdmin,
    logoutAdmin,
    getAllMenuItems,
    getVisibleMenuItems,
    pageNotes,
    setPageNote,
    menuGroups,
    setMenuGroups,
    pageGroupAssignments,
    setPageGroupAssignment,
    layoutPreferences,
    setLayoutPreferences,
  };

  return (
    <PageVisibilityContext.Provider value={value}>
      {children}
    </PageVisibilityContext.Provider>
  );
};

// ============= Default Context Value =============

/** Default values when context is not available (fallback for safety) */
const defaultContextValue: PageVisibilityContextType = {
  visibilitySettings: {},
  setPageVisibility: () => {},
  isPageVisible: () => true,
  isAdmin: false,
  loginAsAdmin: () => false,
  logoutAdmin: () => {},
  getAllMenuItems: () => [],
  getVisibleMenuItems: () => [],
  pageNotes: {},
  setPageNote: () => {},
  menuGroups: [],
  setMenuGroups: () => {},
  pageGroupAssignments: {},
  setPageGroupAssignment: () => {},
  layoutPreferences: { layout: 'grid', columns: 3 },
  setLayoutPreferences: () => {},
};

// ============= Hook =============

/**
 * usePageVisibility hook
 * Access page visibility context from any component
 * Returns default values if used outside provider (for resilience)
 */
export const usePageVisibility = (): PageVisibilityContextType => {
  const context = useContext(PageVisibilityContext);
  // Return default values if context is not available (safety fallback)
  if (context === undefined) {
    console.warn('usePageVisibility: Context not available, using defaults');
    return defaultContextValue;
  }
  return context;
};
