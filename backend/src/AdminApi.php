<?php
declare(strict_types=1);

namespace Hedztech;

use PDO;
use PDOException;

final class AdminApi
{
    private static function trimLen(string $s, int $max): string
    {
        $s = trim($s);
        if ($max <= 0) {
            return '';
        }
        if (function_exists('mb_substr')) {
            return mb_substr($s, 0, $max);
        }

        return substr($s, 0, $max);
    }

    private static function uploadsDir(): string
    {
        // backend/src -> backend/public/uploads
        return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads';
    }

    private static function publicUploadUrl(string $filename): string
    {
        // On cPanel, backend/public is deployed as public_html/api/, so files are at /api/uploads/.
        // (Returning /uploads/ would point at public_html/uploads/, which does not exist.)
        return '/api/uploads/' . rawurlencode($filename);
    }

    /**
     * Reduce dimensions of large JPEG/PNG/WebP uploads (GD). Keeps originals that are already ≤ max edge.
     * Skips GIF/SVG/ICO. Fails silently if GD cannot read the file.
     */
    private static function tryDownscaleRasterUpload(string $path, string $ext): void
    {
        $ext = strtolower($ext);
        if (!in_array($ext, ['jpg', 'png', 'webp'], true)) {
            return;
        }
        if (!function_exists('imagecreatefromstring') || !function_exists('imagecreatetruecolor')) {
            return;
        }

        $data = @file_get_contents($path);
        if ($data === false || $data === '') {
            return;
        }

        $img = @imagecreatefromstring($data);
        if ($img === false) {
            return;
        }

        $w = imagesx($img);
        $h = imagesy($img);
        if ($w < 1 || $h < 1) {
            imagedestroy($img);
            return;
        }

        $maxEdge = 1920;
        if ($w <= $maxEdge && $h <= $maxEdge) {
            imagedestroy($img);
            return;
        }

        $scale = min($maxEdge / $w, $maxEdge / $h);
        $nw = max(1, (int) round($w * $scale));
        $nh = max(1, (int) round($h * $scale));

        $dst = imagecreatetruecolor($nw, $nh);
        if ($dst === false) {
            imagedestroy($img);
            return;
        }

        if ($ext === 'png') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
            imagefilledrectangle($dst, 0, 0, $nw, $nh, $transparent);
        }

        imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($img);

