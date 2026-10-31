import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/health
// Rota de teste: se responder { ok: true }, o servidor está no ar e a
// conexão com o MySQL funciona. Se der erro, confira o .env e o banco.
export async function GET() {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM usuarios");
  return NextResponse.json({ ok: true, usuarios: rows });
}
