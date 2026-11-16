"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FormState } from "@/lib/form-state";
import type { VeiculoResumo } from "@/lib/types-ui";

type VeiculoFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Partial<VeiculoResumo>;
  submitLabel: string;
  cancelHref: string;
};

export function VeiculoForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: VeiculoFormProps) {
  const [state, formAction] = useActionState(action, { ok: false });

  return (
    <form action={formAction} className="form-stack" noValidate>
      {state.mensagem ? (
        <Alert variant={state.ok ? "success" : "error"}>{state.mensagem}</Alert>
      ) : null}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="placa">Placa</label>
          <input
            id="placa"
            name="placa"
            type="text"
            required
            defaultValue={initial?.placa ?? ""}
            placeholder="ABC1D23"
            autoCapitalize="characters"
            aria-invalid={Boolean(state.campos?.placa)}
            aria-describedby={state.campos?.placa ? "placa-erro" : undefined}
          />
          {state.campos?.placa ? (
            <span id="placa-erro" className="field-error">
              {state.campos.placa}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="ano">Ano</label>
          <input
            id="ano"
            name="ano"
            type="number"
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            defaultValue={initial?.ano ?? ""}
            aria-invalid={Boolean(state.campos?.ano)}
            aria-describedby={state.campos?.ano ? "ano-erro" : undefined}
          />
          {state.campos?.ano ? (
            <span id="ano-erro" className="field-error">
              {state.campos.ano}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="marca">Marca</label>
          <input
            id="marca"
            name="marca"
            type="text"
            required
            minLength={2}
            defaultValue={initial?.marca ?? ""}
            placeholder="Chevrolet"
            aria-invalid={Boolean(state.campos?.marca)}
            aria-describedby={state.campos?.marca ? "marca-erro" : undefined}
          />
          {state.campos?.marca ? (
            <span id="marca-erro" className="field-error">
              {state.campos.marca}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="modelo">Modelo</label>
          <input
            id="modelo"
            name="modelo"
            type="text"
            required
            defaultValue={initial?.modelo ?? ""}
            placeholder="Onix"
            aria-invalid={Boolean(state.campos?.modelo)}
            aria-describedby={state.campos?.modelo ? "modelo-erro" : undefined}
          />
          {state.campos?.modelo ? (
            <span id="modelo-erro" className="field-error">
              {state.campos.modelo}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="kmAtual">Quilometragem atual</label>
          <input
            id="kmAtual"
            name="kmAtual"
            type="number"
            min={0}
            step={1}
            defaultValue={initial?.kmAtual ?? 0}
            aria-invalid={Boolean(state.campos?.kmAtual)}
            aria-describedby={state.campos?.kmAtual ? "km-erro" : undefined}
          />
          {state.campos?.kmAtual ? (
            <span id="km-erro" className="field-error">
              {state.campos.kmAtual}
            </span>
          ) : null}
        </div>
      </div>

      <div className="form-actions">
        <SubmitButton label={submitLabel} pendingLabel="Salvando…" />
        <Link href={cancelHref} className="btn btn-ghost btn-inline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
