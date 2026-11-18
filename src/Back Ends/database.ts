import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

export const pool = connectionUrl
    ? mysql.createPool(connectionUrl)
    : mysql.createPool({
          host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
          port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
          user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
          password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
          database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'salvapet',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
      });
