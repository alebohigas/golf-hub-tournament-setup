/**
 * AdminTarjetasImpresion — /admin/tarjetas-impresion
 * -----------------------------------------------------------------------------
 * Reporte imprimible de TARJETAS de juego (Stroke Play / Stableford).
 *
 * FILTROS (por query string, los manda Admin → pestaña "Tarjetas"):
 *   ?fecha=2026-04-30&catid=6337[,6338][&campoid=27]
 *   &header=30        → alto de la cabecera superior en mm (3 cm por defecto)
 *   &margin=8         → margen lateral/inferior en mm
 *   &scale=100        → escala del contenido de la tarjeta en %
 *   &sistema=auto     → auto | stroke | stableford (filtra por tipo de juego)
 *   &preview=1        → abre automáticamente la vista previa paginada
 *
 * DISEÑO DE IMPRESIÓN (tamaño carta, 2 tarjetas por hoja)
 *   - Cada hoja se divide en dos mitades iguales (139.7 mm).
 *   - Cada mitad abre con una cabecera configurable (3 cm por defecto) con:
 *       · izquierda: logo del torneo (`torneo.logo_header`)
 *       · derecha:   nombre del torneo (renglón 1) y campo + fecha (renglón 2)
 *   - Debajo de la cabecera va la tarjeta completa del jugador.
 *   - La fecha "universal" del reporte legacy NO se repite dentro de la tarjeta.
 *
 * La vista previa rasteriza cada hoja con html2canvas (misma geometría que la
 * impresión) y el PDF se arma con jsPDF a tamaño carta, una hoja por página.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Download, Eye, Loader2, Printer } from 'lucide-react';
import { useTarjetasReport, type TarjetaCard } from '@/hooks/useTarjetasImpresion';
import {
  TARJETA_ROW_LABELS,
  normalizeTarjetaRows,
  type TarjetaRowKey,
} from '@/lib/tarjetasRows';
import {
  TARJETA_HEADER_FONTS_DEFAULT,
  clampTarjetaFont,
  normalizeTarjetaHeader,
  type TarjetaHeaderFonts,
  type TarjetaHeaderKey,
} from '@/lib/tarjetasHeader';
/* Resaltado del hoyo de inicio (fuente única para pantalla, impresión y PDF). */
import { startHoleStyleFor } from '@/lib/tarjetasStartHole';
import {
  TARJETA_HCP_FIELD_LABELS,
  normalizeTarjetaHcpField,
} from '@/lib/tarjetasHcp';
/* Maqueta compartida (encabezado 3 renglones + pie de firmas) con la vista previa. */
import {
  TarjetaAnotadorRow,
  TarjetaFooter,
  TarjetaHeaderGrid,
} from '@/components/tarjetas/TarjetaChrome';


// ============= Constantes de hoja =============

/** Lado corto de la hoja carta (mm). */
const LETTER_SHORT_MM = 215.9;
/** Lado largo de la hoja carta (mm). */
const LETTER_LONG_MM = 279.4;

/** Alto de media hoja carta VERTICAL (279.4 mm / 2). */
const HALF_SHEET_MM = LETTER_LONG_MM / 2;
/** Ancho de hoja carta vertical. */
const SHEET_W_MM = LETTER_SHORT_MM;
/** Alto de hoja carta vertical. */
const SHEET_H_MM = LETTER_LONG_MM;

/**
 * Geometría de la hoja según la ORIENTACIÓN (`orient=portrait|landscape`).
 * En horizontal la hoja mide 279.4 × 215.9 mm y cada tarjeta ocupa la mitad
 * del alto (107.95 mm): así siempre entran 2 tarjetas por hoja y los brincos
 * de página nunca se desfasan.
 */
export const tarjetaSheetGeometry = (landscape: boolean) => {
  const width = landscape ? LETTER_LONG_MM : LETTER_SHORT_MM;
  const height = landscape ? LETTER_SHORT_MM : LETTER_LONG_MM;
  return { width, height, half: height / 2 };
};

/** Valores predeterminados de maquetación por orientación. */
export const TARJETA_ORIENT_DEFAULTS = {
  portrait: { headerMm: 30, marginMm: 8, scale: 100, rowMm: 5.5 },
  /* En horizontal hay menos alto por tarjeta: cabecera y renglón más chicos. */
  landscape: { headerMm: 20, marginMm: 10, scale: 100, rowMm: 4.2 },
} as const;

/**
 * Alto aproximado del pie de firmas de la tarjeta, en mm (el encabezado y los
 * brincos de renglón se calculan aparte porque miden `rowMm`).
 * NO incluye el padding-bottom del renglón SCORE ANOTADOR: ése es
 * configurable (`pad`) y se suma aparte en `maxRowMm`.
 */
const CARD_CHROME_MM = 9;

