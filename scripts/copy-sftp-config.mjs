/**
 * One-time: copy .vscode/sftp.json.example → .vscode/sftp.json (ignored by git).
 * Then edit sftp.json with your cPanel host, user, and remotePath.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const example = join(root, '.vscode', 'sftp.json.example')
const target = join(root, '.vscode', 'sftp.json')

if (!existsSync(example)) {
  console.error('Missing:', example)
  process.exit(1)
}
if (existsSync(target)) {
  console.error('Already exists:', target, '— edit that file or delete it to re-run.')
  process.exit(1)
}
copyFileSync(example, target)
console.log('Created', target)
console.log('Edit host, username, remotePath (and password or use key auth per SFTP extension docs).')
