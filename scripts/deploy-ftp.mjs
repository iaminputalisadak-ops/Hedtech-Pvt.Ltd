/**
 * Upload deploy/cpanel/out/ to cPanel via FTP/FTPS (basic-ftp).
 * Supports:
 * - GitHub Actions: read HEDZTECH_FTP_* from process.env (recommended)
 * - Local dev: read from deploy.env in project root (copy from deploy.env.example)
 *
 * Optional: HEDZTECH_DEPLOY_VERIFY_URL — after upload, fetch this URL and require the
 * main Vite entry script in HTML to match deploy/cpanel/out/index.html (catches wrong FTP remote).
 * Set HEDZTECH_DEPLOY_VERIFY=0 to skip HTTP check only.
 */
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { Client } from 'basic-ftp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const localDir = join(root, 'deploy', 'cpanel', 'out')
const envPath = join(root, 'deploy.env')

function parseEnvFile(text) {
  const out = {}
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

function loadFtpConfig() {
  const fromProcess = {
    HEDZTECH_FTP_HOST: process.env.HEDZTECH_FTP_HOST,
    HEDZTECH_FTP_PORT: process.env.HEDZTECH_FTP_PORT,
    HEDZTECH_FTP_USER: process.env.HEDZTECH_FTP_USER,
    HEDZTECH_FTP_PASS: process.env.HEDZTECH_FTP_PASS,
    HEDZTECH_FTP_REMOTE: process.env.HEDZTECH_FTP_REMOTE,
    HEDZTECH_FTP_SECURE: process.env.HEDZTECH_FTP_SECURE,
  }

  const hasProcess = Boolean(fromProcess.HEDZTECH_FTP_HOST || fromProcess.HEDZTECH_FTP_USER || fromProcess.HEDZTECH_FTP_PASS)
  const fileEnv = existsSync(envPath) ? parseEnvFile(readFileSync(envPath, 'utf8')) : {}
  const env = hasProcess ? { ...fileEnv, ...fromProcess } : fileEnv

  const host = (env.HEDZTECH_FTP_HOST || '').trim()
  const user = (env.HEDZTECH_FTP_USER || '').trim()
  const password = env.HEDZTECH_FTP_PASS || ''
  const remote = (env.HEDZTECH_FTP_REMOTE || '').replace(/\/+$/, '') || '/'
  const port = Number(env.HEDZTECH_FTP_PORT || 21) || 21
  const secure = String(env.HEDZTECH_FTP_SECURE || 'true').toLowerCase() !== 'false'

  if (!host || !user || !password) {
    console.error('Missing FTP config.')
    console.error('Required: HEDZTECH_FTP_HOST, HEDZTECH_FTP_USER, HEDZTECH_FTP_PASS.')
    console.error('Provide them as environment variables (GitHub Secrets) or in deploy.env (local).')
    process.exit(1)
  }

  return { host, user, password, remote, port, secure }
}

function readDeployEnvKey(key) {
  const p = process.env[key]
  if (p != null && String(p).trim() !== '') return String(p).trim()
  if (!existsSync(envPath)) return ''
  const fileEnv = parseEnvFile(readFileSync(envPath, 'utf8'))
  return String(fileEnv[key] || '').trim()
}

/** Vite main entry: /assets/index-<hash>.js */
function mainModuleSrcFromIndexHtml(html) {
  const a = html.match(/<script\b[^>]*\btype="module"[^>]*\ssrc="(\/assets\/index-[^"]+\.js)"/)
  const b = html.match(/<script\b[^>]*\ssrc="(\/assets\/index-[^"]+\.js)"[^>]*\btype="module"/)
  return (a && a[1]) || (b && b[1]) || null
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))]
}

