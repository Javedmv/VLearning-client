import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import store from './redux/store.tsx'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'

// Pass the router object to RouterProvider
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>    
      <Toaster position='top-right'/>
       <App/>
    </Provider>
  </StrictMode>,
);