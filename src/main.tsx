import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import './index.css'

// BASE_URL is "/" locally and on Vercel/Netlify, and "/<repo-name>/" on GitHub Pages.
// It is set automatically through vite.config.ts. Do not hardcode a basename here.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
