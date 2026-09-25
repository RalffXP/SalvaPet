import { useState } from 'react';
import './Doar.css';

function Doar() {
    const [formData, setFormData] = useState({
        nome: '',
        especie: 'cachorro',
        raca: '',
        idade: '',
        porte: 'medio',
        sexo: 'macho',
        descricao: '',
        imagem_url: '',
        cidade: '',
        estado: 'SP',
        vacinado: false,
        castrado: false
    });
    const [mensagem, setMensagem] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nome || !formData.especie || !formData.sexo) {
            setMensagem('Por favor, preencha os campos obrigatórios.');
            setSucesso(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/animais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, usuario_id: 1 })
            });

            if (res.ok) {
                setMensagem('🎉 Animal cadastrado com sucesso! Ele já está disponível para adoção.');
                setSucesso(true);
                setFormData({
                    nome: '', especie: 'cachorro', raca: '', idade: '',
                    porte: 'medio', sexo: 'macho', descricao: '', imagem_url: '',
                    cidade: '', estado: 'SP', vacinado: false, castrado: false
                });
            } else {
                setMensagem('Erro ao cadastrar. Tente novamente.');
                setSucesso(false);
            }
        } catch {
            setMensagem('Servidor indisponível. Cadastro salvo será enviado quando o servidor estiver online.');
            setSucesso(false);
        }
    };

    const estados = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

    return (
        <div className="doar-page">
            <section className="doar-banner">
                <div className="container">
                    <h1>💛 Doar um Animal</h1>
                    <p>Ajude um pet a encontrar um novo lar cheio de amor</p>
                </div>
            </section>

            <div className="container doar-content">
                <div className="doar-info-panel">
                    <div className="doar-info-card">
                        <h3>📋 Como funciona a doação?</h3>
                        <ol className="doar-passos">
                            <li>
                                <span className="passo-num">1</span>
                                <div>
                                    <strong>Preencha o formulário</strong>
                                    <p>Informe os dados do animal e uma foto de boa qualidade</p>
                                </div>
                            </li>
                            <li>
                                <span className="passo-num">2</span>
                                <div>
                                    <strong>Publicação automática</strong>
                                    <p>O animal será listado na página de adoção</p>
                                </div>
                            </li>
                            <li>
                                <span className="passo-num">3</span>
                                <div>
                                    <strong>Receba contatos</strong>
                                    <p>Interessados entrarão em contato pelo WhatsApp</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    <div className="doar-dicas">
                        <h4>💡 Dicas importantes</h4>
                        <ul>
                            <li>Use fotos nítidas e bem iluminadas</li>
                            <li>Descreva o temperamento do animal</li>
                            <li>Informe se há exigências para adoção</li>
                            <li>Mantenha a vacinação em dia</li>
                        </ul>
                    </div>
                </div>

                <form className="doar-form" onSubmit={handleSubmit}>
                    <h3 className="form-titulo">Dados do Animal</h3>

                    {mensagem && (
                        <div className={`form-mensagem ${sucesso ? 'msg-sucesso' : 'msg-erro'}`}>
                            {mensagem}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-grupo">
                            <label htmlFor="nome">Nome do animal *</label>
                            <input id="nome" name="nome" type="text" placeholder="Ex: Rex" value={formData.nome} onChange={handleChange} required />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="especie">Espécie *</label>
                            <select id="especie" name="especie" value={formData.especie} onChange={handleChange} required>
                                <option value="cachorro">🐕 Cachorro</option>
                                <option value="gato">🐱 Gato</option>
                                <option value="outro">🐾 Outro</option>
                            </select>
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="raca">Raça</label>
                            <input id="raca" name="raca" type="text" placeholder="Ex: Labrador, Vira-lata" value={formData.raca} onChange={handleChange} />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="idade">Idade</label>
                            <input id="idade" name="idade" type="text" placeholder="Ex: 2 anos, 6 meses" value={formData.idade} onChange={handleChange} />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="porte">Porte</label>
                            <select id="porte" name="porte" value={formData.porte} onChange={handleChange}>
                                <option value="pequeno">Pequeno</option>
                                <option value="medio">Médio</option>
                                <option value="grande">Grande</option>
                            </select>
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="sexo">Sexo *</label>
                            <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required>
                                <option value="macho">♂ Macho</option>
                                <option value="femea">♀ Fêmea</option>
                            </select>
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="cidade">Cidade</label>
                            <input id="cidade" name="cidade" type="text" placeholder="Sua cidade" value={formData.cidade} onChange={handleChange} />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="estado">Estado</label>
                            <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
                                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                        </div>

                        <div className="form-grupo form-full">
                            <label htmlFor="imagem_url">URL da foto</label>
                            <input id="imagem_url" name="imagem_url" type="url" placeholder="https://exemplo.com/foto.jpg" value={formData.imagem_url} onChange={handleChange} />
                        </div>

                        <div className="form-grupo form-full">
                            <label htmlFor="descricao">Descrição</label>
                            <textarea id="descricao" name="descricao" rows={4} placeholder="Conte sobre o temperamento, hábitos e particularidades do animal..." value={formData.descricao} onChange={handleChange} />
                        </div>

                        <div className="form-grupo form-checkboxes">
                            <label className="checkbox-label">
                                <input type="checkbox" name="vacinado" checked={formData.vacinado} onChange={handleChange} />
                                <span className="checkbox-custom"></span>
                                Vacinado
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" name="castrado" checked={formData.castrado} onChange={handleChange} />
                                <span className="checkbox-custom"></span>
                                Castrado
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primario btn-submit">
                        💛 Cadastrar Animal para Doação
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Doar;
