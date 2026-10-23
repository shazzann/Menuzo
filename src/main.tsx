import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthService } from './services/auth.service'

// Read a Google sign-in result from the URL before the router can move away from it.
void AuthService.finishGoogleRedirect()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
