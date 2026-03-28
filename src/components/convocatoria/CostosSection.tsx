/**
 * CostosSection
 * Displays pricing tables, bank details, and payment notes
 * Combines what was previously PricingSection + ContactSection bank info
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
import { DollarSign, Building2 } from 'lucide-react';
import type { PricingTable, ForaneosPricing, ContactInfo } from '@/data/mockData';

interface CostosSectionProps {
  sociosPricing: PricingTable[];
  foraneosPricing: ForaneosPricing[];
  pricingNote: string;
  contactInfo: ContactInfo;
  contactWarning: string;
}

const CostosSection = ({
  sociosPricing,
  foraneosPricing,
  pricingNote,
  contactInfo,
  contactWarning,
}: CostosSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-full font-display font-bold text-xl">
          Costos
        </span>
      </div>

      {/* Socios Pricing Tables */}
      {sociosPricing.map((table, idx) => (
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
                    <TableHead className="text-xs font-semibold text-center">MAYO<br />6 MENS.</TableHead>
                    <TableHead className="text-xs font-semibold text-center">JUNIO<br />5 MENS.</TableHead>
                    <TableHead className="text-xs font-semibold text-center">JULIO<br />4 MENS.</TableHead>
                    <TableHead className="text-xs font-semibold text-center">AGOSTO<br />3 MENS.</TableHead>
                    <TableHead className="text-xs font-semibold text-center">SEPT.<br />2 MENS.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.tiers.map((tier, tierIdx) => (
                    <TableRow key={tierIdx} className="border-primary/10">
                      <TableCell className="font-medium text-primary text-sm border-l-4 border-l-primary">
                        {tier.categoria}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">{tier.costo}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{tier.mayo6}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{tier.junio5}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{tier.julio4}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{tier.agosto3}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{tier.sept2}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Foraneos Pricing */}
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

      {/* Pricing note */}
      <p className="text-center text-sm text-muted-foreground italic">{pricingNote}</p>

      {/* Bank details for deposit */}
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
              <div>
                <span className="text-xs text-muted-foreground">Clabe interbancaria:</span>
                <p className="font-mono text-sm font-medium">{contactInfo.clabe}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Cuenta:</span>
                <p className="font-mono text-sm font-medium">{contactInfo.cuenta}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Nombre:</span>
                <p className="text-sm font-medium">{contactInfo.nombre}</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Warning note */}
      <p className="text-center text-sm text-muted-foreground italic px-4">{contactWarning}</p>
    </div>
  );
};

export default CostosSection;
