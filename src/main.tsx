import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from './App.tsx'  // Import the router object
import { RouterProvider } from 'react-router-dom'

// Pass the router object to RouterProvider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
