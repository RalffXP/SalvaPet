import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './header.css';

function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <img src="/log.png" alt="SalvaPet Logo" className="header-logo-img" />
                    <span className="header-logo-text">SalvaPet</span>
                </Link>

                <button
                    className={`menu-toggle ${menuAberto ? 'ativo' : ''}`}
                    onClick={() => setMenuAberto(!menuAberto)}
                    aria-label="Abrir menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className={`header-nav ${menuAberto ? 'aberto' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'ativo' : ''}`}
                        onClick={() => setMenuAberto(false)}
                    >
                        🏠 Início
                    </Link>
                    <Link
                        to="/animais"
                        className={`nav-link ${isActive('/animais') ? 'ativo' : ''}`}
                        onClick={() => setMenuAberto(false)}
                    >
                        🐾 Adotar
                    </Link>
                    <Link
                        to="/doar"
                        className={`nav-link ${isActive('/doar') ? 'ativo' : ''}`}
                        onClick={() => setMenuAberto(false)}
                    >
                        💛 Doar
                    </Link>
                    <Link
                        to="/sobre"
                        className={`nav-link ${isActive('/sobre') ? 'ativo' : ''}`}
                        onClick={() => setMenuAberto(false)}
                    >
                        ℹ️ Sobre
                    </Link>
                    <Link
                        to="/contato"
                        className={`nav-link ${isActive('/contato') ? 'ativo' : ''}`}
                        onClick={() => setMenuAberto(false)}
                    >
                        📧 Contato
                    </Link>
                    <Link
                        to="/login"
                        className="nav-link btn-login"
                        onClick={() => setMenuAberto(false)}
                    >
                        Entrar
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;