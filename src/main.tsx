import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PlatformRoot } from './platform/PlatformRoot.tsx'
import './platform/platform.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformRoot />
  </StrictMode>,
)
