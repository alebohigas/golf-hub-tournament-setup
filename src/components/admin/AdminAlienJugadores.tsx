/**
 * AdminAlienJugadores
 * ---------------------------------------------------------------
 * ALIEN SYSTEM → pestaña "Jugadores".
 *
 * Listado completo de jugadores del torneo con VISTA RÁPIDA de los datos
 * que alimentan la tarjeta de juego: PAR del campo, HANDICAP (HI / HJ / HN)
 * y CATEGORÍA (con su tee de salida). Permite EDITAR cada jugador.
 */

import { useMemo, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Loader2, Pencil, Save, Search, Users } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
import {
  useJugadoresAdmin, useSaveJugadorAdmin, type AdminJugador,
} from '@/hooks/useJugadoresAdmin';

/** Placeholder para valores vacíos. */
const DASH = '—';

/** Formulario de edición de un jugador. */
interface JugadorForm {
  id: number;
  nombre: string;
  apellido: string;
  club: string;
  sexo: string;
  estatus: string;
  indexjgo: string;
  categoriaid: string;
  teesalidaid: string;
}

/** Convierte un jugador de la API al formulario editable. */
const toForm = (p: AdminJugador): JugadorForm => ({
  id: p.id,
  nombre: p.nombre ?? '',
  apellido: p.apellido ?? '',
  club: p.club ?? '',
  sexo: p.sexo ?? '',
  estatus: p.estatus ?? '',
  indexjgo: p.hi != null ? String(p.hi) : '',
  categoriaid: String(p.categoriaid ?? 0),
  teesalidaid: String(p.teesalidaid ?? 0),
});

