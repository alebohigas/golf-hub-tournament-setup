/**
 * CalendarioSection
 * Wrapper around ScheduleTable with section title
 */

import { Card, CardContent } from '@/components/ui/card';
import ScheduleTable from '@/components/convocatoria/ScheduleTable';
import type { ScheduleSlot } from '@/data/mockData';

interface CalendarioSectionProps {
  scheduleData: ScheduleSlot[];
}

const CalendarioSection = ({ scheduleData }: CalendarioSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Calendario y Horario
        </h2>
        <p className="text-muted-foreground">
          Consulta los horarios de salida según tu categoría
        </p>
      </div>
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardContent className="p-0 md:p-6">
          <ScheduleTable scheduleData={scheduleData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarioSection;
