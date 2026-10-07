import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './Componetes/pages/Home';
import Animais from './Componetes/pages/Animais';
import Doar from './Componetes/pages/Doar';
import Sobre from './Componetes/pages/Sobre';
import Contato from './Componetes/pages/Contato';
import Login from './Componetes/pages/Login';
import Avaliar from './Componetes/pages/Avaliar';
import Painel from './Componetes/pages/Painel';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: 'animais', element: <Animais /> },
            { path: 'doar', element: <Doar /> },
            { path: 'sobre', element: <Sobre /> },
            { path: 'contato', element: <Contato /> },
            { path: 'login', element: <Login /> },
            { path: 'cadastro', element: <Login /> },
            { path: 'avaliar', element: <Avaliar /> },
            { path: 'painel', element: <Painel /> },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
