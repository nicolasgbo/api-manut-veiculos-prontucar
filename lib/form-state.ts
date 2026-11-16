export type FormState = {
  ok: true | false;
  mensagem?: string;
  campos?: Record<string, string>;
};

export const formStateInicial: FormState = { ok: false };

export function camposDoZod(
  detalhes?: { campo: string; mensagem: string }[],
): Record<string, string> | undefined {
  if (!detalhes?.length) return undefined;
  const campos: Record<string, string> = {};
  for (const d of detalhes) {
    if (d.campo && !campos[d.campo]) campos[d.campo] = d.mensagem;
  }
  return Object.keys(campos).length ? campos : undefined;
}
