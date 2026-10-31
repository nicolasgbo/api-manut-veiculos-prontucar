import { z } from "zod";
import { TIPOS_MANUTENCAO } from "@/types/Manutencao";

const tipo = z.enum(TIPOS_MANUTENCAO, "Tipo inválido");

//Data no formato aaaa-mm-dd e que existe
export const dataValida = z
  .string("Informe a data")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato aaaa-mm-dd")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Data inexistente");

//A manutencao ja aconteceu, entao a data nao pode ser futura
const hoje = () => new Date().toISOString().slice(0, 10);
const data = dataValida.refine((v) => v <= hoje(), "A data não pode ser futura");

const km = z
  .number("O km deve ser um número")
  .int("O km deve ser inteiro")
  .min(0, "O km não pode ser negativo");

const custo = z
  .number("O custo deve ser um número")
  .min(0, "O custo não pode ser negativo")
  .max(99999999.99, "Custo muito alto");

const oficina = z.string().trim().max(100, "A oficina deve ter no máximo 100 caracteres").optional();
const observacoes = z.string().trim().max(1000, "Observações muito longas").optional();
const proximaRevisaoKm = z.number("Km inválido").int().min(0, "Km inválido").optional();
const proximaRevisaoData = dataValida.optional();

//Campos comuns a criacao e edicao
const campos = {
  tipo,
  data,
  km,
  custo,
  oficina,
  observacoes,
  proximaRevisaoKm,
  proximaRevisaoData,
};

//A proxima revisao nao pode ser antes da manutencao que acabou de acontecer
const revisaoKmOk = (d: { km: number; proximaRevisaoKm?: number }) =>
  d.proximaRevisaoKm === undefined || d.proximaRevisaoKm >= d.km;
const avisoKm = {
  message: "A próxima revisão (km) deve ser maior ou igual ao km da manutenção",
  path: ["proximaRevisaoKm"],
};

const revisaoDataOk = (d: { data: string; proximaRevisaoData?: string }) =>
  d.proximaRevisaoData === undefined || d.proximaRevisaoData >= d.data;
const avisoData = {
  message: "A próxima revisão (data) deve ser igual ou posterior à data da manutenção",
  path: ["proximaRevisaoData"],
};

//POST: precisa informar de qual veiculo e a manutencao
export const criarManutencaoSchema = z
  .object({
    veiculoId: z.number("Informe o veículo").int().positive("Veículo inválido"),
    ...campos,
  })
  .refine(revisaoKmOk, avisoKm)
  .refine(revisaoDataOk, avisoData);

//PUT: o veiculo nao muda a manutencao continua sendo do mesmo veiculo
export const manutencaoSchema = z
  .object(campos)
  .refine(revisaoKmOk, avisoKm)
  .refine(revisaoDataOk, avisoData);

//Filtros aceitos na URL: ?veiculoId=&tipo=&dataDe=&dataAte=&busca=
export const filtroManutencaoSchema = z.object({
  veiculoId: z.coerce.number().int("veiculoId inválido").positive("veiculoId inválido").optional(),
  tipo: tipo.optional(),
  dataDe: dataValida.optional(),
  dataAte: dataValida.optional(),
  busca: z.string().trim().optional(),
});