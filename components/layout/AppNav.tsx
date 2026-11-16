"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Início" },
  { href: "/veiculos", label: "Veículos" },
  { href: "/manutencoes", label: "Manutenções" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/perfil", label: "Perfil" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Principal">
      {LINKS.map((link) => {
        const ativo =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={ativo ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
