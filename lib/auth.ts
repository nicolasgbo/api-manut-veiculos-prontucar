import jwt from "jsonwebtoken";

//Cria o token do usuario. O id do usuario vai dentro do token.
export function gerarToken(usuarioId: number): string {
  return jwt.sign({}, process.env.JWT_SECRET!, {
    subject: String(usuarioId), //guarda o id no campo sub do token
    expiresIn: 7200,            //validade em segundos(2 horas)
  });
}

//Le o token do cabecalho, devolve o id do usuario, ou null se nao houver token valido.
export function getUsuarioId(request: Request): number | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  try {
    //verify confere a assinatura com o JWT_SECRET e a validade
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!);
    if (typeof payload === "string" || !payload.sub) return null;
    return Number(payload.sub);
  } catch {
    return null; //token adulterado, invalido ou expirado
  }
}