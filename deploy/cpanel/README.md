# Deploy Hedztech to cPanel (public_html)

## One folder on your PC (recommended)

From the **project root** (where `package.json`, `frontend/`, and `backend/` are):

```bash
npm run pack:cpanel
```

That runs the frontend build and fills **`deploy/cpanel/out/`** with the same layout as **`public_html`** (SPA + `api/` + `bootstrap.php` + `src/` + `config.php` + `database/schema.sql` for import). Open **`deploy/cpanel/out/README_UPLOAD.txt`**, then upload **everything inside `out/`** to **`public_html`** in cPanel File Manager or FTP.

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
| `backend/config.php` (with DB password) | **Root** `config.php` |
| **`backend/config.sample.php`** (do not skip) | **Root** `config.sample.php` — `config.php` **requires** this file |

SEO is covered by:

- **`robots.txt`** (uploaded with the frontend build) — allows indexing, blocks `/admin`, points crawlers to `https://hedztech.com/sitemap.xml`
- **`/sitemap.xml`** — rewritten to **`/api/public/sitemap.xml`**, which PHP generates (static pages + published blog posts + portfolio slugs)
- **`index.html`** defaults + per-route **`<Seo />`** (React Helmet: title, description, canonical, Open Graph, Twitter)
- **JSON-LD** from `StructuredData.jsx` / `ArticleStructuredData.jsx` when `canonical_base` is set

---

## Server requirements

- **PHP** 8.1+ (8.2+ recommended) with extensions: **pdo_mysql**, **json**, **session**, **fileinfo** (uploads)
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
├── config.php             ← from repo `backend/config.php` (set MySQL password on server)
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

## Step 2 — Backend config (`config.php`)

1. On your PC, copy `backend/config.sample.php` to `backend/config.php` (or edit the one you already use).
2. Set **`db`** to match cPanel, for example:
   - **`host`**: `localhost`
   - **`name`**: `hedztech_hedzdb`
   - **`user`**: `hedztech_hedzdb`
   - **`pass`**: your MySQL user’s password (set only in `config.php` on the server or in a private env var — do not commit real passwords to git).
3. Set **`canonical_base`** to your live URL (no trailing slash), e.g. `https://hedztech.com`.
4. Ensure **`cors_origins`** includes that same URL (the sample file lists `https://hedztech.com` and `https://www.hedztech.com` plus localhost for dev).

The repo’s `backend/config.php` is pre-wired for the **`hedztech_hedzdb`** database and user names; you only need to set **`pass`** (and adjust **`host`** if your host documents a different socket/host).

Upload **`config.php`** to **`public_html/config.php`**.

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

---

## Optional: force HTTPS and one hostname

In cPanel you can use **“Force HTTPS Redirect”**. To redirect **`www` → apex** (or the reverse), add a small redirect **above** the SPA rules in `.htaccess`, or use cPanel **Redirects** — keep a single canonical host to match `canonical_base` and `cors_origins`.

---

## “Database connection failed” / site loads but has no data

### Quick diagnostic URL

Open **`https://YOURDOMAIN.com/api/public/db-health`** (replace with your domain).

It returns JSON such as:

- **`"connected": true`** — MySQL credentials work; if the site still fails, clear cache and check **`/api/public/bootstrap`**.
- **`"connected": false`** — read **`hint`** and the **`config`** block:
  - **`config_sample_php_readable": false`** — **`config.php` requires `config.sample.php` in the same folder** (`public_html`). Upload **`config.sample.php`** from the repo’s **`backend/`** next to **`config.php`**, then reload db-health. (`npm run pack:cpanel` includes **`config.sample.php`** in **`deploy/cpanel/out/`**.)

### Bootstrap URL

Open **`https://YOURDOMAIN.com/api/public/bootstrap`**. If you see **`"error":"Database connection failed"`**, fix **`public_html/config.php`**:

1. **Password** — In cPanel → **MySQL® Databases**, the MySQL user has its **own** password (not your cPanel login). Paste that exact value into **`$config['db']['pass']`** (or set env **`HEDZTECH_DB_PASS`**). An empty password almost always fails on shared hosting.

2. **User attached to database** — In **MySQL® Databases**, use **“Add User to Database”** and give **ALL PRIVILEGES** for **`hedztech_hedzdb`** (or whatever your DB name is).

3. **Exact names** — **`name`** and **`user`** must match cPanel (often both look like **`hedztech_hedzdb`** with your account prefix).

4. **Host** — The repo defaults to **`127.0.0.1`** (TCP). If it still fails, try **`host` => `'localhost'`** in `config.php`. Rarely, your host requires a **Unix socket**; then set **`socket`** (see comments in `backend/config.sample.php`) and leave host unused when socket is set.

5. **Tables exist** — In **phpMyAdmin**, select your database and confirm tables such as **`settings`**, **`services`**. If empty, **Import** `database/schema.sql`.

6. **Temporary PDO message** — In `config.php`, set **`$config['db_show_error'] = true;`** (from `config.sample.php` it follows **`HEDZTECH_DB_DEBUG=1`**). Reload **`/api/public/bootstrap`** once to read the **`detail`** field in JSON, then **turn it off** on production.

---

## Local development note

With **`frontend/public/sitemap.xml` removed**, the pretty URL **`/sitemap.xml`** is satisfied in production by Apache rewrite to the API. On **`npm run dev`**, use the API directly if needed:

`http://127.0.0.1:8080` (or your PHP host) → **`/api/public/sitemap.xml`**

---

## Support checklist

- [ ] Database imported; migrations applied if any  
- [ ] `config.php` + **`config.sample.php`** in `public_html` (same folder) + DB credentials + `canonical_base`  
- [ ] **`/api/public/db-health`** returns `"connected": true`  
- [ ] `public_html/api/uploads` writable  
- [ ] Frontend `dist` merged into `public_html`  
- [ ] Admin password changed  
- [ ] `https://hedztech.com/sitemap.xml` returns XML  
- [ ] Sample React route (e.g. `/contact`) loads after refresh  

You now have a **standard cPanel layout**: one `public_html`, SPA + PHP API + dynamic sitemap + robots + meta/JSON-LD driven by your database settings.
