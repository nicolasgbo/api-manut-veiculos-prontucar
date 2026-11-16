"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initial: AuthFormState = { ok: false };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="form-stack" noValidate>
      {state.mensagem ? <Alert>{state.mensagem}</Alert> : null}

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.campos?.email)}
          aria-describedby={state.campos?.email ? "email-erro" : undefined}
          placeholder="voce@email.com"
        />
        {state.campos?.email ? (
          <span id="email-erro" className="field-error">
            {state.campos.email}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          minLength={1}
          aria-invalid={Boolean(state.campos?.senha)}
          aria-describedby={state.campos?.senha ? "senha-erro" : undefined}
          placeholder="Sua senha"
        />
        {state.campos?.senha ? (
          <span id="senha-erro" className="field-error">
            {state.campos.senha}
          </span>
        ) : null}
      </div>

      <SubmitButton label="Entrar" pendingLabel="Entrando…" />

      <p className="auth-footer">
        Ainda não tem conta? <Link href="/cadastro">Criar cadastro</Link>
      </p>
    </form>
  );
}
