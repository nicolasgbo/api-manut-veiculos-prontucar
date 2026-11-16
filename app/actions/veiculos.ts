"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api-client";
import { type FormState, camposDoZod } from "@/lib/form-state";
import { veiculoSchema } from "@/lib/validators/veiculo";
import type { VeiculoResumo } from "@/lib/types-ui";
import type { z } from "zod";

type VeiculoPayload = z.infer<typeof veiculoSchema>;

function brutoDoForm(formData: FormData) {
  const kmRaw = String(formData.get("kmAtual") ?? "").trim();
  const anoRaw = String(formData.get("ano") ?? "").trim();
  return {
    placa: String(formData.get("placa") ?? ""),
    marca: String(formData.get("marca") ?? ""),
    modelo: String(formData.get("modelo") ?? ""),
    ano: anoRaw === "" ? Number.NaN : Number(anoRaw),
    kmAtual: kmRaw === "" ? 0 : Number(kmRaw),
  };
}

function parseVeiculoForm(
  formData: FormData,
):
  | { sucesso: true; data: VeiculoPayload }
  | { sucesso: false; state: FormState } {
  const parsed = veiculoSchema.safeParse(brutoDoForm(formData));
  if (!parsed.success) {
    return {
      sucesso: false,
      state: {
        ok: false,
        mensagem: "Verifique os campos destacados.",
        campos: Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      },
    };
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

export async function criarVeiculoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const resultado = parseVeiculoForm(formData);
  if (!resultado.sucesso) return resultado.state;

  try {
    await apiFetch<VeiculoResumo>("/api/veiculos", {
      method: "POST",
      body: resultado.data,
    });
  } catch (e) {
    return mensagemApi(e);
  }

  revalidatePath("/veiculos");
  revalidatePath("/dashboard");
  redirect("/veiculos?sucesso=cadastrado");
}

export async function atualizarVeiculoAction(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const resultado = parseVeiculoForm(formData);
  if (!resultado.sucesso) return resultado.state;

  try {
    await apiFetch<VeiculoResumo>(`/api/veiculos/${id}`, {
      method: "PUT",
      body: resultado.data,
    });
  } catch (e) {
    return mensagemApi(e);
  }

  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${id}`);
  revalidatePath(`/veiculos/${id}/editar`);
  revalidatePath("/dashboard");
  redirect(`/veiculos/${id}?sucesso=atualizado`);
}

export async function excluirVeiculoAction(id: number): Promise<FormState> {
  try {
    await apiFetch<void>(`/api/veiculos/${id}`, { method: "DELETE" });
  } catch (e) {
    return mensagemApi(e);
  }

  revalidatePath("/veiculos");
  revalidatePath("/dashboard");
  redirect("/veiculos?sucesso=excluido");
}
