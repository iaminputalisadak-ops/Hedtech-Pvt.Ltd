<?php
/**
 * MySQL connection — same server/database you use in phpMyAdmin.
 *
 * - Host/port: local MySQL (phpMyAdmin usually uses 127.0.0.1:3306).
 * - Database name: must match the database you created (e.g. `hedztech`).
 * - If you set a root password in MySQL, set HEDZTECH_DB_PASS or edit `pass` below.
 *
 * First-time setup: import `database/schema.sql` (and migrations in `database/migrations/`)
 * into the `hedztech` database via phpMyAdmin → Import.
 */
$config = require __DIR__ . '/config.sample.php';

$config['db']['name'] = 'hedztech';

// Uncomment and set if your MySQL user/password differ from the defaults above
// (defaults are user `root`, empty password — typical XAMPP/WAMP).
// $config['db']['user'] = 'root';
// $config['db']['pass'] = '';

return $config;
