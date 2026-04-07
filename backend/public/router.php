<?php
declare(strict_types=1);

$uri = $_SERVER['REQUEST_URI'] ?? '/';
if ($uri !== '/' && is_file(__DIR__ . parse_url($uri, PHP_URL_PATH))) {
    return false;
}

require __DIR__ . '/index.php';
