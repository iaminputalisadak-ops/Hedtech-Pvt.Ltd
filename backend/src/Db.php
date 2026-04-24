<?php
declare(strict_types=1);

namespace Hedztech;

use PDO;
use PDOException;

final class Db
{
    private static ?PDO $pdo = null;

    /** @var array<string, bool> */
    private static array $tableExistsCache = [];

    /** @var array<string, bool> */
    private static array $columnExistsCache = [];

    /** @param array<string, mixed> $c */
    private static function buildDsn(array $c): string
    {
        $socket = trim((string) ($c['socket'] ?? ''));
        if ($socket !== '') {
            return sprintf(
                'mysql:unix_socket=%s;dbname=%s;charset=%s',
                $socket,
                $c['name'],
                $c['charset']
            );
        }

        return sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $c['host'],
            $c['port'],
            $c['name'],
            $c['charset']
        );
    }

    /**
     * Try MySQL once without caching (for diagnostics).
     *
     * @return array{ok: bool, message?: string}
     */
    public static function probe(): array
    {
        $c = $GLOBALS['hedztech_config']['db'];
        $dsn = self::buildDsn($c);
        try {
            $pdo = new PDO($dsn, $c['user'], $c['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->query('SELECT 1');

            return ['ok' => true];
        } catch (PDOException $e) {
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }
        $c = $GLOBALS['hedztech_config']['db'];
        $dsn = self::buildDsn($c);
        try {
            self::$pdo = new PDO($dsn, $c['user'], $c['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(503);
            header('Content-Type: application/json');
            $show = ($GLOBALS['hedztech_config']['db_show_error'] ?? false) === true;
            $payload = [
                'error' => 'Database connection failed',
                'hint' => 'Check public_html/config.php: host (on cPanel try 127.0.0.1 instead of localhost), database name, MySQL username, and password. In cPanel → MySQL® Databases, confirm the user is added to the database with ALL PRIVILEGES. Import database/schema.sql into that database if tables are missing.',
            ];
            if ($show) {
                $payload['detail'] = $e->getMessage();
            }
            echo json_encode($payload);
            exit;
        }
        return self::$pdo;
    }

    /** Cached check so public API can run before/after optional migrations (e.g. testimonials.published). */
    public static function columnExists(string $table, string $column): bool
    {
        $key = $table . '.' . $column;
        if (array_key_exists($key, self::$columnExistsCache)) {
            return self::$columnExistsCache[$key];
        }
        $stmt = self::pdo()->prepare(
            'SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $stmt->execute([$table, $column]);
        self::$columnExistsCache[$key] = (int) $stmt->fetchColumn() > 0;

        return self::$columnExistsCache[$key];
    }

    /** Clear column existence cache (e.g. after ALTER TABLE adds a column). */
    public static function forgetColumnExistsCache(?string $table = null, ?string $column = null): void
    {
        if ($table === null && $column === null) {
            self::$columnExistsCache = [];

            return;
        }
        if ($column !== null) {
            unset(self::$columnExistsCache[$table . '.' . $column]);

            return;
        }
        $prefix = $table . '.';
        foreach (array_keys(self::$columnExistsCache) as $k) {
            if (str_starts_with($k, $prefix)) {
                unset(self::$columnExistsCache[$k]);
            }
        }
    }

    /** Cached check so public API can work even if a table migration hasn't been run yet. */
    public static function tableExists(string $table): bool
    {
        if (array_key_exists($table, self::$tableExistsCache)) {
            return self::$tableExistsCache[$table];
        }
        $stmt = self::pdo()->prepare(
            'SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?'
        );
        $stmt->execute([$table]);
        self::$tableExistsCache[$table] = (int) $stmt->fetchColumn() > 0;

        return self::$tableExistsCache[$table];
    }

    public static function forgetTableExistsCache(string $table): void
    {
        unset(self::$tableExistsCache[$table]);
    }

    /**
     * Create team_members if missing (same DDL as database/migrations/008_team_members.sql).
     * Keeps admin + public team APIs working when an older DB was never migrated.
     */
    public static function ensureTeamMembersTable(): bool
    {
        if (self::tableExists('team_members')) {
            return true;
        }
        $ddl = <<<'SQL'
CREATE TABLE IF NOT EXISTS team_members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT '',
  bio TEXT,
  photo_url VARCHAR(512) DEFAULT NULL,
  linkedin_url VARCHAR(512) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
SQL;
        try {
            self::pdo()->exec($ddl);
        } catch (PDOException) {
            return false;
        }
        self::forgetTableExistsCache('team_members');

        return self::tableExists('team_members');
    }

    /** Adds blog_posts.og_image_alt when missing (see database/migrations/016_blog_og_image_alt.sql). */
    public static function ensureBlogOgImageAltColumn(): void
    {
        if (!self::tableExists('blog_posts') || self::columnExists('blog_posts', 'og_image_alt')) {
            return;
        }
        try {
            self::pdo()->exec('ALTER TABLE blog_posts ADD COLUMN og_image_alt VARCHAR(255) DEFAULT NULL AFTER og_image');
        } catch (PDOException) {
            return;
        }
        self::forgetColumnExistsCache('blog_posts', 'og_image_alt');
    }

    /** Adds services.image_url when missing (see database/migrations/015_services_image_url.sql). */
    public static function ensureServicesImageUrlColumn(): void
    {
        if (!self::tableExists('services') || self::columnExists('services', 'image_url')) {
            return;
        }
        try {
            self::pdo()->exec('ALTER TABLE services ADD COLUMN image_url VARCHAR(512) DEFAULT NULL AFTER icon');
        } catch (PDOException) {
            return;
        }
        self::forgetColumnExistsCache('services', 'image_url');
    }

    /**
     * Adds "Our Work" board fields to projects when missing.
     * Mirrors database/migrations/017_projects_work_fields.sql.
     */
    public static function ensureProjectsWorkFields(): void
    {
        if (!self::tableExists('projects')) {
            return;
        }
        $alters = [];
        if (!self::columnExists('projects', 'service_type')) {
            $alters[] = "ADD COLUMN service_type VARCHAR(16) NOT NULL DEFAULT 'web' AFTER category";
        }
        if (!self::columnExists('projects', 'status')) {
            $alters[] = "ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'completed' AFTER service_type";
        }
        if (!self::columnExists('projects', 'client_name')) {
            $alters[] = "ADD COLUMN client_name VARCHAR(255) DEFAULT '' AFTER status";
        }
        if (!self::columnExists('projects', 'tags')) {
            $alters[] = "ADD COLUMN tags VARCHAR(512) DEFAULT '' AFTER client_name";
        }
        if (!self::columnExists('projects', 'progress')) {
            $alters[] = "ADD COLUMN progress TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER tags";
        }
        if ($alters === []) {
            return;
        }
        try {
            self::pdo()->exec('ALTER TABLE projects ' . implode(', ', $alters));
        } catch (PDOException) {
            return;
        }
        self::forgetColumnExistsCache('projects');
    }

    /**
     * Adds SEO fields to projects when missing.
     * Mirrors database/migrations/018_projects_seo_fields.sql.
     */
    public static function ensureProjectsSeoFields(): void
    {
        if (!self::tableExists('projects')) {
            return;
        }
        $alters = [];
        if (!self::columnExists('projects', 'meta_title')) {
            $alters[] = "ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL";
        }
        if (!self::columnExists('projects', 'meta_description')) {
            $alters[] = "ADD COLUMN meta_description TEXT DEFAULT NULL";
        }
        if (!self::columnExists('projects', 'og_image')) {
            $alters[] = "ADD COLUMN og_image VARCHAR(512) DEFAULT NULL";
        }
        if (!self::columnExists('projects', 'og_image_alt')) {
            $alters[] = "ADD COLUMN og_image_alt VARCHAR(255) DEFAULT NULL";
        }
        if ($alters === []) {
            return;
        }
        try {
            self::pdo()->exec('ALTER TABLE projects ' . implode(', ', $alters));
        } catch (PDOException) {
            return;
        }
        self::forgetColumnExistsCache('projects');
    }

    /** Create seo_pages table if missing (see database/migrations/019_seo_pages.sql). */
    public static function ensureSeoPagesTable(): bool
    {
        if (self::tableExists('seo_pages')) {
            return true;
        }
        $ddl = <<<'SQL'
CREATE TABLE IF NOT EXISTS seo_pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL UNIQUE,
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  og_image VARCHAR(512) DEFAULT NULL,
  og_image_alt VARCHAR(255) DEFAULT NULL,
  robots VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
SQL;
        try {
            self::pdo()->exec($ddl);
        } catch (PDOException) {
            return false;
        }
        self::forgetTableExistsCache('seo_pages');

        return self::tableExists('seo_pages');
    }
}
