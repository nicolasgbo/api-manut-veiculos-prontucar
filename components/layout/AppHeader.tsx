import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { AppNav } from "@/components/layout/AppNav";

type AppHeaderProps = {
  nome: string;
  email: string;
};

export function AppHeader({ nome, email }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/dashboard" className="brand-mark">
          <span aria-hidden="true">PC</span>
          ProntuCar
        </Link>

        <div className="app-header-actions">
          <AppNav />
          <span className="user-chip" title={email}>
            <b>{nome}</b>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn btn-ghost btn-compact"
              style={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.25)",
              }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
