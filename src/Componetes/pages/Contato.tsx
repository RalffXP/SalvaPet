import { useState } from 'react';
import './Contato.css';

function Contato() {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        assunto: '',
        mensagem: ''
    });
    const [enviado, setEnviado] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simular envio
        setEnviado(true);
        setTimeout(() => setEnviado(false), 5000);
        setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
    };

    return (
        <div className="contato-page">
            <section className="contato-banner">
                <div className="container">
                    <h1>📧 Fale Conosco</h1>
                    <p>Tem dúvidas, sugestões ou precisa de ajuda? Entre em contato!</p>
                </div>
            </section>

            <div className="container contato-content">
                <div className="contato-info">
                    <div className="contato-info-card">
                        <h3>Informações de Contato</h3>
                        <div className="contato-item">
                            <span className="contato-icone">📧</span>
                            <div>
                                <strong>Email</strong>
                                <p>contato@salvapet.com.br</p>
                            </div>
                        </div>
                        <div className="contato-item">
                            <span className="contato-icone">📱</span>
                            <div>
                                <strong>WhatsApp</strong>
                                <p>(18) 99999-0000</p>
                            </div>
                        </div>
                        <div className="contato-item">
                            <span className="contato-icone">📍</span>
                            <div>
                                <strong>Endereço</strong>
                                <p>Presidente Venceslau - SP</p>
                            </div>
                        </div>
                        <div className="contato-item">
                            <span className="contato-icone">🕐</span>
                            <div>
                                <strong>Horário</strong>
                                <p>Seg a Sex, 8h às 18h</p>
                            </div>
                        </div>
                    </div>

                    <div className="contato-social">
                        <h4>Redes Sociais</h4>
                        <div className="social-links">
                            <a href="#" className="social-link" title="Instagram">📷 Instagram</a>
                            <a href="#" className="social-link" title="Facebook">📘 Facebook</a>
                            <a href="#" className="social-link" title="Twitter">🐦 Twitter</a>
                        </div>
                    </div>
                </div>

                <form className="contato-form" onSubmit={handleSubmit}>
                    <h3>Enviar Mensagem</h3>

                    {enviado && (
                        <div className="form-mensagem msg-sucesso">
                            ✅ Mensagem enviada com sucesso! Responderemos em breve.
                        </div>
                    )}

                    <div className="form-grupo">
                        <label htmlFor="nome">Nome</label>
                        <input id="nome" name="nome" type="text" placeholder="Seu nome" value={formData.nome} onChange={handleChange} required />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="assunto">Assunto</label>
                        <select id="assunto" name="assunto" value={formData.assunto} onChange={handleChange} required>
                            <option value="">Selecione</option>
                            <option value="duvida">Dúvida sobre adoção</option>
                            <option value="doacao">Dúvida sobre doação</option>
                            <option value="problema">Reportar problema</option>
                            <option value="sugestao">Sugestão</option>
                            <option value="parceria">Parceria / ONG</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div className="form-grupo">
                        <label htmlFor="mensagem">Mensagem</label>
                        <textarea id="mensagem" name="mensagem" rows={6} placeholder="Escreva sua mensagem aqui..." value={formData.mensagem} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primario btn-submit">
                        📤 Enviar Mensagem
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Contato;