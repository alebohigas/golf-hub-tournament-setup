/**
 * TarjetaHeaderFooterPreview
 * -----------------------------------------------------------------------------
 * Previsualización EN VIVO del ENCABEZADO (3 renglones) y del PIE (firmas) de
 * la tarjeta de juego. Usa EXACTAMENTE los mismos componentes que la página
 * imprimible `/admin/tarjetas-impresion` (`@/components/tarjetas/TarjetaChrome`),
 * por lo que la vista previa, la impresión y el PDF son 1:1.
 *
 * Además permite simular DATOS FALTANTES (jugador, club, color de marcas de
 * salida, folio, hora) para validar que los fallbacks no rompen la maqueta.
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  TarjetaAnotadorRow,
  TarjetaFooter,
  TarjetaHeaderGrid,
  type TarjetaChromeData,
} from '@/components/tarjetas/TarjetaChrome';
import type { TarjetaHeaderKey } from '@/lib/tarjetasHeader';

/** Datos de muestra: una tarjeta típica y completa. */
const SAMPLE: TarjetaChromeData = {
  hole: 1,
  time: '11:20',
  playerNumber: '1024',
  name: 'Jugador de Muestra',
  club: 'Club de Golf Demo',
  hcp: 12,
  categoryName: 'Primera Fuerza Caballeros',
  shortName: '1A CAB',
  tee: 'AZULES',
  teeSal: '',
  folio: '0001',
};

/** Misma tarjeta con datos incompletos, para validar los fallbacks. */
const SAMPLE_INCOMPLETO: TarjetaChromeData = {
  hole: null,
  time: '',
  playerNumber: '',
  name: '',
  club: '',
  hcp: null,
  categoryName: '',
  shortName: '',
  tee: '',
  teeSal: '',
  folio: '',
};

export interface TarjetaHeaderFooterPreviewProps {
  /** Campos del encabezado en el orden configurado. */
  headerOrder: TarjetaHeaderKey[];
  /** Alto de renglón (mm) configurado en Admin. */
  rowMm: number;
  /** Margen lateral (mm) de la tarjeta. */
  marginMm: number;
  /** Tipo de juego elegido en Admin (auto usa STROKEPLAY de muestra). */
  sistema: 'auto' | 'stroke' | 'stableford';
}

/** Vista previa en vivo del encabezado + pie de la tarjeta. */
const TarjetaHeaderFooterPreview = ({
  headerOrder,
  rowMm,
  marginMm,
  sistema,
}: TarjetaHeaderFooterPreviewProps) => {
  /** Simulación de datos faltantes para revisar los textos de respaldo. */
  const [simularFaltantes, setSimularFaltantes] = useState(false);

  const card: TarjetaChromeData = {
    ...(simularFaltantes ? SAMPLE_INCOMPLETO : SAMPLE),
    system: sistema === 'stableford' ? 'STABLEFORD' : 'STROKE PLAY',
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Vista previa en vivo (encabezado y firmas). Usa los mismos componentes que impresión y
        PDF, con el orden de campos, el alto de renglón ({rowMm} mm) y el margen lateral (
        {marginMm} mm) configurados aquí.
      </p>

      <div className="flex items-center gap-2">
        <Switch
          id="tarjeta-faltantes"
          checked={simularFaltantes}
          onCheckedChange={setSimularFaltantes}
        />
        <Label htmlFor="tarjeta-faltantes" className="text-xs">
          Simular datos faltantes (jugador, club, marcas de salida)
        </Label>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white p-3">
        <div className="mx-auto w-[196mm] min-w-[196mm] border border-foreground/70 text-foreground">
          {/* ---------- Encabezado de 3 renglones (compartido) ---------- */}
          <TarjetaHeaderGrid card={card} fields={headerOrder} rowMm={rowMm} />

          {/* Brinco de renglón + representación compacta de la tabla de hoyos */}
          <div style={{ height: `${rowMm}mm` }} />
          <div
            className="flex items-center justify-center border-y border-dashed border-foreground/40 text-[6.5pt] uppercase text-foreground/60"
            style={{ height: `${rowMm * 4}mm` }}
          >
            Tabla de hoyos (renglones configurados)
          </div>

          {/* Margen de 3 renglones antes de las firmas */}
          <div style={{ height: `${rowMm * 3}mm` }} />

          {/* ---------- Renglón SCORE ANOTADOR (compartido, con 3 mm de padding-bottom) ---------- */}
          <TarjetaAnotadorRow rowMm={rowMm} />

          {/* ---------- Pie: sistema, firmas y folio (compartido) ---------- */}
          <TarjetaFooter card={card} />
        </div>
      </div>
    </div>
  );
};

export default TarjetaHeaderFooterPreview;
