import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

/**
 * Route Handler (não Server Component): único lugar seguro para apagar o cookie
 * quando a sessão JWT está inválida/expirada e a UI precisa redirecionar ao login.
 * Não faz parte da API REST de negócio — só suporte ao frontend.
 */
export async function GET(request: Request) {
  const login = new URL("/login", request.url);
  const response = NextResponse.redirect(login);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
