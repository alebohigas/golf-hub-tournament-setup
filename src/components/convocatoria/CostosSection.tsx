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

const CostosSection = ({
  sociosPricing,
  foraneosPricing,
  pricingNote,
  contactInfo,
  contactWarning,
  inscripcionesText,
}: CostosSectionProps) => {
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
        const visibleMonths = MONTH_COLUMNS.filter((col) => columnHasData(table.tiers, col.key));

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
                    {table.tiers.map((tier, tierIdx) => (
                      <TableRow key={tierIdx} className="border-primary/10">
                        <TableCell className="font-medium text-primary text-sm border-l-4 border-l-primary">
                          {tier.categoria}
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">{tier.costo}</TableCell>
                        {visibleMonths.map((col) => (
                          <TableCell key={col.key} className="text-center text-sm text-muted-foreground">
                            {(tier as any)[col.key]}
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
              <span className="text-primary text-xl">Foráneos</span>
              <span className="text-muted-foreground text-sm ml-2">(Un solo pago)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {foraneosPricing.map((tier, idx) => (
                <div key={idx} className="text-center p-4 rounded-lg bg-muted/30">
                  <h4 className="font-display font-bold text-primary mb-4">{tier.title}</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Caballeros: </span>
                      <span className="font-semibold text-foreground">{tier.caballeros}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Damas y Seniors: </span>
                      <span className="font-semibold text-foreground">{tier.damasSeniors}</span>
                    </p>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default CostosSection;