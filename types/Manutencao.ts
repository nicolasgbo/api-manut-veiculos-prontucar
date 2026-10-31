//Os cinco tipos aceitos de manutencao, o mesmo ENUM da tabela no bd
export const TIPOS_MANUTENCAO = [
  "TROCA_OLEO",
  "FREIOS",
  "PNEUS",
  "REVISAO",
  "OUTROS",
] as const;

export type TipoManutencao = (typeof TIPOS_MANUTENCAO)[number];

//Manutencao como a API devolve, com o veiculo aninhado
export interface Manutencao {
  id: number;
  veiculoId: number;
  tipo: TipoManutencao;
  data: string; // "aaaa-mm-dd"
  km: number;
  custo: number;
  oficina: string | null;
  observacoes: string | null;
  proximaRevisaoKm: number | null;
  proximaRevisaoData: string | null;
  criadoEm: string;
  veiculo: { id: number; placa: string; marca: string; modelo: string };
}

//Dados que vao para o banco no INSERT e no UPDATE
export interface DadosManutencao {
  tipo: TipoManutencao;
  data: string;
  km: number;
  custo: number;
  oficina: string | null;
  observacoes: string | null;
  proximaRevisaoKm: number | null;
  proximaRevisaoData: string | null;
}