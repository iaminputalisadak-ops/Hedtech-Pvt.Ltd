<?php
/**
 * Temporary database connection check for cPanel / production.
 *
 * Upload with your site (same folder as config.php and bootstrap.php), then open in a browser:
 *   https://yourdomain.com/db_connection_check.php
 *
 * SECURITY: Delete this file from public_html after you confirm the connection — do not leave it on a live site.
 */
declare(strict_types=1);

$root = __DIR__;
if (!is_readable($root . '/config.php') || !is_readable($root . '/bootstrap.php')) {
    header('Content-Type: text/plain; charset=utf-8');
    http_response_code(500);
    echo "Missing config.php or bootstrap.php next to this file. Place db_connection_check.php in public_html (document root).\n";
    exit;
}

require $root . '/bootstrap.php';

use Hedztech\Db;

$cfg = $GLOBALS['hedztech_config'];
$db = $cfg['db'];
$showPdoMessage = ($cfg['db_show_error'] ?? false) === true;
$probe = Db::probe();
$wantJson = isset($_GET['format']) && $_GET['format'] === 'json';

if ($wantJson) {
    header('Content-Type: application/json; charset=utf-8');
    $payload = [
        'ok' => $probe['ok'],
        'database' => (string) $db['name'],
        'host' => (string) $db['host'],
        'port' => (int) $db['port'],
        'user' => (string) $db['user'],
        'using_socket' => trim((string) ($db['socket'] ?? '')) !== '',
    ];
    if ($probe['ok']) {
        try {
            $payload['mysql_version'] = (string) Db::pdo()->query('SELECT VERSION()')->fetchColumn();
        } catch (Throwable $e) {
            $payload['mysql_version'] = null;
        }
    } else {
        $payload['error'] = $showPdoMessage ? ($probe['message'] ?? 'Connection failed') : 'Connection failed (set db_show_error in config.php temporarily for details).';
    }
    http_response_code($probe['ok'] ? 200 : 503);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
http_response_code($probe['ok'] ? 200 : 503);
$title = $probe['ok'] ? 'Database connected' : 'Database connection failed';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    .ok { color: #0a6; }
    .fail { color: #c22; }
    .box { border: 1px solid #ccc; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1rem; background: #fafafa; }
    code { background: #eee; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
    .warn { background: #fff8e6; border-color: #e6c200; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1.25rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1 class="<?= $probe['ok'] ? 'ok' : 'fail' ?>"><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>

  <div class="box">
    <p><strong>Config</strong> (password is never shown):</p>
    <ul>
      <li>Host: <code><?= htmlspecialchars((string) $db['host'], ENT_QUOTES, 'UTF-8') ?></code></li>
      <li>Port: <code><?= (int) $db['port'] ?></code></li>
      <li>Database: <code><?= htmlspecialchars((string) $db['name'], ENT_QUOTES, 'UTF-8') ?></code></li>
      <li>User: <code><?= htmlspecialchars((string) $db['user'], ENT_QUOTES, 'UTF-8') ?></code></li>
      <?php if (trim((string) ($db['socket'] ?? '')) !== '') { ?>
        <li>Socket: <code><?= htmlspecialchars((string) $db['socket'], ENT_QUOTES, 'UTF-8') ?></code></li>
      <?php } ?>
    </ul>
    <?php if ($probe['ok']) {
        $ver = '';
        try {
            $ver = (string) Db::pdo()->query('SELECT VERSION()')->fetchColumn();
        } catch (Throwable $e) {
            $ver = '(could not read version)';
        }
    ?>
      <p class="ok"><strong>MySQL version:</strong> <?= htmlspecialchars($ver, ENT_QUOTES, 'UTF-8') ?></p>
    <?php } else { ?>
      <p class="fail"><strong>Error:</strong>
        <?= $showPdoMessage
            ? htmlspecialchars((string) ($probe['message'] ?? 'Unknown'), ENT_QUOTES, 'UTF-8')
            : 'Enable <code>db_show_error</code> in <code>config.php</code> temporarily to see the exact PDO message, or check cPanel → MySQL® Databases (user attached to DB with ALL PRIVILEGES, correct password, try <code>127.0.0.1</code> as host).' ?>
      </p>
    <?php } ?>
  </div>

  <p style="margin-top:1rem;"><a href="?format=json">JSON</a> (same checks; handy for copy/paste)</p>

  <div class="warn">
    <strong>Security:</strong> Delete <code>db_connection_check.php</code> from the server after you finish testing.
  </div>
</body>
</html>
