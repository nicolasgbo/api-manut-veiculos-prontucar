type AuthBrandPanelProps = {
  title: string;
  description: string;
};

export function AuthBrandPanel({ title, description }: AuthBrandPanelProps) {
  return (
    <aside className="auth-brand">
      <div className="brand-mark">
        <span aria-hidden="true">PC</span>
        ProntuCar
      </div>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <p style={{ fontSize: "0.85rem", color: "rgba(248,250,252,0.55)" }}>
        IFPR — Projeto Integrador · Gestão de Websites
      </p>
    </aside>
  );
}