/**
 * Renglones "extra" que también miden `rowMm`:
 *   3 → encabezado de datos del jugador
 *   1 → brinco entre encabezado y tabla
 *   3 → margen entre el último renglón de la tabla y las firmas
 *   1 → renglón SCORE ANOTADOR (abajo de la tabla, antes de las firmas)
 */
const EXTRA_ROWS = 10;

/**
 * Alto máximo permitido por renglón para que la tarjeta NUNCA se desborde de
 * la mitad de hoja disponible (vertical 139.7 mm u horizontal 107.95 mm),
 * incluyendo cabecera configurable, escala y renglones extra.
 */
const maxRowMm = (
  halfMm: number,
  headerMm: number,
  scale: number,
  tableRows: number,
  padMm: number,
) => {
  const disponible = (halfMm - headerMm) / scale - CARD_CHROME_MM - padMm;
  return Math.max(2.6, disponible / Math.max(1, tableRows + EXTRA_ROWS));
};




/** Lee un número de la URL acotado a un rango. */
const numParam = (v: string | null, def: number, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
};

// ============= Subcomponentes =============

/**
 * Cabecera superior de cada tarjeta (3 cm por defecto): logo del torneo a la
 * izquierda y, alineados a la derecha, el nombre del torneo y el campo + fecha.
 * Usa EXACTAMENTE los mismos márgenes laterales que la tabla de la tarjeta
 * (`marginMm`) para que logo y título nunca se salgan del área imprimible.
 */
const CardHeader = ({
  logo,
  tournament,
  course,
  fecha,
  heightMm,
  marginMm,
  sheetWmm = SHEET_W_MM,
}: {
  logo: string;
  tournament: string;
  course: string;
  fecha: string;
  heightMm: number;
  /** Margen lateral en mm, igual al de la tabla de la tarjeta. */
  marginMm: number;
  /** Ancho real de la hoja en mm (cambia en orientación horizontal). */
  sheetWmm?: number;
}) => (
  <div
    className="flex items-center justify-between gap-3"
    style={{
      height: `${heightMm}mm`,
      paddingLeft: `${marginMm}mm`,
      paddingRight: `${marginMm}mm`,
    }}
  >

    {/* Logo del torneo (list1_logo_header) — no se encoge ni se desborda */}
    <div className="flex h-full shrink-0 items-center">
      {logo ? (
        <img
          src={logo}
          alt={tournament}
          className="w-auto object-contain"
          style={{
            maxHeight: `${Math.max(10, heightMm - 6)}mm`,
            /* Nunca más de un tercio del ancho útil de la hoja. */
            maxWidth: `${Math.max(30, (sheetWmm - marginMm * 2) / 3)}mm`,
          }}
          loading="eager"
          crossOrigin="anonymous"
        />
      ) : null}
    </div>


    {/* Torneo / campo + fecha, ajustados a la derecha dentro del margen */}
    <div className="min-w-0 flex-1 text-right leading-tight">
      <div className="truncate text-[12pt] font-bold uppercase">{tournament}</div>
      <div className="truncate text-[10pt] font-semibold uppercase text-foreground/80">
        {course}
        {course && fecha ? ' · ' : ''}
        {fecha}
      </div>
    </div>

  </div>
);

/** Celda de la tabla de la tarjeta con bordes finos. */
const Cell = ({
  children,
  className = '',
  style,
  darkBorder = false,
}: {
  children?: React.ReactNode;
  className?: string;
  /** Estilo inline por celda (p. ej. resaltado del hoyo de inicio). */
  style?: React.CSSProperties;
  /** Borde oscuro (usado en la línea de SCORE GROSS); el resto usa borde claro. */
  darkBorder?: boolean;
}) => (
  <td
    className={`border px-0 text-center align-middle ${darkBorder ? 'border-foreground/60' : 'border-foreground/30'} ${className}`}
    style={style}
  >
    {children}
  </td>
);


/**
 * ANCHOS DE COLUMNA (en % del ancho útil de la tarjeta).
 * Se fijan con <colgroup> + table-fixed para que el contenido NUNCA se recorte
 * al imprimir: la etiqueta tiene su propio ancho y los 18 hoyos + V1/V2/TOTAL
 * reparten el resto de forma exacta (suma = 100%).
 */
const COL_LABEL_PCT = 10.6;
const COL_TOTAL_PCT = 5.6;
const COL_HOLE_PCT = (100 - COL_LABEL_PCT - COL_TOTAL_PCT * 3) / 18;

