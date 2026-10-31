import { NextResponse } from "next/server";
import {
  findManutencoes,
  findManutencaoById,
  insertManutencao,
} from "@/repositories/manutencaoRepository";
import { findVeiculoById } from "@/repositories/veiculoRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { validarKm, paraDados } from "@/lib/regrasManutencao";
import {
  criarManutencaoSchema,
  filtroManutencaoSchema,
} from "@/lib/validators/manutencao";

//GET /api/manutencoes?veiculoId=1&tipo=FREIOS&dataDe=2026-01-01&dataAte=2026-12-31&busca=silva
export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  //Transforma os parametros da URL em objeto e valida
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = filtroManutencaoSchema.safeParse(params);
  if (!parsed.success) return erroValidacao(parsed.error);

  const manutencoes = await findManutencoes(usuarioId, parsed.data);
  return NextResponse.json(manutencoes);
}

//POST /api/manutencoes -> registra uma manutencao
export async function POST(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const corpo = await request.json().catch(() => null);
  const parsed = criarManutencaoSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error);

  const { veiculoId, ...resto } = parsed.data;

  //O veiculo precisa existir E ser do usuario logado
  if (!(await findVeiculoById(veiculoId, usuarioId))) {
    return erro("Veículo não encontrado", 404);
  }

  //Regra do km: 422 = o pedido esta bem formado, mas viola uma regra de negocio
  const problemaKm = await validarKm(veiculoId, resto.data, resto.km);
  if (problemaKm) return erro(problemaKm, 422);

  const id = await insertManutencao(veiculoId, paraDados(resto));
  return NextResponse.json(await findManutencaoById(id, usuarioId), { status: 201 });
}