import { useState } from 'react';
import './Login.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        telefone: '',
        cidade: '',
        estado: 'SP',
        tipo: 'ambos'
    });
    const [mensagem, setMensagem] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensagem('');

        if (isLogin) {
            // Login
            try {
                const res = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, senha: formData.senha })
                });
                const data = await res.json();
                if (res.ok) {
                    setMensagem('✅ Login realizado com sucesso!');
                    setSucesso(true);
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                } else {
                    setMensagem(data.mensagem || 'Email ou senha incorretos');
                    setSucesso(false);
                }
            } catch {
                setMensagem('Servidor indisponível. Tente novamente mais tarde.');
                setSucesso(false);
            }
        } else {
            // Cadastro
            if (formData.senha !== formData.confirmarSenha) {
                setMensagem('As senhas não coincidem');
                setSucesso(false);
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (res.ok) {
                    setMensagem('🎉 Conta criada com sucesso! Faça login para continuar.');
                    setSucesso(true);
                    setIsLogin(true);
                } else {
                    setMensagem(data.mensagem || 'Erro ao criar conta');
                    setSucesso(false);
                }
            } catch {
                setMensagem('Servidor indisponível. Tente novamente mais tarde.');
                setSucesso(false);
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-hero">
                    <img src="/log.png" alt="SalvaPet" className="login-logo" />
                    <h2>Bem-vindo ao <span>SalvaPet</span></h2>
                    <p>Junte-se à nossa comunidade e ajude a transformar a vida de animais que precisam de amor</p>
                    <div className="login-features">
                        <div className="login-feature">🐾 Adote pets</div>
                        <div className="login-feature">💛 Doe com carinho</div>
                        <div className="login-feature">💬 Conecte-se</div>
                    </div>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-tabs">
                        <button
                            className={`login-tab ${isLogin ? 'ativo' : ''}`}
                            onClick={() => { setIsLogin(true); setMensagem(''); }}
                        >
                            Entrar
                        </button>
                        <button
                            className={`login-tab ${!isLogin ? 'ativo' : ''}`}
                            onClick={() => { setIsLogin(false); setMensagem(''); }}
                        >
                            Criar Conta
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <h3>{isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}</h3>

                        {mensagem && (
                            <div className={`form-mensagem ${sucesso ? 'msg-sucesso' : 'msg-erro'}`}>
                                {mensagem}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="form-grupo">
                                <label htmlFor="nome">Nome completo</label>
                                <input id="nome" name="nome" type="text" placeholder="Seu nome" value={formData.nome} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="form-grupo">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-grupo">
                            <label htmlFor="senha">Senha</label>
                            <input id="senha" name="senha" type="password" placeholder="Sua senha" value={formData.senha} onChange={handleChange} required />
                        </div>

                        {!isLogin && (
                            <>
                                <div className="form-grupo">
                                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                                    <input id="confirmarSenha" name="confirmarSenha" type="password" placeholder="Confirme a senha" value={formData.confirmarSenha} onChange={handleChange} required />
                                </div>

                                <div className="form-grupo">
                                    <label htmlFor="telefone">Telefone (WhatsApp)</label>
                                    <input id="telefone" name="telefone" type="tel" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange} />
                                </div>

                                <div className="form-row">
                                    <div className="form-grupo">
                                        <label htmlFor="cidade">Cidade</label>
                                        <input id="cidade" name="cidade" type="text" placeholder="Sua cidade" value={formData.cidade} onChange={handleChange} />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="tipo">Você deseja</label>
                                        <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
                                            <option value="adotante">Adotar</option>
                                            <option value="doador">Doar</option>
                                            <option value="ambos">Ambos</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn btn-primario btn-submit">
                            {isLogin ? 'Entrar' : 'Criar Conta'}
                        </button>

                        <p className="login-alternar">
                            {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                            <button
                                type="button"
                                className="link-alternar"
                                onClick={() => { setIsLogin(!isLogin); setMensagem(''); }}
                            >
                                {isLogin ? 'Crie aqui' : 'Entre aqui'}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;