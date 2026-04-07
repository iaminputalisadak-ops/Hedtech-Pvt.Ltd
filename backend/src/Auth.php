<?php
declare(strict_types=1);

namespace Hedztech;

use PDO;

final class Auth
{
    public static function startSession(): void
    {
        $cfg = $GLOBALS['hedztech_config'];
        if (session_status() === PHP_SESSION_NONE) {
            session_name($cfg['session_name']);
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    public static function requireAdmin(): void
    {
        self::startSession();
        if (empty($_SESSION['admin_id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
    }

    public static function adminId(): ?int
    {
        self::startSession();
        return isset($_SESSION['admin_id']) ? (int) $_SESSION['admin_id'] : null;
    }

    public static function login(string $username, string $password): bool
    {
        $stmt = Db::pdo()->prepare('SELECT id, password_hash FROM admins WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $row = $stmt->fetch();
        if (!$row || !password_verify($password, $row['password_hash'])) {
            return false;
        }
        self::startSession();
        $_SESSION['admin_id'] = (int) $row['id'];
        return true;
    }

    public static function logout(): void
    {
        self::startSession();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
    }
}