async function ensureRemoteDirWithFallback(client, remote) {
  // cPanel FTP accounts are often jailed/chrooted:
  // - Their "/" is already "/home/<user>"
  // - Using an absolute path like "/home/<user>/public_html" can fail with 550
  // We try a few sensible variants and return the one that worked.
  const trimmed = String(remote || '').trim() || '/'
  const withoutLeadingSlash = trimmed.replace(/^\/+/, '')
  const withoutHomePrefix = trimmed.replace(/^\/home\/[^/]+\/+/, '')

  const candidates = unique([trimmed, withoutLeadingSlash, withoutHomePrefix])
  let lastErr = null

  for (const cand of candidates) {
    try {
      await client.ensureDir(cand)
      return cand
    } catch (e) {
      lastErr = e
    }
  }

  const msg = lastErr?.message || String(lastErr || '')
  const err = new Error(
    [
      'Could not change/create remote directory on FTP server.',
      `Tried: ${candidates.join(', ')}`,
      msg ? `Last error: ${msg}` : '',
      'Tip: On cPanel, try setting HEDZTECH_FTP_REMOTE to just `public_html` (relative) instead of `/home/.../public_html`.',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  err.cause = lastErr
  throw err
}

const { host, user, password, remote, port, secure } = loadFtpConfig()

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

let tmp = null
try {
  const usedRemote = await ensureRemoteDirWithFallback(client, remote)
  const cwd = await client.pwd()
  console.log('FTP working directory:', cwd)
  console.log('Uploading', localDir, '→', usedRemote)
  await client.uploadFromDir(localDir)

  const localIndex = readFileSync(join(localDir, 'index.html'), 'utf8')
  const expectedMain = mainModuleSrcFromIndexHtml(localIndex)
  if (!expectedMain) {
    console.warn('Could not parse main module script from local index.html — skip script fingerprint checks.')
  } else {
    tmp = mkdtempSync(join(tmpdir(), 'hedztech-ftp-verify-'))
    const grabbed = join(tmp, 'index.html')
    await client.downloadTo(grabbed, 'index.html')
    const remoteIndex = readFileSync(grabbed, 'utf8')
    const remoteMain = mainModuleSrcFromIndexHtml(remoteIndex)
    if (remoteMain !== expectedMain) {
      console.error('FTP verification failed: after upload, remote index.html does not match local bundle.')
      console.error('  Expected main script:', expectedMain)
      console.error('  Remote main script: ', remoteMain || '(unparseable)')
      console.error('Check HEDZTECH_FTP_REMOTE matches cPanel → Domains → document root for your live site.')
      console.error('Resolved remote dir was:', usedRemote)
      process.exit(1)
    }
    console.log('FTP OK: remote index.html references', expectedMain)
  }

  const verifyUrl = readDeployEnvKey('HEDZTECH_DEPLOY_VERIFY_URL')
  const verifyLive = String(readDeployEnvKey('HEDZTECH_DEPLOY_VERIFY') || '1').toLowerCase() !== '0'
  if (verifyUrl && verifyLive && expectedMain) {
    const attempts = Number(readDeployEnvKey('HEDZTECH_DEPLOY_VERIFY_ATTEMPTS') || 6) || 6
    const delayMs = Number(readDeployEnvKey('HEDZTECH_DEPLOY_VERIFY_DELAY_MS') || 4000) || 4000
    let liveMain = null
    for (let i = 1; i <= attempts; i++) {
      const res = await fetch(verifyUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'hedztech-deploy-verify',
          Accept: 'text/html',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      })
      if (!res.ok) {
        console.error(`Live URL check attempt ${i}/${attempts}: HTTP ${res.status} ${res.statusText}`)
      } else {
        const liveHtml = await res.text()
        liveMain = mainModuleSrcFromIndexHtml(liveHtml)
        if (liveMain === expectedMain) {
          console.log('Live URL OK:', verifyUrl, '→', liveMain)
          break
        }
        console.error(`Live URL check attempt ${i}/${attempts}: expected ${expectedMain}, got ${liveMain || '(unparseable)'}`)
      }
      if (i < attempts) await new Promise((r) => setTimeout(r, delayMs))
    }
    if (liveMain !== expectedMain) {
      console.error('')
      console.error('Live site HTML does not match what was just uploaded.')
      console.error('Common causes:')
      console.error('  • HEDZTECH_FTP_REMOTE is not the document root for that URL (fix GitHub secret / deploy.env).')
      console.error('  • Domain points at a different server than this FTP account.')
      console.error('  • CDN / full-page cache — purge cache for HTML, or wait and re-run.')
      console.error('FTP cwd was:', cwd)
      console.error('Resolved remote dir was:', usedRemote)
      console.error('To skip this check temporarily: HEDZTECH_DEPLOY_VERIFY=0')
      process.exit(1)
    }
  } else if (verifyUrl && !verifyLive) {
    console.log('Skipping live URL check (HEDZTECH_DEPLOY_VERIFY=0).')
  }

  console.log('Done. Site files should match deploy/cpanel/out on the server.')
} catch (e) {
  console.error('Upload failed:', e.message || e)
  process.exit(1)
} finally {
  if (tmp) {
    try {
      rmSync(tmp, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  }
  client.close()
}
