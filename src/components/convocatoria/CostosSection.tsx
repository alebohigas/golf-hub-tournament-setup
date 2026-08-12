/**
 * CostosSection
 * Displays pricing tables, bank details, and payment notes
 * Dynamically hides columns/sections with no data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2 } from 'lucide-react';
import type { PricingTable, ForaneosPricing, ContactInfo } from '@/data/mockData';
import { formatMoney } from '@/lib/money';

interface CostosSectionProps {
  sociosPricing: PricingTable[];
  foraneosPricing: ForaneosPricing[];
  pricingNote: string;
  contactInfo: ContactInfo;
  contactWarning: string;
  inscripcionesText?: string;
}

/** Column definitions for installment months */
const MONTH_COLUMNS: { key: keyof import('@/data/mockData').PricingTier; label: string; sub: string }[] = [
  { key: 'mayo6', label: 'MAYO', sub: '6 MENS.' },
  { key: 'junio5', label: 'JUNIO', sub: '5 MENS.' },
  { key: 'julio4', label: 'JULIO', sub: '4 MENS.' },
  { key: 'agosto3', label: 'AGOSTO', sub: '3 MENS.' },
  { key: 'sept2', label: 'SEPT.', sub: '2 MENS.' },
];

/** Check if any tier in a pricing table has data for a given column */
const columnHasData = (tiers: import('@/data/mockData').PricingTier[], key: string) =>
  tiers.some((t) => (t as any)[key] && (t as any)[key].trim() !== '');

/**
 * pickKey
 * Busca en un objeto la primera llave cuyo nombre normalizado (sin
 * acentos, espacios, `/` ni mayúsculas) coincida con alguno de los
 * alias dados. Permite leer valores guardados desde el editor de admin
 * con variantes como `"damas /juveniles"` o `"Damas y Seniors"`.
 */
const pickKey = (obj: any, aliases: string[]): string => {
  if (!obj || typeof obj !== 'object') return '';
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const targets = aliases.map(norm);
  for (const k of Object.keys(obj)) {
    if (targets.includes(norm(k))) return String(obj[k] ?? '');
  }
  return '';
};

/**
 * normalizeTiers
 * Devuelve siempre `tiers[]` para una tabla de precios. Si la fila de BD
 * ya trae `tiers`, se usan tal cual; si en su lugar trae los importes
 * planos (`caballeros`, `damas y juveniles`, …) se construyen los tiers
 * para que la tabla pública NO se muestre vacía.
 */
const normalizeTiers = (table: any): import('@/data/mockData').PricingTier[] => {
  if (Array.isArray(table?.tiers) && table.tiers.length > 0) return table.tiers;
  const cab = pickKey(table, ['caballeros', 'varonil', 'hombres']);
  const dam = pickKey(table, [
    'damasyjuveniles', 'damasjuveniles', 'damas', 'damasyseniors', 'damasseniors', 'juveniles',
  ]);
  const rows: any[] = [];
  if (cab) rows.push({ categoria: 'Caballeros', costo: cab });
  if (dam) rows.push({ categoria: 'Damas y Juveniles', costo: dam });
  return rows;
};

