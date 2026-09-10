/**
 * BracketsPuttImpresion — Impresión de los Brackets Finales de Putt
 * -----------------------------------------------------------------------------
 * Ruta: /brackets-putt-impresion?sexo=M|F|A&orient=vertical|horizontal
 *
 * Reutiliza `BracketView` (el mismo render público de los brackets) dentro de
 * una hoja tamaño carta, con dos orientaciones y escala ajustable para que el
 * bracket completo quepa en el papel.
 *
 * Controles (ocultos al imprimir con `print:hidden`):
 *   - Rama: Caballeros / Damas / Único (según cómo esté configurada la competencia).
 *   - Orientación: Vertical / Horizontal (cambia @page y el ancho útil).
 *   - Escala: 40–100 % para ajustar el bracket al ancho de la hoja.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Printer, Trophy } from 'lucide-react';
import BracketView from '@/components/competencias/BracketView';
import { useTournamentInfo } from '@/hooks/useTournamentData';

/** Rama del bracket: caballeros, damas o competencia unificada. */
type Sexo = 'M' | 'F' | 'A';
/** Orientación de la hoja carta. */
type Orient = 'vertical' | 'horizontal';

/** Geometría de la hoja carta por orientación (mm) y etiqueta de @page. */
const SHEET: Record<Orient, { label: string; page: string; widthMm: number }> = {
  vertical:   { label: 'Vertical (Carta)',   page: 'letter portrait',  widthMm: 215.9 },
  horizontal: { label: 'Horizontal (Carta)', page: 'letter landscape', widthMm: 279.4 },
};

/** Margen de impresión (mm) por lado. */
const MARGIN_MM = 8;
/** mm → px CSS a 96 dpi. */
const MM = 3.7795;

/** Etiquetas de las ramas disponibles. */
const SEXO_LABEL: Record<Sexo, string> = {
  M: 'Caballeros',
  F: 'Damas',
  A: 'Único (unificado)',
};

const BracketsPuttImpresion = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [sexo, setSexo] = useState<Sexo>((params.get('sexo') as Sexo) || 'M');
  const [orient, setOrient] = useState<Orient>(
    params.get('orient') === 'horizontal' ? 'horizontal' : 'vertical',
  );
  const [scale, setScale] = useState(70);

  /** Mantiene la URL en sincronía para poder compartir/reimprimir. */
  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set('sexo', sexo);
    next.set('orient', orient);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sexo, orient]);

  const { data: torneo } = useTournamentInfo();
  const sheet = SHEET[orient];
  const innerWidthPx = (sheet.widthMm - MARGIN_MM * 2) * MM;

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white">
      {/* ===== @page + reglas de impresión ===== */}
      <style>{`
        @page { size: ${sheet.page}; margin: ${MARGIN_MM}mm; }
        @media print {
          html, body { background: #fff !important; }
          .bracket-sheet { box-shadow: none !important; border: 0 !important; }
          .bracket-sheet .overflow-x-auto { overflow: visible !important; }
          section { break-inside: avoid; }
        }
      `}</style>

      {/* ===== Barra de controles (no se imprime) ===== */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-end gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rama
            </label>
            <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">{SEXO_LABEL.M}</SelectItem>
                <SelectItem value="F">{SEXO_LABEL.F}</SelectItem>
                <SelectItem value="A">{SEXO_LABEL.A}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Orientación
            </label>
            <Select value={orient} onValueChange={(v) => setOrient(v as Orient)}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">{SHEET.vertical.label}</SelectItem>
                <SelectItem value="horizontal">{SHEET.horizontal.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Escala: {scale}%
            </label>
            <input
              type="range"
              min={40}
              max={100}
              step={1}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value, 10))}
              className="w-[160px] h-9"
            />
          </div>

          <div className="ml-auto">
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Hoja ===== */}
      <div className="py-6 print:py-0 flex justify-center">
        <div
          className="bracket-sheet bg-white border border-border shadow-card p-3"
          style={{ width: `${innerWidthPx}px` }}
        >
          {/* Encabezado del reporte */}
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide truncate">
                {torneo?.name || 'Torneo'}
              </p>
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
                Brackets Finales de Putt — {SEXO_LABEL[sexo]}
              </p>
            </div>
          </div>

          {/* Bracket escalado para caber en el ancho de la hoja */}
          <div
            style={{
              transform: `scale(${scale / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (scale / 100)}%`,
            }}
          >
            <BracketView sexo={sexo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketsPuttImpresion;
