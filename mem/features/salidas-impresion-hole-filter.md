---
name: Salidas impresión — filtro de hoyos y encabezado
description: El rango hoyo inicial/final debe respetarse exactamente (1 a 1 = solo hoyo 1); el hoyo se deriva del tee si falta la columna
type: feature
---
En `/admin/salidas-impresion` (`server/api/salidas_impresion.php`):

- El filtro `hi`/`hf` es **inclusivo y estricto**: si el usuario pide hoyo 1 a hoyo 1, sólo se muestran grupos que salen del hoyo 1 dentro del rango horario.
- El hoyo del grupo se resuelve así: primero la columna detectada en `salidagrupo` (`hoyo1a`, etc.); si no existe o viene vacía/0, se extrae el número del texto del tee (`teesal`, p. ej. "H10" → 10). El filtro se aplica en PHP sobre ese valor resuelto, nunca sólo en SQL.
- Encabezado de cada bloque de salida: a la izquierda **"Categoría: <abreviatura>"**; a la derecha **hora / tee**. El número de hoyo no se repite en el encabezado porque ya viene implícito en el tee.
