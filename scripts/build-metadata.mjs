import { execFileSync } from 'node:child_process'

export function readBuildCommit(
  environment = process.env,
  readGitCommit = () => execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }),
) {
  const commit = environment.WORKERS_CI_COMMIT_SHA?.trim()
    || environment.BUILD_COMMIT_SHA?.trim()
    || readGitCommit().trim()

  if (!commit) throw new Error('Unable to determine build commit')
  return commit
}
