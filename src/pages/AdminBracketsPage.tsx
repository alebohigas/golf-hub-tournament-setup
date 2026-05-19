/**
 * AdminBracketsPage — `/admin/brackets`
 * --------------------------------------------------------------------
 * Acceso público (con contraseña independiente) para que personal externo
 * pueda capturar resultados de los brackets Putt Finales sin entrar al
 * panel completo de /admin. Reutiliza el componente AdminBrackets, que
 * incluye configuración, generación y captura de scores con avance auto.
 *
 * Auth: contraseña local `brackets2025`, persistida en sessionStorage.
 */

import { useState, type FormEvent } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminBrackets from '@/components/admin/AdminBrackets';

/** Clave en sessionStorage para mantener la sesión durante la pestaña. */
const SESSION_KEY = 'brackets_admin_session';
/** Contraseña local — independiente del resto del panel. */
const BRACKETS_PASSWORD = 'brackets2025';

// ============= Login form =============

const LoginForm = ({ onLogin }: { onLogin: (pwd: string) => boolean }) => {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!onLogin(pwd)) { setErr(true); setPwd(''); }
  };
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Brackets Putt</CardTitle>
          <CardDescription>Acceso para captura de resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pwd">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pwd" type="password" value={pwd}
                  onChange={e => { setPwd(e.target.value); setErr(false); }}
                  className={cn('pl-10', err && 'border-destructive focus-visible:ring-destructive')}
                  placeholder="Ingresa la contraseña"
                />
              </div>
              {err && <p className="text-sm text-destructive">Contraseña incorrecta</p>}
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= Page =============

const AdminBracketsPage = () => {
  const [authed, setAuthed] = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) === '1');

  /** Compara contraseña; persiste sesión al éxito. */
  const onLogin = (pwd: string) => {
    if (pwd === BRACKETS_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
      return true;
    }
    return false;
  };

  return (
    <Layout>
      {authed ? (
        <div className="container mx-auto px-4 py-8">
          <AdminBrackets />
        </div>
      ) : (
        <LoginForm onLogin={onLogin} />
      )}
    </Layout>
  );
};

export default AdminBracketsPage;