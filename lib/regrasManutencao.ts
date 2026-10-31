import type { z } from "zod";
import { findUltimaManutencaoDoVeiculo } from "@/repositories/manutencaoRepository";
import type { manutencaoSchema } from "@/lib/validators/manutencao";
import type { DadosManutencao } from "@/types/Manutencao";

/* REGRA DO KM:
Se a manutenção é da mesma data da mais recente do veículo, ou posterior a ela,
o km não pode ser MENOR (o carro não anda para trás).
Manutenções com data ANTIGA podem ter km menor: é o lançamento de histórico.
Devolve a mensagem de erro, ou null se estiver tudo certo. */

export async function validarKm(
  veiculoId: number,
  data: string,
  km: number,
  ignorarId?: number
): Promise<string | null> {
  const ultima = await findUltimaManutencaoDoVeiculo(veiculoId, ignorarId);

  //Datas no formato aaaa-mm-dd podem ser comparadas como texto
  if (ultima && data >= ultima.data && km < ultima.km) {
    return `O km não pode ser menor que o da última manutenção (${ultima.km} km em ${ultima.data})`;
  }
  return null;
}

//O banco nao aceita undefined: campos opcionais vazios viram null
export function paraDados(d: z.infer<typeof manutencaoSchema>): DadosManutencao {
  return {
    tipo: d.tipo,
    data: d.data,
    km: d.km,
    custo: d.custo,
    oficina: d.oficina || null,
    observacoes: d.observacoes || null,
    proximaRevisaoKm: d.proximaRevisaoKm ?? null,
    proximaRevisaoData: d.proximaRevisaoData ?? null,
  };
}