        $written = match ($ext) {
            'jpg' => imagejpeg($dst, $path, 86),
            'png' => imagepng($dst, $path, 6),
            'webp' => function_exists('imagewebp') ? imagewebp($dst, $path, 82) : false,
            default => false,
        };
        imagedestroy($dst);
        if ($written !== true) {
            // Leave whatever was on disk; rare write failure.
        }
    }

    private static function extFromMime(string $mime): ?string
    {
        $mime = strtolower(trim($mime));
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/svg+xml' => 'svg',
            'image/x-icon' => 'ico',
            'image/vnd.microsoft.icon' => 'ico',
            default => null,
        };
    }

    public static function upload(): void
    {
        Auth::requireAdmin();

        if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
            Util::sendJson(['error' => 'file is required'], 400);
            return;
        }

        $f = $_FILES['file'];
        $err = (int) ($f['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($err !== UPLOAD_ERR_OK) {
            $msg = match ($err) {
                UPLOAD_ERR_INI_SIZE => 'Upload failed: file exceeds PHP upload_max_filesize',
                UPLOAD_ERR_FORM_SIZE => 'Upload failed: file exceeds form limit',
                UPLOAD_ERR_PARTIAL => 'Upload failed: file only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'Upload failed: no file received',
                UPLOAD_ERR_NO_TMP_DIR => 'Upload failed: missing temporary folder on server',
                UPLOAD_ERR_CANT_WRITE => 'Upload failed: server could not write file to disk',
                UPLOAD_ERR_EXTENSION => 'Upload failed: blocked by a PHP extension',
                default => 'Upload failed',
            };
            $code = in_array($err, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 413 : 400;
            Util::sendJson(['error' => $msg, 'upload_error_code' => $err], $code);
            return;
        }

        $size = (int) ($f['size'] ?? 0);
        if ($size <= 0) {
            Util::sendJson(['error' => 'Empty upload'], 400);
            return;
        }
        // Keep reasonable limits for cPanel shared hosting.
        if ($size > 12 * 1024 * 1024) {
            Util::sendJson(['error' => 'File too large (max 12MB)'], 413);
            return;
        }

        $tmp = (string) ($f['tmp_name'] ?? '');
        if ($tmp === '' || !is_uploaded_file($tmp)) {
            Util::sendJson(['error' => 'Invalid upload'], 400);
            return;
        }

        $mime = (string) ($f['type'] ?? '');
        // For better accuracy (esp. when browser lies), use finfo when available.
        if (class_exists('finfo')) {
            try {
                $fi = new \finfo(FILEINFO_MIME_TYPE);
                $m = $fi->file($tmp);
                if (is_string($m) && $m !== '') {
                    $mime = $m;
                }
            } catch (\Throwable) {
                // ignore
            }
        }

        $ext = self::extFromMime($mime);
        if ($ext === null) {
            Util::sendJson(['error' => 'Unsupported file type'], 415);
            return;
        }

        $dir = self::uploadsDir();
        if (!is_dir($dir) && !mkdir($dir, 0775, true)) {
            Util::sendJson(['error' => 'Could not create uploads directory'], 500);
            return;
        }

        $prefix = Util::slugify((string) ($_POST['kind'] ?? 'asset'));
        $rand = bin2hex(random_bytes(6));
        $name = $prefix . '-' . gmdate('Ymd-His') . '-' . $rand . '.' . $ext;
        $dest = $dir . DIRECTORY_SEPARATOR . $name;

        if (!move_uploaded_file($tmp, $dest)) {
            Util::sendJson(['error' => 'Could not save upload'], 500);
            return;
        }

        self::tryDownscaleRasterUpload($dest, $ext);
        clearstatcache(true, $dest);
        $finalSize = filesize($dest);
        Util::sendJson([
            'ok' => true,
            'url' => self::publicUploadUrl($name),
            'mime' => $mime,
            'bytes' => $finalSize !== false ? $finalSize : $size,
        ]);
    }

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
        Db::ensureServicesImageUrlColumn();
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
            $stmt = $pdo->prepare('INSERT INTO services (title, description, icon, image_url, sort_order) VALUES (?,?,?,?,?)');
            $stmt->execute([
                $title,
                (string) ($b['description'] ?? ''),
                (string) ($b['icon'] ?? 'code'),
                trim((string) ($b['image_url'] ?? '')) !== '' ? trim((string) $b['image_url']) : null,
                (int) ($b['sort_order'] ?? 0),
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $img = trim((string) ($b['image_url'] ?? ''));
            $stmt = $pdo->prepare('UPDATE services SET title=?, description=?, icon=?, image_url=?, sort_order=? WHERE id=?');
            $stmt->execute([
                (string) ($b['title'] ?? ''),
                (string) ($b['description'] ?? ''),
                (string) ($b['icon'] ?? 'code'),
                $img !== '' ? $img : null,
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
        if ($method === 'GET' && $id === null) {
            $order = $hasSort ? 'ORDER BY sort_order ASC, id ASC' : 'ORDER BY created_at DESC';
            $stmt = $pdo->query('SELECT * FROM projects ' . $order);
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
            $fit = strtolower(trim((string) ($b['image_fit'] ?? 'contain')));
            $fit = $fit === 'cover' ? 'cover' : 'contain';
            $live = isset($b['live_url']) ? trim((string) $b['live_url']) : '';
            $svc = strtolower(trim((string) ($b['service_type'] ?? ($b['category'] ?? 'web'))));
            $svc = in_array($svc, ['web', 'seo', 'marketing', 'design'], true) ? $svc : 'web';
            $status = strtolower(trim((string) ($b['status'] ?? 'completed')));
            $status = in_array($status, ['completed', 'ongoing'], true) ? $status : 'completed';
            $client = isset($b['client_name']) ? trim((string) $b['client_name']) : '';
            $tags = isset($b['tags']) ? trim((string) $b['tags']) : '';
            $progress = (int) ($b['progress'] ?? 0);
            $progress = max(0, min(100, $progress));
            $metaTitle = isset($b['meta_title']) ? trim((string) $b['meta_title']) : '';
            $metaDesc = isset($b['meta_description']) ? trim((string) $b['meta_description']) : '';
            $og = isset($b['og_image']) ? trim((string) $b['og_image']) : '';
            $ogAlt = isset($b['og_image_alt']) ? trim((string) $b['og_image_alt']) : '';
            $nextSort = $hasSort
                ? (int) $pdo->query('SELECT COALESCE(MAX(sort_order), -1) + 1 FROM projects')->fetchColumn()
                : 0;
            $cols = ['title', 'slug', 'excerpt', 'body', 'category'];
            $vals = [
                $title,
                $slug,
                (string) ($b['excerpt'] ?? ''),
                (string) ($b['body'] ?? ''),
                (string) ($b['category'] ?? 'web'),
            ];
            if ($hasSvc) {
                $cols[] = 'service_type';
                $vals[] = $svc;
            }
            if ($hasStatus) {
                $cols[] = 'status';
                $vals[] = $status;
            }
            if ($hasClient) {
                $cols[] = 'client_name';
                $vals[] = $client;
            }
            if ($hasTags) {
                $cols[] = 'tags';
                $vals[] = $tags;
            }
            if ($hasProgress) {
                $cols[] = 'progress';
                $vals[] = $progress;
            }
            if ($hasMetaTitle) {
                $cols[] = 'meta_title';
                $vals[] = $metaTitle !== '' ? $metaTitle : null;
            }
            if ($hasMetaDesc) {
                $cols[] = 'meta_description';
                $vals[] = $metaDesc !== '' ? $metaDesc : null;
            }
            if ($hasOg) {
                $cols[] = 'og_image';
                $vals[] = $og !== '' ? $og : null;
            }
            if ($hasOgAlt) {
                $cols[] = 'og_image_alt';
                $vals[] = $ogAlt !== '' ? $ogAlt : null;
            }
            $cols[] = 'image_url';
            $vals[] = $img !== '' ? $img : null;
            if ($hasFit) {
                $cols[] = 'image_fit';
                $vals[] = $fit;
            }
            $cols[] = 'featured';
            $vals[] = !empty($b['featured']) ? 1 : 0;
            if ($hasSort) {
                $cols[] = 'sort_order';
                $vals[] = $nextSort;
            }
            $cols[] = 'live_url';
            $vals[] = $live !== '' ? $live : null;
            $placeholders = implode(',', array_fill(0, count($cols), '?'));
            $stmt = $pdo->prepare('INSERT INTO projects (' . implode(',', $cols) . ') VALUES (' . $placeholders . ')');
            $stmt->execute($vals);
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
            $fit = strtolower(trim((string) ($b['image_fit'] ?? 'contain')));
            $fit = $fit === 'cover' ? 'cover' : 'contain';
            $live = isset($b['live_url']) ? trim((string) $b['live_url']) : '';
            $sortOrder = (int) ($b['sort_order'] ?? 0);
            $svc = strtolower(trim((string) ($b['service_type'] ?? ($b['category'] ?? 'web'))));
            $svc = in_array($svc, ['web', 'seo', 'marketing', 'design'], true) ? $svc : 'web';
            $status = strtolower(trim((string) ($b['status'] ?? 'completed')));
            $status = in_array($status, ['completed', 'ongoing'], true) ? $status : 'completed';
            $client = isset($b['client_name']) ? trim((string) $b['client_name']) : '';
            $tags = isset($b['tags']) ? trim((string) $b['tags']) : '';
            $progress = (int) ($b['progress'] ?? 0);
            $progress = max(0, min(100, $progress));
            $metaTitle = isset($b['meta_title']) ? trim((string) $b['meta_title']) : '';
            $metaDesc = isset($b['meta_description']) ? trim((string) $b['meta_description']) : '';
            $og = isset($b['og_image']) ? trim((string) $b['og_image']) : '';
            $ogAlt = isset($b['og_image_alt']) ? trim((string) $b['og_image_alt']) : '';

            $sets = ['title=?', 'slug=?', 'excerpt=?', 'body=?', 'category=?'];
            $vals = [
                (string) ($b['title'] ?? ''),
                $slug,
                (string) ($b['excerpt'] ?? ''),
                (string) ($b['body'] ?? ''),
                (string) ($b['category'] ?? 'web'),
            ];
            if ($hasSvc) {
                $sets[] = 'service_type=?';
                $vals[] = $svc;
            }
            if ($hasStatus) {
                $sets[] = 'status=?';
                $vals[] = $status;
            }
            if ($hasClient) {
                $sets[] = 'client_name=?';
                $vals[] = $client;
            }
            if ($hasTags) {
                $sets[] = 'tags=?';
                $vals[] = $tags;
            }
            if ($hasProgress) {
                $sets[] = 'progress=?';
                $vals[] = $progress;
            }
            if ($hasMetaTitle) {
                $sets[] = 'meta_title=?';
                $vals[] = $metaTitle !== '' ? $metaTitle : null;
            }
            if ($hasMetaDesc) {
                $sets[] = 'meta_description=?';
                $vals[] = $metaDesc !== '' ? $metaDesc : null;
            }
            if ($hasOg) {
                $sets[] = 'og_image=?';
                $vals[] = $og !== '' ? $og : null;
            }
            if ($hasOgAlt) {
                $sets[] = 'og_image_alt=?';
                $vals[] = $ogAlt !== '' ? $ogAlt : null;
            }
            $sets[] = 'image_url=?';
            $vals[] = $img !== '' ? $img : null;
            if ($hasFit) {
                $sets[] = 'image_fit=?';
                $vals[] = $fit;
            }
            $sets[] = 'featured=?';
            $vals[] = !empty($b['featured']) ? 1 : 0;
            if ($hasSort) {
                $sets[] = 'sort_order=?';
                $vals[] = $sortOrder;
            }
            $sets[] = 'live_url=?';
            $vals[] = $live !== '' ? $live : null;
            $vals[] = (int) $id;
            $pdo->prepare('UPDATE projects SET ' . implode(', ', $sets) . ' WHERE id=?')->execute($vals);
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
        Db::ensureBlogOgImageAltColumn();
        $pdo = Db::pdo();
        // Support older DBs by only touching existing columns.
        $hasExcerpt = Db::columnExists('blog_posts', 'excerpt');
        $hasBody = Db::columnExists('blog_posts', 'body');
        $hasCategory = Db::columnExists('blog_posts', 'category');
        $hasTags = Db::columnExists('blog_posts', 'tags');
        $hasMetaTitle = Db::columnExists('blog_posts', 'meta_title');
        $hasMetaDesc = Db::columnExists('blog_posts', 'meta_description');
        $hasOg = Db::columnExists('blog_posts', 'og_image');
        $hasOgAlt = Db::columnExists('blog_posts', 'og_image_alt');
        $hasPublished = Db::columnExists('blog_posts', 'published');
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM blog_posts ORDER BY created_at DESC');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $title = self::trimLen((string) ($b['title'] ?? ''), 255);
            if ($title === '') {
                Util::sendJson(['error' => 'title required'], 400);
                return;
            }
            $slugIn = trim((string) ($b['slug'] ?? ''));
            $slugBase = $slugIn !== '' ? Util::slugify($slugIn) : Util::slugify($title);
            if ($slugBase === '') {
                $slugBase = 'post';
            }
            // Keep room for suffixes: "-20" etc.
            $slugBase = self::trimLen($slugBase, 240);
            $og = self::trimLen((string) ($b['og_image'] ?? ''), 512);
            $ogAlt = self::trimLen((string) ($b['og_image_alt'] ?? ''), 255);
            $category = self::trimLen((string) ($b['category'] ?? 'news'), 64) ?: 'news';
            $tags = self::trimLen((string) ($b['tags'] ?? ''), 512);
            $metaTitle = self::trimLen((string) ($b['meta_title'] ?? ''), 255);

            $cols = ['title', 'slug'];
            if ($hasExcerpt) $cols[] = 'excerpt';
            if ($hasBody) $cols[] = 'body';
            if ($hasCategory) $cols[] = 'category';
            if ($hasTags) $cols[] = 'tags';
            if ($hasMetaTitle) $cols[] = 'meta_title';
            if ($hasMetaDesc) $cols[] = 'meta_description';
            if ($hasOg) $cols[] = 'og_image';
            if ($hasOgAlt) $cols[] = 'og_image_alt';
            if ($hasPublished) $cols[] = 'published';
            $placeholders = implode(',', array_fill(0, count($cols), '?'));
            $stmt = $pdo->prepare('INSERT INTO blog_posts (' . implode(',', $cols) . ') VALUES (' . $placeholders . ')');

            $slug = $slugBase;
            $lastErr = null;
            $lastErrMsg = '';
            for ($i = 0; $i < 20; $i++) {
                $slug = $i === 0 ? $slugBase : ($slugBase . '-' . ($i + 1));
                try {
                    $vals = [$title, $slug];
                    if ($hasExcerpt) $vals[] = (string) ($b['excerpt'] ?? '');
                    if ($hasBody) $vals[] = (string) ($b['body'] ?? '');
                    if ($hasCategory) $vals[] = $category;
                    if ($hasTags) $vals[] = $tags;
                    if ($hasMetaTitle) $vals[] = $metaTitle;
                    if ($hasMetaDesc) $vals[] = (string) ($b['meta_description'] ?? '');
                    if ($hasOg) $vals[] = $og !== '' ? $og : null;
                    if ($hasOgAlt) $vals[] = $ogAlt !== '' ? $ogAlt : null;
                    if ($hasPublished) $vals[] = !empty($b['published']) ? 1 : 0;
                    $stmt->execute($vals);
                    Util::sendJson(['id' => (int) $pdo->lastInsertId(), 'slug' => $slug]);
                    return;
                } catch (PDOException $e) {
                    $lastErr = $e;
                    $lastErrMsg = $e->getMessage();
                    // Duplicate entry (unique slug) → try next suffix.
                    if ($e->getCode() === '23000') {
                        continue;
                    }
                    break;
                } catch (\Throwable $e) {
                    $lastErrMsg = $e->getMessage();
                    break;
                }
            }

            if ($lastErr && $lastErr->getCode() === '23000') {
                Util::sendJson(['error' => 'Slug already exists. Try a different slug.'], 409);
                return;
            }
            Util::sendJson(
                ['error' => 'Could not create blog post'] + ($lastErrMsg !== '' ? ['detail' => $lastErrMsg] : []),
                500
            );
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $slugIn = trim((string) ($b['slug'] ?? ''));
            $slug = $slugIn !== '' ? Util::slugify($slugIn) : Util::slugify((string) ($b['title'] ?? 'post'));
            if ($slug === '') {
                $slug = 'post';
            }
            $slug = self::trimLen($slug, 255);
            $og = self::trimLen((string) ($b['og_image'] ?? ''), 512);
            $ogAlt = self::trimLen((string) ($b['og_image_alt'] ?? ''), 255);
            $title = self::trimLen((string) ($b['title'] ?? ''), 255);
            $category = self::trimLen((string) ($b['category'] ?? 'news'), 64) ?: 'news';
            $tags = self::trimLen((string) ($b['tags'] ?? ''), 512);
            $metaTitle = self::trimLen((string) ($b['meta_title'] ?? ''), 255);
            try {
                $sets = ['title=?', 'slug=?', 'excerpt=?', 'body=?', 'category=?', 'tags=?', 'meta_title=?', 'meta_description=?'];
                $vals = [
                    $title,
                    $slug,
                    (string) ($b['excerpt'] ?? ''),
                    (string) ($b['body'] ?? ''),
                    $category,
                    $tags,
                    $metaTitle,
                    (string) ($b['meta_description'] ?? ''),
                ];
                if ($hasOg) {
                    $sets[] = 'og_image=?';
                    $vals[] = $og !== '' ? $og : null;
                }
                if ($hasOgAlt) {
                    $sets[] = 'og_image_alt=?';
                    $vals[] = $ogAlt !== '' ? $ogAlt : null;
                }
                $sets[] = 'published=?';
                $vals[] = !empty($b['published']) ? 1 : 0;
                $vals[] = (int) $id;
                $pdo->prepare('UPDATE blog_posts SET ' . implode(', ', $sets) . ' WHERE id=?')->execute($vals);
                Util::sendJson(['ok' => true]);
            } catch (PDOException $e) {
                if ($e->getCode() === '23000') {
                    Util::sendJson(['error' => 'Slug already exists. Choose a unique slug.'], 409);
                    return;
                }
                Util::sendJson(
                    ['error' => 'Could not update blog post', 'detail' => $e->getMessage()],
                    500
                );
            }
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

    public static function crudTeam(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        $pdo = Db::pdo();
        if (!Db::ensureTeamMembersTable()) {
            Util::sendJson(
                [
                    'error' => 'Could not create team_members table. Import database/migrations/008_team_members.sql or full database/schema.sql using a MySQL user with CREATE privileges.',
                ],
                503
            );
            return;
        }
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM team_members ORDER BY sort_order, id');
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
            $photo = isset($b['photo_url']) ? trim((string) $b['photo_url']) : '';
            $li = isset($b['linkedin_url']) ? trim((string) $b['linkedin_url']) : '';
            $stmt = $pdo->prepare(
                'INSERT INTO team_members (name, role, bio, photo_url, linkedin_url, sort_order, published) VALUES (?,?,?,?,?,?,?)'
            );
            $stmt->execute([
                $name,
                (string) ($b['role'] ?? ''),
                (string) ($b['bio'] ?? ''),
                $photo !== '' ? $photo : null,
                $li !== '' ? $li : null,
                (int) ($b['sort_order'] ?? 0),
                isset($b['published']) && (int) $b['published'] === 0 ? 0 : 1,
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $photo = isset($b['photo_url']) ? trim((string) $b['photo_url']) : '';
            $li = isset($b['linkedin_url']) ? trim((string) $b['linkedin_url']) : '';
            $pdo->prepare(
                'UPDATE team_members SET name=?, role=?, bio=?, photo_url=?, linkedin_url=?, sort_order=?, published=? WHERE id=?'
            )->execute([
                (string) ($b['name'] ?? ''),
                (string) ($b['role'] ?? ''),
                (string) ($b['bio'] ?? ''),
                $photo !== '' ? $photo : null,
                $li !== '' ? $li : null,
                (int) ($b['sort_order'] ?? 0),
                isset($b['published']) && (int) $b['published'] === 0 ? 0 : 1,
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM team_members WHERE id=?')->execute([(int) $id]);
            Util::sendJson(['ok' => true]);
            return;
        }
        Util::sendJson(['error' => 'Method not allowed'], 405);
    }

    public static function crudSeoPages(string $method, ?string $id): void
    {
        Auth::requireAdmin();
        if (!Db::ensureSeoPagesTable()) {
            Util::sendJson(
                ['error' => 'Could not create seo_pages table. Import database/migrations/019_seo_pages.sql using a MySQL user with CREATE privileges.'],
                503,
            );
            return;
        }
        $pdo = Db::pdo();
        if ($method === 'GET' && $id === null) {
            $stmt = $pdo->query('SELECT * FROM seo_pages ORDER BY path ASC, id ASC');
            Util::sendJson(['items' => $stmt->fetchAll()]);
            return;
        }
        if ($method === 'POST' && $id === null) {
            $b = Util::jsonInput();
            $path = trim((string) ($b['path'] ?? ''));
            if ($path === '' || $path[0] !== '/') {
                Util::sendJson(['error' => 'path required (must start with /)'], 400);
                return;
            }
            $stmt = $pdo->prepare(
                'INSERT INTO seo_pages (path, meta_title, meta_description, og_image, og_image_alt, robots) VALUES (?,?,?,?,?,?)'
            );
            $stmt->execute([
                $path,
                trim((string) ($b['meta_title'] ?? '')) !== '' ? trim((string) $b['meta_title']) : null,
                trim((string) ($b['meta_description'] ?? '')) !== '' ? trim((string) $b['meta_description']) : null,
                trim((string) ($b['og_image'] ?? '')) !== '' ? trim((string) $b['og_image']) : null,
                trim((string) ($b['og_image_alt'] ?? '')) !== '' ? trim((string) $b['og_image_alt']) : null,
                trim((string) ($b['robots'] ?? '')) !== '' ? trim((string) $b['robots']) : null,
            ]);
            Util::sendJson(['id' => (int) $pdo->lastInsertId()]);
            return;
        }
        if ($method === 'PUT' && $id !== null) {
            $b = Util::jsonInput();
            $path = trim((string) ($b['path'] ?? ''));
            if ($path === '' || $path[0] !== '/') {
                Util::sendJson(['error' => 'path required (must start with /)'], 400);
                return;
            }
            $pdo->prepare(
                'UPDATE seo_pages SET path=?, meta_title=?, meta_description=?, og_image=?, og_image_alt=?, robots=? WHERE id=?'
            )->execute([
                $path,
                trim((string) ($b['meta_title'] ?? '')) !== '' ? trim((string) $b['meta_title']) : null,
                trim((string) ($b['meta_description'] ?? '')) !== '' ? trim((string) $b['meta_description']) : null,
                trim((string) ($b['og_image'] ?? '')) !== '' ? trim((string) $b['og_image']) : null,
                trim((string) ($b['og_image_alt'] ?? '')) !== '' ? trim((string) $b['og_image_alt']) : null,
                trim((string) ($b['robots'] ?? '')) !== '' ? trim((string) $b['robots']) : null,
                (int) $id,
            ]);
            Util::sendJson(['ok' => true]);
            return;
        }
        if ($method === 'DELETE' && $id !== null) {
            $pdo->prepare('DELETE FROM seo_pages WHERE id=?')->execute([(int) $id]);
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
