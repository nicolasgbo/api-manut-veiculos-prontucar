// Layout raiz exigido pelo Next. Como o projeto é só API, não há interface.
export const metadata = {
  title: "ProntuCar API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
