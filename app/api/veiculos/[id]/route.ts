import { NextResponse } from "next/server";
import {
  findVeiculoById,
  findVeiculoByPlaca,
  updateVeiculo,
  deleteVeiculo,
  countManutencoesDoVeiculo,
} from "@/repositories/veiculoRepository";
import { erro, erroValidacao, parseId } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { veiculoSchema } from "@/lib/validators/veiculo";

//No Nextjs atual, "params" chega como uma Promise e precisa de await
type Contexto = { params: Promise<{ id: string }> };

//GET /api/veiculos/5 -> detalhes de um veiculo especifico
export async function GET(request: Request, { params }: Contexto) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const id = parseId((await params).id);
  if (!id) return erro("Id inválido", 400);

  const veiculo = await findVeiculoById(id, usuarioId);
  if (!veiculo) return erro("Veículo não encontrado", 404);

  return NextResponse.json(veiculo);
}

//PUT /api/veiculos/5 -> editar um veiculo
export async function PUT(request: Request, { params }: Contexto) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const id = parseId((await params).id);
  if (!id) return erro("Id inválido", 400);

  const corpo = await request.json().catch(() => null);
  const parsed = veiculoSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error);

  //Se o veiculo nao existe ou e de outro usuario, responde 404
  if (!(await findVeiculoById(id, usuarioId))) {
    return erro("Veículo não encontrado", 404);
  }

  const { placa, marca, modelo, ano, kmAtual } = parsed.data;

  //A nova placa nao pode ser de OUTRO veiculo do mesmo usuario
  const mesmaPlaca = await findVeiculoByPlaca(usuarioId, placa);
  if (mesmaPlaca && mesmaPlaca.id !== id) {
    return erro("Placa já cadastrada", 409);
  }

  await updateVeiculo(id, usuarioId, placa, marca, modelo, ano, kmAtual);
  return NextResponse.json(await findVeiculoById(id, usuarioId));
}

//DELETE /api/veiculos/5 -> exclui um veiculo se nao tiver manutencoes
export async function DELETE(request: Request, { params }: Contexto) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const id = parseId((await params).id);
  if (!id) return erro("Id inválido", 400);

  if (!(await findVeiculoById(id, usuarioId))) {
    return erro("Veículo não encontrado", 404);
  }

  //Nao apaga veiculo com histrrico, evitando perder manutencoes
  if ((await countManutencoesDoVeiculo(id)) > 0) {
    return erro("Veículo possui manutenções e não pode ser excluído", 409);
  }

  await deleteVeiculo(id, usuarioId);
  return new NextResponse(null, { status: 204 }); //204: deu certo, sem corpo
}