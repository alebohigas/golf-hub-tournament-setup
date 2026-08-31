/**
 * AdminCategorias
 * ---------------------------------------------------------------
 * Pestaña /admin → "Categorías". Permite CREAR, EDITAR y ELIMINAR
 * las categorías del torneo activo, incluyendo sus datos de
 * Tee de Salida, Rating, Slope y Par (que viven en `campo_tee`).
 *
 * Estos son exactamente los datos que se muestran en la ficha de
 * categoría de la página pública /jugadores.
 *
 * Además incluye la vista "Todas las columnas (torneos.categorias)":
 * lee la lista real de columnas de la tabla vía SHOW COLUMNS y muestra
 * / permite editar CUALQUIERA de ellas (payload `fields`).
 */

import { useMemo, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, Pencil, Plus, Save, Trash2, Users } from 'lucide-react';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
import {
  useCategoriasAdmin, useSaveCategoriaAdmin,
  type AdminCategoria, type CategoriaColumn,
} from '@/hooks/useCategoriasAdmin';

/**
 * Columnas de `categorias` que ya tienen control dedicado en el formulario
 * principal, o que son llaves y no deben editarse a mano.
 */
const CURATED_COLUMNS = new Set([
  'categoria_id', 'torneo_id', 'categoria', 'abreviatura', 'sistema',
  'formato', 'estilo', 'sexo', 'hcpIdxMin', 'hcpIdxMax', 'porcentaje',
  'hoyosajugar', 'maxjugadores', 'gross', 'salida',
]);

/** Forma del formulario de edición/creación. */
interface FormState {
  id?: number;
  categoria: string;
  abreviatura: string;
  sistema: string;
  formato: string;
  estilo: string;
  sexo: string;
  hcpIdxMin: string;
  hcpIdxMax: string;
  porcentaje: string;
  hoyosajugar: string;
  maxjugadores: string;
  gross: boolean;
  salida: string;
  campoid: string;
  rating: string;
  slope: string;
  parcampo: string;
  /** Resto de columnas reales de `categorias` (nombre → valor de texto). */
  extra: Record<string, string>;
}

/** Estado inicial vacío para "Nueva categoría". */
const EMPTY_FORM: FormState = {
  categoria: '', abreviatura: '', sistema: '', formato: '', estilo: '',
  sexo: '', hcpIdxMin: '', hcpIdxMax: '', porcentaje: '', hoyosajugar: '',
  maxjugadores: '', gross: false, salida: '0', campoid: '0',
  rating: '', slope: '', parcampo: '', extra: {},
};

/** Convierte una categoría de la API al formulario. */
const toForm = (c: AdminCategoria): FormState => ({
  id: c.id,
  categoria: c.categoria ?? '',
  abreviatura: c.abreviatura ?? '',
  sistema: c.sistema ?? '',
  formato: c.formato ?? '',
  estilo: c.estilo ?? '',
  sexo: c.sexo ?? '',
  hcpIdxMin: c.hcpIdxMin ?? '',
  hcpIdxMax: c.hcpIdxMax ?? '',
  porcentaje: c.porcentaje ?? '',
  hoyosajugar: c.hoyosajugar != null ? String(c.hoyosajugar) : '',
  maxjugadores: c.maxjugadores != null ? String(c.maxjugadores) : '',
  gross: !!c.gross,
  salida: String(c.salida ?? 0),
  campoid: String(c.campoid ?? 0),
  rating: c.rating ?? '',
  slope: c.slope ?? '',
  parcampo: c.parcampo ?? '',
  /** Copia editable de las columnas no curadas tal como están en la BD. */
  extra: Object.fromEntries(
    Object.entries(c.raw ?? {})
      .filter(([k]) => !CURATED_COLUMNS.has(k))
      .map(([k, v]) => [k, v == null ? '' : String(v)]),
  ),
});

const DASH = '—';

const AdminCategorias = () => {
  const { torneoId } = useTorneoId();
  const { data, isLoading, error } = useCategoriasAdmin();
  const save = useSaveCategoriaAdmin();
  const { toast } = useToast();

  /** Diálogo de edición/creación. */
  const [form, setForm] = useState<FormState | null>(null);
  /** Categoría marcada para eliminar. */
  const [toDelete, setToDelete] = useState<AdminCategoria | null>(null);

  const categories = data?.categories ?? [];
  const tees = data?.tees ?? [];
  const campos = data?.campos ?? [];

  /** Etiqueta legible del tee de salida. */
  const teeLabel = useMemo(
    () => (id: number) => {
      const t = tees.find((x) => x.id === id);
      if (!t) return DASH;
      return t.color ? `${t.tee} (${t.color})` : t.tee;
    },
    [tees],
  );

  /** Actualiza un campo del formulario. */
  const set = (patch: Partial<FormState>) =>
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  /** Guarda (crea o edita) la categoría del formulario. */
  const onSave = () => {
    if (!form) return;
    if (!torneoId) {
      toast({ title: 'Configura primero el Torneo ID', variant: 'destructive' });
      return;
    }
    if (!form.categoria.trim()) {
      toast({ title: 'El nombre de la categoría es obligatorio', variant: 'destructive' });
      return;
    }
    save.mutate(
      {
        action: form.id ? 'update' : 'create',
        torneoid: Number(torneoId),
        password: getSuperAdminPassword(),
        id: form.id,
        categoria: form.categoria.trim(),
        abreviatura: form.abreviatura.trim(),
        sistema: form.sistema.trim(),
        formato: form.formato.trim(),
        estilo: form.estilo.trim(),
        sexo: form.sexo.trim(),
        hcpIdxMin: form.hcpIdxMin,
        hcpIdxMax: form.hcpIdxMax,
        porcentaje: form.porcentaje,
        hoyosajugar: form.hoyosajugar,
        maxjugadores: form.maxjugadores,
        gross: form.gross ? 1 : 0,
        salida: Number(form.salida) || 0,
        campoid: Number(form.campoid) || 0,
        rating: form.rating,
        slope: form.slope,
        parcampo: form.parcampo,
        /** Columnas extra de la tabla editadas en "Todas las columnas". */
        fields: form.extra,
      },
      {
        onSuccess: () => {
          toast({ title: form.id ? 'Categoría actualizada' : 'Categoría creada' });
          setForm(null);
        },
        onError: (e: any) =>
          toast({ title: 'Error al guardar', description: e.message, variant: 'destructive' }),
      },
    );
  };

  /** Elimina la categoría seleccionada. */
  const onDelete = () => {
    if (!toDelete || !torneoId) return;
    save.mutate(
      {
        action: 'delete',
        torneoid: Number(torneoId),
        password: getSuperAdminPassword(),
        id: toDelete.id,
      },
      {
        onSuccess: () => {
          toast({ title: 'Categoría eliminada' });
          setToDelete(null);
        },
        onError: (e: any) =>
          toast({ title: 'No se pudo eliminar', description: e.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> Categorías
          </CardTitle>
          <CardDescription>
            Crea, edita y elimina las categorías del torneo con su Tee de Salida,
            Rating, Slope y Par. Es la información que aparece en /jugadores.
          </CardDescription>
        </div>
        <Button onClick={() => setForm({ ...EMPTY_FORM })} className="gap-2">
          <Plus className="w-4 h-4" /> Nueva categoría
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando categorías…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4">
            No se pudieron cargar las categorías. Revisa el Torneo ID.
          </p>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cat</TableHead>
                  <TableHead>Abrev.</TableHead>
                  <TableHead>Tee Salida</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Slope</TableHead>
                  <TableHead className="text-right">Par</TableHead>
                  <TableHead>Sistema</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Jug.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.categoria}</TableCell>
                    <TableCell>{c.abreviatura || DASH}</TableCell>
                    <TableCell>{teeLabel(c.salida)}</TableCell>
                    <TableCell className="text-right">{c.rating ?? DASH}</TableCell>
                    <TableCell className="text-right">{c.slope ?? DASH}</TableCell>
                    <TableCell className="text-right">{c.parcampo ?? DASH}</TableCell>
                    <TableCell>{c.sistema || DASH}</TableCell>
                    <TableCell className="text-right">{c.porcentaje ?? DASH}</TableCell>
                    <TableCell className="text-right">{c.playerCount}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setForm(toForm(c))}
                        aria-label={`Editar ${c.categoria}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setToDelete(c)}
                        aria-label={`Eliminar ${c.categoria}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-6">
                      Aún no hay categorías para este torneo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Diálogo crear / editar */}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
            <DialogDescription>
              Rating, Slope y Par se guardan por Tee de Salida + Campo.
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Categoría *</Label>
                <Input value={form.categoria} onChange={(e) => set({ categoria: e.target.value })} />
              </div>
              <div>
                <Label>Abreviatura</Label>
                <Input value={form.abreviatura} onChange={(e) => set({ abreviatura: e.target.value })} />
              </div>
              <div>
                <Label>Sexo</Label>
                <Input value={form.sexo} onChange={(e) => set({ sexo: e.target.value })} placeholder="M / F" />
              </div>

              <div>
                <Label>Tee de Salida</Label>
                <Select value={form.salida} onValueChange={(v) => set({ salida: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un tee" /></SelectTrigger>
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
                <Label>Campo</Label>
                <Select value={form.campoid} onValueChange={(v) => set({ campoid: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un campo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin asignar</SelectItem>
                    {campos.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.campo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rating</Label>
                <Input value={form.rating} onChange={(e) => set({ rating: e.target.value })} inputMode="decimal" />
              </div>
              <div>
                <Label>Slope</Label>
                <Input value={form.slope} onChange={(e) => set({ slope: e.target.value })} inputMode="decimal" />
              </div>
              <div>
                <Label>Par</Label>
                <Input value={form.parcampo} onChange={(e) => set({ parcampo: e.target.value })} inputMode="numeric" />
              </div>
              <div>
                <Label>Sistema</Label>
                <Input value={form.sistema} onChange={(e) => set({ sistema: e.target.value })} />
              </div>
              <div>
                <Label>Formato</Label>
                <Input value={form.formato} onChange={(e) => set({ formato: e.target.value })} />
              </div>
              <div>
                <Label>Estilo</Label>
                <Input value={form.estilo} onChange={(e) => set({ estilo: e.target.value })} />
              </div>
              <div>
                <Label>Hándicap mínimo</Label>
                <Input value={form.hcpIdxMin} onChange={(e) => set({ hcpIdxMin: e.target.value })} inputMode="decimal" />
              </div>
              <div>
                <Label>Hándicap máximo</Label>
                <Input value={form.hcpIdxMax} onChange={(e) => set({ hcpIdxMax: e.target.value })} inputMode="decimal" />
              </div>
              <div>
                <Label>Porcentaje de hándicap</Label>
                <Input value={form.porcentaje} onChange={(e) => set({ porcentaje: e.target.value })} inputMode="decimal" />
              </div>
              <div>
                <Label>Hoyos a jugar</Label>
                <Input value={form.hoyosajugar} onChange={(e) => set({ hoyosajugar: e.target.value })} inputMode="numeric" />
              </div>
              <div>
                <Label>Máximo de jugadores</Label>
                <Input value={form.maxjugadores} onChange={(e) => set({ maxjugadores: e.target.value })} inputMode="numeric" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.gross} onCheckedChange={(v) => set({ gross: v })} />
                <Label>Incluye Gross</Label>
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

      {/* Confirmación de borrado */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar “{toDelete?.categoria}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las categorías con jugadores
              asignados no pueden eliminarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminCategorias;
