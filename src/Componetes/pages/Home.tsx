import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

interface Animal {
    id: number;
    nome: string;
    especie: string;
    raca: string;
    idade: string;
    porte: string;
    sexo: string;
    descricao: string;
    imagem_url: string;
    cidade: string;
    estado: string;
    vacinado: boolean;
    castrado: boolean;
}

interface Avaliacao {
    id: number;
    nome_usuario: string;
    nota: number;
    comentario: string;
}

function Home() {
    const [animaisDestaque, setAnimaisDestaque] = useState<Animal[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [stats, setStats] = useState({ animais_disponiveis: 0, animais_adotados: 0, usuarios_cadastrados: 0 });

    useEffect(() => {
        // Buscar animais em destaque
        fetch('http://localhost:3000/api/animais?status=disponivel')
            .then(res => res.json())
            .then(data => setAnimaisDestaque(Array.isArray(data) ? data.slice(0, 3) : []))
            .catch(() => setAnimaisDestaque([]));

        // Buscar avaliações
        fetch('http://localhost:3000/api/avaliacoes')
            .then(res => res.json())
            .then(data => setAvaliacoes(Array.isArray(data) ? data.slice(0, 3) : []))
            .catch(() => setAvaliacoes([]));

        // Buscar estatísticas
        fetch('http://localhost:3000/api/estatisticas')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => {});
    }, []);

    const renderEstrelas = (nota: number) => {
        return '★'.repeat(nota) + '☆'.repeat(5 - nota);
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1">🐾</div>
                    <div className="shape shape-2">🐾</div>
                    <div className="shape shape-3">🐾</div>
                    <div className="shape shape-4">💛</div>
                    <div className="shape shape-5">🐾</div>
                </div>
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">🐾 Adote com amor</span>
                        <h1 className="hero-title">
                            Encontre seu novo <span className="hero-destaque">melhor amigo</span>
                        </h1>
                        <p className="hero-texto">
                            Conectamos corações e patinhas! Milhares de animais estão 
                            esperando por um lar cheio de carinho. Adote, doe e transforme vidas.
                        </p>
                        <div className="hero-botoes">
                            <Link to="/animais" className="btn btn-primario btn-grande">
                                🔍 Quero Adotar
                            </Link>
                            <Link to="/doar" className="btn btn-secundario-hero btn-grande">
                                💛 Quero Doar
                            </Link>
                        </div>
                    </div>
                    <div className="hero-imagem">
                        <div className="hero-img-wrapper">
                            <img src="/log.png" alt="Gato e cachorro juntos" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Estatísticas */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-icon">🐕</span>
                            <span className="stat-numero">{stats.animais_disponiveis || 6}+</span>
                            <span className="stat-label">Animais Disponíveis</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🏡</span>
                            <span className="stat-numero">{stats.animais_adotados || 0}+</span>
                            <span className="stat-label">Adoções Realizadas</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">👥</span>
                            <span className="stat-numero">{stats.usuarios_cadastrados || 3}+</span>
                            <span className="stat-label">Usuários Cadastrados</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-numero">4.8</span>
                            <span className="stat-label">Avaliação Média</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Como funciona */}
            <section className="como-funciona">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Como funciona?</span>
                        <h2 className="section-titulo">Adotar é simples e rápido</h2>
                        <p className="section-subtitulo">Em poucos passos, você pode transformar a vida de um animal</p>
                    </div>
                    <div className="passos-grid">
                        <div className="passo-card">
                            <div className="passo-numero">1</div>
                            <div className="passo-icone">📋</div>
                            <h3>Cadastre-se</h3>
                            <p>Crie sua conta gratuitamente e preencha seu perfil completo</p>
                        </div>
                        <div className="passo-seta">→</div>
                        <div className="passo-card">
                            <div className="passo-numero">2</div>
                            <div className="passo-icone">🔍</div>
                            <h3>Busque</h3>
                            <p>Encontre o animal ideal usando nossos filtros de busca avançados</p>
                        </div>
                        <div className="passo-seta">→</div>
                        <div className="passo-card">
                            <div className="passo-numero">3</div>
                            <div className="passo-icone">💬</div>
                            <h3>Converse</h3>
                            <p>Entre em contato diretamente com o tutor responsável pelo animal</p>
                        </div>
                        <div className="passo-seta">→</div>
                        <div className="passo-card">
                            <div className="passo-numero">4</div>
                            <div className="passo-icone">🏡</div>
                            <h3>Adote!</h3>
                            <p>Dê um lar amoroso e receba todo o carinho de um novo companheiro</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Animais em destaque */}
            <section className="destaques">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">🐾 Destaques</span>
                        <h2 className="section-titulo">Pets esperando por você</h2>
                        <p className="section-subtitulo">Conheça alguns dos animais disponíveis para adoção</p>
                    </div>
                    <div className="animais-grid">
                        {animaisDestaque.length > 0 ? (
                            animaisDestaque.map((animal, index) => (
                                <div className="animal-card" key={animal.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="animal-img-wrapper">
                                        <img src={animal.imagem_url} alt={animal.nome} className="animal-img" />
                                        <span className="animal-badge-especie">
                                            {animal.especie === 'cachorro' ? '🐕' : animal.especie === 'gato' ? '🐱' : '🐾'}
                                        </span>
                                    </div>
                                    <div className="animal-info">
                                        <h3 className="animal-nome">{animal.nome}</h3>
                                        <p className="animal-raca">{animal.raca} • {animal.idade}</p>
                                        <div className="animal-tags">
                                            <span className="tag">{animal.porte}</span>
                                            <span className="tag">{animal.sexo === 'macho' ? '♂ Macho' : '♀ Fêmea'}</span>
                                            {animal.vacinado && <span className="tag tag-verde">Vacinado</span>}
                                        </div>
                                        <p className="animal-local">📍 {animal.cidade} - {animal.estado}</p>
                                        <Link to={`/animais`} className="btn btn-primario btn-card">
                                            Conhecer {animal.nome}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback cards when API is unavailable */
                            <>
                                <div className="animal-card">
                                    <div className="animal-img-wrapper">
                                        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400" alt="Rex" className="animal-img" />
                                        <span className="animal-badge-especie">🐕</span>
                                    </div>
                                    <div className="animal-info">
                                        <h3 className="animal-nome">Rex</h3>
                                        <p className="animal-raca">Vira-lata • 2 anos</p>
                                        <div className="animal-tags">
                                            <span className="tag">Médio</span>
                                            <span className="tag">♂ Macho</span>
                                            <span className="tag tag-verde">Vacinado</span>
                                        </div>
                                        <p className="animal-local">📍 Pres. Venceslau - SP</p>
                                        <Link to="/animais" className="btn btn-primario btn-card">Conhecer Rex</Link>
                                    </div>
                                </div>
                                <div className="animal-card">
                                    <div className="animal-img-wrapper">
                                        <img src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400" alt="Mimi" className="animal-img" />
                                        <span className="animal-badge-especie">🐱</span>
                                    </div>
                                    <div className="animal-info">
                                        <h3 className="animal-nome">Mimi</h3>
                                        <p className="animal-raca">Siamês • 1 ano</p>
                                        <div className="animal-tags">
                                            <span className="tag">Pequeno</span>
                                            <span className="tag">♀ Fêmea</span>
                                            <span className="tag tag-verde">Vacinado</span>
                                        </div>
                                        <p className="animal-local">📍 Pres. Prudente - SP</p>
                                        <Link to="/animais" className="btn btn-primario btn-card">Conhecer Mimi</Link>
                                    </div>
                                </div>
                                <div className="animal-card">
                                    <div className="animal-img-wrapper">
                                        <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=400" alt="Thor" className="animal-img" />
                                        <span className="animal-badge-especie">🐕</span>
                                    </div>
                                    <div className="animal-info">
                                        <h3 className="animal-nome">Thor</h3>
                                        <p className="animal-raca">Labrador • 3 anos</p>
                                        <div className="animal-tags">
                                            <span className="tag">Grande</span>
                                            <span className="tag">♂ Macho</span>
                                            <span className="tag tag-verde">Vacinado</span>
                                        </div>
                                        <p className="animal-local">📍 Pres. Venceslau - SP</p>
                                        <Link to="/animais" className="btn btn-primario btn-card">Conhecer Thor</Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="ver-todos">
                        <Link to="/animais" className="btn btn-secundario btn-grande">
                            Ver todos os animais →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Avaliações */}
            <section className="avaliacoes-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">⭐ Avaliações</span>
                        <h2 className="section-titulo">O que dizem nossos usuários</h2>
                    </div>
                    <div className="avaliacoes-grid">
                        {(avaliacoes.length > 0 ? avaliacoes : [
                            { id: 1, nome_usuario: 'Maria Silva', nota: 5, comentario: 'Site maravilhoso! Consegui encontrar um lar para meus gatinhos rapidamente.' },
                            { id: 2, nome_usuario: 'João Santos', nota: 4, comentario: 'Muito fácil de usar, adorei a iniciativa!' },
                            { id: 3, nome_usuario: 'Ana Oliveira', nota: 5, comentario: 'Plataforma excelente para quem quer ajudar os animais.' }
                        ]).map((av) => (
                            <div className="avaliacao-card" key={av.id}>
                                <div className="avaliacao-header">
                                    <div className="avaliacao-avatar">
                                        {av.nome_usuario?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h4 className="avaliacao-nome">{av.nome_usuario || 'Anônimo'}</h4>
                                        <span className="avaliacao-estrelas">{renderEstrelas(av.nota)}</span>
                                    </div>
                                </div>
                                <p className="avaliacao-comentario">"{av.comentario}"</p>
                            </div>
                        ))}
                    </div>
                    <div className="ver-todos">
                        <Link to="/avaliar" className="btn btn-primario btn-grande">
                            ⭐ Avaliar o Site
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Pronto para fazer a diferença?</h2>
                            <p>Cada adoção é uma vida transformada. Junte-se à nossa comunidade 
                               e ajude a dar um final feliz para esses animais.</p>
                            <div className="cta-botoes">
                                <Link to="/animais" className="btn btn-primario btn-grande">
                                    🐾 Adotar agora
                                </Link>
                                <Link to="/cadastro" className="btn btn-secundario-claro btn-grande">
                                    Criar minha conta
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;