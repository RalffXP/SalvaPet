import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from './database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// ============================================
// DADOS EM MEMÓRIA (FALLBACK CASO MYSQL OFFLINE)
// ============================================
interface UsuarioMem {
    id: number;
    nome: string;
    email: string;
    senha?: string;
    telefone: string;
    cidade: string;
    estado: string;
    tipo: 'adotante' | 'doador' | 'ambos' | 'admin';
    foto_url?: string;
    criado_em: string;
}

interface AnimalMem {
    id: number;
    nome: string;
    especie: 'cachorro' | 'gato' | 'outro';
    raca: string;
    idade: string;
    porte: 'pequeno' | 'medio' | 'grande';
    sexo: 'macho' | 'femea';
    descricao: string;
    imagem_url: string;
    cidade: string;
    estado: string;
    vacinado: boolean;
    castrado: boolean;
    status: 'disponivel' | 'em_analise' | 'adotado';
    usuario_id: number;
    criado_em: string;
}

let usuariosMemoria: UsuarioMem[] = [
    { id: 1, nome: 'Maria Silva', email: 'maria@email.com', senha: '123456', telefone: '(18) 99999-0001', cidade: 'Presidente Venceslau', estado: 'SP', tipo: 'doador', criado_em: '2026-09-10T10:00:00Z' },
    { id: 2, nome: 'João Santos', email: 'joao@email.com', senha: '123456', telefone: '(18) 99999-0002', cidade: 'Presidente Prudente', estado: 'SP', tipo: 'adotante', criado_em: '2026-09-12T14:30:00Z' },
    { id: 3, nome: 'Ana Oliveira', email: 'ana@email.com', senha: '123456', telefone: '(18) 99999-0003', cidade: 'Presidente Venceslau', estado: 'SP', tipo: 'ambos', criado_em: '2026-09-15T09:15:00Z' },
    { id: 999, nome: 'Administrador', email: 'admin@salvapet.com', senha: 'admin123', telefone: '(18) 99999-0000', cidade: 'Presidente Venceslau', estado: 'SP', tipo: 'admin', criado_em: '2026-09-01T08:00:00Z' },
];

