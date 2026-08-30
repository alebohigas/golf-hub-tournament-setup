/**
 * AdminTarjetasImpresion — /admin/tarjetas-impresion
 * -----------------------------------------------------------------------------
 * Reporte imprimible de TARJETAS de juego (Stroke Play / Stableford).
 *
 * FILTROS (por query string, los manda Admin → pestaña "Tarjetas"):
 *   ?fecha=2026-04-30&catid=6337[,6338][&campoid=27]
 *
 * DISEÑO DE IMPRESIÓN (tamaño carta, 2 tarjetas por hoja)
 *   - Cada hoja se divide en dos mitades iguales (139.7 mm).
 *   - Cada mitad abre con una cabecera de 3 cm (`HEADER_MM`) que contiene:
 *       · izquierda: logo del torneo (`torneo.logo_header`)
 *       · derecha:   nombre del torneo (renglón 1) y campo + fecha (renglón 2)
 *   - Debajo de la cabecera va la tarjeta completa del jugador.
 *   - La fecha "universal" del reporte legacy NO se repite dentro de la
 *     tarjeta: vive únicamente en esa cabecera de 3 cm.
 *
 * Las clases `print:` ocultan la barra de acciones y quitan sombras/fondos.
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Printer } from 'lucide-react';
import { useTarjetasReport, type TarjetaCard } from '@/hooks/useTarjetasImpresion';

// ============= Constantes de hoja =============

/** Alto de la cabecera obligatoria arriba de cada tarjeta (3 cm). */
const HEADER_MM = 30;
/** Alto de media hoja carta (279.4 mm / 2). */
const HALF_SHEET_MM = 139.7;

// ============= Subcomponentes =============

/**
 * Cabecera de 3 cm: logo del torneo a la izquierda y, alineados a la derecha,
 * el nombre del torneo y (segundo renglón) el campo con la fecha de juego.
 */
const CardHeader = ({
  logo,
  tournament,
  course,
  fecha,
}: {
  logo: string;
  tournament: string;
  course: string;
  fecha: string;
}) => (
  <div
    className="flex items-center justify-between gap-3 px-2"
    style={{ height: `${HEADER_MM}mm` }}
  >
    {/* Logo del torneo (list1_logo_header) */}
    <div className="flex h-full items-center">
      {logo ? (
        <img
          src={logo}
          alt={tournament}
          className="max-h-[24mm] w-auto object-contain"
          loading="eager"
        />
      ) : null}
    </div>

    {/* Torneo / campo + fecha, ajustados a la derecha */}
    <div className="text-right leading-tight">
      <div className="text-[12pt] font-bold uppercase">{tournament}</div>
      <div className="text-[10pt] font-semibold uppercase text-foreground/80">
        {course}
        {course && fecha ? ' · ' : ''}
        {fecha}
      </div>
    </div>
  </div>
);

