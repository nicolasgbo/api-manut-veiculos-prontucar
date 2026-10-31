import db from "@/lib/db";
import { Manutencao, DadosManutencao } from "@/types/Manutencao";
import type { ResultSetHeader } from "mysql2";

//SELECT base: junta a manutencao com o veiculo para trazer placa, marca e modelo
const SELECT_BASE = `
  SELECT m.id, m.veiculo_id AS veiculoId, m.tipo, m.data, m.km, m.custo,
         m.oficina, m.observacoes,
         m.proxima_revisao_km AS proximaRevisaoKm,
         m.proxima_revisao_data AS proximaRevisaoData,
         m.created_at AS criadoEm,
         v.placa AS veiculoPlaca, v.marca AS veiculoMarca, v.modelo AS veiculoModelo
  FROM manutencoes m
  JOIN veiculos v ON v.id = m.veiculo_id`;

//Linha achatada que vem do SQL
type Linha = Omit<Manutencao, "veiculo"> & {
  veiculoPlaca: string;
  veiculoMarca: string;
  veiculoModelo: string;
};

//Transforma a linha do SQL no formato da API, com o veiculo aninhado
function montar(l: Linha): Manutencao {
  const { veiculoPlaca, veiculoMarca, veiculoModelo, ...resto } = l;
  return {
    ...resto,
    veiculo: {
      id: l.veiculoId,
      placa: veiculoPlaca,
      marca: veiculoMarca,
      modelo: veiculoModelo,
    },
  };
}

export interface FiltrosManutencao {
  veiculoId?: number;
  tipo?: string;
  dataDe?: string;
  dataAte?: string;
  busca?: string;
}

//Lista as manutencoes dos veiculos de UM usuario, aplicando os filtros que vierem
export async function findManutencoes(
  usuarioId: number,
  filtros: FiltrosManutencao
): Promise<Manutencao[]> {
  let sql = `${SELECT_BASE} WHERE v.usuario_id = ?`;
  const valores: (string | number)[] = [usuarioId];

  if (filtros.veiculoId) {
    sql += " AND m.veiculo_id = ?";
    valores.push(filtros.veiculoId);
  }
  if (filtros.tipo) {
    sql += " AND m.tipo = ?";
    valores.push(filtros.tipo);
  }
  if (filtros.dataDe) {
    sql += " AND m.data >= ?";
    valores.push(filtros.dataDe);
  }
  if (filtros.dataAte) {
    sql += " AND m.data <= ?";
    valores.push(filtros.dataAte);
  }
  if (filtros.busca) {
    sql += " AND (m.oficina LIKE ? OR m.observacoes LIKE ?)";
    valores.push(`%${filtros.busca}%`, `%${filtros.busca}%`);
  }

  sql += " ORDER BY m.data DESC, m.id DESC";

  const [rows] = await db.query(sql, valores);
  return (rows as Linha[]).map(montar);
}

//Busca uma manutencao pelo id, so se o veiculo dela for do usuario
export async function findManutencaoById(
  id: number,
  usuarioId: number
): Promise<Manutencao | null> {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE m.id = ? AND v.usuario_id = ?`,
    [id, usuarioId]
  );
  const linhas = rows as Linha[];
  return linhas[0] ? montar(linhas[0]) : null;
}

// A manutenção mais recente do veículo, ignora id pra nao pegar ela mesma.
export async function findUltimaManutencaoDoVeiculo(
  veiculoId: number,
  ignorarId?: number
): Promise<{ data: string; km: number } | null> {
  let sql = "SELECT data, km FROM manutencoes WHERE veiculo_id = ?";
  const valores: number[] = [veiculoId];

  if (ignorarId) {
    sql += " AND id <> ?";
    valores.push(ignorarId);
  }

  sql += " ORDER BY data DESC, id DESC LIMIT 1";

  const [rows] = await db.query(sql, valores);
  const linhas = rows as { data: string; km: number }[];
  return linhas[0] ?? null;
}

//Grava a manutencao E atualiza o km do veiculo na mesma transacao.
export async function insertManutencao(
  veiculoId: number,
  d: DadosManutencao
): Promise<number> {
  const conexao = await db.getConnection();
  try {
    await conexao.beginTransaction();

    const [result] = await conexao.execute(
      `INSERT INTO manutencoes
        (veiculo_id, tipo, data, km, custo, oficina, observacoes, proxima_revisao_km, proxima_revisao_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [veiculoId, d.tipo, d.data, d.km, d.custo, d.oficina, d.observacoes, d.proximaRevisaoKm, d.proximaRevisaoData]
    );

    //GREATEST escolhe o maior: o km do veiculo so aumenta, nunca diminui
    await conexao.execute(
      "UPDATE veiculos SET km_atual = GREATEST(km_atual, ?) WHERE id = ?",
      [d.km, veiculoId]
    );

    await conexao.commit();
    return (result as ResultSetHeader).insertId;
  } catch (e) {
    await conexao.rollback(); //desfaz o que foi feito
    throw e;
  } finally {
    conexao.release(); //devolve a conexao ao pool
  }
}

//Mesma lóoica na edicao: altera a manutencao e, se o km for maior, o do veiculo
export async function updateManutencao(
  id: number,
  veiculoId: number,
  d: DadosManutencao
): Promise<void> {
  const conexao = await db.getConnection();
  try {
    await conexao.beginTransaction();

    await conexao.execute(
      `UPDATE manutencoes
          SET tipo = ?, data = ?, km = ?, custo = ?, oficina = ?, observacoes = ?,
              proxima_revisao_km = ?, proxima_revisao_data = ?
        WHERE id = ?`,
      [d.tipo, d.data, d.km, d.custo, d.oficina, d.observacoes, d.proximaRevisaoKm, d.proximaRevisaoData, id]
    );

    await conexao.execute(
      "UPDATE veiculos SET km_atual = GREATEST(km_atual, ?) WHERE id = ?",
      [d.km, veiculoId]
    );

    await conexao.commit();
  } catch (e) {
    await conexao.rollback();
    throw e;
  } finally {
    conexao.release();
  }
}

//Excluir a manutencao nao mexe no km_atual do veiculo
export async function deleteManutencao(id: number): Promise<void> {
  await db.execute("DELETE FROM manutencoes WHERE id = ?", [id]);
}