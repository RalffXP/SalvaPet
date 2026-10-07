import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { pool } from './database';
import { PASTA_UPLOADS, receberImagem, removerImagem, urlPublica } from './upload';

// Custo do bcrypt (2^10 iterações). Quanto maior, mais seguro e mais lento.
const SALT_ROUNDS = 10;

// Hashes bcrypt sempre começam com $2a$, $2b$ ou $2y$
const ehHashBcrypt = (valor: string) => /^\$2[aby]\$\d{2}\$/.test(valor);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Fotos enviadas pelos usuários ficam acessíveis em /uploads/<arquivo>
app.use('/uploads', express.static(PASTA_UPLOADS, { maxAge: '7d' }));

// ============================================
// AUTORIZAÇÃO (perfil admin / dono do animal)
// ============================================
// O frontend envia o id do usuário logado no cabeçalho "x-usuario-id".
// O perfil é sempre consultado no banco, nunca confiado ao cliente.
// Obs.: em produção, substituir por um token assinado (ex.: JWT).

type UsuarioLogado = { id: number; nome: string; perfil: 'usuario' | 'admin' };

async function obterUsuarioLogado(req: Request): Promise<UsuarioLogado | null> {
    const id = Number(req.header('x-usuario-id'));
    if (!id) return null;
    const [rows]: any = await pool.query('SELECT id, nome, perfil FROM usuarios WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
}

// Verifica se o usuário logado pode gerenciar o animal (admin ou quem cadastrou)
async function verificarPermissaoAnimal(req: Request, res: Response): Promise<boolean> {
    const usuario = await obterUsuarioLogado(req);
    if (!usuario) {
        res.status(401).json({ mensagem: 'Faça login para continuar' });
        return false;
    }
    const [rows]: any = await pool.query('SELECT usuario_id FROM animais WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({ mensagem: 'Animal não encontrado' });
        return false;
    }
    if (usuario.perfil !== 'admin' && rows[0].usuario_id !== usuario.id) {
        res.status(403).json({ mensagem: 'Você não tem permissão para gerenciar este animal' });
        return false;
    }
    return true;
}

// ============================================
// ROTAS DO PAINEL ADMINISTRATIVO
// ============================================

// Lista animais do painel: admin vê todos, usuário comum vê apenas os seus
app.get('/api/painel/animais', async (req: Request, res: Response) => {
    try {
        const usuario = await obterUsuarioLogado(req);
        if (!usuario) {
            return res.status(401).json({ mensagem: 'Faça login para continuar' });
        }

        let query = 'SELECT a.*, u.nome as nome_dono, u.email as email_dono FROM animais a JOIN usuarios u ON a.usuario_id = u.id';
        const params: any[] = [];
        if (usuario.perfil !== 'admin') {
            query += ' WHERE a.usuario_id = ?';
            params.push(usuario.id);
        }
        query += ' ORDER BY a.criado_em DESC';

        const [rows] = await pool.query(query, params);
        res.json({ perfil: usuario.perfil, animais: rows });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao carregar painel', erro: error });
    }
});

// Alterar apenas o status (ex.: marcar como adotado)
app.patch('/api/animais/:id/status', async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!['disponivel', 'em_analise', 'adotado'].includes(status)) {
        return res.status(400).json({ mensagem: 'Status inválido' });
    }
    try {
        if (!(await verificarPermissaoAnimal(req, res))) return;
        await pool.query('UPDATE animais SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ mensagem: status === 'adotado' ? 'Animal marcado como adotado! 🎉' : 'Status atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao atualizar status', erro: error });
    }
});

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

// Cadastrar novo animal (multipart/form-data, foto opcional no campo "imagem")
app.post('/api/animais', receberImagem, async (req: Request, res: Response) => {
    const { nome, especie, raca, idade, porte, sexo, descricao, cidade, estado } = req.body;
    // FormData envia tudo como texto: converte "true"/"false" para booleano
    const vacinado = req.body.vacinado === true || req.body.vacinado === 'true';
    const castrado = req.body.castrado === true || req.body.castrado === 'true';
    // O dono do animal é o usuário logado (cabeçalho x-usuario-id); usa o corpo como alternativa
    const usuario_id = Number(req.header('x-usuario-id')) || req.body.usuario_id;
    const imagem_url = req.file ? urlPublica(req, req.file.filename) : null;

    if (!nome || !especie || !sexo || !usuario_id) {
        removerImagem(imagem_url);
        return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, especie, sexo, usuario_id' });
    }

    try {
        const [result]: any = await pool.query(
            'INSERT INTO animais (nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, usuario_id]
        );
        res.status(201).json({ id: result.insertId, imagem_url, mensagem: 'Animal cadastrado com sucesso!' });
    } catch (error) {
        removerImagem(imagem_url); // não deixa arquivo órfão se o INSERT falhar
        res.status(500).json({ mensagem: 'Erro ao cadastrar animal', erro: error });
    }
});

