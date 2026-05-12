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
import AdminConvocatoria from '@/components/admin/AdminConvocatoria';
import AdminLiveScoring from '@/components/admin/AdminLiveScoring';
import AdminSponsors from '@/components/admin/AdminSponsors';
import AdminPagina from '@/components/admin/AdminPagina';
import AdminEventos from '@/components/admin/AdminEventos';
import AdminAvisos from '@/components/admin/AdminAvisos';
import AdminUploads from '@/components/admin/AdminUploads';
import { 
  Shield, 
  LogOut, 
  Lock,
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  FolderTree,
  Database,
  GripVertical,
  Globe,
  Loader2,
  FileText,
  Radio,
  Image as ImageIcon,
  LayoutPanelTop,
  CalendarDays,
  Bell,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';

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
    menuItemOrder,
    setMenuItemOrder,
  } = usePageVisibility();
  const navigate = useNavigate();
  const { torneoId, setTorneoId } = useTorneoId();
  const { data: siteConfig, isLoading: isLoadingSiteConfig } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();
  const [torneoInput, setTorneoInput] = useState(torneoId);
  
  const menuItems = getAllMenuItems();
  const visibleCount = Object.values(visibilitySettings).filter(Boolean).length;
  const hiddenCount = menuItems.length - visibleCount;

  /**
   * Save a specific config field to the server for all visitors
   */
  const syncToServer = (fields: Record<string, any>) => {
    saveSiteConfig.mutate(
      { password: 'admin2025', ...fields },
      {
        onError: (err) => {
          toast({
            title: 'Error al sincronizar',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  /** Wrapper: set visibility and sync to server */
  const handleSetVisibility = (pageId: string, visible: boolean) => {
    const updated = { ...visibilitySettings, [pageId]: visible };
    setPageVisibility(pageId, visible);
    syncToServer({ visibility: updated });
  };

  /** Wrapper: set menu order and sync to server */
  const handleSetMenuOrder = (order: Record<string, number>) => {
    setMenuItemOrder(order);
    syncToServer({ menu_order: Object.keys(order).length > 0 ? order : null });
  };

  /** Wrapper: set menu groups and sync to server */
  const handleSetMenuGroups = (groups: any[]) => {
    setMenuGroups(groups);
    syncToServer({ menu_groups: groups.length > 0 ? groups : null });
  };

  /** Wrapper: set page group assignment and sync to server */
  const handleSetPageGroupAssignment = (pageId: string, groupId: string | null) => {
    setPageGroupAssignment(pageId, groupId);
    const updated = { ...pageGroupAssignments };
    if (groupId === null) {
      delete updated[pageId];
    } else {
      updated[pageId] = groupId;
    }
    syncToServer({ page_group_assignments: Object.keys(updated).length > 0 ? updated : null });
  };

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
      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="config" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
          <TabsTrigger value="archivos" className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Archivos</span>
          </TabsTrigger>
          <TabsTrigger value="pagina" className="gap-2">
            <LayoutPanelTop className="h-4 w-4" />
            <span className="hidden sm:inline">Página</span>
          </TabsTrigger>
          <TabsTrigger value="convocatoria" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Convocatoria</span>
          </TabsTrigger>
          <TabsTrigger value="eventos" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="avisos" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Avisos</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">Live</span>
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Patrocinadores</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          {/* Server-side torneoid config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Configuración del Torneo (Global)
              </CardTitle>
              <CardDescription>
                Configura el ID del torneo para este dominio. Este valor aplica para <strong>todos los visitantes</strong> del sitio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                {/* Server config status */}
                {isLoadingSiteConfig ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando configuración del servidor...
                  </div>
                ) : siteConfig?.torneoid ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-4 w-4 text-primary" />
                    Torneo en servidor: <span className="font-mono font-bold">{siteConfig.torneoid}</span>
                    <span className="text-xs">({siteConfig.domain})</span>
                  </p>
                ) : (
                  <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Sin configuración en servidor. Los visitantes no verán datos hasta configurarlo.
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="torneoid">Torneo ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="torneoid"
                      type="text"
                      value={torneoInput}
                      onChange={(e) => setTorneoInput(e.target.value)}
                      placeholder="Ej: 341"
                      className="font-mono"
                    />
                    <Button 
                      onClick={() => {
                        // Save locally
                        setTorneoId(torneoInput);
                        // Save to server for all visitors
                        saveSiteConfig.mutate(
                          { torneoid: parseInt(torneoInput), password: 'admin2025' },
                          {
                            onSuccess: () => {
                              toast({
                                title: 'Configuración guardada',
                                description: `Torneo ${torneoInput} configurado para todos los visitantes de este dominio.`,
                              });
                            },
                            onError: (err) => {
                              toast({
                                title: 'Error al guardar en servidor',
                                description: err.message + '. Se guardó solo localmente.',
                                variant: 'destructive',
                              });
                            },
                          }
                        );
                      }}
                      disabled={!torneoInput || saveSiteConfig.isPending}
                    >
                      {saveSiteConfig.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Guardar'
                      )}
                    </Button>
                  </div>
                  {torneoId && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Torneo local: <span className="font-mono font-bold">{torneoId}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archivos Tab — upload images + PDFs to the server */}
        <TabsContent value="archivos">
          <AdminUploads />
        </TabsContent>

        {/* Página Tab — groups Visibilidad, Orden y Grupos as nested sub-tabs */}
        <TabsContent value="pagina">
          <AdminPagina
            menuItems={menuItems}
            visibilitySettings={visibilitySettings}
            pageNotes={pageNotes}
            pageGroupAssignments={pageGroupAssignments}
            menuGroups={menuGroups}
            layoutPreferences={layoutPreferences}
            menuItemOrder={menuItemOrder}
            getGroupName={getGroupName}
            getGridClass={getGridClass}
            onSetVisibility={handleSetVisibility}
            onSetPageNote={setPageNote}
            onSetLayoutPreferences={setLayoutPreferences}
            onSetMenuOrder={handleSetMenuOrder}
            onSetMenuGroups={handleSetMenuGroups}
            onSetPageGroupAssignment={handleSetPageGroupAssignment}
          />
        </TabsContent>

        {/* Archivos Tab — upload images + PDFs to the server */}
        <TabsContent value="archivos">
          <AdminUploads />
        </TabsContent>

        {/* Convocatoria Tab */}
        <TabsContent value="convocatoria">
          <AdminConvocatoria />
        </TabsContent>

        {/* Eventos Tab — controls poster grid layout (desktop & mobile) */}
        <TabsContent value="eventos">
          <AdminEventos />
        </TabsContent>

        {/* Avisos Tab — controls Avisos page poster grid layout (desktop & mobile) */}
        <TabsContent value="avisos">
          <AdminAvisos />
        </TabsContent>

        {/* Live Scoring Tab */}
        <TabsContent value="live">
          <AdminLiveScoring />
        </TabsContent>

        {/* Sponsors Tab — controls how the Patrocinadores page renders sponsor logos */}
        <TabsContent value="sponsors">
          <AdminSponsors />
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
