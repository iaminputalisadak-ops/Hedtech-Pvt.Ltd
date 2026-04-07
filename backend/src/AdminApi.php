<?php
declare(strict_types=1);

namespace Hedztech;

use PDO;

final class AdminApi
{
    public static function login(): void
    {
        $body = Util::jsonInput();
        $u = trim((string) ($body['username'] ?? ''));
        $p = (string) ($body['password'] ?? '');
        if ($u === '' || $p === '') {
            Util::sendJson(['error' => 'Username and password required'], 400);
            return;
        }
        if (!Auth::login($u, $p)) {
            Util::sendJson(['error' => 'Invalid credentials'], 401);
            return;
        }
        Util::sendJson(['ok' => true, 'admin_id' => Auth::adminId()]);
    }

    public static function logout(): void
    {
        Auth::logout();
        Util::sendJson(['ok' => true]);
    }

    public static function me(): void
    {
        Auth::requireAdmin();
        Util::sendJson(['admin_id' => Auth::adminId()]);
    }

    public static function patchSettings(): void
    {
        Auth::requireAdmin();
        $body = Util::jsonInput();
        if (!is_array($body) || $body === []) {
            Util::sendJson(['error' => 'JSON object with key/value pairs expected'], 400);
            return;
        }
        $pdo = Db::pdo();
        $stmt = $pdo->prepare('INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)');
        foreach ($body as $k => $v) {
            if (!is_string($k) || $k === '') {
                continue;
            }
            $stmt->execute([$k, is_scalar($v) ? (string) $v : json_encode($v)]);
        }
        Util::sendJson(['ok' => true]);
    }

