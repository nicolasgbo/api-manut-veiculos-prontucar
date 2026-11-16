import Link from "next/link";
import {
  ABAS_RELATORIO,
  hrefRelatorio,
  type AbaRelatorioId,
  type FiltrosRelatorioUi,
} from "@/lib/relatorio-ui";

type RelatoriosTabsProps = {
  abaAtual: AbaRelatorioId;
  filtros: FiltrosRelatorioUi;
};

export function RelatoriosTabs({ abaAtual, filtros }: RelatoriosTabsProps) {
  return (
    <nav className="report-tabs" aria-label="Tipos de relatório">
      {ABAS_RELATORIO.map((aba) => {
        const ativo = aba.id === abaAtual;
        return (
          <Link
            key={aba.id}
            href={hrefRelatorio(aba.id, filtros)}
            className={ativo ? "report-tab is-active" : "report-tab"}
            aria-current={ativo ? "page" : undefined}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
