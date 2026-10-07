// ============================================
// Utilitários de sessão do usuário (localStorage)
// ============================================

export type Usuario = {
    id: number;
    nome: string;
    email: string;
    perfil: 'usuario' | 'admin';
    telefone?: string;
    cidade?: string;
    estado?: string;
    tipo?: string;
};

export const API_URL = 'http://localhost:3000';

export function getUsuarioLogado(): Usuario | null {
    try {
        const dados = localStorage.getItem('usuario');
        return dados ? (JSON.parse(dados) as Usuario) : null;
    } catch {
        return null;
    }
}

export function salvarUsuario(usuario: Usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    window.dispatchEvent(new Event('usuario-alterado'));
}

export function logout() {
    localStorage.removeItem('usuario');
    window.dispatchEvent(new Event('usuario-alterado'));
}

/** Cabeçalhos com a identificação do usuário logado para rotas protegidas */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const usuario = getUsuarioLogado();
    return {
        'Content-Type': 'application/json',
        ...(usuario ? { 'x-usuario-id': String(usuario.id) } : {}),
        ...extra,
    };
}

/** Cabeçalhos de autenticação para multipart/form-data (deixa o navegador definir Content-Type com boundary) */
export function authHeadersMultipart(extra: Record<string, string> = {}): Record<string, string> {
    const usuario = getUsuarioLogado();
    return {
        ...(usuario ? { 'x-usuario-id': String(usuario.id) } : {}),
        ...extra,
    };
}
