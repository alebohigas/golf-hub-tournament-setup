-- ===========================================================================
-- Torneo 361 — Ajuste de precio para SOCIO HONORARIO / EMERITO
-- ---------------------------------------------------------------------------
-- Fija el precio en 13000 MXN para la regla cuya etiqueta es
-- 'SOCIO HONORARIO' y tipo_socio 'EMERITO' dentro de la tabla
-- `registro_precios` del torneo 361 (Campestre Saltillo).
-- ===========================================================================
UPDATE `registro_precios`
   SET `precio` = 13000,
       `moneda` = 'MXN'
 WHERE `torneo_id` = 361
   AND `tipo_socio` = 'EMERITO'
   AND UPPER(TRIM(`etiqueta`)) = 'SOCIO HONORARIO';