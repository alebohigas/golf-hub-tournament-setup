
## Objetivo

1. Eliminar TODO fallback a mock en `/convocatoria` y `/reglas`. Si no hay datos en BD para el `torneoid` activo, la sección/página simplemente no se renderiza.
2. En `/admin` mostrar un badge por sección: **"BD"** (verde) si hay fila guardada, **"Vacío"** (gris) si no.
3. Reemplazar el `Textarea` actual del editor por un **editor estructurado con preview en vivo** que reproduce el aspecto visual de cada sección pública, para que el usuario edite manteniendo la estética.
4. Lo mismo para `/reglas`.

---

## Cambios por área

### 1. Eliminar fallbacks (frontend público)

**`src/pages/Convocatoria.tsx`**
- Quitar el helper `pick()` y todas las referencias a `*Data` de `mockData`.
- Pasar directamente `c?.text`, `c?.items`, etc. (o `[]` / `undefined`).
- Cada `*Section` ya debe manejar "sin datos" devolviendo `null` o un placeholder neutro. Ajustar las que aún esperan props obligatorios.
- Quitar el `import` de mocks.

**`src/pages/Reglas.tsx`** (revisar contenido)
- Mismo tratamiento: si no hay fila `reglas_content` para el torneo, mostrar estado vacío.

### 2. Badge BD/Vacío en `/admin`

**`src/components/admin/AdminConvocatoria.tsx`**
- El hook `useConvocatoriaSections` ya carga las secciones. Añadir info por sección: `hasDbContent: boolean` (basado en si `convocatoria_content` tiene fila para `torneoid + section_id` con `content` no vacío).
- En cada fila del listado, junto a "Oculta" añadir:
  - `<Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">BD</Badge>` si `hasDbContent`.
  - `<Badge variant="outline" className="text-muted-foreground">Vacío</Badge>` si no.

**Hook `useConvocatoriaSections`** (`src/hooks/`)
- Extender el GET de `/api/convocatoria_content.php?torneoid=...` para devolver, por cada section_id, si existe fila con contenido.
- Exponer `hasDbContent(sectionId): boolean`.

### 3. Editor estructurado con preview en vivo

Reemplazar el `Textarea` actual por un componente nuevo:

**`src/components/admin/convocatoria/SectionEditor.tsx`**
- Router por `section.id` → editor específico de cada sección.
- Layout: dos columnas (form a la izquierda, preview a la derecha en desktop; apilado en mobile).
- El preview usa el MISMO componente público (`<DescripcionSection/>`, `<PremiacionSection/>`, etc.) alimentado por el state local del form.

**Editores por tipo de sección:**
- `descripcion`, `inscripciones`, `contacto`, etc. → textarea grande con preview.
- `premiacion` → repeater de categorías con lista de premios.
- `reglas` → repeater de `{titulo, contenido}` + sección `reglamento`.
- `competenciasEspeciales` → repeater.
- `servicios` → repeater por día.
- `patrocinadoresOficiales` → repeater `{premio, patrocinador, descripcion}`.
- `costos` → grid de `sociosPricing` / `foraneosPricing` con notas y contacto.
- `desempates` → editor de listas.
- `categorias` / `calendarioJuego` → tabla editable.

Cada editor:
- Botón **Guardar** que llama a `setSectionContent(id, structuredJson)` (ya existe; ajustar para aceptar objeto y serializar a JSON al persistir).
- Botón **Limpiar** que elimina la fila de BD (badge vuelve a "Vacío").
- Indicador "Cambios sin guardar".

### 4. Persistencia backend

**`server/api/convocatoria_content.php`**
- Asegurar GET y POST/PUT por `torneoid + section_id` con payload `content` JSON.
- Endpoint DELETE para "Limpiar" (vuelve la sección a Vacío).

**`server/api/reglas_content.php`** (mismo patrón si no existe).

### 5. Reglas página y admin

Replicar 1–4 para `/reglas`:
- `src/pages/Reglas.tsx` sin fallback.
- Nuevo `src/components/admin/AdminReglas.tsx` (o reusar `AdminCategoriasReglas.tsx` existente) con el mismo patrón de editor + preview + badge.

---

## Detalles técnicos

- **No tocar mockData todavía**: lo dejaremos sin usar en runtime. En una iteración futura se puede borrar.
- **Tipos compartidos**: mover los tipos `PremioCategoria`, `ReglaItem`, `PatrocinadorOficial`, etc., de `mockData.ts` a `src/types/convocatoria.ts` para que editor y vista pública compartan contrato.
- **Preview en vivo**: el editor mantiene `draftContent` en `useState`; el preview consume `draftContent` directamente (no espera al guardado). Al guardar, se persiste vía hook.
- **Validación mínima**: campos requeridos por sección marcados con `*`. Sin validación de schema dura para no bloquear edición.

---

## Entregables

```text
Frontend:
- src/pages/Convocatoria.tsx              (eliminar fallbacks)
- src/pages/Reglas.tsx                    (eliminar fallbacks)
- src/types/convocatoria.ts               (NUEVO – tipos compartidos)
- src/components/admin/AdminConvocatoria.tsx          (badges + abrir SectionEditor)
- src/components/admin/AdminReglas.tsx                (NUEVO o refactor)
- src/components/admin/convocatoria/SectionEditor.tsx (NUEVO – router)
- src/components/admin/convocatoria/editors/
    DescripcionEditor.tsx
    PremiacionEditor.tsx
    ReglasEditor.tsx
    PatrocinadoresEditor.tsx
    CompetenciasEditor.tsx
    ServiciosEditor.tsx
    CostosEditor.tsx
    DesempatesEditor.tsx
    CategoriasEditor.tsx
    CalendarioEditor.tsx
- src/hooks/useConvocatoriaSections.ts    (hasDbContent + clearSection)

Backend:
- server/api/convocatoria_content.php     (asegurar GET/POST/DELETE)
- server/api/reglas_content.php           (mismo patrón)
```

---

## Alcance / fuera de alcance

- IN: comportamiento descrito arriba para Convocatoria y Reglas.
- OUT: editor para otras secciones del admin (Eventos, Avisos, Premios) – ya tienen sus propios flujos.
- OUT: borrado físico de `src/data/mockData.ts` (queda como referencia muerta esta iteración).

¿Apruebo y construyo, o ajustas algo?
