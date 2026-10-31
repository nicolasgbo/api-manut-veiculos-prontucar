import { NextResponse } from "next/server";
import { resumoPorVeiculo } from "@/repositories/relatorioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { filtroRelatorioSchema } from "@/lib/validators/relatorio";

//GET /api/relatorios/custo-por-km?dataDe=&dataAte=&veiculoId=
export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = filtroRelatorioSchema.safeParse(params);
  if (!parsed.success) return erroValidacao(parsed.error);

  const linhas = await resumoPorVeiculo(usuarioId, parsed.data);

  const veiculos = linhas.map((l) => {
    //Km rodado no periodo = maior km lancado - menor km lancado
    const kmRodado = l.kmMax !== null && l.kmMin !== null ? l.kmMax - l.kmMin : 0;
    //So da para calcular com km rodado maior que zero, precisa de 2+ manutencao com km diferente
    const custoPorKm = kmRodado > 0 ? Math.round((l.totalGasto / kmRodado) * 100) / 100 : null;

    return {
      veiculoId: l.veiculoId,
      placa: l.placa,
      marca: l.marca,
      modelo: l.modelo,
      totalGasto: l.totalGasto,
      kmRodado,
      custoPorKm,
    };
  });

  return NextResponse.json({ filtros: parsed.data, veiculos });
}