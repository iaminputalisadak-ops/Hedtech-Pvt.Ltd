<?php
declare(strict_types=1);

namespace Hedztech;

final class Router
{
    public static function dispatch(): void
    {
        $cfg = $GLOBALS['hedztech_config'];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        foreach ($cfg['cors_origins'] as $allowed) {
            if ($origin === $allowed) {
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Credentials: true');
                break;
            }
        }
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            return;
        }

        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Strip query string path only — support /api/... or /backend/public/api/...
        if (preg_match('#/api(/.*)$#', $uri, $m)) {
            $path = $m[1];
        } elseif (str_starts_with($uri, '/api')) {
            $path = substr($uri, 4) ?: '/';
        } else {
            $path = $uri;
        }
        $path = '/' . trim($path, '/');
        if ($path === '') {
            $path = '/';
        }

        Auth::startSession();

        // --- Public ---
        if ($method === 'GET' && $path === '/public/bootstrap') {
            PublicApi::bootstrap();
            return;
        }
        if ($method === 'GET' && $path === '/public/settings') {
            PublicApi::settings();
            return;
        }
        if ($method === 'GET' && $path === '/public/services') {
            PublicApi::services();
            return;
        }
        if ($method === 'GET' && $path === '/public/skills') {
            PublicApi::skills();
            return;
        }
        if ($method === 'GET' && $path === '/public/projects') {
            PublicApi::projects();
            return;
        }
        if ($method === 'GET' && preg_match('#^/public/projects/([^/]+)$#', $path, $mm)) {
            PublicApi::projectBySlug(rawurldecode($mm[1]));
            return;
        }
        if ($method === 'GET' && $path === '/public/blog') {
            PublicApi::blogList();
            return;
        }
        if ($method === 'GET' && preg_match('#^/public/blog/([^/]+)$#', $path, $mm)) {
            PublicApi::blogBySlug(rawurldecode($mm[1]));
            return;
        }
        if ($method === 'GET' && $path === '/public/trusted') {
            PublicApi::trusted();
            return;
        }
        if ($method === 'GET' && $path === '/public/testimonials') {
            PublicApi::testimonials();
            return;
        }
        if ($method === 'GET' && $path === '/public/team') {
            PublicApi::team();
            return;
        }
        if ($method === 'GET' && $path === '/public/sitemap.xml') {
            PublicApi::sitemapXml();
            return;
        }
        if ($method === 'POST' && $path === '/public/contact') {
            PublicApi::contactSubmit();
            return;
        }

        // --- Admin ---
        if ($method === 'POST' && $path === '/admin/login') {
            AdminApi::login();
            return;
        }
        if ($method === 'POST' && $path === '/admin/logout') {
            AdminApi::logout();
            return;
        }
        if ($method === 'GET' && $path === '/admin/me') {
            AdminApi::me();
            return;
        }
        if ($method === 'PUT' && $path === '/admin/settings') {
            AdminApi::patchSettings();
            return;
        }
        if ($method === 'POST' && $path === '/admin/upload') {
            AdminApi::upload();
            return;
        }
        if (preg_match('#^/admin/services(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudServices($method, $mm[1] ?? null);
            return;
        }
        if (preg_match('#^/admin/skills(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudSkills($method, $mm[1] ?? null);
            return;
        }
        if (preg_match('#^/admin/projects(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudProjects($method, $mm[1] ?? null);
            return;
        }
        if (preg_match('#^/admin/blog(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudBlog($method, $mm[1] ?? null);
            return;
        }
        if (preg_match('#^/admin/trusted(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudTrusted($method, $mm[1] ?? null);
            return;
        }
        if (preg_match('#^/admin/testimonials(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudTestimonials($method, $mm[1] ?? null);
            return;
        }
        if (preg_match('#^/admin/team(?:/(\d+))?$#', $path, $mm)) {
            AdminApi::crudTeam($method, $mm[1] ?? null);
            return;
        }
        if ($method === 'GET' && $path === '/admin/contact-messages') {
            AdminApi::contactMessages();
            return;
        }

        Util::sendJson(['error' => 'Not found', 'path' => $path], 404);
    }
}
