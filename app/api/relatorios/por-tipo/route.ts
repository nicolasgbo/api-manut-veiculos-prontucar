import { NextResponse } from "next/server";
import { resumoPorTipo } from "@/repositories/relatorioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { filtroRelatorioSchema } from "@/lib/validators/relatorio";

//GET /api/relatorios/por-tipo?dataDe=&dataAte=&veiculoId=
export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = filtroRelatorioSchema.safeParse(params);
  if (!parsed.success) return erroValidacao(parsed.error);

  const tipos = await resumoPorTipo(usuarioId, parsed.data);
  return NextResponse.json({ filtros: parsed.data, tipos });
}