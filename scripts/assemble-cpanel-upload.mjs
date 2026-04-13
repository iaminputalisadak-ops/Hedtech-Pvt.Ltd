/**
 * Puts everything for cPanel public_html into one folder at the project root:
 *   deploy/cpanel/out/
 *
 * Run: npm run pack:cpanel
 * Then upload EVERYTHING INSIDE deploy/cpanel/out/ into your hosting public_html.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'frontend', 'dist')
const out = join(root, 'deploy', 'cpanel', 'out')

if (!existsSync(dist) || !existsSync(join(dist, 'index.html'))) {
  console.error('Missing frontend build. Run first: npm run build')
  process.exit(1)
}

console.log('Assembling →', out)
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

// 1) SPA (includes .htaccess, robots.txt, CPANEL-* htaccess backups, assets, …)
cpSync(dist, out, { recursive: true })

// 2) PHP app next to index.html
cpSync(join(root, 'backend', 'bootstrap.php'), join(out, 'bootstrap.php'))
cpSync(join(root, 'backend', 'db_connection_check.php'), join(out, 'db_connection_check.php'))
cpSync(join(root, 'backend', 'src'), join(out, 'src'), { recursive: true })
cpSync(join(root, 'backend', 'public'), join(out, 'api'), { recursive: true })

// 3) Config (real file if present — do not share this zip publicly if it has secrets)
const cfg = join(root, 'backend', 'config.php')
const sample = join(root, 'backend', 'config.sample.php')
// config.sample.php is required at runtime: backend/config.php does require __DIR__ . '/config.sample.php'
cpSync(sample, join(out, 'config.sample.php'))
console.log('Included backend/config.sample.php → out/config.sample.php')
if (existsSync(cfg)) {
  cpSync(cfg, join(out, 'config.php'))
  console.log('Included backend/config.php → out/config.php')
} else {
  cpSync(sample, join(out, 'config.EXAMPLE.php'))
  console.warn('No backend/config.php — copied config.sample.php as out/config.EXAMPLE.php (rename to config.php on server and set DB password).')
}

// 4) SQL for phpMyAdmin (optional reference; not used at runtime)
const schema = join(root, 'database', 'schema.sql')
if (existsSync(schema)) {
  mkdirSync(join(out, 'database'), { recursive: true })
  cpSync(schema, join(out, 'database', 'schema.sql'))
  const mig = join(root, 'database', 'migrations')
  if (existsSync(mig)) {
    const migOut = join(out, 'database', 'migrations')
    mkdirSync(migOut, { recursive: true })
    for (const f of readdirSync(mig).filter((x) => x.endsWith('.sql'))) {
      cpSync(join(mig, f), join(migOut, f))
    }
  }
}

writeFileSync(
  join(out, 'README_UPLOAD.txt'),
  [
    'Hedztech — cPanel upload bundle',
    '========================',
    '',
    'Upload EVERYTHING inside this folder into your hosting public_html directory',
    '(merge / replace files as needed; do not upload this folder name itself as a subfolder).',
    '',
    'After upload:',
    '- If .htaccess is missing, rename CPANEL-public_html-RENAME-TO-dothtaccess.txt to .htaccess',
    '- In api/, rename CPANEL-api-folder-RENAME-TO-dothtaccess.txt to .htaccess if needed',
    '- Import database/schema.sql via phpMyAdmin into your MySQL database',
    '- Keep config.sample.php next to config.php (required). On production, add config.local.php next to them (see backend/config.local.php.example in repo) with cPanel MySQL db/user/pass and canonical_base',
    '- Debug DB: open /api/public/db-health in the browser',
    '- Optional: open /db_connection_check.php for a simple HTML/JSON DB test — delete that file after testing',
    '',
    'Full guide: deploy/cpanel/README.md in the repo.',
    '',
  ].join('\n'),
  'utf8',
)

console.log('Done. Open:', join(out, 'README_UPLOAD.txt'))
