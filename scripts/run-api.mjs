/**
 * Start PHP built-in server for local dev (port 8080).
 * Finds php.exe on Windows (PATH, PHP_PATH, XAMPP, Laragon) or Unix `which php`.
 */
import { existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docroot = join(root, 'backend', 'public')
const router = join(docroot, 'router.php')

function findPhpWin() {
  if (process.env.PHP_PATH && existsSync(process.env.PHP_PATH)) {
    return process.env.PHP_PATH
  }
  const where = spawnSync('where.exe', ['php'], { encoding: 'utf8', windowsHide: true })
  if (where.status === 0 && where.stdout?.trim()) {
    const first = where.stdout.trim().split(/\r?\n/)[0].trim()
    if (first && existsSync(first)) return first
  }
  const fixed = [
    'C:\\xampp\\php\\php.exe',
    'C:\\wamp64\\bin\\php\\php8.3.0\\php.exe',
    'C:\\wamp64\\bin\\php\\php8.2.0\\php.exe',
    'C:\\wamp64\\bin\\php\\php8.1.0\\php.exe',
    'C:\\Program Files\\PHP\\php.exe',
  ]
  for (const p of fixed) {
    if (existsSync(p)) return p
  }
  const laragonBase = 'C:\\laragon\\bin\\php'
  if (existsSync(laragonBase)) {
    try {
      const dirs = readdirSync(laragonBase).filter((d) => d.toLowerCase().startsWith('php-'))
      for (const d of dirs) {
        const exe = join(laragonBase, d, 'php.exe')
        if (existsSync(exe)) return exe
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

function findPhpUnix() {
  if (process.env.PHP_PATH && existsSync(process.env.PHP_PATH)) {
    return process.env.PHP_PATH
  }
  const r = spawnSync('which', ['php'], { encoding: 'utf8' })
  if (r.status === 0 && r.stdout?.trim()) {
    const p = r.stdout.trim().split('\n')[0]
    if (p && existsSync(p)) return p
  }
  return null
}

const php = process.platform === 'win32' ? findPhpWin() : findPhpUnix()

if (!php) {
  console.error('Could not find PHP.')
  console.error('')
  console.error('Windows: install XAMPP or Laragon, or add PHP to PATH, then retry.')
  console.error('Or set PHP_PATH to your php.exe, e.g.:')
  console.error('  set PHP_PATH=C:\\xampp\\php\\php.exe')
  console.error('  npm run api')
  console.error('')
  console.error('Then create a MySQL database, import database/schema.sql, and match backend/config.php.')
  process.exit(1)
}

if (!existsSync(router)) {
  console.error('Missing router:', router)
  process.exit(1)
}

console.log('Using PHP:', php)
console.log('API → http://127.0.0.1:8080/ (document root:', docroot + ')')
console.log('')

const child = spawn(
  php,
  ['-S', '127.0.0.1:8080', '-t', docroot, router],
  { stdio: 'inherit', cwd: root, shell: false },
)

child.on('error', (err) => {
  console.error('Failed to start PHP:', err.message)
  process.exit(1)
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
