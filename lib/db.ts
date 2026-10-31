import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { db?: mysql.Pool };
 
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
  });

// Só guarda em globalThis fora de produção, onde não há recarga de módulos
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export default db;
