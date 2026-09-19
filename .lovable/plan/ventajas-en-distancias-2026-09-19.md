# Ventajas en DISTANCIAS

## Cambios
- Ampliar el servicio de DISTANCIAS para leer la ventaja de cada hoyo desde `hoyosxsalida` y la lista de ventajas de la mesa desde `campo_tee`.
- Presentar las filas en este orden: HOYO, PAR, YARDAS, VENTAJA.
- En Admin → ALIEN SYSTEM → DISTANCIAS, resaltar en amarillo con texto negro cada ventaja donde ambas fuentes tengan valores distintos.
- Mantener la vista pública sin el resaltado administrativo.

## Detalles técnicos
- La comparación se hará por número de hoyo, normalizando la lista separada por comas de `campo_tee.ventajas`.
- Se añadirán tipos explícitos para ambos valores y una bandera de diferencia.
- Se validarán PHP, tipos, compilación y la presentación de la tabla.
