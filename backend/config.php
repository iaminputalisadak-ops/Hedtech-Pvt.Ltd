<?php
/**
 * MySQL — match the database you use in phpMyAdmin.
 *
 * cPanel (Hedztech): database + user are often both `hedztech_hedzdb`, host `localhost`.
 * Set the MySQL user password below (from cPanel → MySQL® Databases). An empty password will always fail on cPanel.
 * Host: use 127.0.0.1 (TCP). If that fails, try localhost or ask your host for the MySQL socket path and set db.socket.
 *
 * Import `database/schema.sql` (and `database/migrations/*.sql` in order) into `hedztech_hedzdb`.
 *
 * Local PC (XAMPP, etc.): set env vars HEDZTECH_DB_HOST, HEDZTECH_DB_NAME, HEDZTECH_DB_USER, HEDZTECH_DB_PASS
 * or temporarily change the defaults below (e.g. name/user `hedztech` and user `root`).
 */
$config = require __DIR__ . '/config.sample.php';

$config['db']['host'] = getenv('HEDZTECH_DB_HOST') ?: '127.0.0.1';
$config['db']['name'] = getenv('HEDZTECH_DB_NAME') ?: 'hedztech_hedzdb';
$config['db']['user'] = getenv('HEDZTECH_DB_USER') ?: 'hedztech_hedzdb';
$config['db']['pass'] = getenv('HEDZTECH_DB_PASS') ?: '';
// $config['db']['socket'] = '/var/lib/mysql/mysql.sock'; // only if host/port fails; path varies by host
// $config['db_show_error'] = true; // temporary: see exact PDO message in /api/public/bootstrap JSON, then set false

return $config;
