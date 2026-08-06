import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('preview headers', () => {
  it('allows assets to load inside the opaque preview sandbox', () => {
    const headers = readFileSync(new URL('../config/_headers', import.meta.url), 'utf8')
    expect(headers).toContain('Access-Control-Allow-Origin: *')
  })
})
