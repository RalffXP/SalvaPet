import { Outlet } from 'react-router-dom';
import Header from './Componetes/pages/Header/header';
import Footer from './Componetes/pages/Footer/footer';

function App() {
    return (
        <>
            <Header />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default App;
