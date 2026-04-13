import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const example = join(root, 'tunnel.env.example')
const target = join(root, 'tunnel.env')

if (!existsSync(example)) {
  console.error('Missing:', example)
  process.exit(1)
}
if (existsSync(target)) {
  console.error('Already exists:', target)
  process.exit(1)
}
copyFileSync(example, target)
console.log('Created', target, '— set SSH_HOST / SSH_USER, then: npm run tunnel:mysql')
