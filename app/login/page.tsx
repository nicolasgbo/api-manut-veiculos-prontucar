import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthBrandPanel } from "@/components/layout/AuthBrandPanel";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <AuthBrandPanel
        title="Controle completo da oficina na palma da mão."
        description="Acompanhe veículos, manutenções e gastos em um só lugar — simples, seguro e feito para o dia a dia."
      />
      <section className="auth-panel">
        <div className="auth-card">
          <h2>Entrar</h2>
          <p className="lead">Acesse sua conta para gerenciar a frota.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