const CostosSection = ({
  sociosPricing,
  foraneosPricing,
  pricingNote,
  contactInfo,
  contactWarning,
  inscripcionesText,
}: CostosSectionProps) => {
  // Hide entire section when there is no pricing data and no contact info.
  const hasSocios = sociosPricing && sociosPricing.length > 0;
  const hasForaneos = foraneosPricing && foraneosPricing.length > 0;
  const hasContact = contactInfo && (contactInfo.clabe || contactInfo.cuenta);
  if (!hasSocios && !hasForaneos && !hasContact) return null;
  return (
    <div className="space-y-8">
      {/* Section title */}
      <div className="text-center">
        <span className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          Costos
        </span>
      </div>

      {/* Socios Pricing Tables — columns shown only if they have data */}
      {sociosPricing.map((table, idx) => {
        /* Defensivo: `tiers` puede faltar; se derivan de los importes planos. */
        const tiers = normalizeTiers(table);
        const visibleMonths = MONTH_COLUMNS.filter((col) => columnHasData(tiers, col.key));
        if (tiers.length === 0) return null;

        return (
          <Card key={idx} className="shadow-card border-border/50 overflow-hidden">
            <CardHeader className="bg-primary/5 py-3">
              <CardTitle className="text-center text-primary font-display text-lg">
                {table.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/20">
                      <TableHead className="text-xs font-semibold">CATEGORÍAS</TableHead>
                      <TableHead className="text-xs font-semibold text-center">COSTO</TableHead>
                      {visibleMonths.map((col) => (
                        <TableHead key={col.key} className="text-xs font-semibold text-center">
                          {col.label}<br />{col.sub}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiers.map((tier, tierIdx) => (
                      <TableRow key={tierIdx} className="border-primary/10">
                        <TableCell className="font-medium text-primary text-sm border-l-4 border-l-primary">
                          {tier.categoria}
                        </TableCell>
                        {/* Los importes viven en BD como DECIMAL ("13550.00");
                            aquí se presentan siempre como $13,550.00. */}
                        <TableCell className="text-center text-sm font-semibold">
                          {formatMoney(tier.costo)}
                        </TableCell>
                        {visibleMonths.map((col) => (
                          <TableCell key={col.key} className="text-center text-sm text-muted-foreground">
                            {formatMoney((tier as any)[col.key])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Foraneos Pricing — only if data exists */}
      {foraneosPricing.length > 0 && (
        <Card className="shadow-card border-border/50">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-center font-display">
              <span className="text-primary text-xl">Foráneos e Invitados</span>
              <span className="text-muted-foreground text-sm ml-2">(Un solo pago)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {foraneosPricing.map((tier, idx) => {
                /* Tolerante a variantes de llaves guardadas desde admin. */
                const cab = (tier as any).caballeros || pickKey(tier, ['caballeros', 'varonil']);
                const dam = (tier as any).damasSeniors
                  || pickKey(tier, ['damasyjuveniles', 'damasjuveniles', 'damas', 'damasyseniors', 'juveniles']);
                if (!cab && !dam) return null;
                return (
                <div key={idx} className="text-center p-4 rounded-lg bg-muted/30">
                  <h4 className="font-display font-bold text-primary mb-4">{tier.title}</h4>
                  <div className="space-y-2">
                    {cab && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Caballeros: </span>
                        <span className="font-semibold text-foreground">{formatMoney(cab)}</span>
                      </p>
                    )}
                    {dam && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Damas y Juveniles: </span>
                        <span className="font-semibold text-foreground">{formatMoney(dam)}</span>
                      </p>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing note — only if not empty */}
      {pricingNote && (
        <p className="text-center text-sm text-muted-foreground italic">{pricingNote}</p>
      )}

      {/* Bank details — only if clabe or cuenta exist */}
      {(contactInfo.clabe || contactInfo.cuenta) && (
        <Card className="shadow-card border-border/50 overflow-hidden">
          <div className="flex">
            <div className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-4 py-6 flex items-center justify-center">
              <span className="font-display font-bold text-sm [writing-mode:vertical-lr] rotate-180">
                {contactInfo.bankName}
              </span>
            </div>
            <CardContent className="flex-1 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-display font-semibold text-foreground">Datos para depósito</span>
              </div>
              <div className="space-y-2">
                {contactInfo.clabe && (
                  <div>
                    <span className="text-xs text-muted-foreground">Clabe interbancaria:</span>
                    <p className="font-mono text-sm font-medium">{contactInfo.clabe}</p>
                  </div>
                )}
                {contactInfo.cuenta && (
                  <div>
                    <span className="text-xs text-muted-foreground">Cuenta:</span>
                    <p className="font-mono text-sm font-medium">{contactInfo.cuenta}</p>
                  </div>
                )}
                {contactInfo.nombre && (
                  <div>
                    <span className="text-xs text-muted-foreground">Nombre:</span>
                    <p className="text-sm font-medium">{contactInfo.nombre}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Warning note — only if not empty */}
      {contactWarning && (
        <p className="text-center text-sm text-muted-foreground italic px-4">{contactWarning}</p>
      )}

      {/* Inscripciones contact note */}
      {inscripcionesText && (
        <p className="text-center text-sm text-foreground whitespace-pre-line px-4 font-bold">
          {inscripcionesText}
        </p>
      )}
    </div>
  );
};

export default CostosSection;