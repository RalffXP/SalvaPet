import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

export const pool = mysql.createPool({
    host: (process.env.DB_HOST || 'localhost').trim(),
    port: Number(process.env.DB_PORT || 3306),
    user: (process.env.DB_USER || 'root').trim(),
    password: (process.env.DB_PASSWORD || '').trim(),
    database: (process.env.DB_NAME || 'salvapet').trim(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});