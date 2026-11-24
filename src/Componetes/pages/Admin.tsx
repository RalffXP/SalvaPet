import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './Admin.css';

interface Animal {
    id: number;
    nome: string;
    especie: 'cachorro' | 'gato' | 'outro';
    raca: string;
    idade: string;
    porte: 'pequeno' | 'medio' | 'grande';
    sexo: 'macho' | 'femea';
    descricao: string;
    imagem_url: string;
    cidade: string;
    estado: string;
    vacinado: boolean;
    castrado: boolean;
    status: 'disponivel' | 'em_analise' | 'adotado';
    usuario_id: number;
    nome_dono?: string;
}

interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha?: string;
    telefone: string;
    cidade: string;
    estado: string;
    tipo: 'adotante' | 'doador' | 'ambos' | 'admin';
    criado_em?: string;
}

const estadosUF = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

const animalInicial: Omit<Animal, 'id'> = {
    nome: '',
    especie: 'cachorro',
    raca: '',
    idade: '',
    porte: 'medio',
    sexo: 'macho',
    descricao: '',
    imagem_url: '',
    cidade: 'Presidente Venceslau',
    estado: 'SP',
    vacinado: false,
    castrado: false,
    status: 'disponivel',
    usuario_id: 1,
};

const usuarioInicial: Omit<Usuario, 'id'> = {
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cidade: 'Presidente Venceslau',
    estado: 'SP',
    tipo: 'ambos',
};

function verificarAdmin(): boolean {
    try {
        const salvo = localStorage.getItem('usuario');
        if (!salvo) return false;
        const user = JSON.parse(salvo);
        return user?.tipo === 'admin';
    } catch {
        return false;
    }
}

