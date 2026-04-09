<?php
declare(strict_types=1);

namespace Hedztech;

use PDO;

final class PublicApi
{
    private static function xmlEscape(string $s): string
    {
        return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private static function canonicalBase(): string
    {
        $base = (string) (($GLOBALS['hedztech_config']['canonical_base'] ?? '') ?: '');
        $base = rtrim($base, '/');
        if ($base === '') {
            // Fallback: build from request (useful in local/dev). Prefer config for production.
            $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $base = $proto . '://' . $host;
        }
        return $base;
    }

    public static function sitemapXml(): void
    {
        $base = self::canonicalBase();
        $pdo = Db::pdo();

        $urls = [
            $base . '/',
            $base . '/work',
            $base . '/blog',
            $base . '/services/web-development',
            $base . '/services/seo',
            $base . '/services/ui-ux',
            $base . '/reviews',
            $base . '/team',
            $base . '/contact',
            $base . '/privacy',
            $base . '/terms',
        ];

        foreach ($pdo->query('SELECT slug FROM blog_posts WHERE published = 1 ORDER BY created_at DESC')->fetchAll() as $r) {
            $urls[] = $base . '/blog/' . rawurlencode((string) $r['slug']);
        }
        foreach ($pdo->query('SELECT slug FROM projects ORDER BY created_at DESC')->fetchAll() as $r) {
            $urls[] = $base . '/work/' . rawurlencode((string) $r['slug']);
        }

        header('Content-Type: application/xml; charset=utf-8');
        echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
        foreach (array_values(array_unique($urls)) as $loc) {
            echo '  <url><loc>' . self::xmlEscape($loc) . "</loc></url>\n";
        }
        echo "</urlset>\n";
    }

    public static function settings(): void
    {
        $stmt = Db::pdo()->query('SELECT `key`, `value` FROM settings');
        $rows = $stmt->fetchAll();
        $out = [];
        foreach ($rows as $r) {
            $out[$r['key']] = $r['value'];
        }
        Util::sendJson(['settings' => $out]);
    }

    public static function services(): void
    {
        $stmt = Db::pdo()->query('SELECT id, title, description, icon, sort_order FROM services ORDER BY sort_order ASC, id ASC');
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function skills(): void
    {
        $stmt = Db::pdo()->query('SELECT id, name, level, sort_order FROM skills ORDER BY sort_order ASC, id ASC');
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function projects(): void
    {
        $stmt = Db::pdo()->query(
            'SELECT id, title, slug, excerpt, category, image_url, image_fit, featured, live_url, created_at FROM projects ORDER BY featured DESC, created_at DESC'
        );
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function projectBySlug(string $slug): void
    {
        $stmt = Db::pdo()->prepare(
            'SELECT id, title, slug, excerpt, body, category, image_url, image_fit, featured, live_url, created_at FROM projects WHERE slug = ? LIMIT 1'
        );
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if (!$row) {
            Util::sendJson(['error' => 'Not found'], 404);
            return;
        }
        Util::sendJson(['item' => $row]);
    }

    public static function blogList(): void
    {
        $cat = $_GET['category'] ?? '';
        $q = trim((string) ($_GET['q'] ?? ''));
        $limit = (int) ($_GET['limit'] ?? 12);
        $offset = (int) ($_GET['offset'] ?? 0);
        $limit = max(1, min(50, $limit));
        $offset = max(0, $offset);

        $sqlBase = ' FROM blog_posts WHERE published = 1';
        $params = [];
        if ($cat !== '') {
            $sqlBase .= ' AND category = ?';
            $params[] = $cat;
        }
        if ($q !== '') {
            $sqlBase .= ' AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ?)';
            $like = '%' . $q . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }
        $pdo = Db::pdo();

        $stmtCount = $pdo->prepare('SELECT COUNT(*)' . $sqlBase);
        $stmtCount->execute($params);
        $total = (int) $stmtCount->fetchColumn();

        $sql = 'SELECT id, title, slug, excerpt, category, tags, created_at, meta_title, meta_description, og_image'
            . $sqlBase
            . ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([...$params, $limit, $offset]);
        Util::sendJson(['items' => $stmt->fetchAll(), 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
    }

    public static function blogBySlug(string $slug): void
    {
        $stmt = Db::pdo()->prepare(
            'SELECT id, title, slug, excerpt, body, category, tags, created_at, meta_title, meta_description, og_image
             FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1'
        );
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if (!$row) {
            Util::sendJson(['error' => 'Not found'], 404);
            return;
        }
        Util::sendJson(['item' => $row]);
    }

    public static function trusted(): void
    {
        $stmt = Db::pdo()->query('SELECT id, name, logo_url, sort_order FROM trusted_companies ORDER BY sort_order ASC, id ASC');
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function testimonials(): void
    {
        $pdo = Db::pdo();
        $sql = Db::columnExists('testimonials', 'published')
            ? 'SELECT id, name, role, video_url, rating, quote, sort_order FROM testimonials WHERE published = 1 ORDER BY sort_order ASC, id ASC'
            : 'SELECT id, name, role, video_url, rating, quote, sort_order FROM testimonials ORDER BY sort_order ASC, id ASC';
        Util::sendJson(['items' => $pdo->query($sql)->fetchAll()]);
    }

    public static function team(): void
    {
        $pdo = Db::pdo();
        if (!Db::tableExists('team_members')) {
            Util::sendJson(['items' => []]);
            return;
        }
        $sql = Db::columnExists('team_members', 'published')
            ? 'SELECT id, name, role, bio, photo_url, linkedin_url, sort_order FROM team_members WHERE published = 1 ORDER BY sort_order ASC, id ASC'
            : 'SELECT id, name, role, bio, photo_url, linkedin_url, sort_order FROM team_members ORDER BY sort_order ASC, id ASC';
        Util::sendJson(['items' => $pdo->query($sql)->fetchAll()]);
    }

    public static function contactSubmit(): void
    {
        $b = Util::jsonInput();
        $name = trim((string) ($b['name'] ?? ''));
        $email = trim((string) ($b['email'] ?? ''));
        $message = trim((string) ($b['message'] ?? ''));
        if ($name === '' || $email === '' || $message === '') {
            Util::sendJson(['error' => 'Name, email, and message are required'], 400);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Util::sendJson(['error' => 'Invalid email'], 400);
            return;
        }
        $stmt = Db::pdo()->prepare('INSERT INTO contact_messages (name, email, message) VALUES (?,?,?)');
        $stmt->execute([$name, $email, $message]);
        Util::sendJson(['ok' => true]);
    }

    /** Single payload for homepage to reduce round-trips */
    public static function bootstrap(): void
    {
        $pdo = Db::pdo();
        $settings = [];
        foreach ($pdo->query('SELECT `key`, `value` FROM settings')->fetchAll() as $r) {
            $settings[$r['key']] = $r['value'];
        }
        // Allow dynamic sitemap to use this base when configured in DB
        if (!isset($GLOBALS['hedztech_config']['canonical_base']) && isset($settings['canonical_base'])) {
            $GLOBALS['hedztech_config']['canonical_base'] = $settings['canonical_base'];
        }
        Util::sendJson([
            'settings' => $settings,
            'services' => $pdo->query('SELECT id, title, description, icon, sort_order FROM services ORDER BY sort_order')->fetchAll(),
            'skills' => $pdo->query('SELECT id, name, level, sort_order FROM skills ORDER BY sort_order')->fetchAll(),
            'projects' => $pdo->query(
                'SELECT id, title, slug, excerpt, category, image_url, image_fit, featured, live_url, created_at FROM projects ORDER BY featured DESC, created_at DESC'
            )->fetchAll(),
            'trusted' => $pdo->query('SELECT id, name, logo_url, sort_order FROM trusted_companies ORDER BY sort_order')->fetchAll(),
            'team' => Db::tableExists('team_members') ? $pdo->query(
                Db::columnExists('team_members', 'published')
                    ? 'SELECT id, name, role, bio, photo_url, linkedin_url, sort_order FROM team_members WHERE published = 1 ORDER BY sort_order'
                    : 'SELECT id, name, role, bio, photo_url, linkedin_url, sort_order FROM team_members ORDER BY sort_order'
            )->fetchAll() : [],
            'testimonials' => $pdo->query(
                Db::columnExists('testimonials', 'published')
                    ? 'SELECT id, name, role, video_url, rating, quote, sort_order FROM testimonials WHERE published = 1 ORDER BY sort_order'
                    : 'SELECT id, name, role, video_url, rating, quote, sort_order FROM testimonials ORDER BY sort_order'
            )->fetchAll(),
            'blog' => $pdo->query(
                'SELECT id, title, slug, excerpt, category, tags, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 6'
            )->fetchAll(),
        ]);
    }
}
