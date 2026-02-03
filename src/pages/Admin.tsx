/**
 * Admin Page
 * Dashboard for managing page visibility settings
 * Protected by password authentication
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  LogOut, 
  Lock,
  Settings,
  CheckCircle2,
  XCircle
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

// ============= Page Toggle Card Component =============

interface PageToggleCardProps {
  pageId: string;
  label: string;
  path: string;
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

/**
 * PageToggleCard
 * Individual card for toggling page visibility
 */
const PageToggleCard = ({ pageId, label, path, isVisible, onToggle }: PageToggleCardProps) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border transition-colors",
        isVisible 
          ? "bg-card border-border" 
          : "bg-muted/50 border-muted"
      )}
    >
      <div className="flex items-center gap-3">
        {isVisible ? (
          <Eye className="h-5 w-5 text-primary" />
        ) : (
          <EyeOff className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className={cn(
            "font-medium",
            !isVisible && "text-muted-foreground"
          )}>
            {label}
          </p>
          <p className="text-sm text-muted-foreground">{path}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={isVisible ? "default" : "secondary"}>
          {isVisible ? "Visible" : "Oculto"}
        </Badge>
        <Switch
          checked={isVisible}
          onCheckedChange={onToggle}
          aria-label={`Toggle visibility for ${label}`}
        />
      </div>
    </div>
  );
};

// ============= Admin Dashboard Component =============

/**
 * AdminDashboard
 * Main admin interface for managing page visibility
 */
const AdminDashboard = () => {
  const { 
    visibilitySettings, 
    setPageVisibility, 
    logoutAdmin,
    getAllMenuItems 
  } = usePageVisibility();
  const navigate = useNavigate();
  
  const menuItems = getAllMenuItems();
  const visibleCount = Object.values(visibilitySettings).filter(Boolean).length;
  const hiddenCount = menuItems.length - visibleCount;

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Controla la visibilidad de las páginas del torneo</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visibleCount}</p>
                <p className="text-sm text-muted-foreground">Páginas Visibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hiddenCount}</p>
                <p className="text-sm text-muted-foreground">Páginas Ocultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{menuItems.length}</p>
                <p className="text-sm text-muted-foreground">Total de Páginas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Control de Visibilidad</CardTitle>
          <CardDescription>
            Activa o desactiva las páginas que deseas mostrar en el menú de navegación.
            Los usuarios no podrán acceder a las páginas ocultas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <PageToggleCard
                key={item.id}
                pageId={item.id}
                label={item.label}
                path={item.path}
                isVisible={visibilitySettings[item.id] ?? true}
                onToggle={(visible) => setPageVisibility(item.id, visible)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Como administrador, siempre podrás ver todas las páginas. 
          Los cambios se aplican inmediatamente para los usuarios normales.
          Las páginas ocultas mostrarán un error 404 para usuarios no administradores.
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
