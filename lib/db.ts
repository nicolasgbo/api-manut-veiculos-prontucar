import fs from "fs";
import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { db?: mysql.Pool };

// TLS opcional para Azure Database for MySQL Flexible Server.
// Local: DB_SSL ausente ou diferente de "true" → sem SSL.
// Azure: DB_SSL=true e, se necessário, DB_SSL_CA apontando para o PEM
// (DigiCert Global Root G2 / Microsoft RSA Root CA 2017, conforme docs da Microsoft).
function buildSslOption():
  | { rejectUnauthorized: true; ca?: string }
  | undefined {
  if (process.env.DB_SSL !== "true") return undefined;

  const ssl: { rejectUnauthorized: true; ca?: string } = {
    rejectUnauthorized: true,
  };

  const caPath = process.env.DB_SSL_CA?.trim();
  if (caPath) {
    ssl.ca = fs.readFileSync(caPath, "utf8");
  }

  return ssl;
}

const db =
  globalForDb.db ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true, // datas voltam como texto ("2026-10-26") em vez de objeto Date
    decimalNumbers: true, // colunas DECIMAL voltam como number em vez de string
    ssl: buildSslOption(),
  });

// Só guarda em globalThis fora de produção, onde não há recarga de módulos
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export default db;
