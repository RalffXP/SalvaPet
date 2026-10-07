// ============================================
// Upload de imagens dos animais (multer)
// ============================================
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type { NextFunction, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pasta onde as fotos ficam salvas: Salva-Pet/uploads
export const PASTA_UPLOADS = path.resolve(__dirname, '..', '..', 'uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

export const TAMANHO_MAXIMO_MB = 5;

const TIPOS_PERMITIDOS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

const upload = multer({
    storage: multer.diskStorage({
        destination: PASTA_UPLOADS,
        // Nome aleatório: evita conflitos e nomes de arquivo maliciosos
        filename: (_req, file, cb) => {
            cb(null, `${Date.now()}-${crypto.randomUUID()}${TIPOS_PERMITIDOS[file.mimetype]}`);
        },
    }),
    limits: { fileSize: TAMANHO_MAXIMO_MB * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (TIPOS_PERMITIDOS[file.mimetype]) cb(null, true);
        else cb(new Error('TIPO_INVALIDO'));
    },
});

/** Middleware que recebe um único arquivo no campo "imagem" e responde 400 com mensagem amigável em caso de erro */
export function receberImagem(req: Request, res: Response, next: NextFunction) {
    upload.single('imagem')(req, res, (erro: unknown) => {
        if (!erro) return next();
        if (erro instanceof multer.MulterError && erro.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ mensagem: `A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB} MB` });
        }
        if (erro instanceof Error && erro.message === 'TIPO_INVALIDO') {
            return res.status(400).json({ mensagem: 'Formato inválido. Envie uma imagem JPG, PNG, WEBP ou GIF' });
        }
        return res.status(400).json({ mensagem: 'Erro ao enviar a imagem' });
    });
}

/** Monta a URL pública da imagem enviada (ex.: http://localhost:3000/uploads/arquivo.jpg) */
export function urlPublica(req: Request, nomeArquivo: string) {
    return `${req.protocol}://${req.get('host')}/uploads/${nomeArquivo}`;
}

/** Remove do disco uma imagem enviada pelo site (ignora URLs externas) */
export function removerImagem(imagemUrl?: string | null) {
    if (!imagemUrl || !imagemUrl.includes('/uploads/')) return;
    const arquivo = path.join(PASTA_UPLOADS, path.basename(imagemUrl));
    fs.promises.unlink(arquivo).catch(() => { /* arquivo já não existe */ });
}
