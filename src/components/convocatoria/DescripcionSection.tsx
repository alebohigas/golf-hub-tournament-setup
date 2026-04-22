/**
 * DescripcionSection
 * Horizontal card showing the tournament convocatoria description
 * Displayed below the tournament date
 */

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DescripcionSectionProps {
  descripcion: string;
}

const DescripcionSection = ({ descripcion }: DescripcionSectionProps) => {
  // Hide section when no description is provided.
  if (!descripcion || descripcion.trim() === '') return null;
  return (
    <Card className="shadow-card border-border/50 bg-primary/5 border-primary/20">
      <CardContent className="py-6 flex items-start gap-4">
        <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground leading-relaxed text-base">
          {descripcion}
        </p>
      </CardContent>
    </Card>
  );
};

export default DescripcionSection;
