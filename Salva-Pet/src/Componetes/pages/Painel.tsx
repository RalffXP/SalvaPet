import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, authHeaders, getUsuarioLogado } from '../auth';
import './Painel.css';

type Status = 'disponivel' | 'em_analise' | 'adotado';

type AnimalPainel = {
    id: number;
    nome: string;
    especie: 'cachorro' | 'gato' | 'outro';
    raca?: string;
    idade?: string;
    porte?: string;
    sexo: 'macho' | 'femea';
    imagem_url?: string;
    cidade?: string;
    estado?: string;
    status: Status;
    usuario_id: number;
    nome_dono: string;
    email_dono: string;
    criado_em: string;
};

type MensagemContato = {
    id: number;
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
    lida: boolean | number;
    criado_em: string;
};

type Toast = { texto: string; tipo: 'sucesso' | 'erro' } | null;

const STATUS_LABEL: Record<Status, string> = {
    disponivel: 'Disponível',
    em_analise: 'Em análise',
    adotado: 'Adotado',
};

const ESPECIE_EMOJI: Record<string, string> = { cachorro: '🐕', gato: '🐱', outro: '🐾' };

function Painel() {
    const navigate = useNavigate();
    const usuario = getUsuarioLogado();

    const [abaPrincipal, setAbaPrincipal] = useState<'animais' | 'contatos'>('animais');
    const [animais, setAnimais] = useState<AnimalPainel[]>([]);
    const [contatos, setContatos] = useState<MensagemContato[]>([]);
    const [perfil, setPerfil] = useState<'usuario' | 'admin'>(usuario?.perfil ?? 'usuario');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<'todos' | Status>('todos');
    const [busca, setBusca] = useState('');
    const [processandoId, setProcessandoId] = useState<number | null>(null);
    const [animalExcluir, setAnimalExcluir] = useState<AnimalPainel | null>(null);
    const [toast, setToast] = useState<Toast>(null);

    const isAdmin = perfil === 'admin';

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro('');
        try {
            const res = await fetch(`${API_URL}/api/painel/animais`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || 'Erro ao carregar painel');
            setAnimais(data.animais);
            setPerfil(data.perfil);

            // Se for admin, carregar também as mensagens de contato
            if (data.perfil === 'admin') {
                const resContatos = await fetch(`${API_URL}/api/contato`, { headers: authHeaders() });
                if (resContatos.ok) {
                    const dataContatos = await resContatos.json();
                    setContatos(dataContatos);
                }
            }
        } catch (e) {
            setErro(e instanceof Error && e.message !== 'Failed to fetch' ? e.message : 'Servidor indisponível. Tente novamente mais tarde.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        if (!usuario) {
            navigate('/login', { replace: true });
            return;
        }
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    const estatisticas = useMemo(() => ({
        total: animais.length,
        disponivel: animais.filter(a => a.status === 'disponivel').length,
        em_analise: animais.filter(a => a.status === 'em_analise').length,
        adotado: animais.filter(a => a.status === 'adotado').length,
        mensagensNaoLidas: contatos.filter(c => !c.lida).length,
    }), [animais, contatos]);

    const animaisFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return animais.filter(a => {
            if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
            if (!termo) return true;
            return [a.nome, a.raca, a.cidade, a.nome_dono].some(v => v?.toLowerCase().includes(termo));
        });
    }, [animais, filtroStatus, busca]);

    const alterarStatus = async (animal: AnimalPainel, status: Status) => {
        setProcessandoId(animal.id);
        try {
            const res = await fetch(`${API_URL}/api/animais/${animal.id}/status`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem);
            setAnimais(prev => prev.map(a => (a.id === animal.id ? { ...a, status } : a)));
            setToast({ texto: status === 'adotado' ? `${animal.nome} foi marcado como adotado! 🎉` : `${animal.nome} voltou para adoção.`, tipo: 'sucesso' });
        } catch (e) {
            setToast({ texto: e instanceof Error && e.message ? e.message : 'Erro ao atualizar status', tipo: 'erro' });
        } finally {
            setProcessandoId(null);
        }
    };

    const confirmarExclusao = async () => {
        if (!animalExcluir) return;
        const animal = animalExcluir;
        setProcessandoId(animal.id);
        try {
            const res = await fetch(`${API_URL}/api/animais/${animal.id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem);
            setAnimais(prev => prev.filter(a => a.id !== animal.id));
            setToast({ texto: `${animal.nome} foi removido.`, tipo: 'sucesso' });
        } catch (e) {
            setToast({ texto: e instanceof Error && e.message ? e.message : 'Erro ao excluir animal', tipo: 'erro' });
        } finally {
            setProcessandoId(null);
            setAnimalExcluir(null);
        }
    };

    const marcarMensagemLida = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/api/contato/${id}/lida`, {
                method: 'PATCH',
                headers: authHeaders()
            });
            if (res.ok) {
                setContatos(prev => prev.map(c => c.id === id ? { ...c, lida: true } : c));
                setToast({ texto: 'Mensagem marcada como lida.', tipo: 'sucesso' });
            }
        } catch {
            setToast({ texto: 'Erro ao atualizar mensagem.', tipo: 'erro' });
        }
    };

    if (!usuario) return null;

    return (
        <div className="painel-page">
            <section className={`painel-banner ${isAdmin ? 'admin' : ''}`}>
                <div className="container painel-banner-conteudo">
                    <div>
                        <span className={`painel-perfil-badge ${isAdmin ? 'admin' : ''}`}>
                            {isAdmin ? '🛡️ Administrador' : '👤 Usuário'}
                        </span>
                        <h1>{isAdmin ? 'Painel Administrativo' : 'Meus Animais'}</h1>
                        <p>
                            Olá, <strong>{usuario.nome.split(' ')[0]}</strong>!{' '}
                            {isAdmin
                                ? 'Gerencie animais, aprovações e responda mensagens de contato dos usuários.'
                                : 'Gerencie os animais que você cadastrou para adoção.'}
                        </p>
                    </div>
                    <Link to="/doar" className="btn btn-primario" id="painel-novo-animal">
                        ➕ Cadastrar animal
                    </Link>
                </div>
            </section>

            <div className="container painel-conteudo">
                {/* Abas Superiores para Administrador: Animais vs Mensagens */}
                {isAdmin && (
                    <div className="painel-seletor-abas">
                        <button
                            className={`btn-aba-principal ${abaPrincipal === 'animais' ? 'ativo' : ''}`}
                            onClick={() => setAbaPrincipal('animais')}
                        >
                            🐾 Gerenciar Animais ({animais.length})
                        </button>
                        <button
                            className={`btn-aba-principal ${abaPrincipal === 'contatos' ? 'ativo' : ''}`}
                            onClick={() => setAbaPrincipal('contatos')}
                        >
                            📬 Mensagens de Contato ({contatos.length})
                            {estatisticas.mensagensNaoLidas > 0 && (
                                <span className="badge-nao-lidas">{estatisticas.mensagensNaoLidas} novas</span>
                            )}
                        </button>
                    </div>
                )}

                {abaPrincipal === 'animais' ? (
                    <>
                        <div className="painel-stats">
                            <div className="stat-card">
                                <span className="stat-icone">📋</span>
                                <div><strong>{estatisticas.total}</strong><span>Total</span></div>
                            </div>
                            <div className="stat-card disponivel">
                                <span className="stat-icone">🏠</span>
                                <div><strong>{estatisticas.disponivel}</strong><span>Disponíveis</span></div>
                            </div>
                            <div className="stat-card em_analise">
                                <span className="stat-icone">⏳</span>
                                <div><strong>{estatisticas.em_analise}</strong><span>Em análise</span></div>
                            </div>
                            <div className="stat-card adotado">
                                <span className="stat-icone">💛</span>
                                <div><strong>{estatisticas.adotado}</strong><span>Adotados</span></div>
                            </div>
                        </div>

                        <div className="painel-toolbar">
                            <div className="painel-tabs" role="tablist">
                                {(['todos', 'disponivel', 'em_analise', 'adotado'] as const).map(s => (
                                    <button
                                        key={s}
                                        id={`painel-filtro-${s}`}
                                        role="tab"
                                        aria-selected={filtroStatus === s}
                                        className={`painel-tab ${filtroStatus === s ? 'ativo' : ''}`}
                                        onClick={() => setFiltroStatus(s)}
                                    >
                                        {s === 'todos' ? 'Todos' : STATUS_LABEL[s]}
                                    </button>
                                ))}
                            </div>
                            <input
                                id="painel-busca"
                                type="search"
                                className="painel-busca"
                                placeholder={isAdmin ? '🔎 Buscar por nome, raça, cidade ou responsável...' : '🔎 Buscar por nome, raça ou cidade...'}
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>

                        {carregando ? (
                            <div className="painel-grid">
                                {[1, 2, 3].map(i => <div key={i} className="painel-card skeleton" />)}
                            </div>
                        ) : erro ? (
                            <div className="painel-vazio">
                                <span>⚠️</span>
                                <p>{erro}</p>
                                <button className="btn btn-secundario" onClick={carregar}>Tentar novamente</button>
                            </div>
                        ) : animaisFiltrados.length === 0 ? (
                            <div className="painel-vazio">
                                <span>🐾</span>
                                <p>{animais.length === 0 ? 'Nenhum animal cadastrado ainda.' : 'Nenhum animal encontrado com esses filtros.'}</p>
                                {animais.length === 0 && <Link to="/doar" className="btn btn-primario">Cadastrar meu primeiro animal</Link>}
                            </div>
                        ) : (
                            <div className="painel-grid">
                                {animaisFiltrados.map(animal => {
                                    const ocupado = processandoId === animal.id;
                                    const ehDono = animal.usuario_id === usuario.id;
                                    return (
                                        <article key={animal.id} className={`painel-card status-${animal.status}`}>
                                            <div className="painel-card-img">
                                                {animal.imagem_url
                                                    ? <img src={animal.imagem_url} alt={animal.nome} loading="lazy" />
                                                    : <div className="painel-card-sem-img">{ESPECIE_EMOJI[animal.especie]}</div>}
                                                <span className={`status-badge ${animal.status}`}>{STATUS_LABEL[animal.status]}</span>
                                                {animal.status === 'adotado' && <div className="selo-adotado">ADOTADO 💛</div>}
                                            </div>

                                            <div className="painel-card-corpo">
                                                <h3>{ESPECIE_EMOJI[animal.especie]} {animal.nome}</h3>
                                                <p className="painel-card-info">
                                                    {[animal.raca, animal.idade, animal.sexo === 'macho' ? '♂ Macho' : '♀ Fêmea'].filter(Boolean).join(' • ')}
                                                </p>
                                                {(animal.cidade || animal.estado) && (
                                                    <p className="painel-card-local">📍 {[animal.cidade, animal.estado].filter(Boolean).join(' - ')}</p>
                                                )}
                                                {isAdmin && (
                                                    <p className="painel-card-dono" title={animal.email_dono}>
                                                        👤 {ehDono ? 'Cadastrado por você' : `Cadastrado por ${animal.nome_dono}`}
                                                    </p>
                                                )}

                                                <div className="painel-card-acoes">
                                                    {animal.status !== 'adotado' ? (
                                                        <button
                                                            id={`btn-adotado-${animal.id}`}
                                                            className="acao-btn acao-adotado"
                                                            disabled={ocupado}
                                                            onClick={() => alterarStatus(animal, 'adotado')}
                                                        >
                                                            {ocupado ? '...' : '💛 Marcar como adotado'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            id={`btn-disponivel-${animal.id}`}
                                                            className="acao-btn acao-reverter"
                                                            disabled={ocupado}
                                                            onClick={() => alterarStatus(animal, 'disponivel')}
                                                        >
                                                            {ocupado ? '...' : '↩️ Voltar para adoção'}
                                                        </button>
                                                    )}
                                                    <button
                                                        id={`btn-excluir-${animal.id}`}
                                                        className="acao-btn acao-excluir"
                                                        disabled={ocupado}
                                                        onClick={() => setAnimalExcluir(animal)}
                                                        aria-label={`Excluir ${animal.nome}`}
                                                    >
                                                        🗑️ Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    /* Seção de Mensagens de Contato */
                    <div className="painel-contatos-container">
                        <div className="painel-contatos-header">
                            <h2>📬 Mensagens Recebidas pelo Fale Conosco</h2>
                            <p>Responda as solicitações dos visitantes ou marque como concluídas.</p>
                        </div>

                        {contatos.length === 0 ? (
                            <div className="painel-vazio">
                                <span>✉️</span>
                                <p>Nenhuma mensagem de contato recebida até o momento.</p>
                            </div>
                        ) : (
                            <div className="painel-contatos-lista">
                                {contatos.map(item => (
                                    <div key={item.id} className={`contato-card ${item.lida ? 'lida' : 'nova'}`}>
                                        <div className="contato-card-topo">
                                            <div>
                                                <span className="contato-card-assunto">📌 {item.assunto}</span>
                                                <h4 className="contato-card-nome">{item.nome}</h4>
                                                <a href={`mailto:${item.email}`} className="contato-card-email">
                                                    ✉️ {item.email}
                                                </a>
                                            </div>
                                            <div className="contato-card-meta">
                                                <span className="contato-card-data">
                                                    {new Date(item.criado_em).toLocaleString('pt-BR')}
                                                </span>
                                                {!item.lida && <span className="tag-nova">Nova</span>}
                                            </div>
                                        </div>

                                        <div className="contato-card-mensagem">
                                            <p>{item.mensagem}</p>
                                        </div>

                                        <div className="contato-card-acoes">
                                            <a
                                                href={`mailto:${item.email}?subject=Re:%20${encodeURIComponent(item.assunto)}%20-%20SalvaPet`}
                                                className="btn btn-primario btn-sm"
                                            >
                                                ✉️ Responder por E-mail
                                            </a>
                                            {!item.lida && (
                                                <button
                                                    className="btn btn-secundario btn-sm"
                                                    onClick={() => marcarMensagemLida(item.id)}
                                                >
                                                    ✓ Marcar como Lida
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {animalExcluir && (
                <div className="painel-modal-fundo" onClick={() => processandoId === null && setAnimalExcluir(null)}>
                    <div className="painel-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                        <div className="painel-modal-icone">🗑️</div>
                        <h3>Excluir {animalExcluir.nome}?</h3>
                        <p>Esta ação não pode ser desfeita. O anúncio será removido permanentemente da plataforma.</p>
                        <div className="painel-modal-acoes">
                            <button className="btn btn-secundario" id="modal-cancelar" onClick={() => setAnimalExcluir(null)} disabled={processandoId !== null}>
                                Cancelar
                            </button>
                            <button className="btn btn-perigo" id="modal-confirmar-exclusao" onClick={confirmarExclusao} disabled={processandoId !== null}>
                                {processandoId !== null ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`painel-toast ${toast.tipo}`} role="status">{toast.texto}</div>}
        </div>
    );
}

export default Painel;
