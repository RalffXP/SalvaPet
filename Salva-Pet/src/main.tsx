import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Teste from './Componetes/pages/Contato.tsx'
import Contato from './Componetes/pages/Contato.tsx'
import Header from './Componetes/pages/Header/header.tsx'
import Login from './Componetes/pages/Login.tsx'

const router = createBrowserRouter([
  {path: '/', element: <App />},
  {path: '/contato', element: <Contato/>},
  {path: '/login', element: <Login/>}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <RouterProvider router={router} />
  </StrictMode>,
)
