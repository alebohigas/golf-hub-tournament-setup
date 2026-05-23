<?php
/**
 * Database Credentials (PRIVATE - DO NOT COMMIT TO GIT)
 * ⚠️  Add this file to .gitignore!
 * Copy credentials.example.php to credentials.php and fill in your values
 */

$DB_HOST = 'localhost';
$DB_USER = 'your_user';
$DB_PASS = 'your_password';
$DB_NAME = 'your_database';
$DB_PORT = 3306;

// ============= SMTP (Pre-Registro email flow) =============
// Used by /api/registro_email.php via PHPMailer (drop sources at
// /api/PHPMailer/{PHPMailer,SMTP,Exception}.php). When PHPMailer is
// missing or these are blank, the code falls back to PHP mail().
$SMTP_HOST      = 'smtp.ionos.mx';
$SMTP_PORT      = 587;
$SMTP_USER      = 'registro.torneo01@speitour.mx';
$SMTP_PASS      = 'your_smtp_password';
$SMTP_FROM_NAME = 'Speitour Registros';