function Admin() {
    const [isAdmin, setIsAdmin] = useState<boolean>(() => verificarAdmin());
    const [abaAtiva, setAbaAtiva] = useState<'animais' | 'usuarios'>('animais');
    const [animais, setAnimais] = useState<Animal[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [busca, setBusca] = useState('');
    const [feedback, setFeedback] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

    // Estado do Modal de Animal
    const [modalAnimalAberto, setModalAnimalAberto] = useState(false);
    const [animalEditandoId, setAnimalEditandoId] = useState<number | null>(null);
    const [formAnimal, setFormAnimal] = useState<Omit<Animal, 'id'>>(animalInicial);

    // Estado do Modal de Usuário
    const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
    const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null);
    const [formUsuario, setFormUsuario] = useState<Omit<Usuario, 'id'>>(usuarioInicial);

    // Confirmação de exclusão
    const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<{
        tipo: 'animal' | 'usuario';
        id: number;
        nome: string;
    } | null>(null);

    const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
        setFeedback({ texto, tipo });
        setTimeout(() => setFeedback(null), 4000);
    };

    const carregarDados = async () => {
        try {
            const [resAnimais, resUsuarios] = await Promise.all([
                fetch('/api/animais'),
                fetch('/api/usuarios'),
            ]);
            if (resAnimais.ok) {
                const dataA = await resAnimais.json();
                if (Array.isArray(dataA)) setAnimais(dataA);
            }
            if (resUsuarios.ok) {
                const dataU = await resUsuarios.json();
                if (Array.isArray(dataU)) setUsuarios(dataU);
            }
        } catch {
            mostrarMensagem('Erro ao conectar com o servidor na porta 3000.', 'erro');
        }
    };

    useEffect(() => {
        const checarSessao = () => setIsAdmin(verificarAdmin());
        window.addEventListener('usuario-atualizado', checarSessao);
        if (verificarAdmin()) {
            carregarDados();
        }
        return () => window.removeEventListener('usuario-atualizado', checarSessao);
    }, []);

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    // ============================================
    // HANDLERS DE ANIMAIS
    // ============================================
    const abrirNovoAnimal = () => {
        setAnimalEditandoId(null);
        setFormAnimal({
            ...animalInicial,
            usuario_id: usuarios[0]?.id || 1,
        });
        setModalAnimalAberto(true);
    };

    const abrirEditarAnimal = (animal: Animal) => {
        setAnimalEditandoId(animal.id);
        setFormAnimal({
            nome: animal.nome || '',
            especie: animal.especie || 'cachorro',
            raca: animal.raca || '',
            idade: animal.idade || '',
            porte: animal.porte || 'medio',
            sexo: animal.sexo || 'macho',
            descricao: animal.descricao || '',
            imagem_url: animal.imagem_url || '',
            cidade: animal.cidade || '',
            estado: animal.estado || 'SP',
            vacinado: Boolean(animal.vacinado),
            castrado: Boolean(animal.castrado),
            status: animal.status || 'disponivel',
            usuario_id: animal.usuario_id || 1,
        });
        setModalAnimalAberto(true);
    };

    const handleImagemAnimalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxDim = 900;
                let width = img.width;
                let height = img.height;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    setFormAnimal(prev => ({ ...prev, imagem_url: dataUrl }));
                } else {
                    setFormAnimal(prev => ({ ...prev, imagem_url: String(reader.result) }));
                }
            };
            img.onerror = () => {
                setFormAnimal(prev => ({ ...prev, imagem_url: String(reader.result) }));
            };
            img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const salvarAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = animalEditandoId
                ? `/api/animais/${animalEditandoId}`
                : '/api/animais';
            const method = animalEditandoId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formAnimal),
            });

            const data = await res.json();
            if (res.ok) {
                mostrarMensagem(animalEditandoId ? '✅ Animal atualizado com sucesso!' : '🎉 Novo animal cadastrado com sucesso!');
                setModalAnimalAberto(false);
                carregarDados();
            } else {
                mostrarMensagem(data.mensagem || 'Erro ao salvar animal', 'erro');
            }
        } catch {
            mostrarMensagem('Erro de conexão ao salvar animal.', 'erro');
        }
    };

    // ============================================
    // HANDLERS DE USUÁRIOS
    // ============================================
    const abrirNovoUsuario = () => {
        setUsuarioEditandoId(null);
        setFormUsuario(usuarioInicial);
        setModalUsuarioAberto(true);
    };

    const abrirEditarUsuario = (u: Usuario) => {
        setUsuarioEditandoId(u.id);
        setFormUsuario({
            nome: u.nome || '',
            email: u.email || '',
            senha: '',
            telefone: u.telefone || '',
            cidade: u.cidade || '',
            estado: u.estado || 'SP',
            tipo: u.tipo || 'ambos',
        });
        setModalUsuarioAberto(true);
    };

    const salvarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = usuarioEditandoId
                ? `/api/usuarios/${usuarioEditandoId}`
                : '/api/usuarios';
            const method = usuarioEditandoId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formUsuario),
            });

            const data = await res.json();
            if (res.ok) {
                mostrarMensagem(usuarioEditandoId ? '✅ Usuário atualizado com sucesso!' : '🎉 Novo usuário cadastrado com sucesso!');
                setModalUsuarioAberto(false);
                carregarDados();
            } else {
                mostrarMensagem(data.mensagem || 'Erro ao salvar usuário', 'erro');
            }
        } catch {
            mostrarMensagem('Erro de conexão ao salvar usuário.', 'erro');
        }
    };

    // ============================================
    // HANDLER DE EXCLUSÃO
    // ============================================
    const confirmarExclusao = async () => {
        if (!confirmacaoExclusao) return;
        const { tipo, id } = confirmacaoExclusao;
        try {
            const endpoint = tipo === 'animal' ? `animais/${id}` : `usuarios/${id}`;
            const res = await fetch(`/api/${endpoint}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                mostrarMensagem(tipo === 'animal' ? '🗑️ Animal excluído com sucesso!' : '🗑️ Usuário excluído com sucesso!');
                setConfirmacaoExclusao(null);
                carregarDados();
            } else {
                mostrarMensagem('Erro ao excluir registro.', 'erro');
            }
        } catch {
            mostrarMensagem('Erro de conexão ao excluir registro.', 'erro');
        }
    };

    // Filtros de busca
    const termoBusca = busca.toLowerCase();
    const animaisFiltrados = animais.filter(a =>
        a.nome?.toLowerCase().includes(termoBusca) ||
        a.raca?.toLowerCase().includes(termoBusca) ||
        a.cidade?.toLowerCase().includes(termoBusca) ||
        a.especie?.toLowerCase().includes(termoBusca)
    );

    const usuariosFiltrados = usuarios.filter(u =>
        u.nome?.toLowerCase().includes(termoBusca) ||
        u.email?.toLowerCase().includes(termoBusca) ||
        u.cidade?.toLowerCase().includes(termoBusca) ||
        u.tipo?.toLowerCase().includes(termoBusca)
    );

    return (
        <div className="admin-page">
            {/* Banner */}
            <section className="admin-banner">
                <div className="container admin-banner-inner">
                    <div>
                        <span className="admin-badge-topo">👑 Painel Administrativo</span>
                        <h1>Gerenciamento SalvaPet</h1>
                        <p>Adicione, edite e exclua animais e usuários cadastrados na plataforma</p>
                    </div>
                    <div className="admin-banner-actions">
                        <Link to="/animais" className="btn btn-secundario-claro">
                            🐾 Ver Site Público
                        </Link>
                    </div>
                </div>
            </section>

            <div className="container admin-container">
                {/* Cards de Resumo */}
                <div className="admin-kpis">
                    <div className="admin-kpi-card">
                        <span className="kpi-icon">🐾</span>
                        <div>
                            <strong>{animais.length}</strong>
                            <span>Total de Animais</span>
                        </div>
                    </div>
                    <div className="admin-kpi-card">
                        <span className="kpi-icon">💚</span>
                        <div>
                            <strong>{animais.filter(a => a.status === 'disponivel').length}</strong>
                            <span>Disponíveis</span>
                        </div>
                    </div>
                    <div className="admin-kpi-card">
                        <span className="kpi-icon">🏡</span>
                        <div>
                            <strong>{animais.filter(a => a.status === 'adotado').length}</strong>
                            <span>Adotados</span>
                        </div>
                    </div>
                    <div className="admin-kpi-card">
                        <span className="kpi-icon">👥</span>
                        <div>
                            <strong>{usuarios.length}</strong>
                            <span>Usuários Cadastrados</span>
                        </div>
                    </div>
                </div>

                {/* Mensagem de Feedback */}
                {feedback && (
                    <div className={`admin-feedback ${feedback.tipo === 'sucesso' ? 'sucesso' : 'erro'}`}>
                        {feedback.texto}
                    </div>
                )}

                {/* Barra de Abas e Ações */}
                <div className="admin-toolbar">
                    <div className="admin-tabs">
                        <button
                            type="button"
                            className={`admin-tab ${abaAtiva === 'animais' ? 'ativa' : ''}`}
                            onClick={() => { setAbaAtiva('animais'); setBusca(''); }}
                        >
                            🐾 Animais ({animais.length})
                        </button>
                        <button
                            type="button"
                            className={`admin-tab ${abaAtiva === 'usuarios' ? 'ativa' : ''}`}
                            onClick={() => { setAbaAtiva('usuarios'); setBusca(''); }}
                        >
                            👥 Usuários ({usuarios.length})
                        </button>
                    </div>

                    <div className="admin-actions-right">
                        <div className="admin-search">
                            <input
                                type="text"
                                placeholder={abaAtiva === 'animais' ? '🔍 Buscar animal por nome, raça, cidade...' : '🔍 Buscar usuário por nome, email, tipo...'}
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>

                        {abaAtiva === 'animais' ? (
                            <button type="button" className="btn btn-primario" onClick={abrirNovoAnimal}>
                                + Adicionar Animal
                            </button>
                        ) : (
                            <button type="button" className="btn btn-primario" onClick={abrirNovoUsuario}>
                                + Adicionar Usuário
                            </button>
                        )}
                    </div>
                </div>

                {/* ============================================
                    ABA: ANIMAIS
                    ============================================ */}
                {abaAtiva === 'animais' && (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Animal</th>
                                    <th>Espécie / Raça</th>
                                    <th>Porte / Sexo</th>
                                    <th>Localização</th>
                                    <th>Saúde</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {animaisFiltrados.map(animal => (
                                    <tr key={animal.id}>
                                        <td className="td-id">#{animal.id}</td>
                                        <td>
                                            <div className="td-animal-info">
                                                <img
                                                    src={animal.imagem_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'}
                                                    alt={animal.nome}
                                                    className="td-animal-thumb"
                                                />
                                                <div>
                                                    <strong>{animal.nome}</strong>
                                                    <span className="td-sub">{animal.idade || 'Idade não inf.'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-especie">
                                                {animal.especie === 'cachorro' ? '🐕 Cachorro' : animal.especie === 'gato' ? '🐱 Gato' : '🐾 Outro'}
                                            </span>
                                            <div className="td-sub">{animal.raca || 'SRD'}</div>
                                        </td>
                                        <td>
                                            <span className="td-capitalize">{animal.porte}</span>
                                            <div className="td-sub">{animal.sexo === 'macho' ? '♂ Macho' : '♀ Fêmea'}</div>
                                        </td>
                                        <td>
                                            {animal.cidade} - {animal.estado}
                                            <div className="td-sub">Tutor: {animal.nome_dono || `#${animal.usuario_id}`}</div>
                                        </td>
                                        <td>
                                            <div className="td-badges-saude">
                                                <span className={`mini-badge ${Boolean(animal.vacinado) ? 'sim' : 'nao'}`}>
                                                    {Boolean(animal.vacinado) ? '✓ Vacinado' : '✗ Não vacinado'}
                                                </span>
                                                <span className={`mini-badge ${Boolean(animal.castrado) ? 'sim' : 'nao-castrado'}`}>
                                                    {Boolean(animal.castrado) ? '✓ Castrado' : 'Não castrado'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill status-${animal.status || 'disponivel'}`}>
                                                {animal.status === 'adotado'
                                                    ? '🏡 Adotado'
                                                    : animal.status === 'em_analise'
                                                    ? '⏳ Em análise'
                                                    : '💚 Disponível'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="td-acoes">
                                                <button
                                                    type="button"
                                                    className="btn-acao editar"
                                                    onClick={() => abrirEditarAnimal(animal)}
                                                    title="Editar animal"
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-acao excluir"
                                                    onClick={() => setConfirmacaoExclusao({ tipo: 'animal', id: animal.id, nome: animal.nome })}
                                                    title="Excluir animal"
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {animaisFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="td-vazio">
                                            Nenhum animal encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ============================================
                    ABA: USUÁRIOS
                    ============================================ */}
                {abaAtiva === 'usuarios' && (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Telefone</th>
                                    <th>Cidade / UF</th>
                                    <th>Perfil</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.map(u => (
                                    <tr key={u.id}>
                                        <td className="td-id">#{u.id}</td>
                                        <td>
                                            <div className="td-user-info">
                                                <div className="td-user-avatar">
                                                    {u.nome?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <strong>{u.nome}</strong>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.telefone || '—'}</td>
                                        <td>{u.cidade ? `${u.cidade} - ${u.estado}` : '—'}</td>
                                        <td>
                                            <span className={`role-pill role-${u.tipo}`}>
                                                {u.tipo === 'admin'
                                                    ? '👑 Admin'
                                                    : u.tipo === 'doador'
                                                    ? '💛 Doador'
                                                    : u.tipo === 'adotante'
                                                    ? '🐾 Adotante'
                                                    : '🤝 Ambos'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="td-acoes">
                                                <button
                                                    type="button"
                                                    className="btn-acao editar"
                                                    onClick={() => abrirEditarUsuario(u)}
                                                    title="Editar usuário"
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-acao excluir"
                                                    onClick={() => setConfirmacaoExclusao({ tipo: 'usuario', id: u.id, nome: u.nome })}
                                                    title="Excluir usuário"
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="td-vazio">
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ============================================
                MODAL: ADICIONAR / EDITAR ANIMAL
                ============================================ */}
            {modalAnimalAberto && (
                <div className="admin-modal-overlay" onClick={() => setModalAnimalAberto(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{animalEditandoId ? `✏️ Editar Animal #${animalEditandoId}` : '🐾 Novo Animal'}</h3>
                            <button type="button" className="admin-modal-close" onClick={() => setModalAnimalAberto(false)}>✕</button>
                        </div>

                        <form onSubmit={salvarAnimal} className="admin-modal-form">
                            <div className="admin-form-grid">
                                <div className="form-grupo">
                                    <label>Nome do Animal *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Rex"
                                        value={formAnimal.nome}
                                        onChange={e => setFormAnimal({ ...formAnimal, nome: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Espécie *</label>
                                    <select
                                        value={formAnimal.especie}
                                        onChange={e => setFormAnimal({ ...formAnimal, especie: e.target.value as Animal['especie'] })}
                                    >
                                        <option value="cachorro">🐕 Cachorro</option>
                                        <option value="gato">🐱 Gato</option>
                                        <option value="outro">🐾 Outro</option>
                                    </select>
                                </div>

                                <div className="form-grupo">
                                    <label>Raça</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Vira-lata, Labrador"
                                        value={formAnimal.raca}
                                        onChange={e => setFormAnimal({ ...formAnimal, raca: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Idade</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 2 anos, 6 meses"
                                        value={formAnimal.idade}
                                        onChange={e => setFormAnimal({ ...formAnimal, idade: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Porte</label>
                                    <select
                                        value={formAnimal.porte}
                                        onChange={e => setFormAnimal({ ...formAnimal, porte: e.target.value as Animal['porte'] })}
                                    >
                                        <option value="pequeno">Pequeno</option>
                                        <option value="medio">Médio</option>
                                        <option value="grande">Grande</option>
                                    </select>
                                </div>

                                <div className="form-grupo">
                                    <label>Sexo *</label>
                                    <select
                                        value={formAnimal.sexo}
                                        onChange={e => setFormAnimal({ ...formAnimal, sexo: e.target.value as Animal['sexo'] })}
                                    >
                                        <option value="macho">♂ Macho</option>
                                        <option value="femea">♀ Fêmea</option>
                                    </select>
                                </div>

                                <div className="form-grupo">
                                    <label>Status</label>
                                    <select
                                        value={formAnimal.status}
                                        onChange={e => setFormAnimal({ ...formAnimal, status: e.target.value as Animal['status'] })}
                                    >
                                        <option value="disponivel">💚 Disponível</option>
                                        <option value="em_analise">⏳ Em análise</option>
                                        <option value="adotado">🏡 Adotado</option>
                                    </select>
                                </div>

                                <div className="form-grupo">
                                    <label>Tutor Responsável</label>
                                    <select
                                        value={formAnimal.usuario_id}
                                        onChange={e => setFormAnimal({ ...formAnimal, usuario_id: Number(e.target.value) })}
                                    >
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.nome} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-grupo">
                                    <label>Cidade</label>
                                    <input
                                        type="text"
                                        placeholder="Cidade"
                                        value={formAnimal.cidade}
                                        onChange={e => setFormAnimal({ ...formAnimal, cidade: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Estado (UF)</label>
                                    <select
                                        value={formAnimal.estado}
                                        onChange={e => setFormAnimal({ ...formAnimal, estado: e.target.value })}
                                    >
                                        {estadosUF.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-grupo form-col-full">
                                    <label>Foto do Animal (Upload de Imagem)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImagemAnimalUpload}
                                    />
                                    {formAnimal.imagem_url && (
                                        <div className="admin-upload-preview">
                                            <img src={formAnimal.imagem_url} alt="Pré-visualização" />
                                            <button
                                                type="button"
                                                className="btn-acao excluir"
                                                onClick={() => setFormAnimal({ ...formAnimal, imagem_url: '' })}
                                            >
                                                ✕ Remover imagem
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="form-grupo form-col-full">
                                    <label>Descrição</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Temperamento, cuidados e história do pet..."
                                        value={formAnimal.descricao}
                                        onChange={e => setFormAnimal({ ...formAnimal, descricao: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo form-col-full admin-checkboxes">
                                    <label className="admin-check-label">
                                        <input
                                            type="checkbox"
                                            checked={formAnimal.vacinado}
                                            onChange={e => setFormAnimal({ ...formAnimal, vacinado: e.target.checked })}
                                        />
                                        <span>✓ Animal Vacinado</span>
                                    </label>
                                    <label className="admin-check-label">
                                        <input
                                            type="checkbox"
                                            checked={formAnimal.castrado}
                                            onChange={e => setFormAnimal({ ...formAnimal, castrado: e.target.checked })}
                                        />
                                        <span>✓ Animal Castrado</span>
                                    </label>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="btn btn-secundario" onClick={() => setModalAnimalAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primario">
                                    {animalEditandoId ? 'Salvar Alterações' : 'Cadastrar Animal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================
                MODAL: ADICIONAR / EDITAR USUÁRIO
                ============================================ */}
            {modalUsuarioAberto && (
                <div className="admin-modal-overlay" onClick={() => setModalUsuarioAberto(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{usuarioEditandoId ? `✏️ Editar Usuário #${usuarioEditandoId}` : '👥 Novo Usuário'}</h3>
                            <button type="button" className="admin-modal-close" onClick={() => setModalUsuarioAberto(false)}>✕</button>
                        </div>

                        <form onSubmit={salvarUsuario} className="admin-modal-form">
                            <div className="admin-form-grid">
                                <div className="form-grupo">
                                    <label>Nome Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nome do usuário"
                                        value={formUsuario.nome}
                                        onChange={e => setFormUsuario({ ...formUsuario, nome: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>E-mail *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@exemplo.com"
                                        value={formUsuario.email}
                                        onChange={e => setFormUsuario({ ...formUsuario, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>{usuarioEditandoId ? 'Nova Senha (deixe em branco p/ manter)' : 'Senha *'}</label>
                                    <input
                                        type="password"
                                        required={!usuarioEditandoId}
                                        placeholder={usuarioEditandoId ? '••••••••' : 'Digite uma senha'}
                                        value={formUsuario.senha}
                                        onChange={e => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="(18) 99999-0000"
                                        value={formUsuario.telefone}
                                        onChange={e => setFormUsuario({ ...formUsuario, telefone: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Cidade</label>
                                    <input
                                        type="text"
                                        placeholder="Sua cidade"
                                        value={formUsuario.cidade}
                                        onChange={e => setFormUsuario({ ...formUsuario, cidade: e.target.value })}
                                    />
                                </div>

                                <div className="form-grupo">
                                    <label>Estado (UF)</label>
                                    <select
                                        value={formUsuario.estado}
                                        onChange={e => setFormUsuario({ ...formUsuario, estado: e.target.value })}
                                    >
                                        {estadosUF.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-grupo form-col-full">
                                    <label>Perfil / Tipo de Conta *</label>
                                    <select
                                        value={formUsuario.tipo}
                                        onChange={e => setFormUsuario({ ...formUsuario, tipo: e.target.value as Usuario['tipo'] })}
                                    >
                                        <option value="adotante">🐾 Adotante</option>
                                        <option value="doador">💛 Doador</option>
                                        <option value="ambos">🤝 Ambos (Adotante e Doador)</option>
                                        <option value="admin">👑 Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button type="button" className="btn btn-secundario" onClick={() => setModalUsuarioAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primario">
                                    {usuarioEditandoId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================
                MODAL: CONFIRMAR EXCLUSÃO
                ============================================ */}
            {confirmacaoExclusao && (
                <div className="admin-modal-overlay" onClick={() => setConfirmacaoExclusao(null)}>
                    <div className="admin-modal admin-modal-pequeno" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>🗑️ Confirmar Exclusão</h3>
                            <button type="button" className="admin-modal-close" onClick={() => setConfirmacaoExclusao(null)}>✕</button>
                        </div>
                        <div className="admin-modal-body">
                            <p>
                                Tem certeza que deseja excluir {confirmacaoExclusao.tipo === 'animal' ? 'o animal' : 'o usuário'}{' '}
                                <strong>{confirmacaoExclusao.nome}</strong>? Essa ação não poderá ser desfeita.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button type="button" className="btn btn-secundario" onClick={() => setConfirmacaoExclusao(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-perigo" onClick={confirmarExclusao}>
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;

