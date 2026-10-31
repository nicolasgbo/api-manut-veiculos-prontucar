import { NextResponse } from "next/server";
import type { ZodError } from "zod";

//Resposta de erro padronizada sempre erro, detalhes? com o status HTTP informado.
export function erro(mensagem: string, status: number, detalhes?: unknown) {
  return NextResponse.json({ erro: mensagem, detalhes }, { status });
}

//Converte o erro do Zod em uma lista entendivel
export function erroValidacao(e: ZodError) {
  const detalhes = e.issues.map((i) => ({
    campo: i.path.join("."),
    mensagem: i.message,
  }));
  return erro("Dados inválidos", 400, detalhes);
}

// Converte o id que vem na URL(texto) em numero.
export function parseId(valor: string): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}