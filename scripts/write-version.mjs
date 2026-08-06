import { copyFile, mkdir, writeFile } from 'node:fs/promises'

import { readBuildCommit } from './build-metadata.mjs'

const version = {
  commit: readBuildCommit(),
  builtAt: new Date().toISOString(),
}

await mkdir('dist', { recursive: true })
await writeFile('dist/__version.json', `${JSON.stringify(version, null, 2)}\n`)
await copyFile('config/_headers', 'dist/_headers')
