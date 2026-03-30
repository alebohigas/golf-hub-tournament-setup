import { useState, useEffect } from 'react';
import { fetchCategories, Category } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const teeMarkerColors: Record<string, string> = {
  AZULES: 'bg-blue-500',
  BLANCAS: 'bg-gray-100 border border-gray-300',
  DORADAS: 'bg-amber-400',
  AMARILLAS: 'bg-yellow-300',
  ROJAS: 'bg-red-500',
};

const CategoryTable = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="text-primary-foreground font-semibold">CATEGORÍAS</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">RANGO DE HÁNDICAP</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">FORMATO</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">VENTAJAS</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">CUPO</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">RONDA</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">MARCAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow 
              key={category.id}
              className={cn(
                "transition-colors",
                index % 2 === 0 ? "bg-card" : "bg-muted/30"
              )}
            >
              <TableCell className="font-medium text-foreground">
                {category.name}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {category.handicapMin > 0 ? '+' : ''}{category.handicapMin} A {category.handicapMax}
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={category.format === 'STROKE PLAY' ? 'default' : 'secondary'}
                  className="font-normal"
                >
                  {category.format}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {category.ventajas}
              </TableCell>
              <TableCell className="text-center font-medium text-foreground">
                {category.maxPlayers ? category.maxPlayers : '∞'}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {category.rounds}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span 
                    className={cn(
                      "w-4 h-4 rounded-full",
                      teeMarkerColors[category.teeMarker]
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {category.teeMarker}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
