import type { Metadata } from "next";
import { CadastroForm } from "@/components/auth/CadastroForm";
import { AuthBrandPanel } from "@/components/layout/AuthBrandPanel";

export const metadata: Metadata = {
  title: "Cadastro",
};

export default function CadastroPage() {
  return (
    <main className="auth-shell">
      <AuthBrandPanel
        title="Comece a organizar as manutenções agora."
        description="Cadastre-se em poucos minutos e tenha o histórico automotivo sempre à mão."
      />
      <section className="auth-panel">
        <div className="auth-card">
          <h2>Criar conta</h2>
          <p className="lead">
            Preencha os dados abaixo. A senha precisa ter no mínimo 6 caracteres.
          </p>
          <CadastroForm />
        </div>
      </section>
    </main>
  );
}