const AdminAlienJugadores = () => {
  const { torneoId } = useTorneoId();
  const { toast } = useToast();

  /** Filtros del listado. */
  const [catid, setCatid] = useState('all');
  const [search, setSearch] = useState('');
  /** Texto realmente enviado al backend (se aplica al presionar Buscar). */
  const [query, setQuery] = useState('');

  const { data, isLoading, error } = useJugadoresAdmin({
    catid: catid !== 'all' ? catid : undefined,
    q: query || undefined,
  });
  const save = useSaveJugadorAdmin();

  /** Jugador en edición y jugador en vista rápida. */
  const [form, setForm] = useState<JugadorForm | null>(null);
  const [quick, setQuick] = useState<AdminJugador | null>(null);

  const players = data?.players ?? [];
  const categories = data?.categories ?? [];
  const tees = data?.tees ?? [];

  /** Etiqueta legible de un tee de salida. */
  const teeLabel = useMemo(
    () => (id: number) => {
      const t = tees.find((x) => x.id === id);
      if (!t) return DASH;
      return t.color ? `${t.tee} (${t.color})` : t.tee;
    },
    [tees],
  );

  /** Actualiza un campo del formulario. */
  const set = (patch: Partial<JugadorForm>) =>
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  /** Guarda los cambios del jugador en edición. */
  const onSave = () => {
    if (!form) return;
    if (!torneoId) {
      toast({ title: 'Configura primero el Torneo ID', variant: 'destructive' });
      return;
    }
    save.mutate(
      {
        torneoid: Number(torneoId),
        password: getSuperAdminPassword(),
        id: form.id,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        club: form.club.trim(),
        sexo: form.sexo.trim(),
        estatus: form.estatus.trim(),
        indexjgo: form.indexjgo,
        categoriaid: Number(form.categoriaid) || 0,
        teesalidaid: Number(form.teesalidaid) || 0,
      },
      {
        onSuccess: () => {
          toast({ title: 'Jugador actualizado' });
          setForm(null);
        },
        onError: (e: any) =>
          toast({ title: 'Error al guardar', description: e.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" /> Jugadores
        </CardTitle>
        <CardDescription>
          Listado, edición y vista rápida con PAR del campo, handicaps
          (HI / HJ / HN) y categoría — la misma fuente que usan las tarjetas.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros: categoría + búsqueda */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px]">
            <Label>Categoría</Label>
            <Select value={catid} onValueChange={setCatid}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <Label>Buscar (nombre, ID o club)</Label>
            <div className="flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setQuery(search.trim())}
                placeholder="Ej. Fernández, 265117, La Herradura"
              />
              <Button onClick={() => setQuery(search.trim())} className="gap-2">
                <Search className="w-4 h-4" /> Buscar
              </Button>
            </div>
          </div>
          <Badge variant="secondary">{players.length} jugadores</Badge>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando jugadores…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4">
            No se pudieron cargar los jugadores. Revisa el Torneo ID.
          </p>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap">ID</TableHead>
                  <TableHead className="whitespace-nowrap">Jugador</TableHead>
                  <TableHead className="whitespace-nowrap">Club</TableHead>
                  <TableHead className="whitespace-nowrap">Cat</TableHead>
                  <TableHead className="whitespace-nowrap">Tee</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Par</TableHead>
                  <TableHead className="text-right whitespace-nowrap">HI</TableHead>
                  <TableHead className="text-right whitespace-nowrap">HJ</TableHead>
                  <TableHead className="text-right whitespace-nowrap">HN</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{p.jugador}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.club || DASH}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.abreviatura || p.categoria || DASH}</TableCell>
                    <TableCell className="whitespace-nowrap">{teeLabel(p.teesalidaid)}</TableCell>
                    <TableCell className="text-right">{p.par ?? DASH}</TableCell>
                    <TableCell className="text-right">{p.hi ?? DASH}</TableCell>
                    <TableCell className="text-right">{p.hj ?? DASH}</TableCell>
                    <TableCell className="text-right">{p.hn ?? DASH}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setQuick(p)}
                        aria-label={`Vista rápida de ${p.jugador}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setForm(toForm(p))}
                        aria-label={`Editar ${p.jugador}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {players.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-6">
                      No hay jugadores con estos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Vista rápida — par, handicap y categoría */}
      <Dialog open={!!quick} onOpenChange={(o) => !o && setQuick(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{quick?.jugador}</DialogTitle>
            <DialogDescription>
              Datos que se imprimen en la tarjeta de juego.
            </DialogDescription>
          </DialogHeader>
          {quick && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {([
                ['ID jugador', quick.id],
                ['ID SPEi', quick.numjugador || DASH],
                ['Club', quick.club || DASH],
                ['Categoría', quick.categoria || DASH],
                ['Sistema', quick.sistema || DASH],
                ['Campo', quick.campo || DASH],
                ['Tee de salida', quick.teeName
                  ? (quick.teeColor ? `${quick.teeName} (${quick.teeColor})` : quick.teeName)
                  : DASH],
                ['Par del campo', quick.par ?? DASH],
                ['Rating', quick.rating ?? DASH],
                ['Slope', quick.slope ?? DASH],
                ['Handicap Index (HI)', quick.hi ?? DASH],
                ['Handicap de Juego (HJ)', quick.hj ?? DASH],
                ['Handicap Neto (HN)', quick.hn ?? DASH],
                ['Sexo', quick.sexo || DASH],
                ['Estatus', quick.estatus || DASH],
              ] as [string, unknown][]).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground uppercase">{label}</dt>
                  <dd className="font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuick(null)}>Cerrar</Button>
            {quick && (
              <Button onClick={() => { setForm(toForm(quick)); setQuick(null); }} className="gap-2">
                <Pencil className="w-4 h-4" /> Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edición del jugador */}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar jugador</DialogTitle>
            <DialogDescription>
              El PAR, Rating y Slope provienen del campo y tee de la categoría.
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nombre</Label>
                <Input value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input value={form.apellido} onChange={(e) => set({ apellido: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Club</Label>
                <Input value={form.club} onChange={(e) => set({ club: e.target.value })} />
              </div>
              <div>
                <Label>Handicap Index (HI)</Label>
                <Input
                  value={form.indexjgo}
                  onChange={(e) => set({ indexjgo: e.target.value })}
                  inputMode="decimal"
                />
              </div>
              <div>
                <Label>Sexo</Label>
                <Input value={form.sexo} onChange={(e) => set({ sexo: e.target.value })} placeholder="M / F" />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoriaid} onValueChange={(v) => set({ categoriaid: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin asignar</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tee de salida</Label>
                <Select value={form.teesalidaid} onValueChange={(v) => set({ teesalidaid: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona tee" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin asignar</SelectItem>
                    {tees.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.color ? `${t.tee} (${t.color})` : t.tee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estatus</Label>
                <Input value={form.estatus} onChange={(e) => set({ estatus: e.target.value })} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Cancelar</Button>
            <Button onClick={onSave} disabled={save.isPending} className="gap-2">
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminAlienJugadores;
