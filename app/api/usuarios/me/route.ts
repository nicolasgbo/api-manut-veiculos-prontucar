import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  findUsuarioById,
  findUsuarioByEmail,
  updateUsuario,
} from "@/repositories/usuarioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { getUsuarioId } from "@/lib/auth";
import { atualizarUsuarioSchema } from "@/lib/validators/auth";

//devolve os dados do usuario logado
export async function GET(request: Request) {
  //O id vem do token, nunca da requisicao. Ninguem ve dados de outro usuario
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const usuario = await findUsuarioById(usuarioId);
  if (!usuario) return erro("Usuário não encontrado", 404);

  return NextResponse.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  });
}

//Altera nome, email e opcionalmente a senha do usuario logado
export async function PUT(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) return erro("Não autenticado", 401);

  const corpo = await request.json().catch(() => null);
  const parsed = atualizarUsuarioSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error);

  const { nome, email, senha } = parsed.data;

  //O email novo nao pode pertencer a outra pessoa
  const existente = await findUsuarioByEmail(email);
  if (existente && existente.id !== usuarioId) {
    return erro("E-mail já cadastrado", 409);
  }

  //So gera um novo hash se uma nova senha foi enviada
  const senhaHash = senha ? await bcrypt.hash(senha, 10) : undefined;
  await updateUsuario(usuarioId, nome, email, senhaHash);

  return NextResponse.json({ id: usuarioId, nome, email });
}