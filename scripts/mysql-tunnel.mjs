/**
 * Opens SSH local port forward: LOCAL_PORT -> REMOTE_DB_HOST:REMOTE_DB_PORT on the server.
 * Requires: tunnel.env (copy from tunnel.env.example), OpenSSH client (ssh), and cPanel SSH access enabled.
 *
 * Run: npm run tunnel:mysql
 * Then in Cursor connect SQLTools to 127.0.0.1:LOCAL_PORT with your MySQL user/db/password from cPanel.
 */
import { spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, 'tunnel.env')

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('Missing tunnel.env — copy tunnel.env.example → tunnel.env and fill SSH_* values.')
    process.exit(1)
  }
  const out = {}
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    out[k] = v
  }
  return out
}

const e = loadEnv()
const host = e.SSH_HOST || ''
const user = e.SSH_USER || ''
const port = e.SSH_PORT || '22'
const key = (e.SSH_KEY || '').trim()
const local = e.LOCAL_PORT || '13307'
const rhost = e.REMOTE_DB_HOST || '127.0.0.1'
const rport = e.REMOTE_DB_PORT || '3306'

if (!host || !user) {
  console.error('tunnel.env must set SSH_HOST and SSH_USER.')
  process.exit(1)
}

const bind = `${local}:${rhost}:${rport}`
const args = ['-N', '-T', '-p', String(port), '-L', bind, `${user}@${host}`]
if (key) {
  args.unshift('-i', key)
}

console.log('Starting SSH tunnel: localhost:%s → %s:%s on %s', local, rhost, rport, host)
console.log('Leave this running. In SQLTools use server 127.0.0.1 port %s, database user/pass from cPanel.', local)
console.log('Ctrl+C to stop.\n')

const child = spawn('ssh', args, { stdio: 'inherit', shell: false })
child.on('exit', (code, signal) => {
  if (signal) process.exit(0)
  process.exit(code ?? 1)
})
