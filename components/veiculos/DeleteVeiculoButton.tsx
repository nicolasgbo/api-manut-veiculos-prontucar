"use client";

import { useState, useTransition } from "react";
import { excluirVeiculoAction } from "@/app/actions/veiculos";
import { Alert } from "@/components/ui/Alert";

type DeleteVeiculoButtonProps = {
  id: number;
  placa: string;
};

export function DeleteVeiculoButton({ id, placa }: DeleteVeiculoButtonProps) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleClick() {
    const ok = window.confirm(
      `Excluir o veículo de placa ${placa}?\n\nEsta ação não pode ser desfeita.`,
    );
    if (!ok) return;

    setErro(null);
    startTransition(async () => {
      const result = await excluirVeiculoAction(id);
      if (result && !result.ok) {
        setErro(result.mensagem ?? "Não foi possível excluir o veículo.");
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
          "Excluir veículo"
        )}
      </button>
    </div>
  );
}
