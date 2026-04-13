import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const example = join(root, 'deploy.env.example')
const target = join(root, 'deploy.env')

if (!existsSync(example)) {
  console.error('Missing:', example)
  process.exit(1)
}
if (existsSync(target)) {
  console.error('Already exists:', target, '— edit it or delete to re-run.')
  process.exit(1)
}
copyFileSync(example, target)
console.log('Created', target, '— fill in HEDZTECH_FTP_* then run: npm run deploy:cpanel')
