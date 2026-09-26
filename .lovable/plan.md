# Optimizar impresión Time Line

## Objetivo
Aprovechar mejor la altura útil de cada hoja carta para reducir páginas vacías, manteniendo cada grupo completo.

## Cambios
- Hacer que la densidad automática elija la presentación más compacta y legible para impresión.
- Reducir alturas internas y separaciones verticales que actualmente no responden a la densidad.
- Mantener el encabezado, los bordes, la numeración y la regla de no dividir grupos.
- Unificar el cálculo de cortes para pantalla, impresión y PDF con el espacio útil real.

## Verificación
- Abrir el reporte indicado y comprobar la distribución de grupos por hoja.
- Revisar visualmente que no haya grupos cortados, textos superpuestos ni páginas adicionales innecesarias.
- Confirmar que la compilación quede correcta.

## Detalles técnicos
La optimización se hará mediante variables de densidad para encabezados, filas, jugadores y separación entre bloques; la escala automática seguirá fija en 100% para evitar el temblor corregido anteriormente.
