import { NextResponse } from "next/server";
import {
  findManutencaoById,
  updateManutencao,
  deleteManutencao,
} from "@/repositories/manutencaoRepository";
import { erro, erroValidacao, parseId } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { validarKm, paraDados } from "@/lib/regrasManutencao";
import { manutencaoSchema } from "@/lib/validators/manutencao";

type Contexto = { params: Promise<{ id: string }> };

//GET /api/manutencoes/5
export async function GET(request: Request, { params }: Contexto) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const id = parseId((await params).id);
  if (!id) return erro("Id inválido", 400);

  const manutencao = await findManutencaoById(id, usuarioId);
  if (!manutencao) return erro("Manutenção não encontrada", 404);

  return NextResponse.json(manutencao);
}

//PUT /api/manutencoes/5 -> edita, o veiculo da manutencao nao muda
export async function PUT(request: Request, { params }: Contexto) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const id = parseId((await params).id);
  if (!id) return erro("Id inválido", 400);

  const corpo = await request.json().catch(() => null);
  const parsed = manutencaoSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error);

  //So edita se a manutencao existir e for do usuario
  const existente = await findManutencaoById(id, usuarioId);
  if (!existente) return erro("Manutenção não encontrada", 404);

  //Regra do km, ignorando a propria manutencao na comparacao
  const problemaKm = await validarKm(
    existente.veiculoId,
    parsed.data.data,
    parsed.data.km,
    id
  );
  if (problemaKm) return erro(problemaKm, 422);

  await updateManutencao(id, existente.veiculoId, paraDados(parsed.data));
  return NextResponse.json(await findManutencaoById(id, usuarioId));
}

//DELETE /api/manutencoes/5
export async function DELETE(request: Request, { params }: Contexto) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const id = parseId((await params).id);
  if (!id) return erro("Id inválido", 400);

  if (!(await findManutencaoById(id, usuarioId))) {
    return erro("Manutenção não encontrada", 404);
  }

  await deleteManutencao(id);
  return new NextResponse(null, { status: 204 });
}