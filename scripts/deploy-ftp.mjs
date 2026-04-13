/**
 * Upload deploy/cpanel/out/ to cPanel via FTP/FTPS (basic-ftp).
 * Requires deploy.env in project root — copy from deploy.env.example
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'basic-ftp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const localDir = join(root, 'deploy', 'cpanel', 'out')
const envPath = join(root, 'deploy.env')

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing deploy.env in project root.')
    console.error('Copy deploy.env.example → deploy.env and set HEDZTECH_FTP_* values.')
    process.exit(1)
  }
  const out = {}
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const env = loadEnv()
const host = env.HEDZTECH_FTP_HOST || ''
const user = env.HEDZTECH_FTP_USER || ''
const password = env.HEDZTECH_FTP_PASS || ''
const remote = (env.HEDZTECH_FTP_REMOTE || '').replace(/\/+$/, '') || '/'
const port = Number(env.HEDZTECH_FTP_PORT || 21) || 21
const secure = String(env.HEDZTECH_FTP_SECURE || 'true').toLowerCase() !== 'false'

if (!host || !user || !password) {
  console.error('deploy.env must set HEDZTECH_FTP_HOST, HEDZTECH_FTP_USER, and HEDZTECH_FTP_PASS.')
  process.exit(1)
}

if (!existsSync(localDir) || !existsSync(join(localDir, 'index.html'))) {
  console.error('Missing or empty deploy/cpanel/out — run first: npm run pack:cpanel')
  process.exit(1)
}

const client = new Client()
client.ftp.verbose = process.env.HEDZTECH_FTP_DEBUG === '1'

console.log('Connecting FTP →', host, 'port', port, secure ? '(FTPS)' : '(plain)')
try {
  await client.access({
    host,
    port,
    user,
    password,
    secure,
  })
} catch (e) {
  console.error('FTP login failed:', e.message || e)
  console.error('Try HEDZTECH_FTP_SECURE=false if your host has no TLS on port 21.')
  process.exit(1)
}

try {
  await client.ensureDir(remote)
  await client.cd(remote)
  console.log('Uploading', localDir, '→', remote)
  await client.uploadFromDir(localDir)
  console.log('Done. Site files should match deploy/cpanel/out on the server.')
} catch (e) {
  console.error('Upload failed:', e.message || e)
  process.exit(1)
} finally {
  client.close()
}
