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
import AdminPremios from '@/components/admin/AdminPremios';
import AdminHoteles from '@/components/admin/AdminHoteles';
import AdminUploads from '@/components/admin/AdminUploads';
import AdminRegistro from '@/components/admin/AdminRegistro';
import AdminRegistroPrecios from '@/components/admin/AdminRegistroPrecios';
import AdminCategoriasReglas from '@/components/admin/AdminCategoriasReglas';
import AdminBrackets from '@/components/admin/AdminBrackets';
import AdminThemePalette from '@/components/admin/AdminThemePalette';
import AdminShowcase300 from '@/components/admin/AdminShowcase300';
import AdminStats from '@/components/admin/AdminStats';
import AdminPopup from '@/components/admin/AdminPopup';
import AdminBanderas from '@/components/admin/AdminBanderas';
import AdminStaffUsers from '@/components/admin/AdminStaffUsers';
import { useStaffAuth, type StaffArea } from '@/contexts/StaffAuthContext';
import { RegistrosDashboard } from '@/pages/AdminRegistros';
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
  ClipboardList,
  Trophy,
  ListChecks,
  BarChart3,
  MonitorPlay,
  Flag,
  Hotel,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';

// ============= Login Form Component =============

interface AdminLoginFormProps {
  onLogin: (password: string) => Promise<boolean>;
}

/**
 * AdminLoginForm
 * Password input form for admin authentication
 */