/** Celda de la tabla de la tarjeta con bordes finos uniformes. */
const Cell = ({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <td className={`border border-foreground/60 px-0 text-center align-middle ${className}`}>
    {children}
  </td>
);

/**
 * Tarjeta de un jugador: encabezado de datos + tabla de 18 hoyos con las
 * columnas acumuladas V1 (ida), V2 (vuelta) y TOTAL.
 */
const Scorecard = ({ card }: { card: TarjetaCard }) => {
  const out = card.holes.slice(0, 9);
  const inn = card.holes.slice(9, 18);
  const t = card.totals;

  /** Renglón de datos: etiqueta + 9 hoyos + V1 + 9 hoyos + V2 + TOTAL. */
  const Row = ({
    label,
    value,
    outTotal,
    inTotal,
    total,
    bold = false,
  }: {
    label: string;
    value: (h: TarjetaCard['holes'][number]) => React.ReactNode;
    outTotal?: React.ReactNode;
    inTotal?: React.ReactNode;
    total?: React.ReactNode;
    bold?: boolean;
  }) => (
    <tr className={bold ? 'font-bold' : ''}>
      <Cell className="w-[16mm] whitespace-nowrap px-1 text-left text-[6pt] font-semibold uppercase">
        {label}
      </Cell>
      {out.map((h) => (
        <Cell key={`o-${h.numero}`}>{value(h)}</Cell>
      ))}
      <Cell className="bg-muted/60 font-bold">{outTotal}</Cell>
      {inn.map((h) => (
        <Cell key={`i-${h.numero}`}>{value(h)}</Cell>
      ))}
      <Cell className="bg-muted/60 font-bold">{inTotal}</Cell>
      <Cell className="bg-muted/60 font-bold">{total}</Cell>
    </tr>
  );

  return (
    <div className="border border-foreground/70">
      {/* ---------- Encabezado de datos del jugador ---------- */}
      <div className="flex items-stretch justify-between border-b border-foreground/70 text-[8pt]">
        {/* Hoyo + hora de salida y color del tee */}
        <div className="flex w-[30mm] flex-col justify-center border-r border-foreground/70 px-1 py-1 leading-tight">
          <div className="font-bold">
            H{String(card.hole ?? 1).padStart(2, '0')} {card.time}
          </div>
          <div className="uppercase text-foreground/80">{card.tee}</div>
        </div>

        {/* Número y nombre del jugador */}
        <div className="flex flex-1 items-center gap-2 px-2 py-1">
          <span className="font-bold">{card.playerNumber}</span>
          <span className="truncate font-bold uppercase">{card.name}</span>
        </div>

        {/* Ventaja total */}
        <div className="flex w-[14mm] flex-col items-center justify-center border-l border-foreground/70 py-1 leading-none">
          <span className="text-[5.5pt] uppercase text-foreground/70">Vtja</span>
          <span className="text-[10pt] font-bold">{card.hcp}</span>
        </div>

        {/* Categoría + club */}
        <div className="flex w-[46mm] flex-col justify-center border-l border-foreground/70 px-1 py-1 text-right leading-tight">
          <div className="font-bold uppercase">{card.shortName || card.categoryName}</div>
          <div className="truncate uppercase text-foreground/80">{card.club}</div>
        </div>
      </div>

      {/* ---------- Tabla de hoyos ---------- */}
      <table className="w-full table-fixed border-collapse text-[7pt] leading-none">
        <tbody>
          {/* Números de hoyo */}
          <tr className="bg-muted/60 font-bold">
            <Cell className="w-[16mm] px-1 text-left text-[6pt] uppercase">Hoyo</Cell>
            {out.map((h) => (
              <Cell key={`h-${h.numero}`} className="py-[1mm]">
                {h.numero}
              </Cell>
            ))}
            <Cell className="py-[1mm]">V1</Cell>
            {inn.map((h) => (
              <Cell key={`h-${h.numero}`} className="py-[1mm]">
                {h.numero}
              </Cell>
            ))}
            <Cell className="py-[1mm]">V2</Cell>
            <Cell className="py-[1mm]">TOTAL</Cell>
          </tr>

          <Row
            label="Par"
            bold
            value={(h) => h.par ?? ''}
            outTotal={t.parOut}
            inTotal={t.parIn}
            total={t.par}
          />
          <Row
            label="Yardas"
            value={(h) => h.yardas ?? ''}
            outTotal={t.yardasOut}
            inTotal={t.yardasIn}
            total={t.yardas}
          />
          <Row label="Par Time" value={(h) => h.parTime} />
          <Row label="Ventaja" value={(h) => h.ventaja ?? ''} />
          <Row
            label="Handicap"
            value={(h) => (h.handicap > 0 ? h.handicap : '')}
            outTotal={t.handicapOut}
            inTotal={t.handicapIn}
            total={t.handicap}
          />

          {/* Renglones en blanco para anotar (score y, en Stableford, puntos) */}
          <Row label="Score" value={() => ''} />
          <Row
            label={card.system.includes('STABLE') ? 'Puntos' : 'Neto'}
            value={() => ''}
          />
        </tbody>
      </table>

      {/* ---------- Pie: club sede, folio y firmas ---------- */}
      <div className="flex items-end justify-between gap-2 border-t border-foreground/70 px-2 pb-1 pt-2 text-[6.5pt] uppercase">
        <div className="font-semibold">{card.categoryName}</div>
        <div className="flex-1 border-b border-foreground/60 text-center">Anotador</div>
        <div className="flex-1 border-b border-foreground/60 text-center">Firma jugador</div>
        <div className="whitespace-nowrap font-semibold">Folio {card.folio || '—'}</div>
      </div>
    </div>
  );
};

// ============= Página =============

/** Página imprimible con 2 tarjetas por hoja carta. */
const AdminTarjetasImpresion = () => {
  const [params] = useSearchParams();
  const filters = useMemo(
    () => ({
      fecha: params.get('fecha') ?? '',
      catid: params.get('catid') ?? '',
      campoid: params.get('campoid') ?? undefined,
    }),
    [params],
  );

  const { data, isLoading, error } = useTarjetasReport(filters);
  const cards = data?.cards ?? [];

  /** Tarjetas agrupadas en pares: cada par es una hoja carta. */
  const sheets = useMemo(() => {
    const out: TarjetaCard[][] = [];
    for (let i = 0; i < cards.length; i += 2) out.push(cards.slice(i, i + 2));
    return out;
  }, [cards]);

  return (
    <div className="min-h-screen bg-background print:bg-transparent">
      {/* @page: hoja carta sin márgenes; el margen real es la cabecera de 3 cm */}
      <style>{`@media print { @page { size: letter portrait; margin: 0; } }`}</style>

      <div className="mx-auto max-w-[216mm] px-4 py-6 print:max-w-none print:px-0 print:py-0">
        {/* Barra de acciones (no se imprime) */}
        <div className="mb-6 flex items-center justify-between gap-2 print:hidden">
          <div>
            <h1 className="text-xl font-bold">Tarjetas de juego</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${cards.length} tarjetas · ${data.fechaFormato}` : 'Cargando…'}
            </p>
          </div>
          <Button onClick={() => window.print()} disabled={!cards.length}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground print:hidden">
            <Loader2 className="h-4 w-4 animate-spin" /> Generando tarjetas…
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm print:hidden">
            No se pudo generar el reporte de tarjetas.
          </div>
        )}

        {!isLoading && !error && !cards.length && (
          <div className="rounded-md border p-4 text-sm text-muted-foreground print:hidden">
            No hay tarjetas para la fecha y categorías seleccionadas.
          </div>
        )}

        {/* Hojas: 2 tarjetas por hoja, cada una con su cabecera de 3 cm */}
        {sheets.map((pair, idx) => (
          <div
            key={`sheet-${idx}`}
            className="mb-6 bg-white print:mb-0"
            style={{ breakAfter: idx < sheets.length - 1 ? 'page' : 'auto' }}
          >
            {pair.map((card) => (
              <div
                key={`${card.groupId}-${card.playerId}`}
                className="overflow-hidden"
                style={{ height: `${HALF_SHEET_MM}mm`, breakInside: 'avoid' }}
              >
                <CardHeader
                  logo={data?.logoHeader ?? ''}
                  tournament={data?.tournament ?? ''}
                  course={data?.course ?? ''}
                  fecha={data?.fechaFormato ?? ''}
                />
                <div className="px-2">
                  <Scorecard card={card} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTarjetasImpresion;
