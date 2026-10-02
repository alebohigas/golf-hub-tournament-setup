# Convocatoria Club Las Lomas — torneo 367

## Objetivo
Publicar la convocatoria oficial del XXI Torneo Anual de Golf de Club Las Lomas para el torneo 367, sin modificar convocatorias de otros torneos.

## Implementación
- Crear una migración MySQL independiente e idempotente para `torneoid = 367`.
- Cargar desde el PDF oficial la descripción, elegibilidad, costos, competencias, premiación, desempates, calendario y datos de inscripción.
- Mantener el PDF asociado al torneo 367 mediante un nombre que incluya su ID, para que la página seleccione el documento correcto.
- Respetar los formatos de contenido ya usados por la página de Convocatoria.

## Validación
- Validar todos los objetos JSON incluidos en la migración.
- Revisar visualmente las cuatro páginas del PDF para detectar recortes o contenido ilegible.
- Confirmar que la aplicación continúa compilando correctamente.

## Publicación
- Dejar listos la migración y el PDF. La aplicación en MySQL/IONOS dependerá de contar con acceso administrativo vigente al servidor.
