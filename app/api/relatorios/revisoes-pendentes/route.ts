import { NextResponse } from "next/server";
import { findUltimasRevisoes } from "@/repositories/relatorioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { filtroPendentesSchema } from "@/lib/validators/relatorio";

//GET /api/relatorios/revisoes-pendentes?veiculoId=2
//Pendente = a proxima revisao ja venceu por DATA (hoje ou antes) ou por KM (km atual >= previsto)
export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = filtroPendentesSchema.safeParse(params);
  if (!parsed.success) return erroValidacao(parsed.error);

  const hoje = new Date().toISOString().slice(0, 10); //"aaaa-mm-dd"
  const ultimas = await findUltimasRevisoes(usuarioId, parsed.data.veiculoId);

  const pendentes = ultimas
    .map((u) => {
      const motivos: string[] = [];
      if (u.proximaRevisaoData && u.proximaRevisaoData <= hoje) {
        motivos.push(`Vencida por data (prevista para ${u.proximaRevisaoData})`);
      }
      if (u.proximaRevisaoKm !== null && u.kmAtual >= u.proximaRevisaoKm) {
        motivos.push(`Vencida por km (prevista aos ${u.proximaRevisaoKm} km, atual ${u.kmAtual} km)`);
      }
      return { ...u, motivos };
    })
    .filter((u) => u.motivos.length > 0); //fica so quem tem algum motivo

  return NextResponse.json({ hoje, total: pendentes.length, pendentes });
}