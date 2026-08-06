import { describe, expect, it } from 'vitest'

import { loadBuildCallbackConfig } from './build-callback-config.mjs'

describe('build callback configuration', () => {
  it('loads the repository configuration for Cloudflare Builds', async () => {
    const config = await loadBuildCallbackConfig({})
    expect(config.url).toBe(
      'https://ai-website-builder-api.2779468693.workers.dev/api/build-events',
    )
    expect(config.secret).toHaveLength(64)
  })

  it('supports disabling callbacks for local validation', async () => {
    await expect(loadBuildCallbackConfig({ BUILD_CALLBACK_DISABLED: '1' }))
      .resolves.toEqual({ url: null, secret: null })
  })
})
