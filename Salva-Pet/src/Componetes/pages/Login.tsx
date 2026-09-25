import './pages.css'

function Login() {
    return(
        <div className="container">
            <h1>Cadastro</h1>
        <div id="Cadastro" className="divNome">
            <div id="nome">
            <typography className="txtcolor">Nome</typography> 
            <input className="myinput" type="text" placeholder="   Digite seu nome"/>
        </div>
        </div>
        </div>
    )
}

export default Login