"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FormState } from "@/lib/form-state";
import {
  OPCOES_TIPO_MANUTENCAO,
  hojeIso,
} from "@/lib/manutencao-labels";
import type { ManutencaoResumo, VeiculoResumo } from "@/lib/types-ui";

type ManutencaoFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  veiculos: VeiculoResumo[];
  initial?: Partial<ManutencaoResumo>;
  /** Se true, o veículo não pode ser alterado (edição). */
  veiculoFixo?: boolean;
  submitLabel: string;
  cancelHref: string;
};

export function ManutencaoForm({
  action,
  veiculos,
  initial,
  veiculoFixo = false,
  submitLabel,
  cancelHref,
}: ManutencaoFormProps) {
  const [state, formAction] = useActionState(action, { ok: false });
  const maxData = hojeIso();
  const veiculoSelecionado =
    initial?.veiculoId ??
    (veiculos.length === 1 ? veiculos[0].id : undefined);

  return (
    <form action={formAction} className="form-stack" noValidate>
      {state.mensagem ? (
        <Alert variant={state.ok ? "success" : "error"}>{state.mensagem}</Alert>
      ) : null}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="veiculoId">Veículo</label>
          {veiculoFixo && initial?.veiculo ? (
            <>
              <input
                type="hidden"
                name="veiculoId"
                value={initial.veiculoId ?? ""}
              />
              <input
                id="veiculoId"
                type="text"
                readOnly
                value={`${initial.veiculo.placa} — ${initial.veiculo.marca} ${initial.veiculo.modelo}`}
                aria-describedby="veiculo-ajuda"
              />
              <span id="veiculo-ajuda" className="field-hint">
                O veículo vinculado não pode ser alterado na edição.
              </span>
            </>
          ) : (
            <>
              <select
                id="veiculoId"
                name="veiculoId"
                required
                defaultValue={veiculoSelecionado ?? ""}
                aria-invalid={Boolean(state.campos?.veiculoId)}
                aria-describedby={
                  state.campos?.veiculoId ? "veiculo-erro" : undefined
                }
              >
                <option value="" disabled>
                  Selecione um veículo
                </option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marca} {v.modelo} ({v.kmAtual} km)
                  </option>
                ))}
              </select>
              {state.campos?.veiculoId ? (
                <span id="veiculo-erro" className="field-error">
                  {state.campos.veiculoId}
                </span>
              ) : null}
            </>
          )}
        </div>

        <div className="field">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            required
            defaultValue={initial?.tipo ?? ""}
            aria-invalid={Boolean(state.campos?.tipo)}
            aria-describedby={state.campos?.tipo ? "tipo-erro" : undefined}
          >
            <option value="" disabled>
              Selecione o tipo
            </option>
            {OPCOES_TIPO_MANUTENCAO.map((op) => (
              <option key={op.valor} value={op.valor}>
                {op.rotulo}
              </option>
            ))}
          </select>
          {state.campos?.tipo ? (
            <span id="tipo-erro" className="field-error">
              {state.campos.tipo}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="data">Data</label>
          <input
            id="data"
            name="data"
            type="date"
            required
            max={maxData}
            defaultValue={initial?.data?.slice(0, 10) ?? ""}
            aria-invalid={Boolean(state.campos?.data)}
            aria-describedby={state.campos?.data ? "data-erro" : undefined}
          />
          {state.campos?.data ? (
            <span id="data-erro" className="field-error">
              {state.campos.data}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="km">Quilometragem</label>
          <input
            id="km"
            name="km"
            type="number"
            required
            min={0}
            step={1}
            defaultValue={initial?.km ?? ""}
            aria-invalid={Boolean(state.campos?.km)}
            aria-describedby={state.campos?.km ? "km-erro" : undefined}
          />
          {state.campos?.km ? (
            <span id="km-erro" className="field-error">
              {state.campos.km}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="custo">Custo (R$)</label>
          <input
            id="custo"
            name="custo"
            type="number"
            required
            min={0}
            step="0.01"
            defaultValue={initial?.custo ?? ""}
            aria-invalid={Boolean(state.campos?.custo)}
            aria-describedby={state.campos?.custo ? "custo-erro" : undefined}
          />
          {state.campos?.custo ? (
            <span id="custo-erro" className="field-error">
              {state.campos.custo}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="oficina">Oficina (opcional)</label>
          <input
            id="oficina"
            name="oficina"
            type="text"
            maxLength={100}
            defaultValue={initial?.oficina ?? ""}
            placeholder="Nome da oficina"
            aria-invalid={Boolean(state.campos?.oficina)}
            aria-describedby={
              state.campos?.oficina ? "oficina-erro" : undefined
            }
          />
          {state.campos?.oficina ? (
            <span id="oficina-erro" className="field-error">
              {state.campos.oficina}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="proximaRevisaoKm">Próxima revisão (km)</label>
          <input
            id="proximaRevisaoKm"
            name="proximaRevisaoKm"
            type="number"
            min={0}
            step={1}
            defaultValue={initial?.proximaRevisaoKm ?? ""}
            placeholder="Opcional"
            aria-invalid={Boolean(state.campos?.proximaRevisaoKm)}
            aria-describedby={
              state.campos?.proximaRevisaoKm ? "prox-km-erro" : undefined
            }
          />
          {state.campos?.proximaRevisaoKm ? (
            <span id="prox-km-erro" className="field-error">
              {state.campos.proximaRevisaoKm}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="proximaRevisaoData">Próxima revisão (data)</label>
          <input
            id="proximaRevisaoData"
            name="proximaRevisaoData"
            type="date"
            defaultValue={initial?.proximaRevisaoData?.slice(0, 10) ?? ""}
            aria-invalid={Boolean(state.campos?.proximaRevisaoData)}
            aria-describedby={
              state.campos?.proximaRevisaoData ? "prox-data-erro" : undefined
            }
          />
          {state.campos?.proximaRevisaoData ? (
            <span id="prox-data-erro" className="field-error">
              {state.campos.proximaRevisaoData}
            </span>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="observacoes">Observações (opcional)</label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          maxLength={1000}
          defaultValue={initial?.observacoes ?? ""}
          placeholder="Detalhes do serviço, peças trocadas, etc."
          aria-invalid={Boolean(state.campos?.observacoes)}
          aria-describedby={
            state.campos?.observacoes ? "obs-erro" : undefined
          }
        />
        {state.campos?.observacoes ? (
          <span id="obs-erro" className="field-error">
            {state.campos.observacoes}
          </span>
        ) : null}
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
