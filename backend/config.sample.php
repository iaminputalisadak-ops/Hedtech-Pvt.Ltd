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
        'charset' => 'utf8mb4',
    ],
    'session_name' => 'hedztech_admin',
    'cors_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
    ],
];
