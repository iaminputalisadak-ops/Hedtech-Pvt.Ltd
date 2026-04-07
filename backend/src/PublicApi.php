<?php
declare(strict_types=1);

namespace Hedztech;

use PDO;

final class PublicApi
{
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
            'SELECT id, title, slug, excerpt, category, image_url, featured, live_url, created_at FROM projects ORDER BY featured DESC, created_at DESC'
        );
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function projectBySlug(string $slug): void
    {
        $stmt = Db::pdo()->prepare(
            'SELECT id, title, slug, excerpt, body, category, image_url, featured, live_url, created_at FROM projects WHERE slug = ? LIMIT 1'
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
        $sql = 'SELECT id, title, slug, excerpt, category, tags, created_at FROM blog_posts WHERE published = 1';
        $params = [];
        if ($cat !== '') {
            $sql .= ' AND category = ?';
            $params[] = $cat;
        }
        if ($q !== '') {
            $sql .= ' AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ?)';
            $like = '%' . $q . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }
        $sql .= ' ORDER BY created_at DESC';
        $stmt = Db::pdo()->prepare($sql);
        $stmt->execute($params);
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function blogBySlug(string $slug): void
    {
        $stmt = Db::pdo()->prepare(
            'SELECT id, title, slug, excerpt, body, category, tags, created_at FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1'
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
        Util::sendJson([
            'settings' => $settings,
            'services' => $pdo->query('SELECT id, title, description, icon, sort_order FROM services ORDER BY sort_order')->fetchAll(),
            'skills' => $pdo->query('SELECT id, name, level, sort_order FROM skills ORDER BY sort_order')->fetchAll(),
            'projects' => $pdo->query(
                'SELECT id, title, slug, excerpt, category, image_url, featured, live_url, created_at FROM projects ORDER BY featured DESC, created_at DESC'
            )->fetchAll(),
            'trusted' => $pdo->query('SELECT id, name, logo_url, sort_order FROM trusted_companies ORDER BY sort_order')->fetchAll(),
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
