import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { UsuarioMe, VeiculoResumo } from "@/lib/types-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel",
};

type Manutencao = {
  id: number;
};

type RevisoesPendentes = {
  total: number;
};

export default async function DashboardPage() {
  const [usuario, veiculos, manutencoes, revisoes] = await Promise.all([
    apiFetch<UsuarioMe>("/api/usuarios/me"),
    apiFetch<VeiculoResumo[]>("/api/veiculos").catch(
      () => [] as VeiculoResumo[],
    ),
    apiFetch<Manutencao[]>("/api/manutencoes").catch(() => [] as Manutencao[]),
    apiFetch<RevisoesPendentes>("/api/relatorios/revisoes-pendentes").catch(
      () => ({ total: 0 }),
    ),
  ]);

  const primeiroNome = usuario.nome.trim().split(/\s+/)[0] || usuario.nome;

  return (
    <>
      <header className="page-hero">
        <h1>Olá, {primeiroNome}</h1>
        <p>
          Bem-vindo ao painel do ProntuCar. Gerencie perfil, frota, manutenções
          e consulte os relatórios da oficina.
        </p>
      </header>

      <section className="dashboard-grid" aria-label="Resumo">
        <article className="stat-card">
          <div className="label">Veículos</div>
          <div className="value">{veiculos.length}</div>
        </article>
        <article className="stat-card">
          <div className="label">Manutenções</div>
          <div className="value">{manutencoes.length}</div>
        </article>
        <article className="stat-card">
          <div className="label">Revisões pendentes</div>
          <div className="value">{revisoes.total}</div>
        </article>
      </section>

      <section className="panel">
        <h2>Atalhos</h2>
        <p>Acesse os módulos do ProntuCar.</p>
        <div className="shortcut-list shortcut-list-4">
          <Link className="shortcut" href="/veiculos">
            <strong>Veículos</strong>
            <span>Cadastro, busca, edição e exclusão da frota.</span>
          </Link>
          <Link className="shortcut" href="/manutencoes">
            <strong>Manutenções</strong>
            <span>Histórico por veículo, com filtros e custos.</span>
          </Link>
          <Link className="shortcut" href="/relatorios">
            <strong>Relatórios</strong>
            <span>Gastos, tipos, custo/km e revisões pendentes.</span>
          </Link>
          <Link className="shortcut" href="/perfil">
            <strong>Perfil</strong>
            <span>Atualize nome, e-mail e senha da conta.</span>
          </Link>
        </div>
      </section>
    </>
  );
}
