import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './header.css';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo: string;
}

function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const carregarUsuario = () => {
        const salvo = localStorage.getItem('usuario');
        if (salvo) {
            try {
                setUsuario(JSON.parse(salvo));
            } catch {
                setUsuario(null);
            }
        } else {
            setUsuario(null);
        }
    };

    useEffect(() => {
        carregarUsuario();
        window.addEventListener('usuario-atualizado', carregarUsuario);
        return () => window.removeEventListener('usuario-atualizado', carregarUsuario);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        setUsuario(null);
        setMenuAberto(false);
        window.dispatchEvent(new Event('usuario-atualizado'));
        if (location.pathname === '/admin') {
            navigate('/login');
        }
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
                    {usuario?.tipo === 'admin' && (
                        <Link
                            to="/admin"
                            className={`nav-link ${isActive('/admin') ? 'ativo' : ''}`}
                            onClick={() => setMenuAberto(false)}
                        >
                            👑 Painel Admin
                        </Link>
                    )}
                    {usuario ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                            <Link
                                to={usuario.tipo === 'admin' ? '/admin' : '/'}
                                className="nav-link"
                                style={{ fontWeight: 600 }}
                                onClick={() => setMenuAberto(false)}
                            >
                                {usuario.tipo === 'admin' ? '👑 ' : '👤 '}{usuario.nome}
                            </Link>
                            <button
                                type="button"
                                className="nav-link btn-login"
                                style={{ cursor: 'pointer', marginLeft: 0 }}
                                onClick={handleLogout}
                            >
                                Sair
                            </button>
                        </div>
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