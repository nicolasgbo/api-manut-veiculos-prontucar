"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api-client";
import { type FormState, camposDoZod } from "@/lib/form-state";
import {
  criarManutencaoSchema,
  manutencaoSchema,
} from "@/lib/validators/manutencao";
import type { ManutencaoResumo } from "@/lib/types-ui";
import type { z } from "zod";

type CriarPayload = z.infer<typeof criarManutencaoSchema>;
type EditarPayload = z.infer<typeof manutencaoSchema>;

function textoOpcional(valor: FormDataEntryValue | null): string | undefined {
  const s = String(valor ?? "").trim();
  return s === "" ? undefined : s;
}

function numeroObrigatorio(valor: FormDataEntryValue | null): number {
  const s = String(valor ?? "").trim();
  return s === "" ? Number.NaN : Number(s);
}

function numeroOpcional(valor: FormDataEntryValue | null): number | undefined {
  const s = String(valor ?? "").trim();
  return s === "" ? undefined : Number(s);
}

function brutoCriar(formData: FormData) {
  return {
    veiculoId: numeroObrigatorio(formData.get("veiculoId")),
    tipo: String(formData.get("tipo") ?? ""),
    data: String(formData.get("data") ?? "").trim(),
    km: numeroObrigatorio(formData.get("km")),
    custo: numeroObrigatorio(formData.get("custo")),
    oficina: textoOpcional(formData.get("oficina")),
    observacoes: textoOpcional(formData.get("observacoes")),
    proximaRevisaoKm: numeroOpcional(formData.get("proximaRevisaoKm")),
    proximaRevisaoData: textoOpcional(formData.get("proximaRevisaoData")),
  };
}

function brutoEditar(formData: FormData) {
  const bruto = brutoCriar(formData);
  return {
    tipo: bruto.tipo,
    data: bruto.data,
    km: bruto.km,
    custo: bruto.custo,
    oficina: bruto.oficina,
    observacoes: bruto.observacoes,
    proximaRevisaoKm: bruto.proximaRevisaoKm,
    proximaRevisaoData: bruto.proximaRevisaoData,
  };
}

function falhaZod(issues: { path: PropertyKey[]; message: string }[]): FormState {
  return {
    ok: false,
    mensagem: "Verifique os campos destacados.",
    campos: Object.fromEntries(
      issues.map((i) => [i.path.map(String).join("."), i.message]),
    ),
  };
}

function parseCriar(
  formData: FormData,
):
  | { sucesso: true; data: CriarPayload }
  | { sucesso: false; state: FormState } {
  const parsed = criarManutencaoSchema.safeParse(brutoCriar(formData));
  if (!parsed.success) {
    return { sucesso: false, state: falhaZod(parsed.error.issues) };
  }
  return { sucesso: true, data: parsed.data };
}

function parseEditar(
  formData: FormData,
):
  | { sucesso: true; data: EditarPayload }
  | { sucesso: false; state: FormState } {
  const parsed = manutencaoSchema.safeParse(brutoEditar(formData));
  if (!parsed.success) {
    return { sucesso: false, state: falhaZod(parsed.error.issues) };
  }
  return { sucesso: true, data: parsed.data };
}

function mensagemApi(e: unknown): FormState {
  if (e instanceof ApiError && e.status === 401) {
    redirect("/auth/limpar-sessao");
  }
  if (e instanceof ApiError) {
    return {
      ok: false,
      mensagem: e.message,
      campos: camposDoZod(e.detalhes),
    };
  }
  return { ok: false, mensagem: "Falha de conexão. Tente novamente." };
}

function revalidarManutencoes(veiculoId?: number) {
  revalidatePath("/manutencoes");
  revalidatePath("/dashboard");
  revalidatePath("/veiculos");
  if (veiculoId) {
    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath(`/veiculos/${veiculoId}/editar`);
  }
}

export async function criarManutencaoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const resultado = parseCriar(formData);
  if (!resultado.sucesso) return resultado.state;

  let criada: ManutencaoResumo;
  try {
    criada = await apiFetch<ManutencaoResumo>("/api/manutencoes", {
      method: "POST",
      body: resultado.data,
    });
  } catch (e) {
    return mensagemApi(e);
  }

  revalidarManutencoes(resultado.data.veiculoId);
  redirect(`/manutencoes/${criada.id}?sucesso=cadastrado`);
}

export async function atualizarManutencaoAction(
  id: number,
  veiculoId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const resultado = parseEditar(formData);
  if (!resultado.sucesso) return resultado.state;

  try {
    await apiFetch<ManutencaoResumo>(`/api/manutencoes/${id}`, {
      method: "PUT",
      body: resultado.data,
    });
  } catch (e) {
    return mensagemApi(e);
  }

  revalidarManutencoes(veiculoId);
  revalidatePath(`/manutencoes/${id}`);
  revalidatePath(`/manutencoes/${id}/editar`);
  redirect(`/manutencoes/${id}?sucesso=atualizado`);
}

export async function excluirManutencaoAction(
  id: number,
  veiculoId: number,
): Promise<FormState> {
  try {
    await apiFetch<void>(`/api/manutencoes/${id}`, { method: "DELETE" });
  } catch (e) {
    return mensagemApi(e);
  }

  revalidarManutencoes(veiculoId);
  redirect("/manutencoes?sucesso=excluido");
}
