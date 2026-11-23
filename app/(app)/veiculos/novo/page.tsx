import type { Metadata } from "next";
import Link from "next/link";
import { criarVeiculoAction } from "@/app/actions/veiculos";
import { VeiculoForm } from "@/components/veiculos/VeiculoForm";

export const metadata: Metadata = {
  title: "Novo veículo",
};

export default function NovoVeiculoPage() {
  return (
    <>
      <header className="page-hero">
        <p className="breadcrumb">
          <Link href="/veiculos">Veículos</Link> / Novo
        </p>
        <h1>Cadastrar veículo</h1>
        <p>Informe placa, marca, modelo, ano e quilometragem atual.</p>
      </header>

      <section className="panel panel-form">
        <VeiculoForm
          action={criarVeiculoAction}
          submitLabel="Cadastrar veículo"
          cancelHref="/veiculos"
        />
      </section>
    </>
  );
}
