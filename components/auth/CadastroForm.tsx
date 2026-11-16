"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Alert } from "@/components/ui/Alert";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initial: AuthFormState = { ok: false };

export function CadastroForm() {
  const [state, formAction] = useActionState(registerAction, initial);

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
          aria-invalid={Boolean(state.campos?.nome)}
          aria-describedby={state.campos?.nome ? "nome-erro" : undefined}
          placeholder="Seu nome completo"
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
          autoComplete="new-password"
          required
          minLength={6}
          aria-invalid={Boolean(state.campos?.senha)}
          aria-describedby={state.campos?.senha ? "senha-erro" : undefined}
          placeholder="Mínimo de 6 caracteres"
        />
        {state.campos?.senha ? (
          <span id="senha-erro" className="field-error">
            {state.campos.senha}
          </span>
        ) : null}
      </div>

      <SubmitButton label="Criar conta" pendingLabel="Cadastrando…" />

      <p className="auth-footer">
        Já possui conta? <Link href="/login">Fazer login</Link>
      </p>
    </form>
  );
}
