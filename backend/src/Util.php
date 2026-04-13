<?php
declare(strict_types=1);

namespace Hedztech;

final class Util
{
    public static function jsonInput(): array
    {
        $raw = file_get_contents('php://input') ?: '';
        if ($raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public static function slugify(string $s): string
    {
        $s = strtolower(trim($s));
        $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
        return trim($s, '-') ?: 'item';
    }

    /**
     * @param int|null $cacheMaxAge When set with HTTP 200, sends Cache-Control for public JSON caching (CDN/browser).
     */
    public static function sendJson(mixed $data, int $code = 200, ?int $cacheMaxAge = null): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        if ($cacheMaxAge !== null && $cacheMaxAge > 0 && $code === 200) {
            $swr = min(180, max(30, $cacheMaxAge * 2));
            header('Cache-Control: public, max-age=' . $cacheMaxAge . ', stale-while-revalidate=' . $swr);
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
