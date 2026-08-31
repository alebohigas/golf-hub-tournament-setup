/**
 * AdminAlienCampos
 * ---------------------------------------------------------------
 * ALIEN SYSTEM → pestaña "Campos".
 *
 * Listado de los campos del torneo con TODO lo que alimenta la tarjeta:
 *   · Horarios del calendario de juego (fecha, salida hoyo 1 / hoyo 10)
 *   · Categorías que juegan en el campo, con su tee, rating, slope y par
 *   · Hoyos por tee de salida (par, yardas, ventaja) y totales
 *   · Tiempos por hoyo editables por staff (tabla `hoyos`) usados en PAR TIME
 *
 * Es una vista de sólo lectura: confirma el origen de cada dato impreso.
 */

import { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flag, Loader2, MapPin } from 'lucide-react';
import { useCamposAdmin, type AdminCampo } from '@/hooks/useJugadoresAdmin';

/** Placeholder para valores vacíos. */
const DASH = '—';

/** Recorta "HH:MM:SS" a "HH:MM"; devuelve DASH si viene vacío o en ceros. */
const hhmm = (t: string | null): string => {
  if (!t) return DASH;
  const m = /(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return DASH;
  if (m[1] === '00' && m[2] === '00') return DASH;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
};

/** Tabla de hoyos (par / yardas / ventaja) de un tee de salida. */
const HolesTable = ({ campo }: { campo: AdminCampo }) => {
  const [teeId, setTeeId] = useState<string>(String(campo.tees[0]?.id ?? 0));
  const tee = campo.tees.find((t) => String(t.id) === teeId) ?? campo.tees[0];
  /**
   * PAR TIME por hoyo tal como lo resuelve el Time Line
   * (`hoyos` → `hoyosxsalida` → estimación por par), con su fuente.
   */
  const parTimePorHoyo = new Map((campo.parTime ?? []).map((h) => [h.numero, h]));
  /** Hoyos cuyo PAR TIME no está capturado en la base de datos. */
  const estimados = (campo.parTime ?? []).filter((h) => h.fuente === 'estimado').length;

  if (!campo.tees.length) {
    return <p className="text-sm text-muted-foreground">Este campo no tiene tees configurados en campo_tee.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px]">
          <Label>Tee de salida</Label>
          <Select value={teeId} onValueChange={setTeeId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {campo.tees.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.color ? `${t.tee} (${t.color})` : t.tee ?? `Tee ${t.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {tee && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Par {tee.par ?? (tee.totalPar || DASH)}</Badge>
            <Badge variant="secondary">Rating {tee.rating ?? DASH}</Badge>
            <Badge variant="secondary">Slope {tee.slope ?? DASH}</Badge>
            <Badge variant="secondary">{tee.totalYardas || DASH} yardas</Badge>
          </div>
        )}
      </div>

      {/* Aviso: el Time Line y las tarjetas usan estos mismos minutos. Si
          algún hoyo no está capturado en `hoyos`/`hoyosxsalida`, se estima. */}
      {estimados > 0 && (
        <p className="text-xs text-muted-foreground">
          {estimados} hoyo(s) sin PAR TIME capturado en la base de datos: se
          muestran en cursiva y el Time Line los estima por par (3=15, 4=14, 5=19).
          Captúralos en la tabla <span className="font-mono">hoyos</span> para
          usar tiempos reales.
        </p>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Hoyo</TableHead>
              {(tee?.holes ?? []).map((h) => (
                <TableHead key={h.numero} className="text-center">{h.numero}</TableHead>
              ))}
              <TableHead className="text-center">TOT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium whitespace-nowrap">Par</TableCell>
              {(tee?.holes ?? []).map((h) => (
                <TableCell key={h.numero} className="text-center">{h.par}</TableCell>
              ))}
              <TableCell className="text-center font-medium">{tee?.totalPar ?? DASH}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium whitespace-nowrap">Yardas</TableCell>
              {(tee?.holes ?? []).map((h) => (
                <TableCell key={h.numero} className="text-center">{h.yardas}</TableCell>
              ))}
              <TableCell className="text-center font-medium">{tee?.totalYardas ?? DASH}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium whitespace-nowrap">Ventaja</TableCell>
              {(tee?.holes ?? []).map((h) => (
                <TableCell key={h.numero} className="text-center">{h.ventaja}</TableCell>
              ))}
              <TableCell className="text-center">{DASH}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium whitespace-nowrap">Par time (min)</TableCell>
              {(tee?.holes ?? []).map((h) => {
                const pt = parTimePorHoyo.get(h.numero);
                return (
                  <TableCell
                    key={h.numero}
                    className={`text-center ${pt?.fuente === 'estimado' ? 'text-muted-foreground italic' : ''}`}
                    title={pt ? `Fuente: ${pt.fuente}` : undefined}
                  >
                    {pt ? pt.minutos : DASH}
                  </TableCell>
                );
              })}
              <TableCell className="text-center font-medium">
                {(campo.parTime ?? []).reduce((a, h) => a + h.minutos, 0) || DASH}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const AdminAlienCampos = () => {
  const { data, isLoading, error } = useCamposAdmin();
  const campos = data?.campos ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Campos
        </CardTitle>
        <CardDescription>
          Campos del torneo con horarios, categorías y hoyos. De aquí provienen
          el par, las yardas, la ventaja y el par time que se imprimen en las tarjetas.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando campos…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive py-4">
            No se pudieron cargar los campos. Revisa el Torneo ID.
          </p>
        )}

        {!isLoading && !error && campos.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            El calendario de juego no tiene campos asignados para este torneo.
          </p>
        )}

        {!isLoading && !error && campos.length > 0 && (
          <Accordion type="single" collapsible defaultValue={`campo-${campos[0].id}`} className="w-full">
            {campos.map((campo) => (
              <AccordionItem key={campo.id} value={`campo-${campo.id}`}>
                <AccordionTrigger>
                  <span className="flex flex-wrap items-center gap-2 text-left">
                    <Flag className="w-4 h-4" />
                    <span className="font-semibold">{campo.campo || `Campo ${campo.id}`}</span>
                    <Badge variant="outline">ID {campo.id}</Badge>
                    <Badge variant="secondary">{campo.categorias.length} categorías</Badge>
                    <Badge variant="secondary">{campo.horarios.length} horarios</Badge>
                    <Badge variant="secondary">{campo.tees.length} tees</Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-6">
                  {/* Horarios del calendario de juego */}
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground">Horarios</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Fecha</TableHead>
                            <TableHead className="whitespace-nowrap">Categoría</TableHead>
                            <TableHead className="whitespace-nowrap">Hoyo 1</TableHead>
                            <TableHead className="whitespace-nowrap">Hoyo 10</TableHead>
                            <TableHead className="whitespace-nowrap">Sal. hoyos</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Foursomes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campo.horarios.map((h, i) => (
                            <TableRow key={`${h.fecha}-${h.categoriaid}-${i}`}>
                              <TableCell className="whitespace-nowrap">{h.fechaFormato || h.fecha}</TableCell>
                              <TableCell className="whitespace-nowrap">{h.categoria || DASH}</TableCell>
                              <TableCell>{hhmm(h.horaInicio1)}</TableCell>
                              <TableCell>{hhmm(h.horaInicio10)}</TableCell>
                              <TableCell>{h.salhoyos || DASH}</TableCell>
                              <TableCell className="text-right">{h.numfoursome ?? DASH}</TableCell>
                            </TableRow>
                          ))}
                          {campo.horarios.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                                Sin horarios en el calendario de juego.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </section>

                  {/* Categorías que juegan en el campo */}
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground">Categorías</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Cat</TableHead>
                            <TableHead className="whitespace-nowrap">Abrev.</TableHead>
                            <TableHead className="whitespace-nowrap">Sistema</TableHead>
                            <TableHead className="whitespace-nowrap">Tee</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Rating</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Slope</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Par</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campo.categorias.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium whitespace-nowrap">{c.categoria}</TableCell>
                              <TableCell>{c.abreviatura || DASH}</TableCell>
                              <TableCell className="whitespace-nowrap">{c.sistema || DASH}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {c.teeName ? (c.teeColor ? `${c.teeName} (${c.teeColor})` : c.teeName) : DASH}
                              </TableCell>
                              <TableCell className="text-right">{c.rating ?? DASH}</TableCell>
                              <TableCell className="text-right">{c.slope ?? DASH}</TableCell>
                              <TableCell className="text-right">{c.par ?? DASH}</TableCell>
                            </TableRow>
                          ))}
                          {campo.categorias.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                                Sin categorías asignadas a este campo.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </section>

                  {/* Hoyos por tee de salida */}
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground">Hoyos</h4>
                    <HolesTable campo={campo} />
                  </section>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAlienCampos;
