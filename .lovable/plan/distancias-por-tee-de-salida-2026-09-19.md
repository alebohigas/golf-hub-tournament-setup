# DISTANCIAS por tee de salida

## Objetivo
Agregar una página pública **DISTANCIAS** y una pestaña **DISTANCIAS** dentro de **Admin → ALIEN SYSTEM**.

## Implementación
- Mostrar únicamente los campos activos del torneo y las mesas asignadas a sus categorías.
- Agrupar categorías que compartan la misma mesa de salida para evitar tablas duplicadas.
- Encabezar cada tabla con el nombre de la mesa y sus colores reales de `salidas.bgcolor` y `salidas.color`.
- Presentar hoyos 1–18 con renglones de **Yardas** y **Par**, subtotales de vuelta 1 y vuelta 2, y total general.
- Adaptar la tabla para celular con desplazamiento horizontal y columnas legibles.
- Añadir el botón público **DISTANCIAS**, su ruta, visibilidad administrativa y descripción.
- Añadir la pestaña **DISTANCIAS** en ALIEN SYSTEM y un permiso asignable a usuarios temporales.

## Detalles técnicos
- Ampliar la respuesta existente de campos para incluir ambos colores de la mesa y filtrar tees realmente usados por categorías del torneo.
- Crear una vista reutilizable para la página pública y la pestaña administrativa.
- Mantener el torneo activo en todas las consultas y documentar las nuevas funciones, objetos y estilos.
- Verificar tipos, compilación y presentación en escritorio y móvil.
