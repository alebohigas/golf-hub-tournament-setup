# Quitar marco exterior de Impresión Tarjeta

## Cambios
- Eliminar la línea exterior que encierra toda la tarjeta, tanto en tarjetas normales como Match Play.
- Conservar recuadrado completo el encabezado con hoyo/hora, handicap, jugador y categoría.
- Mantener sin cambios las líneas de la tabla de hoyos, yardas, Par Time, ventaja, Score Gross, handicap, Score Neto y puntos.
- Mantener recuadrado el bloque final de Score Anotador.
- Dejar libres de marco exterior los espacios en blanco, sistema, firmas y folio.

## Verificación
- Revisar la impresión con el formato de la URL indicada y confirmar que no aparezca el marco perimetral.
- Confirmar que encabezado, tabla principal y Score Anotador conserven sus líneas y que la tarjeta siga cabiendo en media hoja carta.

## Detalles técnicos
- El contenedor general dejará de dibujar borde.
- El encabezado compartido recibirá sus cuatro bordes propios para no depender del contenedor exterior.
