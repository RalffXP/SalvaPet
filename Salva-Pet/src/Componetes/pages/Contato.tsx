import { useEffect, useState } from 'react';
import { API_URL, getUsuarioLogado } from '../auth';
import './Contato.css';

function Contato() {
    const usuarioLogado = getUsuarioLogado();

    const [formData, setFormData] = useState({
        nome: usuarioLogado?.nome || '',
        email: usuarioLogado?.email || '',
        assunto: '',
        mensagem: ''
    });

    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!sucesso) return;
        const timer = setTimeout(() => setSucesso(''), 6000);
        return () => clearTimeout(timer);
    }, [sucesso]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSucesso('');
        setErro('');

        if (!formData.nome.trim() || !formData.email.trim() || !formData.assunto || !formData.mensagem.trim()) {
            setErro('Por favor, preencha todos os campos do formulário.');
            return;
        }

        setEnviando(true);

        try {
            const res = await fetch(`${API_URL}/api/contato`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSucesso(data.mensagem || 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
                setFormData({
                    nome: usuarioLogado?.nome || '',
                    email: usuarioLogado?.email || '',
                    assunto: '',
                    mensagem: ''
                });
            } else {
                setErro(data.mensagem || 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.');
            }
        } catch {
            setErro('Servidor indisponível no momento. Você também pode nos contatar diretamente pelo WhatsApp ao lado!');
        } finally {
            setEnviando(false);
        }
    };

    const whatsappNumero = '5518999990000';
    const whatsappMensagem = encodeURIComponent('Olá! Vim através do site SalvaPet e gostaria de tirar uma dúvida.');
    const whatsappLink = `https://wa.me/${whatsappNumero}?text=${whatsappMensagem}`;

    return (
        <div className="contato-page">
            <section className="contato-banner">
                <div className="container">
                    <h1>📧 Fale Conosco</h1>
                    <p>Tem dúvidas, sugestões ou precisa de ajuda? Nossa equipe está pronta para te atender!</p>
                </div>
            </section>

            <div className="container contato-content">
                <div className="contato-info">
                    <div className="contato-info-card">
                        <h3>Informações de Contato</h3>

                        <a href="mailto:contato@salvapet.com.br?subject=Contato%20via%20SalvaPet" className="contato-item-link">
                            <div className="contato-item">
                                <span className="contato-icone">📧</span>
                                <div>
                                    <strong>Email</strong>
                                    <p>contato@salvapet.com.br</p>
                                </div>
                            </div>
                        </a>

                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contato-item-link">
                            <div className="contato-item">
                                <span className="contato-icone">📱</span>
                                <div>
                                    <strong>WhatsApp</strong>
                                    <p>(18) 99999-0000 <span className="tag-online">Online</span></p>
                                </div>
                            </div>
                        </a>

                        <div className="contato-item">
                            <span className="contato-icone">📍</span>
                            <div>
                                <strong>Localização</strong>
                                <p>Presidente Venceslau - SP</p>
                            </div>
                        </div>

                        <div className="contato-item">
                            <span className="contato-icone">🕐</span>
                            <div>
                                <strong>Horário de Atendimento</strong>
                                <p>Segunda a Sexta, das 8h às 18h</p>
                            </div>
                        </div>

                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                            💬 Chamar no WhatsApp
                        </a>
                    </div>

                    <div className="contato-social">
                        <h4>Siga nossas Redes</h4>
                        <div className="social-links">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                                📷 Instagram <span className="social-handle">@salvapet.oficial</span>
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
                                📘 Facebook <span className="social-handle">/salvapet</span>
                            </a>
                        </div>
                    </div>
                </div>

                <form className="contato-form" onSubmit={handleSubmit}>
                    <h3>Envie sua Mensagem</h3>
                    <p className="form-subtitulo">Preencha o formulário abaixo e responderemos o mais rápido possível.</p>

                    {sucesso && (
                        <div className="form-mensagem msg-sucesso animate-fadeIn" role="status">
                            ✅ {sucesso}
                        </div>
                    )}

                    {erro && (
                        <div className="form-mensagem msg-erro animate-fadeIn" role="alert">
                            ⚠️ {erro}
                        </div>
                    )}

                    <div className="form-grupo">
                        <label htmlFor="nome">Seu Nome completo *</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            placeholder="Ex: Maria da Silva"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="email">Seu E-mail para contato *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="assunto">Assunto da Mensagem *</label>
                        <select
                            id="assunto"
                            name="assunto"
                            value={formData.assunto}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione o assunto...</option>
                            <option value="Dúvida sobre Adoção">🐾 Dúvida sobre Adoção</option>
                            <option value="Dúvida sobre Doação de Animal">💛 Dúvida sobre Doação de Animal</option>
                            <option value="Problema ou Dificuldade no Site">🛠️ Reportar Problema no Site</option>
                            <option value="Sugestão para o SalvaPet">💡 Sugestão de Melhoria</option>
                            <option value="Parceria / ONG / Clínica Veterinária">🤝 Parceria, ONG ou Clínica</option>
                            <option value="Outro Assunto">❓ Outro Assunto</option>
                        </select>
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="mensagem">Mensagem detalhada *</label>
                        <textarea
                            id="mensagem"
                            name="mensagem"
                            rows={6}
                            placeholder="Descreva aqui sua dúvida, comentário ou solicitação em detalhes..."
                            value={formData.mensagem}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primario btn-submit"
                        disabled={enviando}
                    >
                        {enviando ? '⏳ Enviando mensagem...' : '📤 Enviar Mensagem'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Contato;