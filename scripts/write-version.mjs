import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'

function readCommit() {
  const override = process.env.BUILD_COMMIT_SHA?.trim()

  if (override) {
    return override
  }

  return execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim()
}

const version = {
  commit: readCommit(),
  builtAt: new Date().toISOString(),
}

await mkdir('dist', { recursive: true })
await writeFile('dist/__version.json', `${JSON.stringify(version, null, 2)}\n`)
await copyFile('config/_headers', 'dist/_headers')
