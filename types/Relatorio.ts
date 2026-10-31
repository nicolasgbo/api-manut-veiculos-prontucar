//Uma linha do relatario por veiculo usada em gastos e em custo por km
export interface ResumoVeiculo {
  veiculoId: number;
  placa: string;
  marca: string;
  modelo: string;
  quantidade: number; //quantas manutencoes no periodo
  totalGasto: number; //soma dos custos no periodo
  kmMin: number | null; //menor km lancado no periodo, null se nao houver manutencao
  kmMax: number | null; //maior km lancado no periodo
}

//Uma linha do relatorio por tipo
export interface ResumoTipo {
  tipo: string;
  quantidade: number;
  totalGasto: number;
}

//Ultima manutencao de cada tipo por veiculo que tem proxima revisao definida
export interface UltimaRevisao {
  manutencaoId: number;
  veiculoId: number;
  placa: string;
  marca: string;
  modelo: string;
  kmAtual: number;
  tipo: string;
  data: string;
  proximaRevisaoKm: number | null;
  proximaRevisaoData: string | null;
}