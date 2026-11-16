import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

const PUBLIC_PATHS = new Set(["/login", "/cadastro"]);

/**
 * Proteção otimista de rotas da interface.
 * A autorização real continua nas rotas /api (Bearer JWT).
 * Rotas /api não são redirecionadas — respondem 401 normalmente.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const autenticado = Boolean(token);

  if (PUBLIC_PATHS.has(pathname)) {
    if (autenticado) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/veiculos") ||
    pathname.startsWith("/manutencoes") ||
    pathname.startsWith("/relatorios")
  ) {
    if (!autenticado) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/cadastro",
    "/dashboard/:path*",
    "/perfil/:path*",
    "/veiculos/:path*",
    "/manutencoes/:path*",
    "/relatorios/:path*",
  ],
};
