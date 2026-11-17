import './footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-col footer-brand">
                        <div className="footer-logo-wrapper">
                            <img src="/log.png" alt="SalvaPet" className="footer-logo-img" />
                            <h3 className="footer-logo-text">SalvaPet</h3>
                        </div>
                        <p className="footer-desc">
                            Conectando corações e patinhas. Ajudamos a encontrar 
                            lares amorosos para animais que precisam de carinho.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Navegação</h4>
                        <ul className="footer-links">
                            <li><a href="/">Início</a></li>
                            <li><a href="/animais">Adotar</a></li>
                            <li><a href="/doar">Doar Animal</a></li>
                            <li><a href="/sobre">Sobre Nós</a></li>
                            <li><a href="/contato">Contato</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Ajuda</h4>
                        <ul className="footer-links">
                            <li><a href="/sobre">Como adotar?</a></li>
                            <li><a href="/doar">Como doar?</a></li>
                            <li><a href="/contato">Fale conosco</a></li>
                            <li><a href="/avaliar">Avaliar o site</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Contato</h4>
                        <ul className="footer-links footer-contato">
                            <li>📧 contato@salvapet.com.br</li>
                            <li>📱 (18) 99999-0000</li>
                            <li>📍 Presidente Venceslau - SP</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-divider"></div>
                    <div className="footer-bottom-content">
                        <p>© 2026 SalvaPet - Todos os direitos reservados</p>
                        <p className="footer-creditos">
                            Feito com 💛 para os animais | ETEC Presidente Venceslau
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
