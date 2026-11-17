import { useState, useEffect } from 'react';
import './Animais.css';

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
    nome_dono: string;
    telefone: string;
}

const animaisFallback: Animal[] = [
    { id: 1, nome: 'Rex', especie: 'cachorro', raca: 'Vira-lata', idade: '2 anos', porte: 'medio', sexo: 'macho', descricao: 'Cachorro muito dócil e brincalhão, ótimo com crianças.', imagem_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: true, nome_dono: 'Maria Silva', telefone: '(18) 99999-0001' },
    { id: 2, nome: 'Mimi', especie: 'gato', raca: 'Siamês', idade: '1 ano', porte: 'pequeno', sexo: 'femea', descricao: 'Gatinha carinhosa, gosta de colo e é muito tranquila.', imagem_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', cidade: 'Presidente Prudente', estado: 'SP', vacinado: true, castrado: false, nome_dono: 'Maria Silva', telefone: '(18) 99999-0001' },
    { id: 3, nome: 'Thor', especie: 'cachorro', raca: 'Labrador', idade: '3 anos', porte: 'grande', sexo: 'macho', descricao: 'Labrador enérgico, precisa de espaço. Vacinado e castrado.', imagem_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: true, nome_dono: 'Ana Oliveira', telefone: '(18) 99999-0003' },
    { id: 4, nome: 'Luna', especie: 'gato', raca: 'Persa', idade: '6 meses', porte: 'pequeno', sexo: 'femea', descricao: 'Filhote muito fofa, peluda e brincalhona.', imagem_url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: false, nome_dono: 'Ana Oliveira', telefone: '(18) 99999-0003' },
    { id: 5, nome: 'Bob', especie: 'cachorro', raca: 'Poodle', idade: '4 anos', porte: 'pequeno', sexo: 'macho', descricao: 'Poodle dócil e já adestrado. Ideal para apartamento.', imagem_url: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400', cidade: 'Presidente Prudente', estado: 'SP', vacinado: false, castrado: true, nome_dono: 'Maria Silva', telefone: '(18) 99999-0001' },
    { id: 6, nome: 'Mel', especie: 'cachorro', raca: 'Golden Retriever', idade: '1 ano', porte: 'grande', sexo: 'femea', descricao: 'Golden filhote, super amorosa e companheira.', imagem_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: false, nome_dono: 'Ana Oliveira', telefone: '(18) 99999-0003' },
];

function Animais() {
    const [animais, setAnimais] = useState<Animal[]>([]);
    const [filtros, setFiltros] = useState({
        especie: '',
        porte: '',
        sexo: '',
        busca: ''
    });
    const [animalSelecionado, setAnimalSelecionado] = useState<Animal | null>(null);

    useEffect(() => {
        buscarAnimais();
    }, []);

    const buscarAnimais = async () => {
        try {
            const params = new URLSearchParams();
            if (filtros.especie) params.append('especie', filtros.especie);
            if (filtros.porte) params.append('porte', filtros.porte);
            if (filtros.sexo) params.append('sexo', filtros.sexo);
            if (filtros.busca) params.append('busca', filtros.busca);

            const res = await fetch(`http://localhost:3000/api/animais?${params.toString()}`);
            const data = await res.json();
            setAnimais(Array.isArray(data) ? data : animaisFallback);
        } catch {
            setAnimais(animaisFallback);
        }
    };

    const handleFiltro = () => {
        buscarAnimais();
    };

    const limparFiltros = () => {
        setFiltros({ especie: '', porte: '', sexo: '', busca: '' });
        setTimeout(() => {
            buscarAnimais();
        }, 100);
    };

    const animaisFiltrados = animais.filter(a => {
        if (filtros.especie && a.especie !== filtros.especie) return false;
        if (filtros.porte && a.porte !== filtros.porte) return false;
        if (filtros.sexo && a.sexo !== filtros.sexo) return false;
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            if (!a.nome.toLowerCase().includes(busca) && 
                !a.raca.toLowerCase().includes(busca) && 
                !a.descricao.toLowerCase().includes(busca)) return false;
        }
        return true;
    });

    return (
        <div className="animais-page">
            {/* Banner */}
            <section className="animais-banner">
                <div className="container">
                    <h1>🐾 Animais para Adoção</h1>
                    <p>Encontre seu companheiro perfeito entre nossos pets disponíveis</p>
                </div>
            </section>

            <div className="container animais-content">
                {/* Filtros */}
                <aside className="filtros-panel">
                    <h3 className="filtros-titulo">🔍 Filtrar Animais</h3>
                    
                    <div className="filtro-grupo">
                        <label>Buscar por nome ou raça</label>
                        <input
                            type="text"
                            placeholder="Ex: Rex, Labrador..."
                            value={filtros.busca}
                            onChange={e => setFiltros({ ...filtros, busca: e.target.value })}
                        />
                    </div>

                    <div className="filtro-grupo">
                        <label>Espécie</label>
                        <select value={filtros.especie} onChange={e => setFiltros({ ...filtros, especie: e.target.value })}>
                            <option value="">Todas</option>
                            <option value="cachorro">🐕 Cachorro</option>
                            <option value="gato">🐱 Gato</option>
                            <option value="outro">🐾 Outro</option>
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label>Porte</label>
                        <select value={filtros.porte} onChange={e => setFiltros({ ...filtros, porte: e.target.value })}>
                            <option value="">Todos</option>
                            <option value="pequeno">Pequeno</option>
                            <option value="medio">Médio</option>
                            <option value="grande">Grande</option>
                        </select>
                    </div>

                    <div className="filtro-grupo">
                        <label>Sexo</label>
                        <select value={filtros.sexo} onChange={e => setFiltros({ ...filtros, sexo: e.target.value })}>
                            <option value="">Ambos</option>
                            <option value="macho">♂ Macho</option>
                            <option value="femea">♀ Fêmea</option>
                        </select>
                    </div>

                    <div className="filtro-botoes">
                        <button className="btn btn-primario" onClick={handleFiltro}>Buscar</button>
                        <button className="btn btn-secundario" onClick={limparFiltros}>Limpar</button>
                    </div>
                </aside>

                {/* Lista de animais */}
                <main className="animais-lista">
                    <div className="animais-header-lista">
                        <p className="animais-count">{animaisFiltrados.length} animal(is) encontrado(s)</p>
                    </div>

                    <div className="animais-grid-page">
                        {animaisFiltrados.map((animal, index) => (
                            <div
                                className="animal-card-page"
                                key={animal.id}
                                style={{ animationDelay: `${index * 0.08}s` }}
                                onClick={() => setAnimalSelecionado(animal)}
                            >
                                <div className="acp-img-wrapper">
                                    <img src={animal.imagem_url} alt={animal.nome} />
                                    <span className="acp-especie">
                                        {animal.especie === 'cachorro' ? '🐕' : animal.especie === 'gato' ? '🐱' : '🐾'}
                                    </span>
                                    {animal.vacinado && <span className="acp-badge-vacina">✓ Vacinado</span>}
                                </div>
                                <div className="acp-info">
                                    <h3>{animal.nome}</h3>
                                    <p className="acp-raca">{animal.raca} • {animal.idade}</p>
                                    <div className="acp-tags">
                                        <span className="tag">{animal.porte === 'pequeno' ? 'Pequeno' : animal.porte === 'medio' ? 'Médio' : 'Grande'}</span>
                                        <span className="tag">{animal.sexo === 'macho' ? '♂ Macho' : '♀ Fêmea'}</span>
                                        {animal.castrado && <span className="tag tag-verde">Castrado</span>}
                                    </div>
                                    <p className="acp-local">📍 {animal.cidade} - {animal.estado}</p>
                                    <button className="btn btn-primario btn-card">Ver detalhes</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {animaisFiltrados.length === 0 && (
                        <div className="sem-resultados">
                            <span className="sem-icone">🐾</span>
                            <h3>Nenhum animal encontrado</h3>
                            <p>Tente ajustar os filtros de busca</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de detalhes */}
            {animalSelecionado && (
                <div className="modal-overlay" onClick={() => setAnimalSelecionado(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <button className="modal-fechar" onClick={() => setAnimalSelecionado(null)}>✕</button>
                        <div className="modal-content">
                            <div className="modal-img">
                                <img src={animalSelecionado.imagem_url} alt={animalSelecionado.nome} />
                            </div>
                            <div className="modal-info">
                                <h2>{animalSelecionado.nome}</h2>
                                <p className="modal-raca">{animalSelecionado.raca} • {animalSelecionado.idade}</p>
                                
                                <div className="modal-tags">
                                    <span className="tag">{animalSelecionado.especie === 'cachorro' ? '🐕 Cachorro' : '🐱 Gato'}</span>
                                    <span className="tag">{animalSelecionado.porte === 'pequeno' ? 'Pequeno' : animalSelecionado.porte === 'medio' ? 'Médio' : 'Grande'}</span>
                                    <span className="tag">{animalSelecionado.sexo === 'macho' ? '♂ Macho' : '♀ Fêmea'}</span>
                                    {animalSelecionado.vacinado && <span className="tag tag-verde">✓ Vacinado</span>}
                                    {animalSelecionado.castrado && <span className="tag tag-verde">✓ Castrado</span>}
                                </div>

                                <h4>Sobre</h4>
                                <p className="modal-descricao">{animalSelecionado.descricao}</p>

                                <div className="modal-contato">
                                    <h4>📞 Contato do Tutor</h4>
                                    <p><strong>{animalSelecionado.nome_dono}</strong></p>
                                    <p>📱 {animalSelecionado.telefone}</p>
                                    <p>📍 {animalSelecionado.cidade} - {animalSelecionado.estado}</p>
                                </div>

                                <a
                                    href={`https://wa.me/55${animalSelecionado.telefone?.replace(/\D/g, '')}?text=Olá! Vi o ${animalSelecionado.nome} no SalvaPet e tenho interesse em adotá-lo!`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sucesso btn-whatsapp"
                                >
                                    💬 Falar pelo WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Animais;
