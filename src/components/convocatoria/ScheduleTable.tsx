import { useState, useEffect } from 'react';
import { ScheduleSlot } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ScheduleTableProps {
  scheduleData: ScheduleSlot[];
}

const ScheduleTable = ({ scheduleData }: ScheduleTableProps) => {
  const days = ['MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const dayKeys = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-primary/20">
            <TableHead className="text-accent font-display font-semibold">TURNO</TableHead>
            {days.map((day) => (
              <TableHead key={day} className="text-center text-accent font-display font-semibold">
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduleData.map((slot, idx) => {
            const maxRows = Math.max(
              slot.martes.length,
              slot.miercoles.length,
              slot.jueves.length,
              slot.viernes.length,
              slot.sabado.length
            );

            return Array.from({ length: maxRows }).map((_, rowIdx) => (
              <TableRow 
                key={`${idx}-${rowIdx}`} 
                className={`border-primary/10 ${rowIdx === 0 && idx > 0 ? 'border-t-2 border-t-primary/30' : ''}`}
              >
                {rowIdx === 0 ? (
                  <TableCell 
                    rowSpan={maxRows} 
                    className="font-display font-semibold text-primary bg-primary/5 align-top"
                  >
                    <div>{slot.turno}</div>
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      {slot.horario}
                    </div>
                  </TableCell>
                ) : null}
                {dayKeys.map((dayKey) => (
                  <TableCell 
                    key={dayKey} 
                    className="text-center text-muted-foreground py-2"
                  >
                    {slot[dayKey][rowIdx] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScheduleTable;
