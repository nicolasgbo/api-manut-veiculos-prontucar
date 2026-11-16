"use client";

import { useState, useTransition } from "react";
import { excluirManutencaoAction } from "@/app/actions/manutencoes";
import { Alert } from "@/components/ui/Alert";

type DeleteManutencaoButtonProps = {
  id: number;
  veiculoId: number;
  rotulo: string;
};

export function DeleteManutencaoButton({
  id,
  veiculoId,
  rotulo,
}: DeleteManutencaoButtonProps) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleClick() {
    const ok = window.confirm(
      `Excluir a manutenção "${rotulo}"?\n\nEsta ação não pode ser desfeita.`,
    );
    if (!ok) return;

    setErro(null);
    startTransition(async () => {
      const result = await excluirManutencaoAction(id, veiculoId);
      if (result && !result.ok) {
        setErro(result.mensagem ?? "Não foi possível excluir a manutenção.");
      }
    });
  }

  return (
    <div className="delete-block">
      {erro ? <Alert>{erro}</Alert> : null}
      <button
        type="button"
        className="btn btn-danger btn-inline"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Excluindo…
          </>
        ) : (
          "Excluir manutenção"
        )}
      </button>
    </div>
  );
}
