import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from './store/themeStore'

// Initialize theme before rendering
const theme = useThemeStore.getState().theme
document.documentElement.classList.toggle('dark', theme === 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
