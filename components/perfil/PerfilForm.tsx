"use client";

import { useActionState } from "react";
import { atualizarPerfilAction } from "@/app/actions/perfil";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formStateInicial } from "@/lib/form-state";
import type { UsuarioMe } from "@/lib/types-ui";

type PerfilFormProps = {
  usuario: UsuarioMe;
};

export function PerfilForm({ usuario }: PerfilFormProps) {
  const [state, formAction] = useActionState(
    atualizarPerfilAction,
    formStateInicial,
  );

  return (
    <form action={formAction} className="form-stack" noValidate>
      {state.mensagem ? (
        <Alert variant={state.ok ? "success" : "error"}>{state.mensagem}</Alert>
      ) : null}

      <div className="field">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          defaultValue={usuario.nome}
          aria-invalid={Boolean(state.campos?.nome)}
          aria-describedby={state.campos?.nome ? "nome-erro" : undefined}
        />
        {state.campos?.nome ? (
          <span id="nome-erro" className="field-error">
            {state.campos.nome}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={usuario.email}
          aria-invalid={Boolean(state.campos?.email)}
          aria-describedby={state.campos?.email ? "email-erro" : undefined}
        />
        {state.campos?.email ? (
          <span id="email-erro" className="field-error">
            {state.campos.email}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="senha">Nova senha (opcional)</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          placeholder="Deixe em branco para manter a atual"
          aria-invalid={Boolean(state.campos?.senha)}
          aria-describedby={
            state.campos?.senha ? "senha-erro" : "senha-ajuda"
          }
        />
        {state.campos?.senha ? (
          <span id="senha-erro" className="field-error">
            {state.campos.senha}
          </span>
        ) : (
          <span id="senha-ajuda" className="field-hint">
            Mínimo de 6 caracteres. A senha atual nunca é exibida.
          </span>
        )}
      </div>

      <div className="form-actions">
        <SubmitButton label="Salvar alterações" pendingLabel="Salvando…" />
      </div>
    </form>
  );
}
