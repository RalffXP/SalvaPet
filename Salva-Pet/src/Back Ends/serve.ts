import express, { Request, Response } from 'express';
import cors from 'cors';
import { pool } from './database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
// ROTAS DE ANIMAIS
// ============================================

// Listar todos os animais (com filtros opcionais)
app.get('/api/animais', async (req: Request, res: Response) => {
    try {
        let query = 'SELECT a.*, u.nome as nome_dono, u.telefone, u.cidade as cidade_dono FROM animais a JOIN usuarios u ON a.usuario_id = u.id WHERE 1=1';
        const params: any[] = [];

        if (req.query.especie) {
            query += ' AND a.especie = ?';
            params.push(req.query.especie);
        }
        if (req.query.porte) {
            query += ' AND a.porte = ?';
            params.push(req.query.porte);
        }
        if (req.query.sexo) {
            query += ' AND a.sexo = ?';
            params.push(req.query.sexo);
        }
        if (req.query.cidade) {
            query += ' AND a.cidade LIKE ?';
            params.push(`%${req.query.cidade}%`);
        }
        if (req.query.status) {
            query += ' AND a.status = ?';
            params.push(req.query.status);
        }
        if (req.query.busca) {
            query += ' AND (a.nome LIKE ? OR a.raca LIKE ? OR a.descricao LIKE ?)';
            const busca = `%${req.query.busca}%`;
            params.push(busca, busca, busca);
        }

        query += ' ORDER BY a.criado_em DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar animais', erro: error });
    }
});

// Buscar animal por ID
app.get('/api/animais/:id', async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query(
            'SELECT a.*, u.nome as nome_dono, u.telefone, u.email as email_dono, u.cidade as cidade_dono FROM animais a JOIN usuarios u ON a.usuario_id = u.id WHERE a.id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Animal não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar animal', erro: error });
    }
});

// Cadastrar novo animal
app.post('/api/animais', async (req: Request, res: Response) => {
    const { nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, usuario_id } = req.body;

    if (!nome || !especie || !sexo || !usuario_id) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, especie, sexo, usuario_id' });
    }

    try {
        const [result]: any = await pool.query(
            'INSERT INTO animais (nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado || false, castrado || false, usuario_id]
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Animal cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao cadastrar animal', erro: error });
    }
});

// Atualizar animal
app.put('/api/animais/:id', async (req: Request, res: Response) => {
    const { nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status } = req.body;

    try {
        await pool.query(
            'UPDATE animais SET nome=?, especie=?, raca=?, idade=?, porte=?, sexo=?, descricao=?, imagem_url=?, cidade=?, estado=?, vacinado=?, castrado=?, status=? WHERE id=?',
            [nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status, req.params.id]
        );
        res.json({ mensagem: 'Animal atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao atualizar animal', erro: error });
    }
});

// Deletar animal
app.delete('/api/animais/:id', async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM animais WHERE id = ?', [req.params.id]);
        res.json({ mensagem: 'Animal removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao remover animal', erro: error });
    }
});

// ============================================
// ROTAS DE USUÁRIOS
// ============================================

// Cadastrar usuário
app.post('/api/usuarios', async (req: Request, res: Response) => {
    const { nome, email, senha, telefone, cidade, estado, tipo } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, email, senha' });
    }

    try {
        // Verificar se email já existe
        const [existing]: any = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ mensagem: 'Email já cadastrado' });
        }

        const [result]: any = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, email, senha, telefone, cidade, estado, tipo || 'ambos']
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao cadastrar usuário', erro: error });
    }
});

// Login
app.post('/api/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    try {
        const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
        }

        const usuario = rows[0];
        // Comparação simples de senha (em produção, usar bcrypt)
        if (usuario.senha !== senha) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
        }

        const { senha: _, ...usuarioSemSenha } = usuario;
        res.json({ mensagem: 'Login realizado com sucesso!', usuario: usuarioSemSenha });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao fazer login', erro: error });
    }
});

// Buscar usuário por ID
app.get('/api/usuarios/:id', async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT id, nome, email, telefone, cidade, estado, tipo, foto_url, criado_em FROM usuarios WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar usuário', erro: error });
    }
});

// ============================================
// ROTAS DE AVALIAÇÕES
// ============================================

// Listar avaliações
app.get('/api/avaliacoes', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT av.*, u.nome as nome_usuario FROM avaliacoes av LEFT JOIN usuarios u ON av.usuario_id = u.id ORDER BY av.criado_em DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar avaliações', erro: error });
    }
});

// Cadastrar avaliação
app.post('/api/avaliacoes', async (req: Request, res: Response) => {
    const { usuario_id, nota, comentario } = req.body;

    if (!nota || nota < 1 || nota > 5) {
        return res.status(400).json({ mensagem: 'Nota deve ser entre 1 e 5' });
    }

    try {
        const [result]: any = await pool.query(
            'INSERT INTO avaliacoes (usuario_id, nota, comentario) VALUES (?, ?, ?)',
            [usuario_id || null, nota, comentario]
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Avaliação registrada com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao registrar avaliação', erro: error });
    }
});

// Média das avaliações
app.get('/api/avaliacoes/media', async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes');
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar média', erro: error });
    }
});

// ============================================
// ROTAS DE MENSAGENS
// ============================================

// Enviar mensagem
app.post('/api/mensagens', async (req: Request, res: Response) => {
    const { remetente_id, destinatario_id, animal_id, assunto, conteudo } = req.body;

    if (!remetente_id || !destinatario_id || !conteudo) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: remetente_id, destinatario_id, conteudo' });
    }

    try {
        const [result]: any = await pool.query(
            'INSERT INTO mensagens (remetente_id, destinatario_id, animal_id, assunto, conteudo) VALUES (?, ?, ?, ?, ?)',
            [remetente_id, destinatario_id, animal_id || null, assunto, conteudo]
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao enviar mensagem', erro: error });
    }
});

// Listar mensagens do usuário
app.get('/api/mensagens/:usuario_id', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            `SELECT m.*, 
                    ur.nome as nome_remetente, 
                    ud.nome as nome_destinatario,
                    a.nome as nome_animal
             FROM mensagens m 
             JOIN usuarios ur ON m.remetente_id = ur.id 
             JOIN usuarios ud ON m.destinatario_id = ud.id 
             LEFT JOIN animais a ON m.animal_id = a.id
             WHERE m.remetente_id = ? OR m.destinatario_id = ?
             ORDER BY m.criado_em DESC`,
            [req.params.usuario_id, req.params.usuario_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar mensagens', erro: error });
    }
});

// Estatísticas gerais
app.get('/api/estatisticas', async (req: Request, res: Response) => {
    try {
        const [animais]: any = await pool.query('SELECT COUNT(*) as total FROM animais WHERE status = "disponivel"');
        const [adotados]: any = await pool.query('SELECT COUNT(*) as total FROM animais WHERE status = "adotado"');
        const [usuarios]: any = await pool.query('SELECT COUNT(*) as total FROM usuarios');
        
        res.json({
            animais_disponiveis: animais[0].total,
            animais_adotados: adotados[0].total,
            usuarios_cadastrados: usuarios[0].total
        });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar estatísticas', erro: error });
    }
});

app.listen(PORT, () => {
    console.log(`🐾 SalvaPet API rodando em http://localhost:${PORT}`);
});
