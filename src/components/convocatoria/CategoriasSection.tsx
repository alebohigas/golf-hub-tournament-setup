/**
 * CategoriasSection
 * Wrapper around CategoryTable with section title
 */

import CategoryTable from '@/components/convocatoria/CategoryTable';

const CategoriasSection = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Categorías y Sistema de Juego
        </h2>
        <p className="text-muted-foreground">
          Consulta los requisitos, formato y cupo de cada categoría
        </p>
      </div>
      <CategoryTable />
    </div>
  );
};

export default CategoriasSection;
