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

    /** Team list for bootstrap — omits long bio text (full rows: GET /public/team). */
    private static function teamRowsForBootstrap(PDO $pdo): array
    {
        Db::ensureTeamMembersTable();
        if (!Db::tableExists('team_members')) {
            return [];
        }
        $published = Db::columnExists('team_members', 'published');
        $sql = $published
            ? 'SELECT id, name, role, photo_url, linkedin_url, sort_order FROM team_members WHERE published = 1 ORDER BY sort_order ASC, id ASC'
            : 'SELECT id, name, role, photo_url, linkedin_url, sort_order FROM team_members ORDER BY sort_order ASC, id ASC';

        return $pdo->query($sql)->fetchAll();
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
            $base . '/about',
            $base . '/services',
            $base . '/expertise',
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
        $projOrder = Db::columnExists('projects', 'sort_order')
            ? 'ORDER BY sort_order ASC, id ASC'
            : 'ORDER BY created_at DESC';
        foreach ($pdo->query('SELECT slug FROM projects ' . $projOrder)->fetchAll() as $r) {
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
        Db::ensureServicesImageUrlColumn();
        $stmt = Db::pdo()->query('SELECT id, title, description, icon, image_url, sort_order FROM services ORDER BY sort_order ASC, id ASC');
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function skills(): void
    {
        $stmt = Db::pdo()->query('SELECT id, name, level, sort_order FROM skills ORDER BY sort_order ASC, id ASC');
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function projects(): void
    {
        $pdo = Db::pdo();
        Db::ensureProjectsWorkFields();
        Db::ensureProjectsSeoFields();
        $hasFit = Db::columnExists('projects', 'image_fit');
        $hasSort = Db::columnExists('projects', 'sort_order');
        $hasSvc = Db::columnExists('projects', 'service_type');
        $hasStatus = Db::columnExists('projects', 'status');
        $hasClient = Db::columnExists('projects', 'client_name');
        $hasTags = Db::columnExists('projects', 'tags');
        $hasProgress = Db::columnExists('projects', 'progress');
        $hasMetaTitle = Db::columnExists('projects', 'meta_title');
        $hasMetaDesc = Db::columnExists('projects', 'meta_description');
        $hasOg = Db::columnExists('projects', 'og_image');
        $hasOgAlt = Db::columnExists('projects', 'og_image_alt');
        $cols = 'id, title, slug, excerpt, category, image_url';
        if ($hasSvc) {
            $cols .= ', service_type';
        }
        if ($hasStatus) {
            $cols .= ', status';
        }
        if ($hasClient) {
            $cols .= ', client_name';
        }
        if ($hasTags) {
            $cols .= ', tags';
        }
        if ($hasProgress) {
            $cols .= ', progress';
        }
        if ($hasMetaTitle) {
            $cols .= ', meta_title';
        }
        if ($hasMetaDesc) {
            $cols .= ', meta_description';
        }
        if ($hasOg) {
            $cols .= ', og_image';
        }
        if ($hasOgAlt) {
            $cols .= ', og_image_alt';
        }
        if ($hasFit) {
            $cols .= ', image_fit';
        }
        $cols .= ', featured, live_url, created_at';
        if ($hasSort) {
            $cols .= ', sort_order';
        }
        $order = $hasSort ? 'ORDER BY sort_order ASC, id ASC' : 'ORDER BY featured DESC, created_at DESC';
        $stmt = $pdo->query('SELECT ' . $cols . ' FROM projects ' . $order);
        Util::sendJson(['items' => $stmt->fetchAll()]);
    }

    public static function projectBySlug(string $slug): void
    {
        $pdo = Db::pdo();
        Db::ensureProjectsWorkFields();
        Db::ensureProjectsSeoFields();
        $hasFit = Db::columnExists('projects', 'image_fit');
        $hasSvc = Db::columnExists('projects', 'service_type');
        $hasStatus = Db::columnExists('projects', 'status');
        $hasClient = Db::columnExists('projects', 'client_name');
        $hasTags = Db::columnExists('projects', 'tags');
        $hasProgress = Db::columnExists('projects', 'progress');
        $hasMetaTitle = Db::columnExists('projects', 'meta_title');
        $hasMetaDesc = Db::columnExists('projects', 'meta_description');
        $hasOg = Db::columnExists('projects', 'og_image');
        $hasOgAlt = Db::columnExists('projects', 'og_image_alt');
        $extra = '';
        if ($hasSvc) {
            $extra .= ', service_type';
        }
        if ($hasStatus) {
            $extra .= ', status';
        }
        if ($hasClient) {
            $extra .= ', client_name';
        }
        if ($hasTags) {
            $extra .= ', tags';
        }
        if ($hasProgress) {
            $extra .= ', progress';
        }
        if ($hasMetaTitle) {
            $extra .= ', meta_title';
        }
        if ($hasMetaDesc) {
            $extra .= ', meta_description';
        }
        if ($hasOg) {
            $extra .= ', og_image';
        }
        if ($hasOgAlt) {
            $extra .= ', og_image_alt';
        }
        $stmt = $pdo->prepare(
            $hasFit
                ? 'SELECT id, title, slug, excerpt, body, category' . $extra . ', image_url, image_fit, featured, live_url, created_at FROM projects WHERE slug = ? LIMIT 1'
                : 'SELECT id, title, slug, excerpt, body, category' . $extra . ', image_url, featured, live_url, created_at FROM projects WHERE slug = ? LIMIT 1'
        );
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if (!$row) {
            Util::sendJson(['error' => 'Not found'], 404);
            return;
        }
        if (!$hasFit) {
            $row['image_fit'] = 'contain';
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
        Db::ensureBlogOgImageAltColumn();

        $stmtCount = $pdo->prepare('SELECT COUNT(*)' . $sqlBase);
        $stmtCount->execute($params);
        $total = (int) $stmtCount->fetchColumn();

        $sql = 'SELECT id, title, slug, excerpt, category, tags, created_at, meta_title, meta_description, og_image, og_image_alt'
            . $sqlBase
            . ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([...$params, $limit, $offset]);
        Util::sendJson(['items' => $stmt->fetchAll(), 'total' => $total, 'limit' => $limit, 'offset' => $offset]);
    }

    public static function blogBySlug(string $slug): void
    {
        Db::ensureBlogOgImageAltColumn();
        $stmt = Db::pdo()->prepare(
            'SELECT id, title, slug, excerpt, body, category, tags, created_at, meta_title, meta_description, og_image, og_image_alt
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
        Db::ensureTeamMembersTable();
        if (!Db::tableExists('team_members')) {
            Util::sendJson(['items' => []]);
            return;
        }
        $sql = Db::columnExists('team_members', 'published')
            ? 'SELECT id, name, role, bio, photo_url, linkedin_url, sort_order FROM team_members WHERE published = 1 ORDER BY sort_order ASC, id ASC'
            : 'SELECT id, name, role, bio, photo_url, linkedin_url, sort_order FROM team_members ORDER BY sort_order ASC, id ASC';
        Util::sendJson(['items' => $pdo->query($sql)->fetchAll()], 200, 45);
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
        Db::ensureServicesImageUrlColumn();
        Db::ensureBlogOgImageAltColumn();
        Db::ensureTeamMembersTable();
        Db::ensureProjectsWorkFields();
        Db::ensureProjectsSeoFields();
        Db::ensureSeoPagesTable();
        $settings = [];
        foreach ($pdo->query('SELECT `key`, `value` FROM settings')->fetchAll() as $r) {
            $settings[$r['key']] = $r['value'];
        }
        // Prefer DB canonical when config leaves it empty (typical: config.sample + Admin settings).
        $cfgBase = trim((string) ($GLOBALS['hedztech_config']['canonical_base'] ?? ''));
        $dbBase = trim((string) ($settings['canonical_base'] ?? ''));
        if ($cfgBase === '' && $dbBase !== '') {
            $GLOBALS['hedztech_config']['canonical_base'] = $dbBase;
        }
        Util::sendJson([
            'settings' => $settings,
            'services' => $pdo->query('SELECT id, title, description, icon, image_url, sort_order FROM services ORDER BY sort_order')->fetchAll(),
            'skills' => $pdo->query('SELECT id, name, level, sort_order FROM skills ORDER BY sort_order')->fetchAll(),
            'projects' => (static function () use ($pdo) {
                $hasFit = Db::columnExists('projects', 'image_fit');
                $hasSort = Db::columnExists('projects', 'sort_order');
                $hasSvc = Db::columnExists('projects', 'service_type');
                $hasStatus = Db::columnExists('projects', 'status');
                $hasClient = Db::columnExists('projects', 'client_name');
                $hasTags = Db::columnExists('projects', 'tags');
                $hasProgress = Db::columnExists('projects', 'progress');
                $hasMetaTitle = Db::columnExists('projects', 'meta_title');
                $hasMetaDesc = Db::columnExists('projects', 'meta_description');
                $hasOg = Db::columnExists('projects', 'og_image');
                $hasOgAlt = Db::columnExists('projects', 'og_image_alt');
                $cols = 'id, title, slug, excerpt, category, image_url';
                if ($hasSvc) {
                    $cols .= ', service_type';
                }
                if ($hasStatus) {
                    $cols .= ', status';
                }
                if ($hasClient) {
                    $cols .= ', client_name';
                }
                if ($hasTags) {
                    $cols .= ', tags';
                }
                if ($hasProgress) {
                    $cols .= ', progress';
                }
                if ($hasMetaTitle) {
                    $cols .= ', meta_title';
                }
                if ($hasMetaDesc) {
                    $cols .= ', meta_description';
                }
                if ($hasOg) {
                    $cols .= ', og_image';
                }
                if ($hasOgAlt) {
                    $cols .= ', og_image_alt';
                }
                if ($hasFit) {
                    $cols .= ', image_fit';
                }
                $cols .= ', featured, live_url, created_at';
                if ($hasSort) {
                    $cols .= ', sort_order';
                }
                $order = $hasSort ? 'ORDER BY sort_order ASC, id ASC' : 'ORDER BY featured DESC, created_at DESC';

                return $pdo->query('SELECT ' . $cols . ' FROM projects ' . $order)->fetchAll();
            })(),
            'seo_pages' => (static function () use ($pdo) {
                if (!Db::tableExists('seo_pages')) {
                    return [];
                }
                return $pdo
                    ->query(
                        'SELECT id, path, meta_title, meta_description, og_image, og_image_alt, robots, created_at FROM seo_pages ORDER BY path ASC, id ASC'
                    )
                    ->fetchAll();
            })(),
            'trusted' => $pdo->query('SELECT id, name, logo_url, sort_order FROM trusted_companies ORDER BY sort_order')->fetchAll(),
            'team' => self::teamRowsForBootstrap($pdo),
            'testimonials' => $pdo->query(
                Db::columnExists('testimonials', 'published')
                    ? 'SELECT id, name, role, video_url, rating, quote, sort_order FROM testimonials WHERE published = 1 ORDER BY sort_order'
                    : 'SELECT id, name, role, video_url, rating, quote, sort_order FROM testimonials ORDER BY sort_order'
            )->fetchAll(),
            'blog' => (static function () use ($pdo) {
                $cols = 'id, title, slug, excerpt, category, tags, created_at';
                if (Db::columnExists('blog_posts', 'og_image')) {
                    $cols .= ', og_image';
                }
                if (Db::columnExists('blog_posts', 'og_image_alt')) {
                    $cols .= ', og_image_alt';
                }
                $where = Db::columnExists('blog_posts', 'published') ? 'WHERE published = 1' : '';

                return $pdo
                    ->query('SELECT ' . $cols . ' FROM blog_posts ' . $where . ' ORDER BY created_at DESC LIMIT 12')
                    ->fetchAll();
            })(),
        ], 200, 30);
    }

    public static function seoPages(): void
    {
        Db::ensureSeoPagesTable();
        if (!Db::tableExists('seo_pages')) {
            Util::sendJson(['items' => []]);
            return;
        }
        $stmt = Db::pdo()->query(
            'SELECT id, path, meta_title, meta_description, og_image, og_image_alt, robots, created_at FROM seo_pages ORDER BY path ASC, id ASC'
        );
        Util::sendJson(['items' => $stmt->fetchAll()], 200, 120);
    }

    /**
     * Read-only DB check (no passwords). Use: GET /api/public/db-health
     * If db_show_error is true in config, includes PDO detail for one-off debugging.
     */
    public static function dbHealth(): void
    {
        $root = dirname(__DIR__);
        $samplePath = $root . '/config.sample.php';
        $configPath = $root . '/config.php';

        $db = $GLOBALS['hedztech_config']['db'];
        $meta = [
            'config_php_readable' => is_readable($configPath),
            'config_sample_php_readable' => is_readable($samplePath),
            'db_host' => $db['host'],
            'db_port' => $db['port'],
            'db_name' => $db['name'],
            'db_user' => $db['user'],
            'db_password_is_non_empty' => trim((string) $db['pass']) !== '',
            'db_socket_set' => trim((string) ($db['socket'] ?? '')) !== '',
        ];

        $probe = Db::probe();
        if ($probe['ok']) {
            Util::sendJson(array_merge(['connected' => true], ['config' => $meta]));

            return;
        }

        $show = ($GLOBALS['hedztech_config']['db_show_error'] ?? false) === true;
        $out = array_merge(
            [
                'connected' => false,
                'config' => $meta,
                'hint' => 'If config_sample_php_readable is false, upload config.sample.php next to config.php (same folder as bootstrap.php). If db_password_is_non_empty is false, set the MySQL user password in config.php. In cPanel, add the user to the database with ALL PRIVILEGES. Try db_host 127.0.0.1 or localhost.',
            ],
            $show ? ['detail' => $probe['message'] ?? ''] : []
        );
        Util::sendJson($out, 503);
    }
}
