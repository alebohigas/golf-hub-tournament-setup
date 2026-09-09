/**
 * AdminResultadosFinales — Reporte imprimible "RESULTADOS FINALES"
 * -----------------------------------------------------------------------------
 * Ruta: /admin/resultados-finales?bloques=catid:gross,catid:gross,...
 *
 * Cada BLOQUE es una categoría en un formato (GROSS o NETO). Los bloques se
 * agrupan de DOS EN DOS por hoja carta: si una categoría premia Gross y Neto,
 * cada formato es un bloque y por lo tanto comparte hoja con otro bloque
 * (de la misma o de otra categoría).
 *
 * Contenido de cada bloque:
 *   logo del torneo + nombre del torneo (encabezado de hoja)
 *   nombre de la categoría · sistema de juego · formato (GROSS/NETO)
 *   posiciones en orden ASCENDENTE (3, 2, 1) con logo del club, nombre y total
 *
 * Al pie de cada hoja se imprime el ribbon "SPEi Tour by Alien System".
 */

import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import {
  useResultadosFinalesBloques,
  useResultadosFinalesCatalogo,
  type BloqueKey,
  type ResultadosFinalesBloque,
} from '@/hooks/useResultadosFinales';

/** Ribbon de pie de hoja. */
const SheetRibbon = () => (
  <div className="mt-auto bg-[#cccccc] py-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-black">
    SPEi Tour by Alien System
  </div>
);

/** Encabezado de hoja: nombre del club/torneo a la izquierda y logo a la derecha. */
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
      <div className="truncate text-[17px] font-semibold uppercase text-foreground">
        {club}
      </div>
      <div className="truncate text-[15px] text-foreground">{tournament}</div>
      <div className="text-[17px] font-bold uppercase text-foreground">
        Resultados Finales
      </div>
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

/** Bloque de resultados de una categoría en un formato (GROSS/NETO). */
const CategoryBlock = ({ block }: { block: ResultadosFinalesBloque }) => (
  <div data-final-block className="break-inside-avoid px-2 py-3">
    <div className="text-[15px] font-bold text-foreground">
      CATEGORIA: {block.categoryName || block.shortName}
    </div>
    <div className="text-[13px] font-semibold uppercase text-destructive">
      {block.system} / {block.formatLabel}
    </div>
    <div className="mb-2 text-[12px] text-muted-foreground">
      Lugares: {block.places}
    </div>

    {block.isLoading ? (
      <div className="py-4 text-center text-[12px] text-muted-foreground">
        Cargando resultados…
      </div>
    ) : block.rows.length === 0 ? (
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
            <th className="w-20 px-2 py-1.5 text-right text-[11px] font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r) => (
            <tr key={`${block.categoryId}-${block.gross}-${r.position}`} className="border-b border-border">
              <td className="px-2 py-2 text-center text-[15px] font-bold tabular-nums">
                {r.position}
              </td>
              <td className="px-2 py-2 text-center">
                {r.clubLogo ? (
                  <img
                    src={r.clubLogo}
                    alt=""
                    className="mx-auto h-6 max-w-12 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                    }}
                  />
                ) : (
                  <span className="text-[11px] text-muted-foreground">{r.club}</span>
                )}
              </td>
              <td className="px-2 py-2 text-left text-[14px] text-foreground">{r.name}</td>
              <td className="px-2 py-2 text-right text-[15px] font-bold tabular-nums">
                {r.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/** Página imprimible de resultados finales. */
const AdminResultadosFinales = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  /** Bloques pedidos por URL: "catid:gross" separados por coma. */
  const bloques = useMemo<BloqueKey[]>(() => {
    const raw = params.get('bloques') ?? '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [categoryId, gross] = s.split(':');
        return { categoryId, gross: gross === '1' ? '1' : '0' } as BloqueKey;
      })
      .filter((b) => !!b.categoryId);
  }, [params]);

  const { data: catalogo } = useResultadosFinalesCatalogo();
  const blocks = useResultadosFinalesBloques(bloques);

  /** Hojas carta con DOS bloques cada una. */
  const sheets = useMemo(() => {
    const out: ResultadosFinalesBloque[][] = [];
    for (let i = 0; i < blocks.length; i += 2) out.push(blocks.slice(i, i + 2));
    return out;
  }, [blocks]);

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
      pdf.save('resultados-finales.pdf');
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
        {bloques.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Selecciona las categorías concluidas en Admin → ALIEN SYSTEM → Resultados Finales.
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
              <div className="flex-1">
                {sheet.map((b) => (
                  <CategoryBlock key={`${b.categoryId}-${b.gross}`} block={b} />
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

export default AdminResultadosFinales;
