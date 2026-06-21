/**
 * AdminBanderas
 * ---------------------------------------------------------------
 * Captura del pin sheet (posición de banderas) para el torneo activo.
 * Persiste en BD (`banderas_pin_sheet` + `banderas_round`) vía
 * /api/banderas.php. Una fila por hoyo con:
 *   - Profundidad total del green (Depth)
 *   - Pasos del frente al pin (vertical)
 *   - Pasos del lado al pin (horizontal) + qué lado (L/R)
 *   - Posición vs centro (cuadrito ±)
 *
 * Replace-all: al guardar se borran los hoyos previos y se reinsertan
 * los 18 enviados, así que cada save deja la BD con un estado
 * consistente.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flag, Save, RefreshCcw, Loader2, Trash2 } from 'lucide-react';
import { useBanderas, useSaveBanderas, type BanderaHole } from '@/hooks/useBanderas';
import { useTorneoId } from '@/hooks/useTorneoId';
import { useToast } from '@/hooks/use-toast';

/** Plantilla vacía: 18 hoyos con todo en cero. */
const blankHoles = (): BanderaHole[] =>
  Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    depth: 0,
    pin_from_front: 0,
    pin_from_side: 0,
    pin_side: 'L',
    center_offset: 0,
  }));

const AdminBanderas = () => {
  const { torneoId } = useTorneoId();
  const { data, isLoading, refetch, isFetching } = useBanderas();
  const saveMutation = useSaveBanderas();
  const { toast } = useToast();

  // Estado local: 18 filas siempre. Si la BD tiene menos, se rellenan
  // los faltantes con la plantilla vacía para que la tabla sea estable.
  const [holes, setHoles] = useState<BanderaHole[]>(blankHoles());
  const [roundLabel, setRoundLabel] = useState('');
  const [roundDate, setRoundDate] = useState('');

  /** Sincroniza el estado local cuando cambia la respuesta de la API. */
  useEffect(() => {
    if (!data) return;
    const incoming = new Map<number, BanderaHole>();
    (data.holes ?? []).forEach((h) => incoming.set(h.hole_number, h));
    const merged = blankHoles().map((h) => incoming.get(h.hole_number) ?? h);
    setHoles(merged);
    setRoundLabel(data.round?.round_label ?? '');
    setRoundDate(data.round?.round_date ?? '');
  }, [data]);

  /** Helper para actualizar un campo de un hoyo específico. */
  const updateHole = (
    hole: number,
    field: keyof BanderaHole,
    value: number | 'L' | 'R',
  ) => {
    setHoles((prev) =>
      prev.map((h) => (h.hole_number === hole ? { ...h, [field]: value } : h)),
    );
  };

  /** Limpia todas las filas a cero (sin guardar todavía). */
  const handleReset = () => {
    setHoles(blankHoles());
    setRoundLabel('');
    setRoundDate('');
  };

  /** Manda el replace-all al backend. */
  const handleSave = () => {
    if (!torneoId) {
      toast({
        title: 'Sin torneo activo',
        description: 'Configura un torneoid en la pestaña Config antes de guardar.',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(
      {
        torneoid: parseInt(torneoId, 10),
        password: 'admin2025',
        round: {
          round_label: roundLabel || null,
          round_date: roundDate || null,
        },
        holes,
      },
      {
        onSuccess: (res) => {
          toast({
            title: 'Pin sheet guardado',
            description: `${(res as any)?.count ?? 18} hoyos sincronizados con la BD.`,
          });
        },
        onError: (err) => {
          toast({
            title: 'Error al guardar',
            description: (err as Error).message,
            variant: 'destructive',
          });
        },
      },
    );
  };

  /** ¿Hay al menos un valor distinto de cero? Para enable/disable del save. */
  const hasAnyValue = useMemo(
    () =>
      holes.some(
        (h) =>
          h.depth > 0 ||
          h.pin_from_front > 0 ||
          h.pin_from_side > 0 ||
          h.center_offset !== 0,
      ),
    [holes],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          Posición de Banderas (Pin Sheet)
        </CardTitle>
        <CardDescription>
          Captura los 18 greens del torneo activo. Los datos se guardan en
          la base de datos ligados al <strong>torneo_id</strong> y se muestran
          en <code>/banderas</code> con la visualización custom. Si dejas todo en
          cero, la página pública mostrará el mensaje de disculpa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ===== Metadatos del round ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="round-label">Etiqueta del round (opcional)</Label>
            <Input
              id="round-label"
              value={roundLabel}
              onChange={(e) => setRoundLabel(e.target.value)}
              placeholder="Ej. Ronda Final · LXVI Torneo Anual"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="round-date">Fecha visible (opcional)</Label>
            <Input
              id="round-date"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              placeholder="Ej. Sábado 6 de junio 2026"
            />
          </div>
        </div>

        {/* ===== Tabla de 18 hoyos ===== */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">Hoyo</TableHead>
                <TableHead className="w-24" title="Profundidad total del green">
                  Depth
                </TableHead>
                <TableHead className="w-28" title="Pasos del frente del green al pin">
                  Frente → pin
                </TableHead>
                <TableHead className="w-28" title="Pasos del lado indicado al pin">
                  Lado → pin
                </TableHead>
                <TableHead className="w-24" title="¿De qué lado se mide?">
                  Lado
                </TableHead>
                <TableHead className="w-28" title="Posición vs centro del green (±)">
                  vs Centro
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holes.map((h) => (
                <TableRow key={h.hole_number}>
                  <TableCell className="text-center font-bold">
                    {h.hole_number}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={h.depth || ''}
                      onChange={(e) =>
                        updateHole(h.hole_number, 'depth', parseInt(e.target.value, 10) || 0)
                      }
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={h.pin_from_front || ''}
                      onChange={(e) =>
                        updateHole(
                          h.hole_number,
                          'pin_from_front',
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={h.pin_from_side || ''}
                      onChange={(e) =>
                        updateHole(
                          h.hole_number,
                          'pin_from_side',
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={h.pin_side}
                      onValueChange={(v: 'L' | 'R') => updateHole(h.hole_number, 'pin_side', v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Izquierdo</SelectItem>
                        <SelectItem value="R">Derecho</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={h.center_offset || ''}
                      onChange={(e) =>
                        updateHole(
                          h.hole_number,
                          'center_offset',
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      className="h-9"
                      placeholder="±"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ===== Acciones ===== */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending || !hasAnyValue}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar pin sheet
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            {isFetching || isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Recargar desde BD
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar todo
          </Button>
          {!torneoId && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Sin torneo activo configurado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminBanderas;