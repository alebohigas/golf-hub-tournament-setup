/**
 * AdminSheetLivePrint — ALIEN SYSTEM → pestaña "Sheet Live"
 * -----------------------------------------------------------------------------
 * Formulario de la hoja de captura por estación: fecha, campo, hoyo de la
 * estación y hoyos de captura. GENERA abre `/admin/sheet-live` con los filtros.
 */
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardPen } from 'lucide-react';
import { useSalidasImpresionDays } from '@/hooks/useSalidasImpresion';
import { parseCaptureHoles } from '@/pages/AdminSheetLive';

/** Hoyos de captura predeterminados: los 6 hoyos que terminan en la estación. */
const defaultCapture = (station: number) =>
  Array.from({ length: 6 }, (_, i) => ((station - 6 + i + 1 + 17) % 18) + 1)
    .map((h) => `h${String(h).padStart(2, '0')}`)
    .join(',');

/** Panel de generación de SHEET LIVE. */
const AdminSheetLivePrint = () => {
  const { data } = useSalidasImpresionDays();
  const days = data?.days ?? [];
  const [fecha, setFecha] = useState('');
  const [campoid, setCampoid] = useState('');
  const [station, setStation] = useState('4');
  const [cap, setCap] = useState(defaultCapture(4));

  /** Preselecciona el primer día disponible. */
  useEffect(() => {
    if (!fecha && days.length > 0) {
      setFecha(days[0].fecha);
      setCampoid(days[0].campoid);
    }
  }, [days, fecha]);

  const campos = useMemo(() => days.filter((d) => d.fecha === fecha), [days, fecha]);
  const capHoles = parseCaptureHoles(cap);
  const valid = !!fecha && !!campoid && Number(station) >= 1 && Number(station) <= 18 && capHoles.length > 0;

  /** Abre la hoja imprimible en otra pestaña. */
  const generar = () => {
    const qs = new URLSearchParams({ fecha, campoid, est: station, cap: capHoles.join(',') });
    window.open(`/admin/sheet-live?${qs.toString()}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardPen className="h-5 w-5" /> Sheet Live
        </CardTitle>
        <CardDescription>
          Hoja de captura por estación: grupos en el orden en que llegan al hoyo de la estación, con casillas
          para los hoyos que ya jugaron.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Fecha</Label>
          <Select
            value={fecha}
            onValueChange={(v) => {
              setFecha(v);
              const m = days.find((d) => d.fecha === v);
              if (m) setCampoid(m.campoid);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Fecha" /></SelectTrigger>
            <SelectContent>
              {Array.from(new Set(days.map((d) => d.fecha))).map((f) => (
                <SelectItem key={f} value={f}>{days.find((d) => d.fecha === f)?.fechaFormato || f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Campo</Label>
          <Select value={campoid} onValueChange={setCampoid}>
            <SelectTrigger><SelectValue placeholder="Campo" /></SelectTrigger>
            <SelectContent>
              {campos.map((d) => (
                <SelectItem key={d.campoid} value={d.campoid}>{d.campo || `Campo ${d.campoid}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Estación (hoyo)</Label>
          <Input
            type="number" min={1} max={18} value={station}
            onChange={(e) => {
              setStation(e.target.value);
              const n = Number(e.target.value);
              if (n >= 1 && n <= 18) setCap(defaultCapture(n));
            }}
          />
        </div>
        <div className="space-y-1">
          <Label>Hoyos de captura</Label>
          <Input value={cap} onChange={(e) => setCap(e.target.value)} placeholder="h17,h18,h01,h02,h03,h04" />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={generar} disabled={!valid}>GENERA</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSheetLivePrint;
