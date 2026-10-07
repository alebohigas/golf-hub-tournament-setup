/** TeeLabel — nombre de la mesa con un punto del color registrado en salidas. */
interface TeeLabelProps {
  /** Nombre real de la mesa asignada a la categoría. */
  tee: string;
  /** Color de fondo de salidas; nunca se infiere a partir del nombre. */
  bgcolor?: string;
}

/** Valida hexadecimales de la BD (con o sin #) y usa el token neutro como respaldo. */
const teeDotColor = (value?: string): string => {
  const hex = (value ?? '').trim().replace(/^#/, '');
  return /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)
    ? `#${hex}`
    : 'hsl(var(--muted-foreground))';
};

/** Insignia compacta: fondo neutro, nombre legible y punto de tamaño estable. */
export default function TeeLabel({ tee, bgcolor }: TeeLabelProps) {
  if (!tee) return null;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 align-middle text-xs font-bold uppercase leading-tight text-foreground">
      {/* Color dinámico de la mesa; el borde mantiene visibles las tees blancas. */}
      <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border border-border" style={{ backgroundColor: teeDotColor(bgcolor) }} />
      <span className="break-words">{tee}</span>
    </span>
  );
}