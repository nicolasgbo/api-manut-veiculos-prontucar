import { z } from "zod";
import { dataValida } from "@/lib/validators/manutencao";

//Filtros aceitos na URL: ?veiculoId=&dataDe=&dataAte=
export const filtroRelatorioSchema = z
  .object({
    veiculoId: z.coerce.number().int("veiculoId inválido").positive("veiculoId inválido").optional(),
    dataDe: dataValida.optional(),
    dataAte: dataValida.optional(),
  })
  .refine((f) => !f.dataDe || !f.dataAte || f.dataDe <= f.dataAte, {
    message: "dataDe não pode ser maior que dataAte",
    path: ["dataDe"],
  });

//Revisoes pendentes nao usam periodo, so o veiculo
export const filtroPendentesSchema = z.object({
  veiculoId: z.coerce.number().int("veiculoId inválido").positive("veiculoId inválido").optional(),
});