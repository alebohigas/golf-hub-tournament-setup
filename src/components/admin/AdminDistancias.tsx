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
        Yardas y par por campo y mesa activa, con los colores definidos para cada salida.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <DistanciasReport compact />
    </CardContent>
  </Card>
);

export default AdminDistancias;