// Atualizar animal
app.put('/api/animais/:id', async (req: Request, res: Response) => {
    const { nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status } = req.body;

    try {
        if (!(await verificarPermissaoAnimal(req, res))) return;
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
        if (!(await verificarPermissaoAnimal(req, res))) return;
        const [rows]: any = await pool.query('SELECT imagem_url FROM animais WHERE id = ?', [req.params.id]);
        await pool.query('DELETE FROM animais WHERE id = ?', [req.params.id]);
        removerImagem(rows[0]?.imagem_url); // apaga a foto do disco, se foi enviada pelo site
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

        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
        const [result]: any = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, email, senhaHash, telefone, cidade, estado, tipo || 'ambos']
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
        let senhaCorreta = false;

        if (ehHashBcrypt(usuario.senha)) {
            senhaCorreta = await bcrypt.compare(senha ?? '', usuario.senha);
        } else if (usuario.senha === senha) {
            // Senha antiga em texto puro: aceita uma última vez e já converte para hash
            senhaCorreta = true;
            const novoHash = await bcrypt.hash(senha, SALT_ROUNDS);
            await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [novoHash, usuario.id]);
        }

        if (!senhaCorreta) {
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
app.get('/api/avaliacoes', async (_req: Request, res: Response) => {
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
app.get('/api/avaliacoes/media', async (_req: Request, res: Response) => {
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

// ============================================
// ROTAS DE CONTATO / FALE CONOSCO
// ============================================

// Garante que a tabela contatos exista
async function garantirTabelaContatos() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS contatos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL,
            assunto VARCHAR(100) NOT NULL,
            mensagem TEXT NOT NULL,
            lida BOOLEAN DEFAULT FALSE,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);
}

// Enviar mensagem de contato (pública)
app.post('/api/contato', async (req: Request, res: Response) => {
    const { nome, email, assunto, mensagem } = req.body;

    if (!nome || !email || !assunto || !mensagem) {
        return res.status(400).json({ mensagem: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        await garantirTabelaContatos();
        const [result]: any = await pool.query(
            'INSERT INTO contatos (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)',
            [nome.trim(), email.trim(), assunto.trim(), mensagem.trim()]
        );
        res.status(201).json({
            id: result.insertId,
            mensagem: 'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve. 🐾'
        });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao enviar mensagem. Tente novamente mais tarde.', erro: error });
    }
});

// Listar mensagens de contato (Apenas Administrador)
app.get('/api/contato', async (req: Request, res: Response) => {
    try {
        const usuario = await obterUsuarioLogado(req);
        if (!usuario || usuario.perfil !== 'admin') {
            return res.status(403).json({ mensagem: 'Apenas administradores podem visualizar as mensagens de contato.' });
        }
        await garantirTabelaContatos();
        const [rows] = await pool.query('SELECT * FROM contatos ORDER BY criado_em DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao carregar mensagens de contato', erro: error });
    }
});

// Marcar mensagem de contato como lida (Apenas Administrador)
app.patch('/api/contato/:id/lida', async (req: Request, res: Response) => {
    try {
        const usuario = await obterUsuarioLogado(req);
        if (!usuario || usuario.perfil !== 'admin') {
            return res.status(403).json({ mensagem: 'Acesso negado.' });
        }
        await pool.query('UPDATE contatos SET lida = TRUE WHERE id = ?', [req.params.id]);
        res.json({ mensagem: 'Mensagem marcada como lida!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao atualizar mensagem', erro: error });
    }
});

// Estatísticas gerais
app.get('/api/estatisticas', async (_req: Request, res: Response) => {
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
