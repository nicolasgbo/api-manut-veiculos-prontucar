import db from "@/lib/db";
import type { ResumoVeiculo, ResumoTipo, UltimaRevisao } from "@/types/Relatorio";

export interface FiltrosRelatorio {
  veiculoId?: number;
  dataDe?: string;
  dataAte?: string;
}

/* Resumo por veículo no período: quantidade, total gasto e menor/maior km.
LEFT JOIN: veículos sem manutenção no período também aparecem (com zero).
Por isso o filtro de data fica no ON do JOIN, e não no WHERE
(no WHERE ele eliminaria os veículos sem manutenção). */

export async function resumoPorVeiculo(
  usuarioId: number,
  f: FiltrosRelatorio
): Promise<ResumoVeiculo[]> {
  let sql = `
    SELECT v.id AS veiculoId, v.placa, v.marca, v.modelo,
           COUNT(m.id) AS quantidade,
           COALESCE(SUM(m.custo), 0) AS totalGasto,
           MIN(m.km) AS kmMin,
           MAX(m.km) AS kmMax
    FROM veiculos v
    LEFT JOIN manutencoes m ON m.veiculo_id = v.id`;
  const valores: (string | number)[] = [];

  //Os "?" do ON vem primeiro, depois os do WHERE, a ordem dos valores segue a do texto
  if (f.dataDe) {
    sql += " AND m.data >= ?";
    valores.push(f.dataDe);
  }
  if (f.dataAte) {
    sql += " AND m.data <= ?";
    valores.push(f.dataAte);
  }

  sql += " WHERE v.usuario_id = ?";
  valores.push(usuarioId);

  if (f.veiculoId) {
    sql += " AND v.id = ?";
    valores.push(f.veiculoId);
  }

  sql += " GROUP BY v.id, v.placa, v.marca, v.modelo ORDER BY totalGasto DESC, v.placa";

  const [rows] = await db.query(sql, valores);
  //SUM/COUNT podem voltar como texto dependendo do driver: Number garante numero
  return (rows as ResumoVeiculo[]).map((r) => ({
    ...r,
    quantidade: Number(r.quantidade),
    totalGasto: Number(r.totalGasto),
    kmMin: r.kmMin === null ? null : Number(r.kmMin),
    kmMax: r.kmMax === null ? null : Number(r.kmMax),
  }));
}

//Quantidade e total gasto por tipo de manutencao
export async function resumoPorTipo(
  usuarioId: number,
  f: FiltrosRelatorio
): Promise<ResumoTipo[]> {
  let sql = `
    SELECT m.tipo, COUNT(*) AS quantidade, SUM(m.custo) AS totalGasto
    FROM manutencoes m
    JOIN veiculos v ON v.id = m.veiculo_id
    WHERE v.usuario_id = ?`;
  const valores: (string | number)[] = [usuarioId];

  if (f.veiculoId) {
    sql += " AND m.veiculo_id = ?";
    valores.push(f.veiculoId);
  }
  if (f.dataDe) {
    sql += " AND m.data >= ?";
    valores.push(f.dataDe);
  }
  if (f.dataAte) {
    sql += " AND m.data <= ?";
    valores.push(f.dataAte);
  }

  sql += " GROUP BY m.tipo ORDER BY totalGasto DESC";

  const [rows] = await db.query(sql, valores);
  return (rows as ResumoTipo[]).map((r) => ({
    ...r,
    quantidade: Number(r.quantidade),
    totalGasto: Number(r.totalGasto),
  }));
}

/* Para cada veículo + tipo, pega só a manutenção MAIS RECENTE (maior data; empate, maior id)
que tenha próxima revisão definida.
NOT EXISTS = "não existe nenhuma manutenção mais nova do mesmo veículo e tipo".
As manutenções antigas ficam só como histórico e não entram aqui. */

export async function findUltimasRevisoes(
  usuarioId: number,
  veiculoId?: number
): Promise<UltimaRevisao[]> {
  let sql = `
    SELECT m.id AS manutencaoId, m.veiculo_id AS veiculoId,
           v.placa, v.marca, v.modelo, v.km_atual AS kmAtual,
           m.tipo, m.data,
           m.proxima_revisao_km AS proximaRevisaoKm,
           m.proxima_revisao_data AS proximaRevisaoData
    FROM manutencoes m
    JOIN veiculos v ON v.id = m.veiculo_id
    WHERE v.usuario_id = ?
      AND (m.proxima_revisao_km IS NOT NULL OR m.proxima_revisao_data IS NOT NULL)
      AND NOT EXISTS (
        SELECT 1 FROM manutencoes m2
        WHERE m2.veiculo_id = m.veiculo_id
          AND m2.tipo = m.tipo
          AND (m2.data > m.data OR (m2.data = m.data AND m2.id > m.id))
      )`;
  const valores: number[] = [usuarioId];

  if (veiculoId) {
    sql += " AND m.veiculo_id = ?";
    valores.push(veiculoId);
  }

  sql += " ORDER BY v.placa, m.tipo";

  const [rows] = await db.query(sql, valores);
  return rows as UltimaRevisao[];
}