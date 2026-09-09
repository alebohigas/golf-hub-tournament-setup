/**
 * AdminResultadosFinalesCompeticion — Reporte imprimible
 * "RESULTADOS FINALES COMPETICIÓN"
 * -----------------------------------------------------------------------------
 * Ruta: /admin/resultados-finales-competicion?bloques=k1,k2&porhoja=1|2|3
 *
 * Cada BLOQUE es una competencia + grupo/premio (O'Yes X, O'Yes, Driver,
 * Driver Precisión, Approach, Putt finalistas de brackets y Mejor Score del
 * Día). Los bloques se agrupan por hoja carta vertical según `porhoja` y cada
 * hoja lleva el encabezado del torneo (club, nombre, logo) y el ribbon
 * "SPEi Tour by Alien System" al pie.
 */

import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { useResultadosFinalesCatalogo } from '@/hooks/useResultadosFinales';
import {
  useResultadosFinalesCompeticion,
  type CompeticionFinalBloque,
} from '@/hooks/useResultadosFinalesCompeticion';

/** Ribbon de pie de hoja. */
const SheetRibbon = () => (
  <div className="mt-auto bg-[#cccccc] py-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-black">
    SPEi Tour by Alien System
  </div>
);

/** Encabezado de hoja: club/torneo a la izquierda y logo a la derecha. */
const SheetHeader = ({
  club,
  tournament,
  logo,
}: {
  club: string;
  tournament: string;
  logo: string;
}) => (
  <div className="flex items-start justify-between gap-4 border-y-2 border-foreground/70 px-2 py-3">
    <div className="min-w-0">
      <div className="truncate text-[17px] font-semibold uppercase text-foreground">{club}</div>
      <div className="truncate text-[15px] text-foreground">{tournament}</div>
      <div className="text-[17px] font-bold uppercase text-foreground">Resultados Finales</div>
    </div>
    {logo ? (
      <img
        src={logo}
        alt=""
        className="h-16 max-w-[150px] shrink-0 object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
    ) : null}
  </div>
);

/**
 * Bloque de resultados de una competencia.
 * @param dense Compacta paddings y tipografía cuando se imprimen 3 por hoja.
 */
const CompeticionBlock = ({
  block,
  dense = false,
}: {
  block: CompeticionFinalBloque;
  dense?: boolean;
}) => (
  <div className={`break-inside-avoid px-2 ${dense ? 'py-1.5' : 'py-3'}`}>
    <div className="text-[15px] font-bold uppercase text-foreground">{block.competencia}</div>
    <div className="text-[13px] font-semibold text-foreground">Grupo: {block.groupName}</div>
    {block.places > 0 && (
      <div className={`${dense ? 'mb-1' : 'mb-2'} text-[12px] text-muted-foreground`}>
        Lugares: {block.places}
      </div>
    )}

    {block.rows.length === 0 ? (
      <div className="py-4 text-center text-[12px] text-muted-foreground">
        Sin resultados publicados.
      </div>
    ) : (
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-[#4b4f56] text-white">
            <th className="w-14 px-2 py-1.5 text-center text-[11px] font-semibold">Pos</th>
            <th className="w-16 px-2 py-1.5 text-center text-[11px] font-semibold">Club</th>
            <th className="px-2 py-1.5 text-left text-[11px] font-semibold">Jugador</th>
            {block.showCategory && (
              <th className="w-16 px-2 py-1.5 text-center text-[11px] font-semibold">Cat</th>
            )}
            <th className="w-24 px-2 py-1.5 text-right text-[11px] font-semibold">
              {block.valueLabel || 'Resultado'}
            </th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r, i) => (
            <tr key={`${block.key}-${i}`} className="border-b border-border">
              <td className={`px-2 ${dense ? 'py-1' : 'py-2'} text-center text-[15px] font-bold tabular-nums`}>
                {r.position || ''}
              </td>
              <td className={`px-2 ${dense ? 'py-1' : 'py-2'} text-center`}>
                {r.clubLogo ? (
                  <img
                    src={r.clubLogo}
                    alt=""
                    className={`mx-auto ${dense ? 'h-5' : 'h-6'} max-w-12 object-contain`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                    }}
                  />
                ) : (
                  <span className="text-[11px] text-muted-foreground">{r.club}</span>
                )}
              </td>
              <td className={`px-2 ${dense ? 'py-1' : 'py-2'} text-left text-[14px] text-foreground`}>
                {r.name}
              </td>
              {block.showCategory && (
                <td className={`px-2 ${dense ? 'py-1' : 'py-2'} text-center text-[12px]`}>
                  {r.category}
                </td>
              )}
              <td className={`px-2 ${dense ? 'py-1' : 'py-2'} text-right text-[15px] font-bold tabular-nums`}>
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/** Página imprimible de resultados finales de competición. */
const AdminResultadosFinalesCompeticion = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const { data: catalogo } = useResultadosFinalesCatalogo();
  const { blocks: allBlocks, isLoading } = useResultadosFinalesCompeticion();

  /** Claves de bloque pedidas por URL, en orden. */
  const keys = useMemo(
    () =>
      (params.get('bloques') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [params],
  );

  /** Bloques a imprimir respetando el orden de la URL. */
  const blocks = useMemo(
    () => keys.map((k) => allBlocks.find((b) => b.key === k)).filter(Boolean) as CompeticionFinalBloque[],
    [keys, allBlocks],
  );

  /** Bloques por hoja carta: 1, 2 o 3 (`?porhoja=`). */
  const perSheet = useMemo(() => {
    const n = Number(params.get('porhoja'));
    return n === 1 || n === 3 ? n : 2;
  }, [params]);

  const dense = perSheet === 3;

  /** Hojas carta con `perSheet` bloques cada una. */
  const sheets = useMemo(() => {
    const out: CompeticionFinalBloque[][] = [];
    for (let i = 0; i < blocks.length; i += perSheet) out.push(blocks.slice(i, i + perSheet));
    return out;
  }, [blocks, perSheet]);

  /** Exporta el reporte a PDF carta vertical, una imagen por hoja. */
  const exportPdf = async () => {
    const root = reportRef.current;
    if (!root) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const sheetNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-final-sheet]'));
      for (let i = 0; i < sheetNodes.length; i++) {
        const canvas = await html2canvas(sheetNodes[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, Math.min(h, pdf.internal.pageSize.getHeight()));
      }
      pdf.save('resultados-finales-competicion.pdf');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Barra de acciones (oculta al imprimir). */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3 print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
        <Button size="sm" variant="secondary" onClick={() => void exportPdf()} disabled={exporting}>
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Exportar PDF
        </Button>
      </div>

      <style>{`@page { size: letter portrait; margin: 10mm; }`}</style>

      <div ref={reportRef} className="mx-auto w-full max-w-[215.9mm] bg-white p-4 print:p-0">
        {isLoading ? (
          <p className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando resultados…
          </p>
        ) : blocks.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Selecciona las competencias en Admin → ALIEN SYSTEM → Resultados Finales Competición.
          </p>
        ) : (
          sheets.map((sheet, i) => (
            <div
              key={i}
              data-final-sheet
              className="mb-6 flex min-h-[259mm] flex-col break-after-page bg-white last:mb-0"
            >
              <SheetHeader
                club={catalogo?.club ?? ''}
                tournament={catalogo?.tournament ?? ''}
                logo={catalogo?.logoHeader ?? ''}
              />
              <div className="flex-1 overflow-hidden">
                {sheet.map((b) => (
                  <CompeticionBlock key={b.key} block={b} dense={dense} />
                ))}
              </div>
              <SheetRibbon />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminResultadosFinalesCompeticion;
