/**
 * ApproachClasificadosReport Component
 * -----------------------------------------------------------------------
 * Reporte "Clasificados de Approach": una sola tabla con todos los jugadores
 * registrados en `torneos.approachjug` que caen dentro de los parámetros de la
 * competencia, ordenados por distancia y, en empate, por fecha/hora de registro.
 *
 * Se usa tanto en la página pública de Competiciones como en la pestaña
 * Admin > Approach (para vista previa del orden seleccionado).
 */

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Crosshair } from 'lucide-react';
import LastUpdatedStamp from '@/components/competencias/LastUpdatedStamp';
import { useApproachClasificados, type ApproachOrden } from '@/hooks/useApproachClasificados';

// ============= Types =============

interface ApproachClasificadosReportProps {
  /** Dirección de ordenamiento por distancia (asc = más cerca primero). */
  orden?: ApproachOrden;
  /** Muestra la columna con la fecha/hora de registro (desempate). */
  showFecha?: boolean;
}

// ============= Styles =============

/** Clases del encabezado oscuro de la tabla (mismo look que Competencias). */
const TH_CLASS = 'px-3 py-2 text-xs font-semibold uppercase tracking-wide';

// ============= Component =============

/**
 * ApproachClasificadosReport
 * Tabla única de clasificados. Muestra loader, error y estado vacío.
 */
const ApproachClasificadosReport = ({
  orden = 'asc',
  showFecha = true,
}: ApproachClasificadosReportProps) => {
  const { data, isLoading, isError } = useApproachClasificados(orden);

  /** Loading */
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /** Error */
  if (isError) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No se pudieron cargar los clasificados de approach.
      </p>
    );
  }

  const players = data?.players ?? [];

  /** Empty */
  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <Crosshair className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Todavía no hay jugadores registrados en approach.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen: total y última actualización */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Jugadores: <span className="font-semibold text-foreground">{data?.total ?? players.length}</span>
        </p>
        {data?.lastUpdated && <LastUpdatedStamp timestamp={data.lastUpdated} />}
      </div>

      {/* Tabla de clasificados */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className={`${TH_CLASS} text-center w-14`}>Pos</th>
                  <th className={`${TH_CLASS} text-center w-16`}>Club</th>
                  <th className={`${TH_CLASS} text-left`}>Jugador</th>
                  <th className={`${TH_CLASS} text-center`}>Cat</th>
                  <th className={`${TH_CLASS} text-left`}>Premio</th>
                  <th className={`${TH_CLASS} text-right`}>Dist</th>
                  {showFecha && <th className={`${TH_CLASS} text-right`}>Registro</th>}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={`${p.id}-${p.position}`} className="border-t border-border/50">
                    <td className="px-3 py-2 text-center font-semibold">{p.position}</td>
                    <td className="px-3 py-2 text-center">
                      {p.clubLogo ? (
                        <img
                          src={p.clubLogo}
                          alt={p.club || 'Club'}
                          className="h-7 mx-auto object-contain bg-white p-0.5"
                          loading="lazy"
                        />
                      ) : null}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{p.name}</td>
                    <td className="px-3 py-2 text-center text-muted-foreground">{p.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.group}</td>
                    <td className="px-3 py-2 text-right font-semibold">{p.distance.toFixed(2)}</td>
                    {showFecha && (
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {p.fecha ?? '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApproachClasificadosReport;
