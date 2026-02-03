/**
 * ProtectedRoute Component
 * Checks page visibility settings and blocks access to hidden pages
 * Admins can always access all pages
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';

// ============= Types =============

interface ProtectedRouteProps {
  /** The page ID to check visibility for */
  pageId: string;
  /** Child components to render if page is visible */
  children: ReactNode;
}

// ============= Component =============

/**
 * ProtectedRoute
 * Wraps page components to enforce visibility settings
 * Redirects to 404 if page is hidden and user is not admin
 */
const ProtectedRoute = ({ pageId, children }: ProtectedRouteProps) => {
  const { isPageVisible } = usePageVisibility();

  // Check if user can access this page
  if (!isPageVisible(pageId)) {
    // Redirect to 404 for hidden pages
    return <Navigate to="/not-found" replace />;
  }

  // Page is visible, render children
  return <>{children}</>;
};

export default ProtectedRoute;
