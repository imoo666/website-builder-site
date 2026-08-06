import { describe, expect, it, vi } from 'vitest'

import { readBuildCommit } from './build-metadata.mjs'

describe('build metadata', () => {
  it('prefers the Cloudflare Workers Builds commit', () => {
    const readGitCommit = vi.fn(() => 'git-commit')
    expect(readBuildCommit({
      WORKERS_CI_COMMIT_SHA: 'cloudflare-commit',
      BUILD_COMMIT_SHA: 'legacy-override',
    }, readGitCommit)).toBe('cloudflare-commit')
    expect(readGitCommit).not.toHaveBeenCalled()
  })

  it('supports the local override before falling back to Git', () => {
    expect(readBuildCommit({ BUILD_COMMIT_SHA: 'local-commit' }, () => 'git-commit'))
      .toBe('local-commit')
    expect(readBuildCommit({}, () => 'git-commit\n')).toBe('git-commit')
  })
})
