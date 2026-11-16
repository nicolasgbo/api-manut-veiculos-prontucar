import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api-client";
import { AppHeader } from "@/components/layout/AppHeader";
import type { UsuarioMe } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let usuario: UsuarioMe;

  try {
    usuario = await apiFetch<UsuarioMe>("/api/usuarios/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      // cookies() não pode ser alterado em Server Component — limpa via Route Handler
      redirect("/auth/limpar-sessao");
    }
    throw e;
  }

  return (
    <div className="app-shell">
      <AppHeader nome={usuario.nome} email={usuario.email} />
      <div className="app-main">{children}</div>
    </div>
  );
}
