import db from "@/lib/db";
import { Usuario } from "@/types/Usuario";
import type { ResultSetHeader } from "mysql2";

//Busca um usuario pelo e-mail. Devolve null se nao existir.
export async function findUsuarioByEmail(email: string): Promise<Usuario | null> {
  const [rows] = await db.query(
    "SELECT id, nome, email, senha_hash AS senhaHash FROM usuarios WHERE email = ?",
    [email]
  );

  //O driver nao sabe o formato das linhas, então dizemos ao TypeScript que são Usuario[]
  const usuarios = rows as Usuario[];
  //Sem resultado, usuarios[0] é undefined e o "?? null" transforma em null
  return usuarios[0] ?? null;
}

//Busca um usuario pelo id. Devolve null se nao existir.
export async function findUsuarioById(id: number): Promise<Usuario | null> {
  const [rows] = await db.query(
    "SELECT id, nome, email, senha_hash AS senhaHash FROM usuarios WHERE id = ?",
    [id]
  );

  const usuarios = rows as Usuario[];
  return usuarios[0] ?? null;
}

//Cria um usuario e devolve o id gerado pelo banco. Recebe a senha ja com hash
export async function insertUsuario(
  nome: string,
  email: string,
  senhaHash: string
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
    [nome, email, senhaHash]
  );

  // Em INSERT, o driver devolve um ResultSetHeader, que traz o insertId
  return (result as ResultSetHeader).insertId;
}

//Atualiza nome e email; a senha so e alterada se um novo hash for passado
export async function updateUsuario(
  id: number,
  nome: string,
  email: string,
  senhaHash?: string
): Promise<void> {
  if (senhaHash) {
    await db.execute(
      "UPDATE usuarios SET nome = ?, email = ?, senha_hash = ? WHERE id = ?",
      [nome, email, senhaHash, id]
    );
  } else {
    await db.execute(
      "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
      [nome, email, id]
    );
  }
}