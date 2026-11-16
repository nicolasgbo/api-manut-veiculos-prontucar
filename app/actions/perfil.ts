"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api-client";
import { type FormState, camposDoZod } from "@/lib/form-state";
import { atualizarUsuarioSchema } from "@/lib/validators/auth";
import type { UsuarioMe } from "@/lib/types-ui";

export async function atualizarPerfilAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const senhaRaw = String(formData.get("senha") ?? "");
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    ...(senhaRaw ? { senha: senhaRaw } : {}),
  };

  const parsed = atualizarUsuarioSchema.safeParse(bruto);
  if (!parsed.success) {
    return {
      ok: false,
      mensagem: "Verifique os campos destacados.",
      campos: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  try {
    await apiFetch<UsuarioMe>("/api/usuarios/me", {
      method: "PUT",
      body: parsed.data,
    });
  } catch (e) {
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

  revalidatePath("/perfil");
  revalidatePath("/dashboard");

  return { ok: true, mensagem: "Perfil atualizado com sucesso." };
}
