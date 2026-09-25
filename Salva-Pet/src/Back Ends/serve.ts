import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { pool } from './database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Interface do Modelo Filme
interface Filme {
    id?: number;
    titulo: string;
    genero: string;
    ano_lancamento: number;
    sinopse: string;
    imagem_url: string;
}

// 1. Listar todos os filmes
app.get('/api/filmes', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM filmes ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar filmes', erro: error });
    }
});

// 2. Cadastrar novo filme
app.post('/api/filmes', async (req: Request, res: Response) => {
    const { titulo, genero, ano_lancamento, sinopse, imagem_url }: Filme = req.body;

    if (!titulo || !genero || !ano_lancamento) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios ausentes.' });
    }

    try {
        const [result]: any = await pool.query(
            'INSERT INTO filmes (titulo, genero, ano_lancamento, sinopse, imagem_url) VALUES (?, ?, ?, ?, ?)',
            [titulo, genero, ano_lancamento, sinopse, imagem_url]
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Filme cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao cadastrar filme', erro: error });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