/** <colgroup> compartido por la vista previa, la impresión y el PDF. */
const ColGroup = () => (
  <colgroup>
    <col style={{ width: `${COL_LABEL_PCT}%` }} />
    {Array.from({ length: 9 }, (_, i) => (
      <col key={`co-${i}`} style={{ width: `${COL_HOLE_PCT}%` }} />
    ))}
    <col style={{ width: `${COL_TOTAL_PCT}%` }} />
    {Array.from({ length: 9 }, (_, i) => (
      <col key={`ci-${i}`} style={{ width: `${COL_HOLE_PCT}%` }} />
    ))}
    <col style={{ width: `${COL_TOTAL_PCT}%` }} />
    <col style={{ width: `${COL_TOTAL_PCT}%` }} />
  </colgroup>
);

/*
 * El encabezado (3 renglones), el chip de marcas de salida y el pie de firmas
 * viven en `@/components/tarjetas/TarjetaChrome`, compartidos 1:1 con la
 * previsualización en vivo de Admin → Tarjetas.
 */


/**
 * Tarjeta de un jugador: encabezado de datos + tabla de 18 hoyos con las
 * columnas acumuladas V1 (ida), V2 (vuelta) y TOTAL.
 *
 * @param rows         Orden de renglones configurado en Admin → Tarjetas.
 * @param headerFields Campos y orden del encabezado (3 renglones), Admin.
 */