let animaisMemoria: AnimalMem[] = [
    { id: 1, nome: 'Rex', especie: 'cachorro', raca: 'Vira-lata', idade: '2 anos', porte: 'medio', sexo: 'macho', descricao: 'Cachorro muito dócil e brincalhão, ótimo com crianças.', imagem_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: true, status: 'disponivel', usuario_id: 1, criado_em: '2026-09-20T10:00:00Z' },
    { id: 2, nome: 'Mimi', especie: 'gato', raca: 'Siamês', idade: '1 ano', porte: 'pequeno', sexo: 'femea', descricao: 'Gatinha carinhosa, gosta de colo e é muito tranquila.', imagem_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', cidade: 'Presidente Prudente', estado: 'SP', vacinado: true, castrado: false, status: 'disponivel', usuario_id: 1, criado_em: '2026-09-19T10:00:00Z' },
    { id: 3, nome: 'Thor', especie: 'cachorro', raca: 'Labrador', idade: '3 anos', porte: 'grande', sexo: 'macho', descricao: 'Labrador enérgico, precisa de espaço. Vacinado e castrado.', imagem_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: true, status: 'disponivel', usuario_id: 3, criado_em: '2026-09-18T10:00:00Z' },
    { id: 4, nome: 'Luna', especie: 'gato', raca: 'Persa', idade: '6 meses', porte: 'pequeno', sexo: 'femea', descricao: 'Filhote muito fofa, peluda e brincalhona.', imagem_url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: false, status: 'disponivel', usuario_id: 3, criado_em: '2026-09-17T10:00:00Z' },
    { id: 5, nome: 'Bob', especie: 'cachorro', raca: 'Poodle', idade: '4 anos', porte: 'pequeno', sexo: 'macho', descricao: 'Poodle dócil e já adestrado. Ideal para apartamento.', imagem_url: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400', cidade: 'Presidente Prudente', estado: 'SP', vacinado: false, castrado: true, status: 'disponivel', usuario_id: 1, criado_em: '2026-09-16T10:00:00Z' },
    { id: 6, nome: 'Mel', especie: 'cachorro', raca: 'Golden Retriever', idade: '1 ano', porte: 'grande', sexo: 'femea', descricao: 'Golden filhote, super amorosa e companheira.', imagem_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', cidade: 'Presidente Venceslau', estado: 'SP', vacinado: true, castrado: false, status: 'disponivel', usuario_id: 3, criado_em: '2026-09-15T10:00:00Z' },
];

let proximoAnimalId = 7;
let proximoUsuarioId = 4;

function enriquecerAnimal(a: AnimalMem) {
    const dono = usuariosMemoria.find(u => u.id === Number(a.usuario_id)) || usuariosMemoria[0];
    return {
        ...a,
        nome_dono: dono ? dono.nome : 'SalvaPet',
        telefone: dono ? dono.telefone : '(18) 99999-0000',
        cidade_dono: dono ? dono.cidade : a.cidade,
    };
}

// ============================================
// ROTAS DE ANIMAIS
// ============================================

// Listar todos os animais (com filtros opcionais)
app.get('/api/animais', async (req: Request, res: Response) => {
    try {
        let query = 'SELECT a.*, u.nome as nome_dono, u.telefone, u.cidade as cidade_dono FROM animais a LEFT JOIN usuarios u ON a.usuario_id = u.id WHERE 1=1';
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
    } catch {
        let lista = animaisMemoria.map(enriquecerAnimal);
        if (req.query.especie) lista = lista.filter(a => a.especie === req.query.especie);
        if (req.query.porte) lista = lista.filter(a => a.porte === req.query.porte);
        if (req.query.sexo) lista = lista.filter(a => a.sexo === req.query.sexo);
        if (req.query.status) lista = lista.filter(a => a.status === req.query.status);
        if (req.query.cidade) {
            const c = String(req.query.cidade).toLowerCase();
            lista = lista.filter(a => a.cidade?.toLowerCase().includes(c));
        }
        if (req.query.busca) {
            const b = String(req.query.busca).toLowerCase();
            lista = lista.filter(a =>
                a.nome.toLowerCase().includes(b) ||
                (a.raca && a.raca.toLowerCase().includes(b)) ||
                (a.descricao && a.descricao.toLowerCase().includes(b))
            );
        }
        res.json(lista);
    }
});

// Buscar animal por ID
app.get('/api/animais/:id', async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query(
            'SELECT a.*, u.nome as nome_dono, u.telefone, u.email as email_dono, u.cidade as cidade_dono FROM animais a LEFT JOIN usuarios u ON a.usuario_id = u.id WHERE a.id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Animal não encontrado' });
        }
        res.json(rows[0]);
    } catch {
        const animal = animaisMemoria.find(a => a.id === Number(req.params.id));
        if (!animal) {
            return res.status(404).json({ mensagem: 'Animal não encontrado' });
        }
        res.json(enriquecerAnimal(animal));
    }
});

// Cadastrar novo animal
app.post('/api/animais', async (req: Request, res: Response) => {
    const { nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status, usuario_id } = req.body;

    if (!nome || !especie || !sexo) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, especie, sexo' });
    }

    const donoId = Number(usuario_id) || 1;

    try {
        const [result]: any = await pool.query(
            'INSERT INTO animais (nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, especie, raca || '', idade || '', porte || 'medio', sexo, descricao || '', imagem_url || '', cidade || '', estado || 'SP', Boolean(vacinado), Boolean(castrado), status || 'disponivel', donoId]
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Animal cadastrado com sucesso!' });
    } catch {
        const novoAnimal: AnimalMem = {
            id: proximoAnimalId++,
            nome,
            especie,
            raca: raca || 'SRD',
            idade: idade || 'Não informada',
            porte: porte || 'medio',
            sexo,
            descricao: descricao || '',
            imagem_url: imagem_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
            cidade: cidade || 'Presidente Venceslau',
            estado: estado || 'SP',
            vacinado: Boolean(vacinado),
            castrado: Boolean(castrado),
            status: status || 'disponivel',
            usuario_id: donoId,
            criado_em: new Date().toISOString(),
        };
        animaisMemoria.unshift(novoAnimal);
        res.status(201).json({ id: novoAnimal.id, mensagem: 'Animal cadastrado com sucesso!', animal: enriquecerAnimal(novoAnimal) });
    }
});

