import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, authHeadersMultipart, getUsuarioLogado } from '../auth';
import './Doar.css';

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB
const FORMATOS_VALIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function Doar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        nome: '',
        especie: 'cachorro',
        raca: '',
        idade: '',
        porte: 'medio',
        sexo: 'macho',
        descricao: '',
        cidade: '',
        estado: 'SP',
        vacinado: false,
        castrado: false
    });
    const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        if (!sucesso || !mensagem) return;

        const timer = setTimeout(() => {
            setMensagem('');
            setSucesso(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [sucesso, mensagem]);

    // Limpar o Object URL quando mudar ou desmontar
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const processarArquivo = (file: File) => {
        if (!FORMATOS_VALIDOS.includes(file.type)) {
            setMensagem('Formato inválido. Por favor, envie uma imagem JPG, PNG, WEBP ou GIF.');
            setSucesso(false);
            return;
        }

        if (file.size > TAMANHO_MAXIMO_BYTES) {
            setMensagem('A imagem excede o tamanho máximo permitido de 5 MB.');
            setSucesso(false);
            return;
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const url = URL.createObjectURL(file);
        setArquivoImagem(file);
        setPreviewUrl(url);
        setMensagem('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processarArquivo(file);
        }
    };

    const handleRemoverImagem = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setArquivoImagem(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processarArquivo(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.especie || !formData.sexo) {
            setMensagem('Por favor, preencha os campos obrigatórios.');
            setSucesso(false);
            return;
        }

        const usuario = getUsuarioLogado();
        if (!usuario) {
            setMensagem('Faça login para cadastrar um animal.');
            setSucesso(false);
            return;
        }

        setEnviando(true);
        setMensagem('');

        try {
            const data = new FormData();
            data.append('nome', formData.nome);
            data.append('especie', formData.especie);
            data.append('raca', formData.raca);
            data.append('idade', formData.idade);
            data.append('porte', formData.porte);
            data.append('sexo', formData.sexo);
            data.append('cidade', formData.cidade);
            data.append('estado', formData.estado);
            data.append('descricao', formData.descricao);
            data.append('vacinado', String(formData.vacinado));
            data.append('castrado', String(formData.castrado));
            data.append('usuario_id', String(usuario.id));

            if (arquivoImagem) {
                data.append('imagem', arquivoImagem);
            }

            const res = await fetch(`${API_URL}/api/animais`, {
                method: 'POST',
                headers: authHeadersMultipart(),
                body: data
            });

            const json = await res.json();

            if (res.ok) {
                setMensagem('🎉 Animal cadastrado com sucesso! Ele já está disponível para adoção.');
                setSucesso(true);
                setFormData({
                    nome: '', especie: 'cachorro', raca: '', idade: '',
                    porte: 'medio', sexo: 'macho', descricao: '',
                    cidade: '', estado: 'SP', vacinado: false, castrado: false
                });
                handleRemoverImagem();
            } else {
                setMensagem(json.mensagem || 'Erro ao cadastrar. Tente novamente.');
                setSucesso(false);
            }
        } catch {
            setMensagem('Servidor indisponível. Verifique sua conexão e tente novamente.');
            setSucesso(false);
        } finally {
            setEnviando(false);
        }
    };

    const estados = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

    return (
        <div className="doar-page">
            <section className="doar-banner">
                <div className="container">
                    <h1>💛 Doar um Animal</h1>
                    <p>Ajude um pet a encontrar um novo lar cheio de amor</p>
                </div>
            </section>

            {sucesso && mensagem && (
                <div className="doar-alerta">
                    <div className="container">
                        <strong>✅ Cadastro concluído:</strong> {mensagem}
                    </div>
                </div>
            )}

            <div className="container doar-content">
                <div className="doar-info-panel">
                    <div className="doar-info-card">
                        <h3>📋 Como funciona a doação?</h3>
                        <ol className="doar-passos">
                            <li>
                                <span className="passo-num">1</span>
                                <div>
                                    <strong>Preencha o formulário</strong>
                                    <p>Informe os dados do animal e envie uma foto bem bonita</p>
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
                            <li>Envie fotos nítidas e bem iluminadas</li>
                            <li>Descreva o temperamento do animal</li>
                            <li>Informe se há exigências para adoção</li>
                            <li>Mantenha a vacinação em dia</li>
                        </ul>
                    </div>
                </div>

                <form className="doar-form" onSubmit={handleSubmit}>
                    <h3 className="form-titulo">Dados do Animal</h3>

                    {!getUsuarioLogado() && (
                        <div className="form-mensagem msg-erro">
                            🔒 Você precisa estar logado para cadastrar um animal. <Link to="/login"><strong>Entrar</strong></Link>
                        </div>
                    )}

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
                            <label>Foto do animal</label>
                            <div
                                className={`upload-container ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    id="input-imagem-animal"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                {!previewUrl ? (
                                    <div
                                        className="upload-dropzone"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="upload-icone">📷</div>
                                        <div className="upload-textos">
                                            <p className="upload-titulo">
                                                <strong>Clique para enviar uma foto</strong> ou arraste aqui
                                            </p>
                                            <p className="upload-subtitulo">
                                                Formatos aceitos: JPG, PNG, WEBP ou GIF (até 5 MB)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-preview-wrapper">
                                        <div className="upload-preview-img-container">
                                            <img
                                                src={previewUrl}
                                                alt="Prévia do animal"
                                                className="upload-preview-img"
                                            />
                                        </div>
                                        <div className="upload-preview-info">
                                            <div className="upload-preview-detalhes">
                                                <span className="upload-preview-nome">{arquivoImagem?.name}</span>
                                                <span className="upload-preview-tamanho">
                                                    {arquivoImagem ? (arquivoImagem.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                                                </span>
                                            </div>
                                            <div className="upload-preview-acoes">
                                                <button
                                                    type="button"
                                                    className="btn-trocar-foto"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    🔄 Trocar foto
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-remover-foto"
                                                    onClick={handleRemoverImagem}
                                                >
                                                    🗑️ Remover
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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

                    <button type="submit" className="btn btn-primario btn-submit" disabled={enviando}>
                        {enviando ? '⏳ Cadastrando animal...' : '💛 Cadastrar Animal para Doação'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Doar;