    public static function crudServices(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM services ORDER BY sort_order, id');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $title = trim((string) ($b['title'] ?? ''));
            if ($title === '') {
                Util::sendJson(['error' => 'title required'], 400);
                return;
            }
            $stmt = $pdo->prepare('INSERT INTO services (title, description, icon, sort_order) VALUES (?,?,?,?)');
            $stmt->execute([
                $title,
                (string) ($b['description'] ?? ''),
                (string) ($b['icon'] ?? 'code'),
                (int) ($b['sort_order'] ?? 0),
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $stmt = $pdo->prepare('UPDATE services SET title=?, description=?, icon=?, sort_order=? WHERE id=?');
            $stmt->execute([
                (string) ($b['title'] ?? ''),
                (string) ($b['description'] ?? ''),
                (string) ($b['icon'] ?? 'code'),
                (int) ($b['sort_order'] ?? 0),
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM services WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function crudSkills(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM skills ORDER BY sort_order, id');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $name = trim((string) ($b['name'] ?? ''));
            if ($name === '') {
                Util::sendJson(['error' => 'name required'], 400);
                return;
            }
            $stmt = $pdo->prepare('INSERT INTO skills (name, level, sort_order) VALUES (?,?,?)');
            $stmt->execute([$name, min(100, max(0, (int) ($b['level'] ?? 80))), (int) ($b['sort_order'] ?? 0)]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $pdo->prepare('UPDATE skills SET name=?, level=?, sort_order=? WHERE id=?')->execute([
                (string) ($b['name'] ?? ''),
                min(100, max(0, (int) ($b['level'] ?? 0))),
                (int) ($b['sort_order'] ?? 0),
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM skills WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function crudProjects(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM projects ORDER BY created_at DESC');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $title = trim((string) ($b['title'] ?? ''));
            if ($title === '') {
                Util::sendJson(['error' => 'title required'], 400);
                return;
            }
            $slug = trim((string) ($b['slug'] ?? ''));
            if ($slug === '') {
                $slug = Util::slugify($title);
            }
            $img = isset($b['image_url']) ? trim((string) $b['image_url']) : '';
            $live = isset($b['live_url']) ? trim((string) $b['live_url']) : '';
            $stmt = $pdo->prepare(
                'INSERT INTO projects (title, slug, excerpt, body, category, image_url, featured, live_url) VALUES (?,?,?,?,?,?,?,?)'
            );
            $stmt->execute([
                $title,
                $slug,
                (string) ($b['excerpt'] ?? ''),
                (string) ($b['body'] ?? ''),
                (string) ($b['category'] ?? 'web'),
                $img !== '' ? $img : null,
                !empty($b['featured']) ? 1 : 0,
                $live !== '' ? $live : null,
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $slug = trim((string) ($b['slug'] ?? ''));
            if ($slug === '') {
                $slug = Util::slugify((string) ($b['title'] ?? 'project'));
            }
            $img = isset($b['image_url']) ? trim((string) $b['image_url']) : '';
            $live = isset($b['live_url']) ? trim((string) $b['live_url']) : '';
            $pdo->prepare(
                'UPDATE projects SET title=?, slug=?, excerpt=?, body=?, category=?, image_url=?, featured=?, live_url=? WHERE id=?'
            )->execute([
                (string) ($b['title'] ?? ''),
                $slug,
                (string) ($b['excerpt'] ?? ''),
                (string) ($b['body'] ?? ''),
                (string) ($b['category'] ?? 'web'),
                $img !== '' ? $img : null,
                !empty($b['featured']) ? 1 : 0,
                $live !== '' ? $live : null,
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM projects WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function crudBlog(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM blog_posts ORDER BY created_at DESC');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $title = trim((string) ($b['title'] ?? ''));
            if ($title === '') {
                Util::sendJson(['error' => 'title required'], 400);
                return;
            }
            $slug = trim((string) ($b['slug'] ?? ''));
            if ($slug === '') {
                $slug = Util::slugify($title);
            }
            $stmt = $pdo->prepare(
                'INSERT INTO blog_posts (title, slug, excerpt, body, category, tags, published) VALUES (?,?,?,?,?,?,?)'
            );
            $stmt->execute([
                $title,
                $slug,
                (string) ($b['excerpt'] ?? ''),
                (string) ($b['body'] ?? ''),
                (string) ($b['category'] ?? 'news'),
                (string) ($b['tags'] ?? ''),
                !empty($b['published']) ? 1 : 0,
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $slug = trim((string) ($b['slug'] ?? ''));
            if ($slug === '') {
                $slug = Util::slugify((string) ($b['title'] ?? 'post'));
            }
            $pdo->prepare(
                'UPDATE blog_posts SET title=?, slug=?, excerpt=?, body=?, category=?, tags=?, published=? WHERE id=?'
            )->execute([
                (string) ($b['title'] ?? ''),
                $slug,
                (string) ($b['excerpt'] ?? ''),
                (string) ($b['body'] ?? ''),
                (string) ($b['category'] ?? 'news'),
                (string) ($b['tags'] ?? ''),
                !empty($b['published']) ? 1 : 0,
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM blog_posts WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function crudTrusted(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM trusted_companies ORDER BY sort_order, id');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $name = trim((string) ($b['name'] ?? ''));
            if ($name === '') {
                Util::sendJson(['error' => 'name required'], 400);
                return;
            }
            $logo = isset($b['logo_url']) ? trim((string) $b['logo_url']) : '';
            $stmt = $pdo->prepare('INSERT INTO trusted_companies (name, logo_url, sort_order) VALUES (?,?,?)');
            $stmt->execute([
                $name,
                $logo !== '' ? $logo : null,
                (int) ($b['sort_order'] ?? 0),
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $logo = isset($b['logo_url']) ? trim((string) $b['logo_url']) : '';
            $pdo->prepare('UPDATE trusted_companies SET name=?, logo_url=?, sort_order=? WHERE id=?')->execute([
                (string) ($b['name'] ?? ''),
                $logo !== '' ? $logo : null,
                (int) ($b['sort_order'] ?? 0),
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM trusted_companies WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function crudTestimonials(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM testimonials ORDER BY sort_order, id');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $name = trim((string) ($b['name'] ?? ''));
            $video = trim((string) ($b['video_url'] ?? ''));
            if ($name === '' || $video === '') {
                Util::sendJson(['error' => 'name and video_url required'], 400);
                return;
            }
            $pub = Db::columnExists('testimonials', 'published');
            if ($pub) {
                $stmt = $pdo->prepare(
                    'INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order, published) VALUES (?,?,?,?,?,?,?)'
                );
                $stmt->execute([
                    $name,
                    (string) ($b['role'] ?? ''),
                    $video,
                    min(5, max(1, (int) ($b['rating'] ?? 5))),
                    (string) ($b['quote'] ?? ''),
                    (int) ($b['sort_order'] ?? 0),
                    isset($b['published']) && (int) $b['published'] === 0 ? 0 : 1,
                ]);
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO testimonials (name, role, video_url, rating, quote, sort_order) VALUES (?,?,?,?,?,?)'
                );
                $stmt->execute([
                    $name,
                    (string) ($b['role'] ?? ''),
                    $video,
                    min(5, max(1, (int) ($b['rating'] ?? 5))),
                    (string) ($b['quote'] ?? ''),
                    (int) ($b['sort_order'] ?? 0),
                ]);
            }
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            if (Db::columnExists('testimonials', 'published')) {
                $pdo->prepare(
                    'UPDATE testimonials SET name=?, role=?, video_url=?, rating=?, quote=?, sort_order=?, published=? WHERE id=?'
                )->execute([
                    (string) ($b['name'] ?? ''),
                    (string) ($b['role'] ?? ''),
                    (string) ($b['video_url'] ?? ''),
                    min(5, max(1, (int) ($b['rating'] ?? 5))),
                    (string) ($b['quote'] ?? ''),
                    (int) ($b['sort_order'] ?? 0),
                    isset($b['published']) && (int) $b['published'] === 0 ? 0 : 1,
                    (int) $id,
                ]);
            } else {
                $pdo->prepare(
                    'UPDATE testimonials SET name=?, role=?, video_url=?, rating=?, quote=?, sort_order=? WHERE id=?'
                )->execute([
                    (string) ($b['name'] ?? ''),
                    (string) ($b['role'] ?? ''),
                    (string) ($b['video_url'] ?? ''),
                    min(5, max(1, (int) ($b['rating'] ?? 5))),
                    (string) ($b['quote'] ?? ''),
                    (int) ($b['sort_order'] ?? 0),
                    (int) $id,
                ]);
            }
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM testimonials WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function contactMessages(): void
    {
        Auth::requireAdmin();
        $stmt = Db::pdo()->query('SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 200');
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }
}
