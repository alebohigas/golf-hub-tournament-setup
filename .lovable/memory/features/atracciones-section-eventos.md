---
name: atracciones-section-eventos
description: Eventos page top section with poster grid (.webp) + lightbox dialog with arrow-key navigation
type: feature
---
La página `/eventos` muestra una sección "Atracciones del Torneo" arriba del calendario con un grid responsivo (2/3/4/5 cols) de pósters verticales (aspect-ratio 9/16) importados desde `src/assets/eventos/dia-DD-{nombredia}.webp`. Al hacer click se abre un Dialog (lightbox) con la imagen completa, botones prev/next, contador, cierre custom y navegación por teclado (ArrowLeft/ArrowRight). Componente: `src/components/eventos/AtraccionesSection.tsx`. Para agregar/cambiar pósters: copiar webp a `src/assets/eventos/` y agregar entrada al array `ATRACCIONES` con import ES6.
