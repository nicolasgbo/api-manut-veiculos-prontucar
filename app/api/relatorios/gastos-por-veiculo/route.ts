import { NextResponse } from "next/server";
import { resumoPorVeiculo } from "@/repositories/relatorioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { filtroRelatorioSchema } from "@/lib/validators/relatorio";

//GET /api/relatorios/gastos-por-veiculo?dataDe=2026-01-01&dataAte=2026-12-31&veiculoId=2
export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = filtroRelatorioSchema.safeParse(params);
  if (!parsed.success) return erroValidacao(parsed.error);

  const linhas = await resumoPorVeiculo(usuarioId, parsed.data);

  //Devolve so os campos deste relatorio
  const veiculos = linhas.map(({ kmMin, kmMax, ...resto }) => resto);
  //A soma geral e feita aqui em JavaScript, somando os totais de cada veiculo
  const totalGeral = veiculos.reduce((soma, v) => soma + v.totalGasto, 0);

  return NextResponse.json({
    filtros: parsed.data,
    totalGeral: Math.round(totalGeral * 100) / 100,
    veiculos,
  });
}