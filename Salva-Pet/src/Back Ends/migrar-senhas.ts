// ============================================
// Migração: criptografa senhas antigas (texto puro) com bcrypt
// Uso: npm run migrar-senhas
// Pode ser executado várias vezes: senhas já criptografadas são ignoradas.
// ============================================
import bcrypt from 'bcryptjs';
import { pool } from './database';

const SALT_ROUNDS = 10;
const ehHashBcrypt = (valor: string) => /^\$2[aby]\$\d{2}\$/.test(valor);

async function migrar() {
    const [usuarios]: any = await pool.query('SELECT id, email, senha FROM usuarios');
    let convertidas = 0;

    for (const u of usuarios) {
        if (!u.senha || ehHashBcrypt(u.senha)) continue;
        const hash = await bcrypt.hash(u.senha, SALT_ROUNDS);
        await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hash, u.id]);
        console.log(`🔒 Senha criptografada: ${u.email}`);
        convertidas++;
    }

    console.log(`\n✅ Concluído: ${convertidas} senha(s) convertida(s) de ${usuarios.length} usuário(s).`);
    await pool.end();
}

migrar().catch(async erro => {
    console.error('❌ Erro na migração:', erro);
    await pool.end();
    process.exit(1);
});
