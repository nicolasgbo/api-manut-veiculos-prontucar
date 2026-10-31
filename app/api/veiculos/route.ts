import { NextResponse } from "next/server";
import {
  findVeiculosByUsuario,
  findVeiculoByPlaca,
  findVeiculoById,
  insertVeiculo,
} from "@/repositories/veiculoRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { veiculoSchema } from "@/lib/validators/veiculo";

//GET /api/veiculos?busca=onix  -> lista os veiculos do usuario logado
export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  //Le o parametro opcional ?busca= da URL
  const busca = new URL(request.url).searchParams.get("busca")?.trim();

  const veiculos = await findVeiculosByUsuario(usuarioId, busca || undefined);
  return NextResponse.json(veiculos);
}

//POST /api/veiculos -> cadastra um veiculo para o usuario logado
export async function POST(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const corpo = await request.json().catch(() => null);
  const parsed = veiculoSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error);

  const { placa, marca, modelo, ano, kmAtual } = parsed.data;

  //Mesma placa nao pode repetir para o mesmo usuario
  if (await findVeiculoByPlaca(usuarioId, placa)) {
    return erro("Placa já cadastrada", 409);
  }

  //O dono vem do token, nunca do corpo da requisicao
  const id = await insertVeiculo(usuarioId, placa, marca, modelo, ano, kmAtual);
  const veiculo = await findVeiculoById(id, usuarioId);

  return NextResponse.json(veiculo, { status: 201 });
}