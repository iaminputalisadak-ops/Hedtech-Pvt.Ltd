# Deploy Hedztech to cPanel (public_html)

**Want Cursor connected to cPanel + database (no manual zip)?** Read **[CURSOR_CPANEL.md](../CURSOR_CPANEL.md)** (Remote SSH, FTP/SFTP, MySQL tunnel + SQLTools).

## One folder on your PC (recommended)

From the **project root** (where `package.json`, `frontend/`, and `backend/` are):

```bash
npm run pack:cpanel
```

That runs the frontend build and fills **`deploy/cpanel/out/`** with the same layout as **`public_html`** (SPA + `api/` + `bootstrap.php` + `src/` + `config.php` + `database/schema.sql` for import). Open **`deploy/cpanel/out/README_UPLOAD.txt`**, then upload **everything inside `out/`** to **`public_html`** in cPanel File Manager or FTP.

---

## One command: build + upload everything (FTP / FTPS)

Use this when you want **every deploy** to be: pack the site, then push **`deploy/cpanel/out/`** to your hosting (same files as a manual zip upload).

1. **One-time:** copy **`deploy.env.example`** → **`deploy.env`** in the project root (or run **`npm run deploy:init`**).
2. Edit **`deploy.env`**: set **`HEDZTECH_FTP_HOST`**, **`HEDZTECH_FTP_USER`**, **`HEDZTECH_FTP_PASS`**, and **`HEDZTECH_FTP_REMOTE`** to the **absolute path of your site document root** (usually **`public_html`** for the main domain — check cPanel **FTP Accounts** for the path that FTP opens into).
3. From the project root run:
   ```bash
   npm install
   npm run deploy:cpanel
   ```
   That runs **`pack:cpanel`**, then uploads the **contents** of **`deploy/cpanel/out/`** into **`HEDZTECH_FTP_REMOTE`**.
4. **Re-deploy after edits:** run **`npm run deploy:cpanel`** again (or **`npm run deploy:upload`** if you already ran **`pack:cpanel`** and only want to upload).
5. **`deploy.env`** is **gitignored** — do not commit passwords.

If FTPS fails with a TLS error, try **`HEDZTECH_FTP_SECURE=false`** (plain FTP — only if your host requires it). For verbose FTP logs: **`set HEDZTECH_FTP_DEBUG=1`** (Windows) or **`HEDZTECH_FTP_DEBUG=1 npm run deploy:upload`** (Unix).

---

## GitHub → cPanel auto-deploy (no manual upload)

If you want “push to GitHub = deploy live”, this repo includes a GitHub Actions workflow:

- `.github/workflows/deploy-cpanel.yml`

### Setup

1. In GitHub → **Settings → Secrets and variables → Actions**, add these **Repository secrets**:
   - `HEDZTECH_FTP_HOST` (e.g. `ftp.hedztech.com` or your server IP)
   - `HEDZTECH_FTP_PORT` (usually `21`)
   - `HEDZTECH_FTP_USER`
   - `HEDZTECH_FTP_PASS`
   - `HEDZTECH_FTP_REMOTE` (usually `/home/CPANEL_USERNAME/public_html`)
   - `HEDZTECH_FTP_SECURE` (`true` for FTPS on port 21; `false` for plain FTP if your host requires it)
2. Push to the `main` branch.

The workflow runs `npm run pack:cpanel` and uploads `deploy/cpanel/out/` into your `public_html`.

---

## SFTP: save locally → sync to cPanel (Cursor / VS Code)

Use the **SFTP** extension (recommended: **Natizyskunk** — workspace may prompt to install it from `.vscode/extensions.json`).

