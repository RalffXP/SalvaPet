import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUsuarioLogado, logout } from '../../auth';
import './header.css';

function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [usuario, setUsuario] = useState(getUsuarioLogado());
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const atualizar = () => setUsuario(getUsuarioLogado());
        window.addEventListener('usuario-alterado', atualizar);
        window.addEventListener('storage', atualizar);
        return () => {
            window.removeEventListener('usuario-alterado', atualizar);
            window.removeEventListener('storage', atualizar);
        };
    }, []);

    const sair = () => {
        logout();
        setMenuAberto(false);
        navigate('/');
    };

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

                {menuAberto && (
                    <div
                        className="header-overlay"
                        onClick={() => setMenuAberto(false)}
                        aria-hidden="true"
                    />
                )}

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
                    {usuario ? (
                        <>
                            <Link
                                to="/painel"
                                id="nav-painel"
                                className={`nav-link ${isActive('/painel') ? 'ativo' : ''}`}
                                onClick={() => setMenuAberto(false)}
                            >
                                {usuario.perfil === 'admin' ? '🛡️ Painel Admin' : '📋 Meus Animais'}
                            </Link>
                            <button id="nav-sair" className="nav-link btn-login" onClick={sair} title={`Logado como ${usuario.nome}`}>
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="nav-link btn-login"
                            onClick={() => setMenuAberto(false)}
                        >
                            Entrar
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;