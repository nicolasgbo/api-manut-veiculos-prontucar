import { z } from "zod"; //Zod valida os dados que chegam do corpo da requisicao.

//trim remove espacos nas pontas antes de checar o tamanho
const nome = z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres");

//toLowerCase padroniza o email, assim A@ e a@ sao o mesmo usuario
const email = z.string().trim().toLowerCase().email("E-mail inválido");

//Sem trim, espacos podem fazer parte da senha
const senha = z.string().min(6, "A senha deve ter pelo menos 6 caracteres");

//Corpo esperado em POST /api/auth/register
export const registroSchema = z.object({ nome, email, senha });

//Corpo esperado no login. A senha so precisa estar preenchida, quem confere se esta certa e o bcrypt
export const loginSchema = z.object({
  email,
  senha: z.string().min(1, "Informe a senha"),
});

//Corpo esperado em PUT /api/usuarios/me. A senha e opcional: so e trocada se vier preenchida
export const atualizarUsuarioSchema = z.object({
  nome,
  email,
  senha: senha.optional(),
});