const AdminLoginForm = ({ onLogin }: AdminLoginFormProps) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login: staffLogin } = useStaffAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false); setErrorMsg(null);
    // Si no hay usuario → intentar admin legacy. Si sí → login staff.
    if (!usuario.trim()) {
      setBusy(true);
      const success = await onLogin(password);
      setBusy(false);
      if (!success) { setError(true); setErrorMsg('Contraseña incorrecta'); setPassword(''); }
      return;
    }
    setBusy(true);
    const r = await staffLogin(usuario.trim(), password);
    setBusy(false);
    if (!r.ok) {
      setError(true);
      setErrorMsg(r.error || 'Credenciales inválidas');
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
              <Label htmlFor="usuario">Usuario (opcional)</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setError(false); }}
                placeholder="Dejar vacío para admin principal"
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">
                Si tienes acceso temporal de staff, ingresa tu usuario.
              </p>
            </div>
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
                  {errorMsg || 'Contraseña incorrecta'}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Validando...' : 'Iniciar Sesión'}
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
  const { session: staffSession, logout: staffLogout } = useStaffAuth();
  const { isAdmin } = usePageVisibility();
  /** Mapa tab → área. Si no está en el mapa, sólo admin completo lo ve. */
  const TAB_AREA: Record<string, StaffArea | undefined> = {
    archivos: 'uploads',
    convocatoria: 'convocatoria',
    eventos: 'eventos',
    avisos: 'avisos',
    premios: 'premios',
    hoteles: 'hoteles',
    popup: 'pop',
    banderas: 'banderas',
    sponsors: undefined,
    registro: 'preregistros',
    registros: 'preregistros',
    brackets: 'brackets',
    stats: 'stats',
    usuarios: undefined,
    config: undefined,
    pagina: undefined,
    live: undefined,
    reglas: 'reglas',
  };
  const isStaffOnly = !!staffSession && !isAdmin;
  /** Áreas de staff → tab values del panel principal. */
  const AREA_TO_TAB: Record<StaffArea, string> = {
    preregistros: 'registros',
    brackets: 'brackets',
    banderas: 'banderas',
    pop: 'popup',
    eventos: 'eventos',
    avisos: 'avisos',
    premios: 'premios',
    hoteles: 'hoteles',
    convocatoria: 'convocatoria',
    reglas: 'convocatoria',
    uploads: 'archivos',
    stats: 'stats',
  };
  const staffDefaultTab = isStaffOnly && staffSession && staffSession.areas.length
    ? (AREA_TO_TAB[staffSession.areas[0]] || 'config')
    : 'config';
  /** Filtra tabs según permisos del usuario activo. */
  const visibleAdminTabs = <T extends { value: string }>(tabs: T[]): T[] => {
    if (!isStaffOnly) return tabs;
    return tabs.filter(t => {
      const area = TAB_AREA[t.value];
      return !!area && staffSession!.areas.includes(area);
    });
  };
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
      { password: getSuperAdminPassword(), ...fields },
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
    if (staffSession) { staffLogout(); }
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
      <Tabs defaultValue={staffDefaultTab} className="space-y-6">
        {/*
          Admin tab strip — split across two wrapping rows so 13+ tabs no
          longer cram into a single 12-column grid. `flex flex-wrap` lets
          each row reflow naturally per breakpoint; `h-auto` overrides the
          shadcn default fixed height. Every trigger carries an icon.
        */}
        {/*
          Admin tab strip — always rendered in TWO rows. When the total
          count is odd, the FIRST row gets the larger half (ceil(n/2)).
          Each row is its own <TabsList> (Radix supports multiple lists in
          one <Tabs> root and keeps the shared active state). Every trigger
          carries an icon for visual scanability.
        */}
        {(() => {
          /**
           * adminTabs
           * Centralized definition of every admin tab so the two-row
           * split stays in sync if tabs are added/removed. Order here
           * = display order across row 1 then row 2.
           */
          const adminTabs: { value: string; icon: any; label: string }[] = [
            { value: 'config',       icon: Database,        label: 'Config' },
            { value: 'archivos',     icon: Upload,          label: 'Archivos' },
            { value: 'pagina',       icon: LayoutPanelTop,  label: 'Página' },
            { value: 'convocatoria', icon: FileText,        label: 'Convocatoria' },
            { value: 'eventos',      icon: CalendarDays,    label: 'Eventos' },
            { value: 'avisos',       icon: Bell,            label: 'Avisos' },
            { value: 'premios',      icon: Trophy,          label: 'Premios' },
            { value: 'hoteles',      icon: Hotel,           label: 'Hoteles' },
            { value: 'popup',        icon: MonitorPlay,     label: 'POP' },
            { value: 'banderas',     icon: Flag,            label: 'Banderas' },
            { value: 'live',         icon: Radio,           label: 'Live' },
            { value: 'sponsors',     icon: ImageIcon,       label: 'Patrocinadores' },
            { value: 'registro',     icon: ClipboardList,   label: 'Pre-Registro' },
            { value: 'registros',    icon: ListChecks,      label: 'Registros' },
            { value: 'brackets',     icon: Trophy,          label: 'Brackets Putt' },
            { value: 'stats',        icon: BarChart3,       label: 'Estadísticas' },
            { value: 'usuarios',     icon: Users,           label: 'Usuarios' },
          ];
          // Filtrar por área para staff temporal. Admin completo ve todo.
          const allowed = visibleAdminTabs(adminTabs);
          // Split: first row = ceil(n/2) so odd counts give the bigger
          // half to the top row, per the design directive.
          const firstCount = Math.ceil(allowed.length / 2);
          const row1 = allowed.slice(0, firstCount);
          const row2 = allowed.slice(firstCount);
          const renderRow = (rowTabs: typeof adminTabs) => (
            <TabsList className="flex flex-wrap w-full h-auto gap-1 p-1">
              {rowTabs.map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="gap-2 flex-1 min-w-[120px]"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          );
          return (
            <div className="space-y-2">
              {renderRow(row1)}
              {renderRow(row2)}
            </div>
          );
        })()}

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
                          { torneoid: parseInt(torneoInput), password: getSuperAdminPassword() },
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

                {!isStaffOnly && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div>
                      <Label>Cambiar contraseña del superadmin</Label>
                      <p className="text-xs text-muted-foreground">
                        Aplica al acceso sin usuario del admin principal y no usa la tabla usuarios.
                      </p>
                    </div>
                    <Input
                      type="password"
                      value={currentAdminPassword}
                      onChange={(e) => setCurrentAdminPassword(e.target.value)}
                      placeholder="Contraseña actual"
                    />
                    <Input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                    />
                    <Input
                      type="password"
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Confirmar nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleChangeAdminPassword}
                      disabled={isChangingAdminPassword || !newAdminPassword || !confirmAdminPassword}
                    >
                      {isChangingAdminPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar contraseña'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Theme palette picker — applies per-domain via site_config.theme_config */}
          <AdminThemePalette />

          {/* Showcase 300 — buttons to open lobby/TV reports in new windows */}
          <AdminShowcase300 />
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

        {/* Premios Tab — manages Premios page poster grid (uploads + layout). */}
        <TabsContent value="premios">
          <AdminPremios />
        </TabsContent>

        {/* Hoteles Tab — manages Hoteles page poster grid (uploads + layout). */}
        <TabsContent value="hoteles">
          <AdminHoteles />
        </TabsContent>

        {/* POP UP Tab — site-wide popup overlay (image + target pages + duration). */}
        <TabsContent value="popup">
          <AdminPopup />
        </TabsContent>

        {/* Banderas Tab — pin sheet por hoyo (tabla `banderas`). */}
        <TabsContent value="banderas">
          <AdminBanderas />
        </TabsContent>

        {/* Live Scoring Tab */}
        <TabsContent value="live">
          <AdminLiveScoring />
        </TabsContent>

        {/* Sponsors Tab — controls how the Patrocinadores page renders sponsor logos */}
        <TabsContent value="sponsors">
          <AdminSponsors />
        </TabsContent>

        {/* Pre-Registro Tab — configures public registration form fields */}
        <TabsContent value="registro">
          <Tabs defaultValue="campos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="campos">Campos del formulario</TabsTrigger>
              <TabsTrigger value="categorias">Categorías elegibles</TabsTrigger>
              <TabsTrigger value="precios">Precios de inscripción</TabsTrigger>
            </TabsList>
            <TabsContent value="campos">
              <AdminRegistro />
            </TabsContent>
            <TabsContent value="categorias">
              <AdminCategoriasReglas />
            </TabsContent>
            <TabsContent value="precios">
              <AdminRegistroPrecios />
            </TabsContent>
          </Tabs>
        </TabsContent>
        {/* Registros Tab — duplica /admin/registros dentro del panel admin
            principal. Usa la misma contraseña interna (`registros2025`) que
            el endpoint verify; el listado público sigue disponible en
            /admin/registros para personal del club / ayudantes. */}
        <TabsContent value="registros">
          <RegistrosDashboard password="registros2025" />
        </TabsContent>
        {/* Brackets Putt Tab — config + visibilidad + captura de resultados
            (mode="full") para que el admin principal pueda hacerlo todo
            desde /admin. Ayudantes usan /admin/brackets (mode="scores"). */}
        <TabsContent value="brackets">
          <AdminBrackets mode="full" />
        </TabsContent>

        {/* Estadísticas Tab — override or auto-compute the home stats ribbon
            numbers per tournament (domain). See AdminStats.tsx. */}
        <TabsContent value="stats">
          <AdminStats />
        </TabsContent>

        {/* Usuarios Tab — solo admin completo. CRUD de staff temporal con
            áreas asignadas por checkbox y rango de fechas. */}
        {!isStaffOnly && (
          <TabsContent value="usuarios">
            <AdminStaffUsers />
          </TabsContent>
        )}
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
  const { session: staffSession } = useStaffAuth();

  return (
    <Layout>
      {(isAdmin || staffSession) ? (
        <AdminDashboard />
      ) : (
        <AdminLoginForm onLogin={loginAsAdmin} />
      )}
    </Layout>
  );
};

export default Admin;
