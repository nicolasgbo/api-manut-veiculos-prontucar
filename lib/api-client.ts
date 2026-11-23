import { getSessionToken } from "@/lib/session";

export type ApiErroDetalhe = { campo: string; mensagem: string };

export type ApiErroBody = {
  erro?: string;
  detalhes?: ApiErroDetalhe[];
};

export class ApiError extends Error {
  status: number;
  detalhes?: ApiErroDetalhe[];

  constructor(status: number, message: string, detalhes?: ApiErroDetalhe[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalhes = detalhes;
  }
}

function baseUrl(): string {
  // Em Server Components/Actions, fetch relativo precisa de URL absoluta.
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Se false, não envia o Authorization (login/register). */
  autenticado?: boolean;
};

/**
 * Cliente HTTP server-side para as rotas REST existentes em /api.
 * Anexa o JWT do cookie HttpOnly como Bearer — o token não fica no localStorage.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, autenticado = true, headers: extraHeaders, ...rest } = options;
  const headers = new Headers(extraHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (autenticado) {
    const token = await getSessionToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl()}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as
    | (T & ApiErroBody)
    | null;

  if (!response.ok) {
    const mensagem =
      data && typeof data === "object" && "erro" in data && data.erro
        ? data.erro
        : "Não foi possível concluir a operação.";
    throw new ApiError(
      response.status,
      mensagem,
      data && typeof data === "object" ? data.detalhes : undefined,
    );
  }

  return data as T;
}
