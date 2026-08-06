import { Component, type ErrorInfo, type ReactNode } from 'react'

import Site from '../site/Site.tsx'

interface ErrorBoundaryState {
  failed: boolean
}

class SiteErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Generated site crashed', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="platform-error" role="alert">
          <h1>页面暂时无法显示</h1>
          <p>请刷新页面重试。</p>
          <button type="button" onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </main>
      )
    }
    return this.props.children
  }
}

export function PlatformRoot() {
  return (
    <SiteErrorBoundary>
      <Site />
    </SiteErrorBoundary>
  )
}
