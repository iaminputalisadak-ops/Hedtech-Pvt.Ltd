<?php
declare(strict_types=1);

$configPath = __DIR__ . '/config.php';
if (!is_readable($configPath)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing backend/config.php — copy config.sample.php']);
    exit;
}

$GLOBALS['hedztech_config'] = require $configPath;

spl_autoload_register(function (string $class): void {
    $prefix = 'Hedztech\\';
    if (str_starts_with($class, $prefix)) {
        $rel = str_replace('\\', '/', substr($class, strlen($prefix)));
        $file = __DIR__ . '/src/' . $rel . '.php';
        if (is_readable($file)) {
            require $file;
        }
    }
});