const Scorecard = ({
  card,
  rowMm,
  padMm,

  rows,
  headerFields,
  headerFonts,
}: {
  card: TarjetaCard;
  rowMm: number;
  /** Padding-bottom (mm) configurable al final de la tarjeta. */
  padMm: number;
  rows: TarjetaRowKey[];
  headerFields: TarjetaHeaderKey[];
  /** Tamaños de letra (pt) de hoyo/hora y categoría (Admin → Tarjetas). */
  headerFonts: TarjetaHeaderFonts;
}) => {

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
    head = false,
    bold = false,
    darkBorder = false,
    heightMm,
    holeCellClass,
    holeCellStyle,
  }: {
    label: string;
    value: (h: TarjetaCard['holes'][number]) => React.ReactNode;
    outTotal?: React.ReactNode;
    inTotal?: React.ReactNode;
    total?: React.ReactNode;
    head?: boolean;
    /** Imprime TODO el renglón (etiqueta, hoyos y totales) en negritas. */
    bold?: boolean;
    /** Borde oscuro para toda la línea (SCORE GROSS); el resto usa borde claro. */
    darkBorder?: boolean;
    /** Alto del renglón en mm (por defecto `rowMm`; SCORE GROSS usa 1.5×). */
    heightMm?: number;
    /** Clase extra por celda de hoyo (p. ej. resaltar el hoyo de salida). */
    holeCellClass?: (h: TarjetaCard['holes'][number]) => string;
    /** Estilo inline por celda de hoyo (resaltado del hoyo de inicio). */
    holeCellStyle?: (h: TarjetaCard['holes'][number]) => React.CSSProperties | undefined;
  }) => (
    /* El alto de cada renglón es configurable (rowMm) sin salir de 1/2 carta. */
    <tr
      className={`${head ? 'bg-muted/60 font-bold' : ''} ${bold ? 'font-bold' : ''}`}
      style={{ height: `${heightMm ?? rowMm}mm` }}
    >
      <Cell
        darkBorder={darkBorder}
        className={`truncate px-1 text-left text-[6pt] uppercase ${
          bold ? 'font-bold' : 'font-semibold'
        }`}
      >
        {label}
      </Cell>
      {out.map((h) => (
        <Cell
          key={`o-${h.numero}`}
          darkBorder={darkBorder}
          className={holeCellClass?.(h)}
          style={holeCellStyle?.(h)}
        >
          {value(h)}
        </Cell>
      ))}
      <Cell darkBorder={darkBorder} className={head ? '' : 'bg-muted/60 font-bold'}>{outTotal}</Cell>
      {inn.map((h) => (
        <Cell
          key={`i-${h.numero}`}
          darkBorder={darkBorder}
          className={holeCellClass?.(h)}
          style={holeCellStyle?.(h)}
        >
          {value(h)}
        </Cell>
      ))}
      <Cell darkBorder={darkBorder} className={head ? '' : 'bg-muted/60 font-bold'}>{inTotal}</Cell>
      <Cell darkBorder={darkBorder} className={head ? '' : 'bg-muted/60 font-bold'}>{total}</Cell>
    </tr>
  );

  /** Definición de cada renglón disponible (se pinta según el orden pedido). */
  const rowDefs: Record<TarjetaRowKey, React.ReactNode> = {
    hoyo: (
      <Row
        key="hoyo"
        head
        label={TARJETA_ROW_LABELS.hoyo}
        value={(h) => h.numero}
        outTotal="V1"
        inTotal="V2"
        total="TOTAL"
        /* Hoyo de inicio (H01–H18): recuadro negro con número blanco. El
           estilo es inline y compartido (tarjetasStartHole) para que pantalla,
           impresión y PDF se vean idénticos en cualquier tema. */
        holeCellStyle={(h) => startHoleStyleFor(h.numero, card.hole)}
      />
    ),
    /* PAR CAMPO: todo el renglón (etiqueta, hoyos y totales) va en NEGRITAS. */
    par: (
      <Row
        key="par"
        bold
        label={TARJETA_ROW_LABELS.par}
        value={(h) => h.par ?? ''}
        outTotal={t.parOut}
        inTotal={t.parIn}
        total={t.par}
      />
    ),


    yardas: (
      <Row
        key="yardas"
        label={TARJETA_ROW_LABELS.yardas}
        value={(h) => h.yardas ?? ''}
        outTotal={t.yardasOut}
        inTotal={t.yardasIn}
        total={t.yardas}
      />
    ),
    partime: (
      <Row key="partime" label={TARJETA_ROW_LABELS.partime} value={(h) => h.parTime} />
    ),
    ventaja: (
      <Row key="ventaja" label={TARJETA_ROW_LABELS.ventaja} value={(h) => h.ventaja ?? ''} />
    ),
    /* Renglones en blanco para anotar */
    /* SCORE GROSS: renglón 1.5× más alto que los demás (donde se anota).
       La etiqueta "SCORE GROSS" siempre se imprime en negritas. */
    gross: (
      <Row
        key="gross"
        bold
        darkBorder
        label={TARJETA_ROW_LABELS.gross}
        value={() => ''}
        heightMm={rowMm * 1.5}
      />
    ),
    handicap: (
      <Row
        key="handicap"
        label={TARJETA_ROW_LABELS.handicap}
        value={(h) => (h.handicap > 0 ? h.handicap : '')}
        outTotal={t.handicapOut}
        inTotal={t.handicapIn}
        total={t.handicap}
      />
    ),
    neto: <Row key="neto" label={TARJETA_ROW_LABELS.neto} value={() => ''} />,
    puntos: <Row key="puntos" label={TARJETA_ROW_LABELS.puntos} value={() => ''} />,
  };

  return (
    <div className="border border-foreground/70">
      {/*
        ---------- Encabezado de datos del jugador (3 renglones) ----------
        Componente COMPARTIDO con la previsualización en vivo de Admin →
        Tarjetas (`hfields` en la URL del reporte): así impresión, PDF y vista
        previa son idénticos e incluyen los mismos fallbacks de datos faltantes.
      */}
      <TarjetaHeaderGrid
        card={card}
        fields={headerFields}
        rowMm={rowMm}
        fonts={headerFonts}
      />

      {/* Brinco de renglón entre el encabezado y la tabla de hoyos */}
      <div style={{ height: `${rowMm}mm` }} />

      {/* ---------- Tabla de hoyos (orden configurable desde Admin) ---------- */}
      <table className="w-full table-fixed border-collapse text-[7pt] leading-none">
        <ColGroup />
        <tbody>{rows.map((key) => rowDefs[key])}</tbody>
      </table>

      {/* Margen de 2 renglones entre el último renglón y el pie */}
      <div style={{ height: `${rowMm * 2}mm` }} />

      {/* ---------- Pie: sistema de juego, firmas y folio (compartido) ---------- */}
      <TarjetaFooter card={card} />

      {/* Brinco de renglón entre el pie y el score del anotador */}
      <div style={{ height: `${rowMm}mm` }} />

      {/*
        ---------- SCORE ANOTADOR en 2 renglones (compartido con la vista previa) ----------
        Renglón 1 igual que el renglón HOYO (hoyos 1-18 + V1/V2/TOTAL) y renglón 2
        vacío para escribir los golpes. El padding-bottom final es configurable (`pad`).
        Su alto ya está contemplado en EXTRA_ROWS para no perder el formato de 1/2 carta.
      */}
      <TarjetaAnotadorRow rowMm={rowMm} padMm={padMm} startHole={card.hole} />
    </div>
  );
};



// ============= Página =============

