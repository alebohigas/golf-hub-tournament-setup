/** AdminDistancias — ALIEN SYSTEM → DISTANCIAS. */
import { Ruler } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DistanciasReport from '@/components/distancias/DistanciasReport';

/** Vista administrativa del mismo reporte público de distancias. */
const AdminDistancias = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Ruler className="h-5 w-5" /> Distancias
      </CardTitle>
      <CardDescription>
        Par, yardas y ventajas por mesa activa. Las ventajas diferentes entre registros se marcan en amarillo.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <DistanciasReport compact showAdvantageDifferences />
    </CardContent>
  </Card>
);

export default AdminDistancias;
