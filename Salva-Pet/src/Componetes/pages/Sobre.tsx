import './Sobre.css';

function Sobre() {
    return (
        <div className="sobre-page">
            <section className="sobre-banner">
                <div className="container">
                    <h1>ℹ️ Sobre o SalvaPet</h1>
                    <p>Conheça nossa missão e como estamos ajudando os animais</p>
                </div>
            </section>

            <section className="sobre-missao">
                <div className="container">
                    <div className="sobre-grid">
                        <div className="sobre-texto">
                            <span className="section-badge">Nossa Missão</span>
                            <h2>Conectar corações e patinhas</h2>
                            <p>
                                O <strong>SalvaPet</strong> é uma plataforma desenvolvida com o objetivo de 
                                facilitar a adoção e doação de animais, promovendo a conexão entre tutores 
                                e interessados em oferecer ou receber cuidados para pets.
                            </p>
                            <p>
                                Nosso projeto visa a redução do abandono animal e o incentivo à 
                                responsabilidade social, proporcionando uma experiência intuitiva e 
                                segura para todos os envolvidos.
                            </p>
                        </div>
                        <div className="sobre-img-container">
                            <img src="/log.png" alt="SalvaPet" className="sobre-img" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="sobre-valores">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Nossos Valores</span>
                        <h2 className="section-titulo">O que nos move</h2>
                    </div>
                    <div className="valores-grid">
                        <div className="valor-card">
                            <span className="valor-icone">💛</span>
                            <h3>Amor aos Animais</h3>
                            <p>Acreditamos que todo animal merece um lar cheio de carinho e respeito</p>
                        </div>
                        <div className="valor-card">
                            <span className="valor-icone">🤝</span>
                            <h3>Responsabilidade</h3>
                            <p>Promovemos a posse responsável e o cuidado consciente com os pets</p>
                        </div>
                        <div className="valor-card">
                            <span className="valor-icone">🌍</span>
                            <h3>Impacto Social</h3>
                            <p>Trabalhamos para reduzir o abandono e apoiar ONGs e protetores independentes</p>
                        </div>
                        <div className="valor-card">
                            <span className="valor-icone">🔒</span>
                            <h3>Segurança</h3>
                            <p>Garantimos um ambiente seguro para a comunicação entre adotantes e doadores</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sobre-como-adotar">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">📋 Guia</span>
                        <h2 className="section-titulo">Como adotar pelo SalvaPet?</h2>
                    </div>
                    <div className="guia-grid">
                        <div className="guia-card">
                            <div className="guia-numero">1</div>
                            <h4>Crie sua conta</h4>
                            <p>Cadastre-se gratuitamente preenchendo seus dados básicos</p>
                        </div>
                        <div className="guia-card">
                            <div className="guia-numero">2</div>
                            <h4>Navegue pelos pets</h4>
                            <p>Use os filtros para encontrar o animal ideal para sua família</p>
                        </div>
                        <div className="guia-card">
                            <div className="guia-numero">3</div>
                            <h4>Entre em contato</h4>
                            <p>Converse diretamente com o tutor responsável via WhatsApp</p>
                        </div>
                        <div className="guia-card">
                            <div className="guia-numero">4</div>
                            <h4>Conheça o pet</h4>
                            <p>Marque uma visita para conhecer o animal pessoalmente</p>
                        </div>
                        <div className="guia-card">
                            <div className="guia-numero">5</div>
                            <h4>Formalize a adoção</h4>
                            <p>Combine os termos e leve seu novo amigo para casa</p>
                        </div>
                        <div className="guia-card">
                            <div className="guia-numero">6</div>
                            <h4>Cuide com amor</h4>
                            <p>Proporcione saúde, carinho e uma vida feliz ao seu pet!</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sobre-projeto">
                <div className="container">
                    <div className="projeto-card">
                        <h3>🎓 Sobre o Projeto</h3>
                        <p>
                            O SalvaPet é um Trabalho de Conclusão de Curso (TCC) desenvolvido por alunos 
                            do 3º módulo do curso de Desenvolvimento de Sistemas da <strong>ETEC de 
                            Presidente Venceslau</strong>.
                        </p>
                        <p>
                            O projeto utiliza tecnologias modernas como React, TypeScript, Node.js, 
                            Express e MySQL, aplicando conceitos de desenvolvimento web completo 
                            (front-end e back-end) aprendidos durante o curso.
                        </p>
                        <p>
                            Inspirado pelo site <em>"Amigo não tem preço"</em>, buscamos criar uma 
                            plataforma funcional que contribua significativamente para a organização 
                            e otimização do processo de adoção e doação de animais na nossa região.
                        </p>
                        <div className="projeto-tech">
                            <span className="tech-badge">React</span>
                            <span className="tech-badge">TypeScript</span>
                            <span className="tech-badge">Node.js</span>
                            <span className="tech-badge">Express</span>
                            <span className="tech-badge">MySQL</span>
                            <span className="tech-badge">CSS3</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Sobre;
