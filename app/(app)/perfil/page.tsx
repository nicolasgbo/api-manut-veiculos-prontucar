import type { Metadata } from "next";
import { apiFetch } from "@/lib/api-client";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import type { UsuarioMe } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Perfil",
};

export default async function PerfilPage() {
  const usuario = await apiFetch<UsuarioMe>("/api/usuarios/me");

  return (
    <>
      <header className="page-hero">
        <h1>Meu perfil</h1>
        <p>
          Atualize nome, e-mail e, se quiser, a senha da conta. A senha atual
          nunca é exibida.
        </p>
      </header>

      <section className="panel panel-form">
        <h2>Dados da conta</h2>
        <PerfilForm usuario={usuario} />
      </section>
    </>
  );
}
