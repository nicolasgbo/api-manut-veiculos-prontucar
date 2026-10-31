    import db from "@/lib/db";
import { Veiculo } from "@/types/Veiculo";
import type { ResultSetHeader } from "mysql2";

//Colunas do banco snake_case renomeadas para o formato do codigo camelCase
const COLUNAS =
  "id, usuario_id AS usuarioId, placa, marca, modelo, ano, km_atual AS kmAtual, created_at AS criadoEm";

//Lista os veiculos de UM usuario, com busca opcional por placa, marca ou modelo
export async function findVeiculosByUsuario(
  usuarioId: number,
  busca?: string
): Promise<Veiculo[]> {
  let sql = `SELECT ${COLUNAS} FROM veiculos WHERE usuario_id = ?`;
  const valores: (string | number)[] = [usuarioId];

  if (busca) {
    sql += " AND (placa LIKE ? OR marca LIKE ? OR modelo LIKE ?)";
    valores.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await db.query(sql, valores);
  return rows as Veiculo[];
}


//Busca um veiculo pelo id, mas SO se pertencer ao usuario Se for de outro usuario, volta null.
export async function findVeiculoById(
  id: number,
  usuarioId: number
): Promise<Veiculo | null> {
  const [rows] = await db.query(
    `SELECT ${COLUNAS} FROM veiculos WHERE id = ? AND usuario_id = ?`,
    [id, usuarioId]
  );
  const veiculos = rows as Veiculo[];
  return veiculos[0] ?? null;
}

//Procura uma placa ja cadastrada por este usuario pra evitar duplicidade
export async function findVeiculoByPlaca(
  usuarioId: number,
  placa: string
): Promise<Veiculo | null> {
  const [rows] = await db.query(
    `SELECT ${COLUNAS} FROM veiculos WHERE usuario_id = ? AND placa = ?`,
    [usuarioId, placa]
  );
  const veiculos = rows as Veiculo[];
  return veiculos[0] ?? null;
}

export async function insertVeiculo(
  usuarioId: number,
  placa: string,
  marca: string,
  modelo: string,
  ano: number,
  kmAtual: number
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO veiculos (usuario_id, placa, marca, modelo, ano, km_atual) VALUES (?, ?, ?, ?, ?, ?)",
    [usuarioId, placa, marca, modelo, ano, kmAtual]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateVeiculo(
  id: number,
  usuarioId: number,
  placa: string,
  marca: string,
  modelo: string,
  ano: number,
  kmAtual: number
): Promise<void> {
  //O WHERE com usuario_id garante que so o dono altera o veiculo
  await db.execute(
    "UPDATE veiculos SET placa = ?, marca = ?, modelo = ?, ano = ?, km_atual = ? WHERE id = ? AND usuario_id = ?",
    [placa, marca, modelo, ano, kmAtual, id, usuarioId]
  );
}

export async function deleteVeiculo(id: number, usuarioId: number): Promise<void> {
  await db.execute("DELETE FROM veiculos WHERE id = ? AND usuario_id = ?", [
    id,
    usuarioId,
  ]);
}

//Quantas manutencoes o veiculo tem, usado para bloquear a exclusao
export async function countManutencoesDoVeiculo(veiculoId: number): Promise<number> {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS total FROM manutencoes WHERE veiculo_id = ?",
    [veiculoId]
  );
  return (rows as { total: number }[])[0].total;
}