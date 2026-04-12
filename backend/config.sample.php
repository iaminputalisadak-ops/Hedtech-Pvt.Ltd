<?php
/**
 * Copy to config.php and adjust credentials.
 */
return [
    'db' => [
        'host' => getenv('HEDZTECH_DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('HEDZTECH_DB_PORT') ?: 3306),
        'name' => getenv('HEDZTECH_DB_NAME') ?: 'hedztech',
        'user' => getenv('HEDZTECH_DB_USER') ?: 'root',
        'pass' => getenv('HEDZTECH_DB_PASS') ?: '',
        /** Optional: Unix socket path if host=localhost fails (cPanel sometimes documents this). */
        'socket' => getenv('HEDZTECH_DB_SOCKET') ?: '',
        'charset' => 'utf8mb4',
    ],
    /** Set true temporarily to include PDO error text in JSON (disable on public production). */
    'db_show_error' => getenv('HEDZTECH_DB_DEBUG') === '1',
    'session_name' => 'hedztech_admin',
    /**
     * Production: set to your live site (no trailing slash). Used in sitemap.xml, JSON-LD, and canonical URLs.
     * Also add the same origin to cors_origins so the browser can call /api from this host.
     */
    'canonical_base' => getenv('HEDZTECH_CANONICAL_BASE') ?: '',
    'cors_origins' => array_values(array_filter(array_unique([
        'https://hedztech.com',
        'https://www.hedztech.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        (string) (getenv('HEDZTECH_CANONICAL_BASE') ?: ''),
    ]), static fn ($o) => is_string($o) && $o !== '')),
];
