import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUsuarioByEmail, insertUsuario } from "@/repositories/usuarioRepository";
import { erro, erroValidacao } from "@/lib/http";
import { registroSchema } from "@/lib/validators/auth";

//POST /api/auth/register
export async function POST(request: Request) {
  //Le o JSON do corpo. Se vier vazio ou malformado, o catch devolve null em vez de estourar um erro.
  const corpo = await request.json().catch(() => null);

  //Valida o corpo com o Zod. safeParse não lança exceção: devolve success: false, error ou success: true, data
  const parsed = registroSchema.safeParse(corpo);
  if (!parsed.success) return erroValidacao(parsed.error); // 400

  //Ja validados e normalizados
  const { nome, email, senha } = parsed.data;

  //Nao permite dois usuarios com o mesmo email
  if (await findUsuarioByEmail(email)) {
    return erro("E-mail já cadastrado", 409); //409 = conflito
  }

  //Gera o hash da senha. O 10 e o custo: quanto maior, mais lento e mais dificil de quebrar. So o hash vai para o banco.
  const senhaHash = await bcrypt.hash(senha, 10);
  const id = await insertUsuario(nome, email, senhaHash);

  //Responde 201(criado), devolve so o id, nome e email
  return NextResponse.json({ id, nome, email }, { status: 201 });
}