/** Página imprimible con 2 tarjetas por hoja carta + vista previa y PDF. */
const AdminTarjetasImpresion = () => {
  const [params] = useSearchParams();

  /**
   * ORIENTACIÓN de la hoja (`orient=portrait|landscape`).
   * En horizontal la hoja carta se imprime acostada (279.4 × 215.9 mm) y cada
   * tarjeta ocupa exactamente 1/2 hoja (107.95 mm): 2 tarjetas por hoja sin
   * desfases en los brincos de página.
   */
  const landscape = (params.get('orient') ?? 'portrait').toLowerCase() === 'landscape';
  /** Geometría real de la hoja y de la mitad que ocupa cada tarjeta. */
  const sheet = useMemo(() => tarjetaSheetGeometry(landscape), [landscape]);
  /** Predeterminados de maquetación de la orientación activa. */
  const orientDefaults = landscape
    ? TARJETA_ORIENT_DEFAULTS.landscape
    : TARJETA_ORIENT_DEFAULTS.portrait;

  /** Configuración de maquetación (viene de Admin y se puede fijar en la URL). */
  /* En horizontal la cabecera se limita a 34 mm para que la tarjeta siempre quepa. */
  const headerMm = numParam(
    params.get('header'),
    orientDefaults.headerMm,
    10,
    landscape ? 34 : 60,
  );
  const marginMm = numParam(params.get('margin'), orientDefaults.marginMm, 0, 25);
  const scale = numParam(params.get('scale'), orientDefaults.scale, 60, 130) / 100;

  const sistema = (params.get('sistema') ?? 'auto').toLowerCase();
  const autoPreview = params.get('preview') === '1';
  /** Imprimir el logo del torneo en la cabecera (Admin → Tarjetas, `logo=`). */
  const showLogo = params.get('logo') !== '0';

  /**
   * Alto de renglón pedido (`rowh`, mm) acotado al máximo que cabe en la media
   * hoja: así se pueden hacer más altos los renglones sin desplazar la tarjeta.
   */
  /**
   * Orden de renglones configurado en Admin → Tarjetas (`rows=hoyo,yardas,...`).
   * Si no llega o es inválido se usa el orden por defecto del club.
   */
  const rowOrder = useMemo(
    () => normalizeTarjetaRows(params.get('rows')),
    [params],
  );

  /**
   * Campos y orden del encabezado de 3 renglones configurado en Admin
   * (`hfields=hoyohora,jugador,...`).
   */
  const headerFields = useMemo(
    () => normalizeTarjetaHeader(params.get('hfields')),
    [params],
  );

  /**
   * Tamaños de letra del encabezado configurados en Admin → Tarjetas y
   * enviados en la URL (`fsh` = hoyo/hora, `fsc` = categoría).
   */
  const headerFonts: TarjetaHeaderFonts = useMemo(
    () => ({
      hoyoPt: clampTarjetaFont(params.get('fsh'), TARJETA_HEADER_FONTS_DEFAULT.hoyoPt),
      catPt: clampTarjetaFont(params.get('fsc'), TARJETA_HEADER_FONTS_DEFAULT.catPt),
      jugadorPt: clampTarjetaFont(
        params.get('fsj'),
        TARJETA_HEADER_FONTS_DEFAULT.jugadorPt,
      ),
    }),
    [params],
  );

  /**
   * Campo de la BD del que el backend toma el HCP. NETO (`hcpfield=`), tal como
   * se configuró en Admin → Tarjetas.
   */
  const hcpField = useMemo(
    () => normalizeTarjetaHcpField(params.get('hcpfield')),
    [params],
  );

  /** Padding-bottom (mm) bajo el renglón SCORE ANOTADOR (Admin → Tarjetas). */
  const padMm = numParam(params.get('pad'), 3, 0, 15);

  /**
   * SCORE GROSS mide 1.5 renglones (más espacio para anotar): se suma 0.5 al
   * total de renglones para que el alto calculado nunca desborde 1/2 carta.
   */
  const effectiveRows =
    rowOrder.length + (rowOrder.includes('gross') ? 0.5 : 0);

  const rowMm = Math.min(
    numParam(params.get('rowh'), orientDefaults.rowMm, 2.6, 12),
    maxRowMm(sheet.half, headerMm, scale, effectiveRows, padMm),
  );



  /**
   * Filtros de datos. `fecha` puede traer varios días separados por coma
   * (rango). El torneo NO se manda: el backend usa siempre el torneo ACTIVO
   * del sitio (`site_config.torneoid`) para evitar inconsistencias.
   */
  const filters = useMemo(
    () => ({
      fecha: params.get('fecha') ?? '',
      catid: params.get('catid') ?? '',
      campoid: params.get('campoid') ?? undefined,
      sistema,
      // Campo de la BD para el HCP. NETO (Admin → Tarjetas).
      hcpfield: hcpField,
    }),
    [params, sistema, hcpField],
  );

  const { data, isLoading, error } = useTarjetasReport(filters);



  /** Tarjetas del reporte, filtradas por tipo de juego si se pidió uno. */
  const cards = useMemo(() => {
    const all = data?.cards ?? [];
    if (sistema === 'stroke') return all.filter((c) => !c.system.includes('STABLE'));
    if (sistema === 'stableford') return all.filter((c) => c.system.includes('STABLE'));
    return all;
  }, [data, sistema]);

  /** Tarjetas agrupadas en pares: cada par es una hoja carta. */
  const sheets = useMemo(() => {
    const out: TarjetaCard[][] = [];
    for (let i = 0; i < cards.length; i += 2) out.push(cards.slice(i, i + 2));
    return out;
  }, [cards]);

  /**
   * VALIDACIÓN DE HCP. NETO (sólo en pantalla, no se imprime)
   * -----------------------------------------------------------------------
   * Compara el valor mostrado en el encabezado (`hcp`, tomado del campo de la
   * BD configurado en Admin) contra el neto calculado con la suma de golpes de
   * ventaja por hoyo (`hcpVentajas`). Si no coinciden se listan las tarjetas
   * afectadas para revisar la captura en el sistema de torneos.
   */
  const hcpMismatches = useMemo(
    () =>
      cards
        .filter(
          (c) =>
            typeof c.hcpVentajas === 'number' && c.hcpVentajas !== c.hcp,
        )
        .map((c) => ({
          key: `${c.groupId}-${c.playerId}-${c.fecha}`,
          name: c.name || 'JUGADOR POR ASIGNAR',
          category: c.shortName || c.categoryName,
          hcp: c.hcp,
          ventajas: c.hcpVentajas as number,
          source: c.hcpSource ?? '',
        })),
    [cards],
  );

  /**
   * MODO AUDITORÍA (sólo pantalla)
   * -----------------------------------------------------------------------
   * Detalle del cálculo por jugador: el neto derivado de los golpes de ventaja
   * por hoyo (que dependen de la MESA DE SALIDA registrada al jugador, no del
   * handicap de la categoría) contra los valores de las columnas netas de la
   * BD, más el campo y la regla que finalmente se aplicaron.
   */
  const [auditOpen, setAuditOpen] = useState(false);

  /** Conteo de tarjetas por campo de la BD realmente usado. */
  const hcpSourceCounts = useMemo(() => {
    const map = new Map<string, number>();
    cards.forEach((c) => {
      const k = c.hcpSource || 'ventajas';
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [cards]);

  // ============= Vista previa + PDF =============

  /** Contenedor de las hojas (fuente de verdad para rasterizar). */
  const sheetsRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [busy, setBusy] = useState<'preview' | 'pdf' | null>(null);
  const autoRan = useRef(false);

  /** Rasteriza cada hoja a PNG con html2canvas (una imagen por página). */
  const renderPages = useCallback(
    async (pixelScale: number) => {
      const root = sheetsRef.current;
      if (!root) return [] as string[];
      const { default: html2canvas } = await import('html2canvas');
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-sheet]'));
      const pages: string[] = [];
      for (const node of nodes) {
        /*
          Se rasteriza el MISMO nodo de la hoja con su geometría exacta en px
          (215.9 × 279.4 mm) para que el PDF no reflowee: mismo CSS de
          impresión, misma cabecera superior y mismos márgenes laterales.
        */
        const canvas = await html2canvas(node, {
          scale: pixelScale,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          width: node.offsetWidth,
          height: node.offsetHeight,
          windowWidth: node.offsetWidth,
          scrollX: 0,
          scrollY: 0,
        });
        pages.push(canvas.toDataURL('image/png'));
      }
      return pages;
    },
    [],
  );

  /** Abre la vista previa paginada (misma geometría que la impresión). */
  const openPreview = useCallback(async () => {
    if (!sheets.length) return;
    setBusy('preview');
    try {
      const pages = await renderPages(1.4);
      setPreviewPages(pages);
      setPreviewIdx(0);
      setPreviewOpen(true);
    } finally {
      setBusy(null);
    }
  }, [renderPages, sheets.length]);

  /** Descarga el reporte como PDF tamaño carta (1 hoja = 1 página). */
  const downloadPdf = useCallback(async () => {
    if (!sheets.length) return;
    setBusy('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const pages = await renderPages(2.5);
      const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
      pages.forEach((img, i) => {
        if (i > 0) pdf.addPage('letter', 'portrait');
        pdf.addImage(img, 'PNG', 0, 0, SHEET_W_MM, SHEET_H_MM, undefined, 'FAST');
      });
      pdf.save(`tarjetas-${filters.fecha || 'reporte'}.pdf`);
    } finally {
      setBusy(null);
    }
  }, [renderPages, sheets.length, filters.fecha]);

  /**
   * Prepara la vista previa en cuanto hay tarjetas del torneo activo.
   * Se hace SIEMPRE (no sólo con `?preview=1`) para garantizar que el reporte
   * se renderizó bien antes de habilitar la impresión; el diálogo sólo se abre
   * automáticamente cuando viene `?preview=1`.
   */
  useEffect(() => {
    if (autoRan.current || !sheets.length) return;
    autoRan.current = true;
    void (async () => {
      setBusy('preview');
      try {
        const pages = await renderPages(1.4);
        setPreviewPages(pages);
        setPreviewIdx(0);
        if (autoPreview) setPreviewOpen(true);
      } finally {
        setBusy(null);
      }
    })();
  }, [autoPreview, sheets.length, renderPages]);

  /** La impresión sólo se habilita cuando la vista previa ya se generó. */
  const previewReady = previewPages.length > 0 && !busy;


  /**
   * Imprime desde la vista previa: cierra el diálogo (para que el overlay del
   * modal no aparezca en la hoja) y abre el diálogo nativo de impresión con la
   * misma maquetación carta/cabecera/margen/escala del reporte.
   */
  const printFromPreview = useCallback(() => {
    setPreviewOpen(false);
    window.setTimeout(() => window.print(), 250);
  }, []);



  return (
    <div className="min-h-screen bg-background print:bg-transparent">
      {/* @page: hoja carta sin márgenes; el margen real lo aplica el layout */}
      <style>{`@media print { @page { size: letter portrait; margin: 0; } }`}</style>

      <div className="mx-auto max-w-[216mm] px-4 py-6 print:max-w-none print:px-0 print:py-0">
        {/* Barra de acciones (no se imprime) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div>
            <h1 className="text-xl font-bold">Tarjetas de juego</h1>
            <p className="text-sm text-muted-foreground">
              {data
                ? `${cards.length} tarjetas · ${sheets.length} hojas · ${data.fechas && data.fechas.length > 1 ? `${data.fechas.length} días` : data.fechaFormato} · cabecera ${headerMm}mm · escala ${Math.round(
                    scale * 100,
                  )}%`
                : 'Cargando…'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openPreview} disabled={!sheets.length || !!busy}>
              {busy === 'preview' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Vista previa
            </Button>
            <Button variant="outline" onClick={downloadPdf} disabled={!sheets.length || !!busy}>
              {busy === 'pdf' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>
            {/* Imprimir sólo cuando la vista previa ya está lista */}
            <Button onClick={() => window.print()} disabled={!previewReady}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {previewReady ? 'Imprimir' : 'Preparando vista previa…'}
            </Button>

          </div>
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

        {/*
          Aviso de discrepancias en HCP. NETO: sólo se ve en pantalla
          (print:hidden) para no alterar la maqueta impresa.
        */}
        {!isLoading && !error && !!cards.length && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm print:hidden ${
              hcpMismatches.length
                ? 'border-destructive/40 bg-destructive/10'
                : 'border-border bg-muted/40'
            }`}
          >
            <p className="font-medium">
              HCP. NETO · fuente: {TARJETA_HCP_FIELD_LABELS[hcpField]}
            </p>
            {hcpMismatches.length ? (
              <>
                <p className="mt-1 text-muted-foreground">
                  {hcpMismatches.length} tarjeta(s) con el valor impreso
                  distinto al neto calculado por ventajas por hoyo:
                </p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-auto">
                  {hcpMismatches.map((m) => (
                    <li key={m.key} className="tabular-nums">
                      <span className="font-medium">{m.name}</span>
                      {m.category ? ` · ${m.category}` : ''} — impreso{' '}
                      <strong>{m.hcp}</strong>
                      {m.source ? ` (${m.source})` : ''} · ventajas{' '}
                      <strong>{m.ventajas}</strong>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-1 text-muted-foreground">
                Todas las tarjetas coinciden con el neto calculado por ventajas
                por hoyo.
              </p>
            )}
          </div>
        )}

        {/*
          MODO AUDITORÍA: tabla con el detalle del cálculo por jugador. Nunca
          se imprime (print:hidden).
        */}
        {!isLoading && !error && !!cards.length && (
          <div className="mb-4 rounded-md border p-3 text-sm print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">Modo auditoría de HCP. NETO</p>
                <p className="text-[12px] text-muted-foreground">
                  Campos usados:{' '}
                  {hcpSourceCounts
                    .map(([k, n]) => `${k}: ${n} tarjeta(s)`)
                    .join(' · ')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAuditOpen((v) => !v)}
              >
                {auditOpen ? 'Ocultar detalle' : 'Ver detalle por jugador'}
              </Button>
            </div>

            {auditOpen && (
              <div className="mt-3 max-h-[60vh] overflow-auto rounded-md border">
                <table className="w-full text-[12px] tabular-nums">
                  <thead className="sticky top-0 bg-muted">
                    <tr className="text-left">
                      <th className="whitespace-nowrap p-2">Jugador</th>
                      <th className="whitespace-nowrap p-2">Categoría</th>
                      <th className="whitespace-nowrap p-2">Mesa de salida</th>
                      <th className="whitespace-nowrap p-2">Neto x ventajas</th>
                      <th className="whitespace-nowrap p-2">hcpneto</th>
                      <th className="whitespace-nowrap p-2">handicapneto</th>
                      <th className="whitespace-nowrap p-2">vtjajug</th>
                      <th className="whitespace-nowrap p-2">Impreso</th>
                      <th className="whitespace-nowrap p-2">Campo usado</th>
                      <th className="whitespace-nowrap p-2">Regla</th>
                      <th className="whitespace-nowrap p-2">Ventajas por hoyo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((c) => {
                      const ventajas = c.hcpVentajas ?? 0;
                      const diff = c.hcp - ventajas;
                      return (
                        <tr
                          key={`audit-${c.groupId}-${c.playerId}-${c.fecha}`}
                          className={diff !== 0 ? 'bg-destructive/10' : undefined}
                        >
                          <td className="p-2">{c.name || 'JUGADOR POR ASIGNAR'}</td>
                          <td className="p-2">{c.shortName || c.categoryName}</td>
                          <td className="p-2">{c.tee || 'SIN MESA'}</td>
                          <td className="p-2 font-medium">{ventajas}</td>
                          <td className="p-2">{c.hcpDb?.hcpneto ?? '—'}</td>
                          <td className="p-2">{c.hcpDb?.handicapneto ?? '—'}</td>
                          <td className="p-2">{c.hcpDb?.vtjajug ?? '—'}</td>
                          <td className="p-2 font-semibold">
                            {c.hcp}
                            {diff !== 0 ? ` (Δ${diff > 0 ? '+' : ''}${diff})` : ''}
                          </td>
                          <td className="p-2">{c.hcpSource ?? 'ventajas'}</td>
                          <td className="p-2 text-muted-foreground">{c.hcpRule ?? ''}</td>
                          <td className="whitespace-nowrap p-2 text-muted-foreground">
                            {(c.hcpPorHoyo ?? c.holes.map((h) => h.handicap)).join('-')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && !cards.length && (
          <div className="rounded-md border p-4 text-sm text-muted-foreground print:hidden">
            No hay tarjetas para la fecha, categorías y tipo de juego seleccionados.
          </div>
        )}

        {/* Hojas: 2 tarjetas por hoja, cada una con su cabecera configurable */}
        <div ref={sheetsRef}>
          {sheets.map((pair, idx) => (
            <div
              key={`sheet-${idx}`}
              data-sheet
              className="mb-6 bg-white print:mb-0"
              style={{
                width: `${SHEET_W_MM}mm`,
                height: `${SHEET_H_MM}mm`,
                breakAfter: idx < sheets.length - 1 ? 'page' : 'auto',
              }}
            >
              {pair.map((card) => (
                <div
                  key={`${card.groupId}-${card.playerId}`}
                  className="overflow-hidden"
                  style={{ height: `${HALF_SHEET_MM}mm`, breakInside: 'avoid' }}
                >
                  <CardHeader
                    logo={showLogo ? (data?.logoHeader ?? '') : ''}
                    tournament={data?.tournament ?? ''}
                    course={data?.course ?? ''}
                    /* Cada tarjeta muestra SU día de juego (soporta rangos). */
                    fecha={card.fechaFormato || data?.fechaFormato || ''}
                    heightMm={headerMm}
                    /* Mismos márgenes laterales que la tabla de la tarjeta. */
                    marginMm={marginMm}

                  />
                  {/*
                    Escala con transform (no `zoom`): es la única forma que
                    html2canvas replica igual que la impresión, así que el PDF
                    y la vista previa comparten exactamente el mismo layout,
                    márgenes laterales y 2 tarjetas por hoja.
                  */}
                  <div
                    style={{
                      paddingLeft: `${marginMm}mm`,
                      paddingRight: `${marginMm}mm`,
                      width: `${100 / scale}%`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <Scorecard
                      card={card}
                      rowMm={rowMm}
                      padMm={padMm}
                      rows={rowOrder}
                      headerFields={headerFields}
                      headerFonts={headerFonts}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Vista previa paginada ---------- */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa de impresión</DialogTitle>
            <DialogDescription>
              Hoja {previewIdx + 1} de {previewPages.length} · 2 tarjetas por hoja carta ·
              cabecera {headerMm}mm · escala {Math.round(scale * 100)}%
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto rounded-md border bg-white p-2">
            {previewPages[previewIdx] ? (
              <img
                src={previewPages[previewIdx]}
                alt={`Hoja ${previewIdx + 1}`}
                className="mx-auto w-full"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewIdx((i) => Math.max(0, i - 1))}
                disabled={previewIdx === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPreviewIdx((i) => Math.min(previewPages.length - 1, i + 1))
                }
                disabled={previewIdx >= previewPages.length - 1}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!!busy}>
                <Download className="mr-2 h-4 w-4" /> Descargar PDF
              </Button>
              {/*
                Imprime con la MISMA maquetación (carta + cabecera/margen/escala):
                cierra el diálogo primero para que el overlay del modal no
                entre en el documento impreso y luego abre el diálogo nativo.
              */}
              <Button size="sm" onClick={printFromPreview}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTarjetasImpresion;