// Atualizar animal
app.put('/api/animais/:id', async (req: Request, res: Response) => {
    const { nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status, usuario_id } = req.body;
    const id = Number(req.params.id);

    try {
        await pool.query(
            'UPDATE animais SET nome=?, especie=?, raca=?, idade=?, porte=?, sexo=?, descricao=?, imagem_url=?, cidade=?, estado=?, vacinado=?, castrado=?, status=?, usuario_id=COALESCE(?, usuario_id) WHERE id=?',
            [nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, Boolean(vacinado), Boolean(castrado), status || 'disponivel', usuario_id || null, id]
        );
        res.json({ mensagem: 'Animal atualizado com sucesso!' });
    } catch {
        const index = animaisMemoria.findIndex(a => a.id === id);
        if (index === -1) {
            return res.status(404).json({ mensagem: 'Animal não encontrado' });
        }
        animaisMemoria[index] = {
            ...animaisMemoria[index],
            nome: nome ?? animaisMemoria[index].nome,
            especie: especie ?? animaisMemoria[index].especie,
            raca: raca ?? animaisMemoria[index].raca,
            idade: idade ?? animaisMemoria[index].idade,
            porte: porte ?? animaisMemoria[index].porte,
            sexo: sexo ?? animaisMemoria[index].sexo,
            descricao: descricao ?? animaisMemoria[index].descricao,
            imagem_url: imagem_url ?? animaisMemoria[index].imagem_url,
            cidade: cidade ?? animaisMemoria[index].cidade,
            estado: estado ?? animaisMemoria[index].estado,
            vacinado: vacinado !== undefined ? Boolean(vacinado) : animaisMemoria[index].vacinado,
            castrado: castrado !== undefined ? Boolean(castrado) : animaisMemoria[index].castrado,
            status: status ?? animaisMemoria[index].status,
            usuario_id: usuario_id ? Number(usuario_id) : animaisMemoria[index].usuario_id,
        };
        res.json({ mensagem: 'Animal atualizado com sucesso!', animal: enriquecerAnimal(animaisMemoria[index]) });
    }
});

// Deletar animal
app.delete('/api/animais/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        await pool.query('DELETE FROM animais WHERE id = ?', [id]);
        res.json({ mensagem: 'Animal removido com sucesso!' });
    } catch {
        animaisMemoria = animaisMemoria.filter(a => a.id !== id);
        res.json({ mensagem: 'Animal removido com sucesso!' });
    }
});

// ============================================
// ROTAS DE USUÁRIOS
// ============================================

// Listar todos os usuários
app.get('/api/usuarios', async (_req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT id, nome, email, telefone, cidade, estado, tipo, foto_url, criado_em FROM usuarios ORDER BY criado_em DESC');
        res.json(rows);
    } catch {
        const listaSemSenha = usuariosMemoria.map(({ senha: _, ...u }) => u);
        res.json(listaSemSenha);
    }
});

// Cadastrar usuário
app.post('/api/usuarios', async (req: Request, res: Response) => {
    const { nome, email, senha, telefone, cidade, estado, tipo } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, email, senha' });
    }

    try {
        const [existing]: any = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ mensagem: 'Email já cadastrado' });
        }

        const [result]: any = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome, email, senha, telefone || '', cidade || '', estado || 'SP', tipo || 'ambos']
        );
        res.status(201).json({ id: result.insertId, mensagem: 'Usuário cadastrado com sucesso!' });
    } catch {
        if (usuariosMemoria.some(u => u.email.toLowerCase() === String(email).toLowerCase())) {
            return res.status(409).json({ mensagem: 'Email já cadastrado' });
        }
        const novoUsuario: UsuarioMem = {
            id: proximoUsuarioId++,
            nome,
            email,
            senha,
            telefone: telefone || '',
            cidade: cidade || '',
            estado: estado || 'SP',
            tipo: tipo || 'ambos',
            criado_em: new Date().toISOString(),
        };
        usuariosMemoria.unshift(novoUsuario);
        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        res.status(201).json({ id: novoUsuario.id, mensagem: 'Usuário cadastrado com sucesso!', usuario: usuarioSemSenha });
    }
});

// Atualizar usuário
app.put('/api/usuarios/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { nome, email, senha, telefone, cidade, estado, tipo } = req.body;

    try {
        if (senha && String(senha).trim() !== '') {
            await pool.query(
                'UPDATE usuarios SET nome=?, email=?, senha=?, telefone=?, cidade=?, estado=?, tipo=? WHERE id=?',
                [nome, email, senha, telefone || '', cidade || '', estado || 'SP', tipo || 'ambos', id]
            );
        } else {
            await pool.query(
                'UPDATE usuarios SET nome=?, email=?, telefone=?, cidade=?, estado=?, tipo=? WHERE id=?',
                [nome, email, telefone || '', cidade || '', estado || 'SP', tipo || 'ambos', id]
            );
        }
        res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    } catch {
        const index = usuariosMemoria.findIndex(u => u.id === id);
        if (index === -1) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        usuariosMemoria[index] = {
            ...usuariosMemoria[index],
            nome: nome ?? usuariosMemoria[index].nome,
            email: email ?? usuariosMemoria[index].email,
            senha: senha && String(senha).trim() !== '' ? senha : usuariosMemoria[index].senha,
            telefone: telefone ?? usuariosMemoria[index].telefone,
            cidade: cidade ?? usuariosMemoria[index].cidade,
            estado: estado ?? usuariosMemoria[index].estado,
            tipo: tipo ?? usuariosMemoria[index].tipo,
        };
        const { senha: _, ...usuarioSemSenha } = usuariosMemoria[index];
        res.json({ mensagem: 'Usuário atualizado com sucesso!', usuario: usuarioSemSenha });
    }
});