1. **One-time setup**
   - Run **`npm run sftp:init`** (copies **`.vscode/sftp.json.example`** → **`.vscode/sftp.json`**) or copy that file manually.
   - Edit **`sftp.json`**: set **`host`**, **`username`**, **`password`** (or use **`privateKeyPath`** and remove **`password`** — see [Natizyskunk SFTP](https://github.com/Natizyskunk/vscode-sftp)).
   - Set **`remotePath`** to your real **`public_html`** path. In cPanel it is often **`/home/CPANEL_USERNAME/public_html`** (check **FTP Accounts** or **SSH** page for the exact home path).
2. **Why `"context": "deploy/cpanel/out"`**  
   Uploads are scoped to the **pack output** folder so only the built site (not `node_modules` or the whole repo) maps to **`public_html`**.
3. **Workflow**
   - Run **`npm run pack:cpanel`** when you change code (refreshes **`deploy/cpanel/out/`**).
   - With **`uploadOnSave`: true** and watcher **`autoUpload`: true**, saving files under **`deploy/cpanel/out/`** uploads to the server. You can set **`uploadOnSave`** / **`autoUpload`** to **`false`** and use the command palette **“SFTP: Upload Folder”** on **`deploy/cpanel/out`** for manual deploys.
4. **Security**  
   **`.vscode/sftp.json`** is listed in **`.gitignore`** so passwords are not committed. Keep secrets only in **`sftp.json`** on your machine.

---

This guide produces a **single document root** (`public_html`) that serves:

- The **React** site (`index.html`, `assets/`, …)
- The **PHP API** at `/api/…` (same origin as the site — no CORS pain when origins match)

### Uploading only `dist/` is not enough

`npm run build` produces **only the frontend**. You must **also** upload the **PHP backend** (below), or the site will have no **`/api`** and content will not load.

| Source on your computer | Upload to `public_html` |
|---------------------------|-------------------------|
| Everything **inside** `frontend/dist/` | **Root** (`index.html`, `assets/`, `.htaccess`, …) |
| If **`.htaccess` is missing** after upload (FTP often hides dotfiles), use **`CPANEL-public_html-RENAME-TO-dothtaccess.txt`** from the same `dist/` folder: rename it to **`.htaccess`** in `public_html`. Put **`CPANEL-api-folder-RENAME-TO-dothtaccess.txt`** into **`public_html/api/`** and rename to **`.htaccess`** there too. (Those two `.txt` files are created automatically every time you run `npm run build` in `frontend/`.) |
| Everything **inside** `backend/public/` | Folder **`api/`** (so you get `public_html/api/index.php`, …) |
| `backend/bootstrap.php` | **Root** `bootstrap.php` |
| Folder `backend/src/` | **`src/`** |
| `backend/config.php` | **Root** `config.php` (loads `config.sample.php`; optional **`config.local.php`** on the server for cPanel MySQL — see Step 2) |
| **`backend/config.sample.php`** (do not skip) | **Root** `config.sample.php` — `config.php` **requires** this file |

SEO is covered by:

- **`robots.txt`** (uploaded with the frontend build) — allows indexing, blocks `/admin`, points crawlers to `https://hedztech.com/sitemap.xml`
- **`/sitemap.xml`** — rewritten to **`/api/public/sitemap.xml`**, which PHP generates (static pages + published blog posts + portfolio slugs)
- **`index.html`** defaults + per-route **`<Seo />`** (React Helmet: title, description, canonical, Open Graph, Twitter)
- **JSON-LD** from `StructuredData.jsx` / `ArticleStructuredData.jsx` when `canonical_base` is set

---

## Server requirements

- **PHP** 8.1+ (8.2+ recommended) with extensions: **pdo_mysql**, **json**, **session**, **fileinfo** (uploads). **gd** (recommended) lets the admin uploader shrink very large JPEG/PNG/WebP files so pages load faster.
- **MySQL** 5.7+ / MariaDB 10.3+
- **Apache** with **mod_rewrite** enabled (standard on cPanel)

---

## Target folder layout (everything under `public_html`)

After you finish, **`public_html`** should look like this:

```text
public_html/
├── .htaccess              ← from frontend build (SPA + security + sitemap rewrite)
├── index.html             ← Vite build
├── assets/                ← Vite build (hashed JS/CSS)
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── bootstrap.php          ← from repo `backend/bootstrap.php`
├── config.php             ← from repo `backend/config.php`
├── config.local.php       ← optional, **create only on the server** (cPanel DB user/pass — gitignored; see `backend/config.local.php.example`)
├── config.sample.php      ← from repo `backend/config.sample.php` (required: `config.php` loads this file)
├── src/                   ← from repo `backend/src/` (PHP application code)
├── database/              ← optional on server (for reference / manual imports only)
└── api/                   ← contents of repo `backend/public/`
    ├── .htaccess
    ├── index.php
    ├── router.php
    └── uploads/           ← writable; store uploaded media here
```

**Important:** `backend/public/index.php` contains:

```php
require dirname(__DIR__) . '/bootstrap.php';
```

So **`bootstrap.php` must live one directory above `api/`**. That is exactly the layout above (`public_html/bootstrap.php` + `public_html/api/index.php`).

---

## Step 1 — MySQL database

1. In cPanel → **MySQL® Databases**, create a database and a user; attach the user with **ALL PRIVILEGES**.
2. Open **phpMyAdmin** → select the database → **Import** → choose `database/schema.sql` from this repo.
3. If your repo has extra files under `database/migrations/`, import those **in filename order** after the schema (optional but recommended for new toggles/columns).

### Example: Hedztech cPanel MySQL

If cPanel assigned the same name for the database and the MySQL user (common), use:

| Field | Value |
|--------|--------|
| **Host** | `localhost` (on cPanel the app and MySQL run on the same server) |
| **Database name** | `hedztech_hedzdb` |
| **MySQL user** | `hedztech_hedzdb` |
| **Password** | The password you set for that user in **MySQL® Databases** (not shown here) |

In **phpMyAdmin**, confirm the database selected in the left sidebar is **`hedztech_hedzdb`** before importing `schema.sql`.

---

## Step 2 — Backend config (`config.php` + optional `config.local.php`)

The repo **`backend/config.php`** loads **`config.sample.php`** (defaults: **`hedztech`** database, **`root`**, empty password — good for local XAMPP), then merges **`config.local.php`** if that file exists **in the same folder** (`public_html` on the server).

**On cPanel (production):**

1. Upload **`config.php`** and **`config.sample.php`** from each pack (or keep the server copy if unchanged).
2. In **File Manager**, create **`public_html/config.local.php`** once (not in git). Copy **`backend/config.local.php.example`** from the repo as a template and set **`db.name`**, **`db.user`**, **`db.pass`**, and **`canonical_base`** to match your host (see **MySQL® Databases** in cPanel for the exact DB and user names — often both look like **`hedztech_hedzdb`** with your account prefix).
3. **`config.local.php` is gitignored** — it is **not** overwritten when you run **`npm run deploy:cpanel`** as long as your FTP client merges uploads and does not delete unknown remote files. If a deploy ever removes it, re-create **`config.local.php`** on the server.

**Alternative:** set **`HEDZTECH_DB_*`** and **`HEDZTECH_CANONICAL_BASE`** environment variables for PHP if your host supports that (see keys in **`backend/config.sample.php`**).

**Local development:** do **not** add **`config.local.php`** unless you need overrides; import **`database/schema.sql`** into MySQL and use the sample defaults (**`hedztech`** / **`root`** / empty password).

---

## Step 3 — Upload the PHP backend

From the repo, upload to **`public_html`**:

| Source in repo        | Destination on server   |
|-----------------------|-------------------------|
| `backend/bootstrap.php` | `public_html/bootstrap.php` |
| `backend/src/` (entire folder) | `public_html/src/` |
| `backend/public/` (all files & folders) | `public_html/api/` |

So **`backend/public/index.php`** becomes **`public_html/api/index.php`**, etc.

Create **`public_html/api/uploads/`** if it does not exist, and set permissions to **0755** (or **0775** if the group must write). The PHP uploader must be able to write here.

---

## Step 4 — Build and upload the frontend

On your machine:

```bash
cd frontend
npm ci
npm run build
```

Upload **everything inside** `frontend/dist/` into **`public_html/`**, **merging** with the PHP files you already placed:

- Overwrite **`index.html`**, **`assets/`**, **`.htaccess`**, **`robots.txt`**, **`favicon.svg`**, **`site.webmanifest`**, etc.
- **Do not delete** `public_html/api/`, `bootstrap.php`, `config.php`, or `src/`.

---

## Step 5 — Inside the app after first login

1. Open **`https://hedztech.com/admin/login`** (default seed user is often **`admin`** / **`password`** — **change this immediately**).
2. In **Admin → Settings**, confirm **`canonical_base`** is `https://hedztech.com` (or your real domain). This powers canonical tags, Open Graph URLs, and the dynamic sitemap.
3. Re-save settings if you adjust **meta title**, **meta description**, or **OG image**.

---

## Step 6 — Verify SEO & routing

With SSL enabled (cPanel **SSL/TLS**), check in a browser:

| URL | Expected |
|-----|----------|
| `https://hedztech.com/` | Home loads |
| `https://hedztech.com/work` | Portfolio loads (not 404 HTML) |
| `https://hedztech.com/sitemap.xml` | XML sitemap (from PHP) |
| `https://hedztech.com/robots.txt` | Plain text robots file |
| `https://hedztech.com/api/public/bootstrap` | JSON bootstrap payload |

If a deep link (e.g. `/blog/your-post`) returns **404 from Apache**, **`mod_rewrite` is not applied** or **`.htaccess` was not uploaded** — fix before going live.

If **`/api/public/...`** (including **`/api/public/bootstrap`**) returns **404 from LiteSpeed**, the root **`.htaccess`** must rewrite non-file `/api/*` URLs to **`api/index.php`** (the build copies this rule from `frontend/public/.htaccess`). Re-upload **`.htaccess`** from a fresh `npm run build` / `npm run pack:cpanel` output.

If **uploaded images do not show**, URLs must point to **`/api/uploads/...`** (files live under **`public_html/api/uploads/`**). The root **`.htaccess`** also rewrites legacy **`/uploads/...`** to **`/api/uploads/...`** for older database rows. Re-pack and re-upload **`.htaccess`**, or fix **`image_url`** / **`logo_url`** in the database to use **`/api/uploads/filename`**.

If **`/admin`** returns **404 (LiteSpeed)**, delete any stray **`public_html/admin`** folder in File Manager (it is not part of this app), then ensure the root **`.htaccess`** from the build is present — it rewrites **`/admin`** to **`index.html`** for the React admin UI.

---

## Optional: force HTTPS and one hostname

In cPanel you can use **“Force HTTPS Redirect”**. To redirect **`www` → apex** (or the reverse), add a small redirect **above** the SPA rules in `.htaccess`, or use cPanel **Redirects** — keep a single canonical host to match `canonical_base` and `cors_origins`.

---

## “Database connection failed” / site loads but has no data

### Quick diagnostic URL

Open **`https://hedztech.com/api/public/db-health`**.

For a **simple HTML page** (and optional JSON) that shows host, database name, user, and MySQL version without using the API router, open **`https://hedztech.com/db_connection_check.php`**. That file is **`backend/db_connection_check.php`** in the repo and is copied into **`deploy/cpanel/out/`** when you run **`npm run pack:cpanel`**. **Delete it from `public_html` after you finish testing** — it is only for diagnostics.

It returns JSON such as:

- **`"connected": true`** — MySQL credentials work; if the site still fails, clear cache and check **`/api/public/bootstrap`**.
- **`"connected": false`** — read **`hint`** and the **`config`** block:
  - **`config_sample_php_readable": false`** — **`config.php` requires `config.sample.php` in the same folder** (`public_html`). Upload **`config.sample.php`** from the repo’s **`backend/`** next to **`config.php`**, then reload db-health. (`npm run pack:cpanel` includes **`config.sample.php`** in **`deploy/cpanel/out/`**.)

### Bootstrap URL

Open **`https://hedztech.com/api/public/bootstrap`**. If you see **`"error":"Database connection failed"`**, fix **`public_html/config.local.php`** (or env vars / **`config.sample.php`** defaults if you are not using **`config.local.php`**):

1. **Password** — In cPanel → **MySQL® Databases**, the MySQL user has its **own** password (not your cPanel login). Put that value in **`config.local.php`** under **`db.pass`** (or set env **`HEDZTECH_DB_PASS`**). An empty password almost always fails on shared hosting.

2. **User attached to database** — In **MySQL® Databases**, use **“Add User to Database”** and give **ALL PRIVILEGES** for **`hedztech_hedzdb`** (or whatever your DB name is).

3. **Exact names** — **`name`** and **`user`** must match cPanel (often both look like **`hedztech_hedzdb`** with your account prefix).

4. **Host** — Defaults use **`127.0.0.1`** (TCP). If it still fails, set **`db.host`** to **`localhost`** in **`config.local.php`**. Rarely, your host requires a **Unix socket**; then set **`db.socket`** (see comments in `backend/config.sample.php`).

5. **Tables exist** — In **phpMyAdmin**, select your database and confirm tables such as **`settings`**, **`services`**. If empty, **Import** `database/schema.sql`.

6. **Temporary PDO message** — Set **`db_show_error`** to **`true`** in **`config.local.php`**, or set env **`HEDZTECH_DB_DEBUG=1`** (see `backend/config.sample.php`). Reload **`/api/public/bootstrap`** once to read the **`detail`** field in JSON, then **turn it off** on production.

---

## Local development note

Run **two terminals** from the project root:

1. **`npm run api`** — starts PHP on **http://127.0.0.1:8080** (uses **`node scripts/run-api.mjs`**, which looks for `php` on PATH, then common **XAMPP** / **Laragon** paths on Windows, or set **`PHP_PATH`** to your **`php.exe`**).
2. **`npm run dev`** — Vite on **http://localhost:5173/** (proxies **`/api`** to port 8080).

Import **`database/schema.sql`** into local MySQL (**`hedztech`** database). With no **`backend/config.local.php`**, **`backend/config.php`** uses the sample defaults (**`root`** / empty password on **`127.0.0.1`**).

With **`frontend/public/sitemap.xml` removed**, the pretty URL **`/sitemap.xml`** is satisfied in production by Apache rewrite to the API. On **`npm run dev`**, use the API directly if needed:

`http://127.0.0.1:8080` → **`/api/public/sitemap.xml`**

---

## Support checklist

- [ ] Database imported; migrations applied if any  
- [ ] `config.php` + **`config.sample.php`** in `public_html` (same folder); production **`config.local.php`** with DB credentials + `canonical_base` (or env vars)  
- [ ] **`/api/public/db-health`** returns `"connected": true` (optional: **`/db_connection_check.php`**, then remove that file)  
- [ ] `public_html/api/uploads` writable  
- [ ] Frontend `dist` merged into `public_html`  
- [ ] Admin password changed  
- [ ] `https://hedztech.com/sitemap.xml` returns XML  
- [ ] Sample React route (e.g. `/contact`) loads after refresh  

You now have a **standard cPanel layout**: one `public_html`, SPA + PHP API + dynamic sitemap + robots + meta/JSON-LD driven by your database settings.
