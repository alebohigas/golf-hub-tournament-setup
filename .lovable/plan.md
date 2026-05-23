
## Alcance

Reestructurar el dashboard `/admin/registros` de 3 tabs (Todos/Pendientes/Verificados) a **4 secciones** basadas en estado real del registro, agregar flujo de correo SMTP con PHPMailer, y crear una página pública para que el jugador adjunte su comprobante de pago mediante un link con token único.

---

## Cambios en Base de Datos

Agregar a tabla `registro`:
- `enviado` TINYINT(1) DEFAULT 0 — marca si el jugador ya completó el flujo (subió comprobante o cargo a cuenta)
- `reg_token` VARCHAR(64) NULL UNIQUE — token único por registro para el link de adjuntar

Auto-llenado en INSERT:
- `enviado = 1` si llegó comprobante adjunto **o** `reg_cargo_socio = 1`
- `reg_token` se genera con `bin2hex(random_bytes(32))` para todos los registros nuevos
- Backfill: generar token para registros existentes que no lo tengan

Acción "dar de baja": UPDATE `jugadores` SET `estatus='BAJA'` WHERE matching player.

---

## Las 4 Secciones (frontend AdminRegistros.tsx)

```text
Sección 1 — Sin validar registro
  Filtro: enviado=0
  Columnas actuales + botón "Enviar correo" en filas donde
  NO hay comprobante y NO hay cargo a cuenta.
  (Si ya hay comprobante o cargo, no aparece botón porque
   el registro está enviado=1 automáticamente desde el INSERT.)

Sección 2 — Pendiente verificación de pago
  Filtro: enviado=1 AND status_pago=0
  Muestra comprobante/cargo + monto cobrado + input monto
  confirmado + toggle status_pago (regla actual: solo activable
  si los montos coinciden).

Sección 3 — Verificar registro
  Filtro: status_pago=1 AND verificado=0
  Muestra TODOS los detalles del pre-registro + un botón
  "Verificar" que pone verificado=1.

Sección 4 — Registros completados
  Filtro: enviado=1 AND verificado=1 AND status_pago=1 (o status_pago=99)
  Dos botones por fila:
    • "Des-registrar" → status_pago=99 (al re-clic el botón
      se llama "Registrar" y vuelve status_pago=1).
    • "Dar de baja" → UPDATE jugadores.estatus='BAJA' para el
      jugador correspondiente (match por correo + nombre).
```

Las secciones se navegarán con tabs nuevos: "Sin validar", "Pendiente pago", "Verificar registro", "Completados", cada uno con su contador.

---

## Flujo de correo (SMTP via PHPMailer)

Nuevo endpoint `server/api/registro_email.php`:
- POST `{id, password}` → carga registro + datos del torneo (incluye `logo_cuentadeposito`).
- Envía correo HTML con:
  - Saludo personalizado y **reg_id en negritas grande**.
  - Resumen de los datos del pre-registro (negritas en valores).
  - Imagen `logo_cuentadeposito` embebida (`<img src="https://...">`).
  - Instrucciones: *"Su registro ha sido validado. Para terminar su registro, por favor realice el pago a la siguiente cuenta. IMPORTANTE: agregar el reg_id en el concepto de su pago."*
  - Botón CTA: *"Adjuntar comprobante a su registro"* → enlaza a `https://<dominio>/registro/comprobante?token=<reg_token>`.
- Después de enviar: NO marca `enviado` (eso solo sucede cuando el jugador realmente sube comprobante o ya tenía cargo). El correo es solo recordatorio.

> **Aclaración importante:** Releí tu mensaje original — dices "al hacer click en este botón, se actualiza en registro el valor 'enviado' a 1". Pero también dices que enviado=1 = "ya subió comprobante o cargo a cuenta" (sección 2). Si marcamos enviado=1 al mandar correo, el registro brinca a sección 2 sin que el jugador haya hecho nada. **Voy a interpretar que enviar el correo NO marca enviado=1** — solo lo marca el jugador al subir comprobante (o automático si ya tenía cargo/comprobante desde el formulario inicial). Si quieres la otra interpretación dímelo.

---

## Página pública `/registro/comprobante?token=...`

Nueva ruta React `Comprobante.tsx`:
- Al cargar, llama GET `/api/registro_publico.php?token=xxx` → devuelve datos del registro (sin password).
- Muestra todos los campos del pre-registro **en negritas, solo lectura**.
- Componente de upload de archivo (mismo widget que en el formulario original).
- Botón "Terminar Registro" → POST `/api/registro_publico.php` con `{token, file}` → guarda blob en `reg_archivo` y marca `enviado=1`.
- Vista de éxito al terminar.

---

## Acciones requeridas del usuario (manuales en IONOS)

1. **Subir PHPMailer** a `/api/PHPMailer/` (3 archivos: `PHPMailer.php`, `SMTP.php`, `Exception.php` desde https://github.com/PHPMailer/PHPMailer/tree/master/src).
2. **Editar `/api/credentials.php`** y agregar:
   ```php
   $SMTP_HOST = 'smtp.ionos.mx';   // o el host correcto
   $SMTP_PORT = 587;
   $SMTP_USER = 'registro.torneo01@speitour.mx';
   $SMTP_PASS = 'la-contraseña';
   $SMTP_FROM_NAME = 'Speitour Registros';
   ```
3. **Correr el SQL** (te lo daré al final) para agregar `enviado`, `reg_token` y poblar tokens.
4. Subir `dist/` y `api/` actualizados.

---

## Archivos a tocar

**Backend (PHP):**
- `server/api/registro.php` — generar `reg_token` en INSERT; auto `enviado=1` si llega archivo o cargo; exponer `enviado`, `reg_token` en listing; nuevo endpoint `action=unregister` (status_pago=99/1 toggle), `action=baja` (jugadores.estatus='BAJA').
- `server/api/registro_email.php` *(nuevo)* — envía SMTP.
- `server/api/registro_publico.php` *(nuevo)* — GET por token + POST con archivo.
- `server/api/_smtp.php` *(nuevo)* — helper que carga PHPMailer y envía.

**Frontend (React):**
- `src/pages/AdminRegistros.tsx` — reemplazar tabs y lógica de filtrado por 4 secciones; añadir botones de cada sección.
- `src/pages/Comprobante.tsx` *(nueva)* — página pública del token.
- `src/App.tsx` — registrar ruta `/registro/comprobante`.
- `src/config/api.ts` — URLs nuevas: `getRegistroEmailUrl`, `getRegistroPublicoUrl`, `getRegistroUnregisterUrl`, `getRegistroBajaUrl`.

---

## Notas / Riesgos

- **PHPMailer no se puede instalar vía Composer en IONOS shared** — por eso lo subes manualmente como 3 archivos.
- Si el SMTP de IONOS bloquea el envío desde la app, los correos saldrán como error y el admin verá un toast — el flujo del jugador no se rompe (puede pegarle el link a mano si hace falta).
- El token es 256-bit y permite a cualquiera con el link adjuntar el comprobante. Es el modelo más simple; si más adelante quieres expiración o uso único, se agrega después.
