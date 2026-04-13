<?php
/**
 * Loads config.sample.php, then optional config.local.php (gitignored).
 *
 * Local XAMPP: import database/schema.sql → database `hedztech`, user `root`, pass ``. No config.local.php needed.
 * Production (cPanel): add config.local.php on the server next to config.php with your MySQL name/user/pass
 * (see config.local.php.example). Env vars HEDZTECH_DB_* in config.sample.php also override defaults if set.
 */
$config = require __DIR__ . '/config.sample.php';

$localFile = __DIR__ . '/config.local.php';
if (is_readable($localFile)) {
    $local = require $localFile;
    if (is_array($local)) {
        $config = array_replace_recursive($config, $local);
    }
}

if (trim((string) ($config['canonical_base'] ?? '')) === '') {
    $config['canonical_base'] = 'https://hedztech.com';
}

return $config;
