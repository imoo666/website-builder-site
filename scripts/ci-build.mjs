import { createHmac, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const callbackUrl = process.env.BUILD_CALLBACK_URL?.trim()
const callbackSecret = process.env.BUILD_CALLBACK_SECRET?.trim()
const commit = process.env.BUILD_COMMIT_SHA?.trim()
  || spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim()
const buildId = randomUUID()
const steps = [
  ['lint', 'pnpm', ['lint']],
  ['test', 'pnpm', ['test']],
  ['typecheck', 'pnpm', ['typecheck']],
  ['build', 'pnpm', ['exec', 'vite', 'build']],
  ['write_version', 'node', ['scripts/write-version.mjs']],
]

await report('validation_started')

for (const [step, command, args] of steps) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 2 * 1024 * 1024,
  })
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim().slice(-8_000)
    await report('validation_failed', step, output || `${command} exited with ${result.status}`)
    process.stderr.write(output)
    process.exit(result.status ?? 1)
  }
}

await report('validation_passed', 'write_version')

async function report(event, step, summary) {
  if (!callbackUrl || !callbackSecret) return
  const timestamp = Date.now()
  const body = JSON.stringify({
    commit,
    buildId,
    eventId: randomUUID(),
    event,
    ...(step ? { step } : {}),
    ...(summary ? { summary } : {}),
    timestamp,
  })
  const signature = createHmac('sha256', callbackSecret).update(body).digest('hex')
  try {
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-builder-signature': `sha256=${signature}`,
        'x-builder-timestamp': String(timestamp),
      },
      body,
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) {
      process.stderr.write(`Build callback returned ${response.status}\n`)
    }
  } catch (error) {
    process.stderr.write(`Build callback failed: ${error instanceof Error ? error.message : String(error)}\n`)
  }
}
