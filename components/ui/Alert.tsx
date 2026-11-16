type AlertProps = {
  variant?: "error" | "success";
  children: React.ReactNode;
};

export function Alert({ variant = "error", children }: AlertProps) {
  return (
    <div
      className={`alert alert-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