// Deletar usuário
app.delete('/api/usuarios/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ mensagem: 'Usuário removido com sucesso!' });
    } catch {
        usuariosMemoria = usuariosMemoria.filter(u => u.id !== id);
        res.json({ mensagem: 'Usuário removido com sucesso!' });
    }
});

// Login
app.post('/api/login', async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    // Credenciais do Administrador padrão
    if (email === 'admin@salvapet.com' && senha === 'admin123') {
        try {
            const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
            if (rows.length > 0) {
                const { senha: _, ...usuarioSemSenha } = rows[0];
                return res.json({ mensagem: 'Login de Administrador realizado com sucesso!', usuario: usuarioSemSenha });
            }
        } catch {
            // Usa fallback em memória
        }
        const adminMem = usuariosMemoria.find(u => u.email === 'admin@salvapet.com');
        if (adminMem) {
            const { senha: _, ...usuarioSemSenha } = adminMem;
            return res.json({ mensagem: 'Login de Administrador realizado com sucesso!', usuario: usuarioSemSenha });
        }
        return res.json({
            mensagem: 'Login de Administrador realizado com sucesso!',
            usuario: {
                id: 999,
                nome: 'Administrador',
                email: 'admin@salvapet.com',
                telefone: '(18) 99999-0000',
                cidade: 'Presidente Venceslau',
                estado: 'SP',
                tipo: 'admin'
            }
        });
    }

    try {
        const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
        }

        const usuario = rows[0];
        if (usuario.senha !== senha) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
        }

        const { senha: _, ...usuarioSemSenha } = usuario;
        res.json({ mensagem: 'Login realizado com sucesso!', usuario: usuarioSemSenha });
    } catch {
        const usuario = usuariosMemoria.find(u => u.email.toLowerCase() === String(email).toLowerCase());
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
        }
        const { senha: _, ...usuarioSemSenha } = usuario;
        res.json({ mensagem: 'Login realizado com sucesso!', usuario: usuarioSemSenha });
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
    } catch {
        const usuario = usuariosMemoria.find(u => u.id === Number(req.params.id));
        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }
        const { senha: _, ...usuarioSemSenha } = usuario;
        res.json(usuarioSemSenha);
    }
});

// ============================================
// ROTAS DE AVALIAÇÕES
// ============================================

app.get('/api/avaliacoes', async (_req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT av.*, u.nome as nome_usuario FROM avaliacoes av LEFT JOIN usuarios u ON av.usuario_id = u.id ORDER BY av.criado_em DESC'
        );
        res.json(rows);
    } catch {
        res.json([
            { id: 1, nome_usuario: 'Maria Silva', nota: 5, comentario: 'Site maravilhoso! Consegui encontrar um lar para meus gatinhos rapidamente.', criado_em: '2026-09-20' },
            { id: 2, nome_usuario: 'João Santos', nota: 4, comentario: 'Muito fácil de usar, adorei a iniciativa!', criado_em: '2026-09-18' },
            { id: 3, nome_usuario: 'Ana Oliveira', nota: 5, comentario: 'Plataforma excelente para quem quer ajudar os animais.', criado_em: '2026-09-15' }
        ]);
    }
});

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

app.get('/api/avaliacoes/media', async (_req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes');
        res.json(rows[0]);
    } catch {
        res.json({ media: 4.7, total: 3 });
    }
});

