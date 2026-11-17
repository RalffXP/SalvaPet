import { useState, useEffect } from 'react';
import './Avaliar.css';

interface Avaliacao {
    id: number;
    nome_usuario: string;
    nota: number;
    comentario: string;
    criado_em: string;
}

function Avaliar() {
    const [nota, setNota] = useState(0);
    const [hoverNota, setHoverNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [media, setMedia] = useState({ media: 0, total: 0 });
    const [mensagem, setMensagem] = useState('');
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        carregarAvaliacoes();
        carregarMedia();
    }, []);

    const carregarAvaliacoes = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/avaliacoes');
            const data = await res.json();
            setAvaliacoes(Array.isArray(data) ? data : []);
        } catch {
            setAvaliacoes([
                { id: 1, nome_usuario: 'Maria Silva', nota: 5, comentario: 'Site maravilhoso! Consegui encontrar um lar para meus gatinhos rapidamente.', criado_em: '2026-09-20' },
                { id: 2, nome_usuario: 'João Santos', nota: 4, comentario: 'Muito fácil de usar, adorei a iniciativa!', criado_em: '2026-09-18' },
                { id: 3, nome_usuario: 'Ana Oliveira', nota: 5, comentario: 'Plataforma excelente para quem quer ajudar os animais.', criado_em: '2026-09-15' }
            ]);
        }
    };

    const carregarMedia = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/avaliacoes/media');
            const data = await res.json();
            setMedia(data);
        } catch {
            setMedia({ media: 4.7, total: 3 });
        }
    };

    const enviarAvaliacao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nota === 0) {
            setMensagem('Por favor, selecione uma nota');
            setSucesso(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/avaliacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nota, comentario })
            });

            if (res.ok) {
                setMensagem('🎉 Avaliação enviada com sucesso! Obrigado pelo feedback!');
                setSucesso(true);
                setNota(0);
                setComentario('');
                carregarAvaliacoes();
                carregarMedia();
            } else {
                setMensagem('Erro ao enviar avaliação. Tente novamente.');
                setSucesso(false);
            }
        } catch {
            setMensagem('Servidor indisponível. Tente novamente mais tarde.');
            setSucesso(false);
        }
    };

    const renderEstrelas = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

    const formatarData = (data: string) => {
        try {
            return new Date(data).toLocaleDateString('pt-BR');
        } catch {
            return data;
        }
    };

    return (
        <div className="avaliar-page">
            <section className="avaliar-banner">
                <div className="container">
                    <h1>⭐ Avalie o SalvaPet</h1>
                    <p>Sua opinião é muito importante para melhorarmos a plataforma</p>
                </div>
            </section>

            <div className="container avaliar-content">
                {/* Resumo */}
                <div className="avaliar-resumo">
                    <div className="resumo-card">
                        <div className="resumo-grande">
                            <span className="resumo-numero">{media.media ? Number(media.media).toFixed(1) : '4.7'}</span>
                            <span className="resumo-estrelas">{renderEstrelas(Math.round(media.media || 4.7))}</span>
                            <span className="resumo-total">{media.total || 3} avaliações</span>
                        </div>
                        <div className="resumo-barras">
                            {[5, 4, 3, 2, 1].map(n => {
                                const count = avaliacoes.filter(a => a.nota === n).length;
                                const percent = avaliacoes.length ? (count / avaliacoes.length) * 100 : (n === 5 ? 66 : n === 4 ? 33 : 0);
                                return (
                                    <div className="barra-item" key={n}>
                                        <span className="barra-label">{n}★</span>
                                        <div className="barra-bg">
                                            <div className="barra-fill" style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <span className="barra-count">{count || (n === 5 ? 2 : n === 4 ? 1 : 0)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Formulário de avaliação */}
                <div className="avaliar-form-section">
                    <form className="avaliar-form" onSubmit={enviarAvaliacao}>
                        <h3>Deixe sua avaliação</h3>

                        {mensagem && (
                            <div className={`form-mensagem ${sucesso ? 'msg-sucesso' : 'msg-erro'}`}>
                                {mensagem}
                            </div>
                        )}

                        <div className="estrelas-input">
                            <p>Qual sua nota para o SalvaPet?</p>
                            <div className="estrelas-seletor">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        className={`estrela-btn ${n <= (hoverNota || nota) ? 'ativa' : ''}`}
                                        onClick={() => setNota(n)}
                                        onMouseEnter={() => setHoverNota(n)}
                                        onMouseLeave={() => setHoverNota(0)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <span className="nota-texto">
                                {nota === 1 && 'Ruim'}
                                {nota === 2 && 'Regular'}
                                {nota === 3 && 'Bom'}
                                {nota === 4 && 'Muito bom'}
                                {nota === 5 && 'Excelente!'}
                            </span>
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="comentario">Comentário (opcional)</label>
                            <textarea
                                id="comentario"
                                rows={4}
                                placeholder="Conte sua experiência com o SalvaPet..."
                                value={comentario}
                                onChange={e => setComentario(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primario btn-submit">
                            ⭐ Enviar Avaliação
                        </button>
                    </form>
                </div>

                {/* Lista de avaliações */}
                <div className="avaliacoes-lista">
                    <h3 className="avaliacoes-lista-titulo">Avaliações recentes</h3>
                    {avaliacoes.map(av => (
                        <div className="avaliacao-item" key={av.id}>
                            <div className="avaliacao-item-header">
                                <div className="avaliacao-avatar-item">
                                    {av.nome_usuario?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <strong>{av.nome_usuario || 'Anônimo'}</strong>
                                    <div className="avaliacao-item-meta">
                                        <span className="avaliacao-estrelas-item">{renderEstrelas(av.nota)}</span>
                                        <span className="avaliacao-data">{formatarData(av.criado_em)}</span>
                                    </div>
                                </div>
                            </div>
                            {av.comentario && <p className="avaliacao-item-texto">"{av.comentario}"</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Avaliar;
