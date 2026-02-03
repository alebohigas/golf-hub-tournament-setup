/**
 * PageVisibilityContext
 * Manages page visibility state for admin-controlled menu items
 * Uses localStorage for persistence without backend dependency
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { menuConfig, MenuItem } from '@/data/mockData';

// ============= Types =============

/** Visibility settings for each page by ID */
export interface PageVisibilitySettings {
  [pageId: string]: boolean;
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
}

// ============= Constants =============

/** LocalStorage key for visibility settings */
const STORAGE_KEY = 'tournament_page_visibility';

/** LocalStorage key for admin session */
const ADMIN_SESSION_KEY = 'tournament_admin_session';

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

  // Persist visibility settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibilitySettings));
  }, [visibilitySettings]);

  // Persist admin session to localStorage
  useEffect(() => {
    localStorage.setItem(ADMIN_SESSION_KEY, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  /**
   * Set visibility for a specific page
   * @param pageId - The page ID to update
   * @param visible - Whether the page should be visible
   */
  const setPageVisibility = (pageId: string, visible: boolean) => {
    setVisibilitySettings(prev => ({
      ...prev,
      [pageId]: visible,
    }));
  };

  /**
   * Check if a page is visible
   * @param pageId - The page ID to check
   * @returns Whether the page is visible (admins always see all pages)
   */
  const isPageVisible = (pageId: string): boolean => {
    if (isAdmin) return true; // Admins see all pages
    return visibilitySettings[pageId] ?? true;
  };

  /**
   * Login as admin with password
   * @param password - The admin password
   * @returns Whether login was successful
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
   * @returns All menu items from config
   */
  const getAllMenuItems = (): MenuItem[] => {
    return menuConfig.sort((a, b) => a.order - b.order);
  };

  /**
   * Get visible menu items (for regular navigation)
   * @returns Only visible menu items
   */
  const getVisibleMenuItems = (): MenuItem[] => {
    return menuConfig
      .filter(item => isPageVisible(item.id))
      .sort((a, b) => a.order - b.order);
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
