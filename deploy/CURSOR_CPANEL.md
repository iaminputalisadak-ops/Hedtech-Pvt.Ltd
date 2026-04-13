# Connect Cursor to cPanel (files + database)

Nobody can “click connect” for you from the internet: **your passwords and keys stay on your PC only**. This repo already includes tooling; you run a short one-time setup once.

---

## 1) Files: work **on the server** inside Cursor (best match for “no manual copy”)

**Requires:** cPanel **SSH Access** enabled for your account (not every cheap plan allows it).

1. Install the **Remote - SSH** extension in Cursor (recommended in `.vscode/extensions.json`).
2. Create an **SSH key** on your PC if you don’t have one (`ssh-keygen`), then add the **public** key in cPanel → **SSH Access** → **Manage SSH Keys** → **Authorize**.
3. In Cursor: **F1** → **Remote-SSH: Connect to Host…** → enter `YOUR_CPANEL_USER@YOUR_SERVER_HOST` (host is often the **server hostname**, not `ftp.`).
4. After connected: **File → Open Folder** → choose your site root (often `public_html` or the path cPanel shows for that user).

You are then **editing live files on cPanel** from Cursor — no zip, no paste.

**If SSH is not available:** use **FTP + SFTP extension** (`.vscode/sftp.json`) or **`npm run deploy:cpanel`** with `deploy.env` — see `deploy/cpanel/README.md`.

---

## 2) Files: stay local, auto-push when you save (no Remote-SSH)

1. `npm run sftp:init` → edit **`.vscode/sftp.json`** (gitignored).
2. Use **`"context": "deploy/cpanel/out"`** and **`remotePath`** = your real document root.
3. Run **`npm run pack:cpanel`** when you change code; then save files under **`deploy/cpanel/out/`** to upload (or use extension commands).

Or one command: **`npm run deploy:cpanel`** (uses **`deploy.env`** FTP settings).

---

## 3) Database: connect from Cursor to MySQL on cPanel

cPanel MySQL almost always listens on **`127.0.0.1` only on the server** — your laptop cannot connect directly. You need an **SSH tunnel** + **SQLTools** in Cursor.

### A) Install the extensions (one-time)

1. Open this project folder in Cursor.
2. When prompted, click **Install** for **Recommended** extensions — or open **Extensions** (`Ctrl+Shift+X`) and install:
   - **SQLTools** (`mtxr.sqltools`)
   - **SQLTools MySQL/MariaDB** (`mtxr.sqltools-driver-mysql`)

I cannot install extensions on your PC from here; you (or anyone on your machine) must click **Install** once.

### B) Tell SQLTools your database name and MySQL user (one-time)

This repo includes **`.vscode/settings.json`** with a connection named **“cPanel MySQL (via SSH tunnel)”**.

1. Open **`.vscode/settings.json`**.
2. Replace **`REPLACE_WITH_YOUR_DATABASE_NAME`** and **`REPLACE_WITH_YOUR_MYSQL_USER`** with values from cPanel → **MySQL® Databases** (the database name and the **MySQL user** that has access — often looks like `cpaneluser_dbname`).

Password is **not** stored in the file: **`askForPassword": true`** — Cursor will ask when you connect.

3. The **port must match** your tunnel: default **`13307`** in **`tunnel.env.example`**. If you change **`LOCAL_PORT`** in **`tunnel.env`**, change **`port`** in **`.vscode/settings.json`** to the same number.

### C) SSH tunnel + connect (every time you query the DB)

1. **`npm run tunnel:init`** once if you do not have **`tunnel.env`** yet, then edit **`tunnel.env`**: **`SSH_HOST`**, **`SSH_USER`** (cPanel SSH user), optional **`SSH_KEY`**. **`LOCAL_PORT`** must match **`settings.json`** (default **13307**).
2. In a terminal at the project root: **`npm run tunnel:mysql`** — **leave this terminal running** while you use SQLTools.
3. In Cursor: **SQLTools** icon in the left sidebar → **Connections** → select **“cPanel MySQL (via SSH tunnel)”** → connect → enter the **MySQL user password** when prompted (from cPanel, not your cPanel login unless they are the same).

Stop the tunnel with **Ctrl+C** when finished.

### If connection fails

- **“Access denied”** — wrong MySQL user/password or user not added to the database in cPanel.
- **“ECONNREFUSED”** — tunnel not running, or **port** in `settings.json` ≠ **`LOCAL_PORT`** in **`tunnel.env`**.
- **“Public key” / SSH** — fix **`tunnel.env`** or authorize your SSH key in cPanel → **SSH Access**.
- **MySQL 8 auth errors** — try removing **`mysqlOptions`** from the connection in **`settings.json`**, or ask your host about **`mysql_native_password`** for that user.

---

## 4) Security checklist

- **`.vscode/sftp.json`**, **`deploy.env`**, **`tunnel.env`** are **gitignored** — never commit them.
- If a password was ever committed to git or pasted in chat, **change it** in cPanel.
- The committed **`.vscode/sftp.json.example`** must stay placeholder-only (no real passwords).

---

## What this project cannot do automatically

- Open SSH/FTP/MySQL to your host **from Cursor’s AI/cloud** using your secrets.
- Guess your cPanel **SSH hostname**, **FTP path**, or **MySQL user** — those come from your hosting panel.

After you complete steps 1–3 locally, Cursor is “connected” the same way any developer would: **Remote SSH** and/or **FTP deploy** + **SSH tunnel + SQLTools**.
