import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import Site from '../site/Site.tsx'

describe('generated site template', () => {
  it('renders the mobile site and touch controls', () => {
    const html = renderToStaticMarkup(<Site />)
    expect(html).toContain('Snake')
    expect(html).toContain('aria-label="向上"')
    expect(html).toContain('aria-label="方向控制"')
  })
})
