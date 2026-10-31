import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUsuarioByEmail } from "@/repositories/usuarioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { gerarToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  //Le e valida o corpo, email e senha preenchidos
  const corpo = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error);

  const { email, senha } = parsed.data;

  //Procura o usuario pelo email
  const usuario = await findUsuarioByEmail(email);

  //Compara a senha digitada com o hash guardado no banco
  const senhaCorreta = usuario
    ? await bcrypt.compare(senha, usuario.senhaHash)
    : false;

  //Mesma mensagem para e-mail inexistente e senha errada,
  if (!usuario || !senhaCorreta) {
    return erro("E-mail ou senha inválidos", 401);
  }

  //Tudo certo, devolve o token e os dados basicos
  return NextResponse.json({
    token: gerarToken(usuario.id),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
}