// ============================================
// ROTAS DE MENSAGENS
// ============================================

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
    } catch {
        res.json({
            animais_disponiveis: animaisMemoria.filter(a => a.status === 'disponivel').length,
            animais_adotados: animaisMemoria.filter(a => a.status === 'adotado').length,
            usuarios_cadastrados: usuariosMemoria.length
        });
    }
});

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA DO BANCO (PRODUÇÃO)
// ============================================
async function inicializarBanco() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(120) NOT NULL,
                email VARCHAR(180) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                cidade VARCHAR(100),
                estado VARCHAR(2),
                tipo ENUM('adotante', 'doador', 'ambos', 'admin') DEFAULT 'ambos',
                foto_url VARCHAR(500),
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS animais (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                especie ENUM('cachorro', 'gato', 'outro') NOT NULL,
                raca VARCHAR(80),
                idade VARCHAR(50),
                porte ENUM('pequeno', 'medio', 'grande') DEFAULT 'medio',
                sexo ENUM('macho', 'femea') NOT NULL,
                descricao TEXT,
                imagem_url VARCHAR(500),
                cidade VARCHAR(100),
                estado VARCHAR(2),
                vacinado BOOLEAN DEFAULT FALSE,
                castrado BOOLEAN DEFAULT FALSE,
                status ENUM('disponivel', 'em_analise', 'adotado') DEFAULT 'disponivel',
                usuario_id INT NOT NULL,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS avaliacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT,
                nota INT NOT NULL,
                comentario TEXT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS mensagens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                remetente_id INT NOT NULL,
                destinatario_id INT NOT NULL,
                animal_id INT,
                assunto VARCHAR(200),
                conteudo TEXT NOT NULL,
                lida BOOLEAN DEFAULT FALSE,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);

        const [usersCount]: any = await pool.query('SELECT COUNT(*) as total FROM usuarios');
        if (usersCount[0].total === 0) {
            await pool.query(`
                INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado, tipo) VALUES
                ('Maria Silva', 'maria@email.com', '123456', '(18) 99999-0001', 'Presidente Venceslau', 'SP', 'doador'),
                ('João Santos', 'joao@email.com', '123456', '(18) 99999-0002', 'Presidente Prudente', 'SP', 'adotante'),
                ('Ana Oliveira', 'ana@email.com', '123456', '(18) 99999-0003', 'Presidente Venceslau', 'SP', 'ambos'),
                ('Administrador', 'admin@salvapet.com', 'admin123', '(18) 99999-0000', 'Presidente Venceslau', 'SP', 'admin');
            `);

            await pool.query(`
                INSERT INTO animais (nome, especie, raca, idade, porte, sexo, descricao, imagem_url, cidade, estado, vacinado, castrado, status, usuario_id) VALUES
                ('Rex', 'cachorro', 'Vira-lata', '2 anos', 'medio', 'macho', 'Cachorro muito dócil e brincalhão, ótimo com crianças.', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 'Presidente Venceslau', 'SP', TRUE, TRUE, 'disponivel', 1),
                ('Mimi', 'gato', 'Siamês', '1 ano', 'pequeno', 'femea', 'Gatinha carinhosa, gosta de colo e é muito tranquila.', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', 'Presidente Prudente', 'SP', TRUE, FALSE, 'disponivel', 1),
                ('Thor', 'cachorro', 'Labrador', '3 anos', 'grande', 'macho', 'Labrador enérgico, precisa de espaço. Vacinado e castrado.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'Presidente Venceslau', 'SP', TRUE, TRUE, 'disponivel', 3),
                ('Luna', 'gato', 'Persa', '6 meses', 'pequeno', 'femea', 'Filhote muito fofa, peluda e brincalhona.', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', 'Presidente Venceslau', 'SP', TRUE, FALSE, 'disponivel', 3),
                ('Bob', 'cachorro', 'Poodle', '4 anos', 'pequeno', 'macho', 'Poodle dócil e já adestrado. Ideal para apartamento.', 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400', 'Presidente Prudente', 'SP', FALSE, TRUE, 'disponivel', 1),
                ('Mel', 'cachorro', 'Golden Retriever', '1 ano', 'grande', 'femea', 'Golden filhote, super amorosa e companheira.', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', 'Presidente Venceslau', 'SP', TRUE, FALSE, 'disponivel', 3);
            `);

            await pool.query(`
                INSERT INTO avaliacoes (usuario_id, nota, comentario) VALUES
                (1, 5, 'Site maravilhoso! Consegui encontrar um lar para meus gatinhos rapidamente.'),
                (2, 4, 'Muito fácil de usar, adorei a iniciativa!'),
                (3, 5, 'Plataforma excelente para quem quer ajudar os animais.');
            `);
            console.log('✅ Banco de dados MySQL inicializado e populado com sucesso!');
        } else {
            console.log('✅ Conectado ao banco de dados MySQL.');
        }
    } catch {
        console.log('ℹ️ MySQL não detectado ou indisponível no momento — operando com armazenamento em memória.');
    }
}

// ============================================
// SERVIR FRONT-END ESTÁTICO (BUILD DE PRODUÇÃO)
// ============================================
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐾 SalvaPet rodando na porta ${PORT}`);
    inicializarBanco();
});
