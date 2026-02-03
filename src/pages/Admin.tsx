/**
 * Admin Page
 * Dashboard for managing page visibility settings, notes, and menu groups
 * Protected by password authentication
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPageCard from '@/components/admin/AdminPageCard';
import AdminLayoutSettings from '@/components/admin/AdminLayoutSettings';
import AdminMenuGroups from '@/components/admin/AdminMenuGroups';
import { 
  Shield, 
  LogOut, 
  Lock,
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  FolderTree
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============= Login Form Component =============

interface AdminLoginFormProps {
  onLogin: (password: string) => boolean;
}

/**
 * AdminLoginForm
 * Password input form for admin authentication
 */
const AdminLoginForm = ({ onLogin }: AdminLoginFormProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Acceso Administrativo</CardTitle>
          <CardDescription>
            Ingresa la contraseña para acceder al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className={cn(
                    "pl-10",
                    error && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="Ingresa la contraseña"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Contraseña incorrecta
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= Admin Dashboard Component =============

/**
 * AdminDashboard
 * Main admin interface with tabs for visibility, notes, and menu groups
 */
const AdminDashboard = () => {
  const { 
    visibilitySettings, 
    setPageVisibility, 
    logoutAdmin,
    getAllMenuItems,
    pageNotes,
    setPageNote,
    menuGroups,
    setMenuGroups,
    pageGroupAssignments,
    setPageGroupAssignment,
    layoutPreferences,
    setLayoutPreferences,
  } = usePageVisibility();
  const navigate = useNavigate();
  
  const menuItems = getAllMenuItems();
  const visibleCount = Object.values(visibilitySettings).filter(Boolean).length;
  const hiddenCount = menuItems.length - visibleCount;

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  /**
   * Get group name for a page
   */
  const getGroupName = (pageId: string): string | undefined => {
    const groupId = pageGroupAssignments[pageId];
    if (!groupId) return undefined;
    const group = menuGroups.find(g => g.id === groupId);
    return group?.name;
  };

  /**
   * Get grid column class based on column count
   */
  const getGridClass = () => {
    switch (layoutPreferences.columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: // 3
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona páginas, grupos y configuración del menú</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xl font-bold">{visibleCount}</p>
                <p className="text-xs text-muted-foreground">Visibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold">{hiddenCount}</p>
                <p className="text-xs text-muted-foreground">Ocultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-accent-foreground" />
              <div>
                <p className="text-xl font-bold">{menuGroups.length}</p>
                <p className="text-xs text-muted-foreground">Grupos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xl font-bold">{menuItems.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different admin sections */}
      <Tabs defaultValue="visibility" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visibility" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visibilidad</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Grupos de Menú</span>
          </TabsTrigger>
        </TabsList>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-4">
          {/* Layout Settings */}
          <AdminLayoutSettings
            layout={layoutPreferences.layout}
            onLayoutChange={(layout) => setLayoutPreferences({ ...layoutPreferences, layout })}
            columns={layoutPreferences.columns}
            onColumnsChange={(columns) => setLayoutPreferences({ ...layoutPreferences, columns })}
          />

          {/* Page Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Control de Visibilidad</CardTitle>
              <CardDescription>
                Activa/desactiva páginas y añade notas para cada una. Las páginas ocultas no aparecen en el menú.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn(
                layoutPreferences.layout === 'grid' 
                  ? `grid ${getGridClass()} gap-4` 
                  : 'space-y-3'
              )}>
                {menuItems.map((item) => (
                  <AdminPageCard
                    key={item.id}
                    pageId={item.id}
                    label={item.label}
                    path={item.path}
                    isVisible={visibilitySettings[item.id] ?? true}
                    onToggle={(visible) => setPageVisibility(item.id, visible)}
                    note={pageNotes[item.id] || ''}
                    onNoteChange={(note) => setPageNote(item.id, note)}
                    layout={layoutPreferences.layout}
                    groupName={getGroupName(item.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Groups Tab */}
        <TabsContent value="groups">
          <AdminMenuGroups
            menuItems={menuItems}
            groups={menuGroups}
            onGroupsChange={setMenuGroups}
            pageGroupAssignments={pageGroupAssignments}
            onPageGroupChange={setPageGroupAssignment}
          />
        </TabsContent>
      </Tabs>

      {/* Info Note */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Como administrador, siempre podrás ver todas las páginas. 
          Los cambios se aplican inmediatamente para los usuarios normales.
          Las notas son solo para referencia interna del administrador.
        </p>
      </div>
    </div>
  );
};

// ============= Main Admin Page =============

/**
 * Admin Page Component
 * Handles authentication and displays dashboard
 */
const Admin = () => {
  const { isAdmin, loginAsAdmin } = usePageVisibility();

  return (
    <Layout>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <AdminLoginForm onLogin={loginAsAdmin} />
      )}
    </Layout>
  );
};

export default Admin;
