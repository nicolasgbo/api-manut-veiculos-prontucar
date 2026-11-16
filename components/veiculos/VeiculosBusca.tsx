import Link from "next/link";

type VeiculosBuscaProps = {
  valorInicial?: string;
};

export function VeiculosBusca({ valorInicial = "" }: VeiculosBuscaProps) {
  return (
    <form className="search-bar" method="get" action="/veiculos" role="search">
      <div className="field search-field">
        <label htmlFor="busca" className="sr-only">
          Buscar veículos
        </label>
        <input
          id="busca"
          name="busca"
          type="search"
          placeholder="Buscar por placa, marca ou modelo"
          defaultValue={valorInicial}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-inline">
        Buscar
      </button>
      {valorInicial ? (
        <Link href="/veiculos" className="btn btn-ghost btn-inline">
          Limpar
        </Link>
      ) : null}
    </form>
  );
}
