import './header.css'

function Header(){
    return(
        <div className="back">
            <img src="./public/log.png" alt="Logo" className="img" />
            <ul>
                <h1 className="missao">Salva Pet</h1>
                <a href="/">Home</a>
                <a href="/contato">Contato</a>
                <a href="/login">Login</a>
            </ul>
        </div>
    )
}

export default Header