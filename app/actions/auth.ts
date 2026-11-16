"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { loginSchema, registroSchema } from "@/lib/validators/auth";
import { clearSessionToken, setSessionToken } from "@/lib/session";

export type AuthFormState = {
  ok: boolean;
  mensagem?: string;
  campos?: Record<string, string>;
};

function camposDoZod(
  detalhes?: { campo: string; mensagem: string }[],
): Record<string, string> | undefined {
  if (!detalhes?.length) return undefined;
  const campos: Record<string, string> = {};
  for (const d of detalhes) {
    if (d.campo && !campos[d.campo]) campos[d.campo] = d.mensagem;
  }
  return campos;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const bruto = {
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  };

  const parsed = loginSchema.safeParse(bruto);
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
    const data = await apiFetch<{
      token: string;
      usuario: { id: number; nome: string; email: string };
    }>("/api/auth/login", {
      method: "POST",
      body: parsed.data,
      autenticado: false,
    });

    await setSessionToken(data.token);
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        ok: false,
        mensagem: e.message,
        campos: camposDoZod(e.detalhes),
      };
    }
    return { ok: false, mensagem: "Falha de conexão. Tente novamente." };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const bruto = {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  };

  const parsed = registroSchema.safeParse(bruto);
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
    await apiFetch("/api/auth/register", {
      method: "POST",
      body: parsed.data,
      autenticado: false,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        ok: false,
        mensagem: e.message,
        campos: camposDoZod(e.detalhes),
      };
    }
    return { ok: false, mensagem: "Falha de conexão. Tente novamente." };
  }

  // Após cadastro, autentica automaticamente com as mesmas credenciais.
  try {
    const data = await apiFetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: { email: parsed.data.email, senha: parsed.data.senha },
      autenticado: false,
    });
    await setSessionToken(data.token);
  } catch {
    return {
      ok: true,
      mensagem: "Conta criada. Faça login para continuar.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionToken();
  redirect("/login");
}
