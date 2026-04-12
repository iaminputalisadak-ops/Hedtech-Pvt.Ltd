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
        static $cache = [];
        $key = $table . '.' . $column;
        if (array_key_exists($key, $cache)) {
            return $cache[$key];
        }
        $stmt = self::pdo()->prepare(
            'SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $stmt->execute([$table, $column]);
        $cache[$key] = (int) $stmt->fetchColumn() > 0;

        return $cache[$key];
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
}
