-- ===========================================================================
-- registro — país y lada del teléfono del jugador
-- ---------------------------------------------------------------------------
-- El formulario de pre-registro permite elegir la lada del país (México por
-- default, Canadá, países de la UE, etc.). Guardamos el país seleccionado
-- (id ISO usado por el formulario, ej. 'MX') y la lada (ej. '+52') junto con
-- el número (reg_telefono / reg_celular) para que el reporte de /admin y la
-- exportación CSV/Excel muestren siempre el formato correcto, p. ej.
-- "(+52) 5512345678".
-- NOTA: sin cláusulas AFTER para no depender del orden/nombre de columnas
-- en los distintos esquemas (algunos usan reg_celular en vez de reg_telefono).
-- ===========================================================================
ALTER TABLE `registro`
  ADD COLUMN IF NOT EXISTS `reg_tel_pais` VARCHAR(8) NULL,
  ADD COLUMN IF NOT EXISTS `reg_tel_lada` VARCHAR(8) NULL;
