import { z } from "zod";

//Placa: remove espacos e hifen, deixa maiuscula e confere o formato.
const placa = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace("-", ""))
  .pipe(z.string().regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, "Placa inválida"));

const marca = z.string().trim().min(2, "Informe a marca");
const modelo = z.string().trim().min(1, "Informe o modelo");

//Ano entre 1900 e o ano que vem
const ano = z
  .number("O ano deve ser um número")
  .int("O ano deve ser inteiro")
  .min(1900, "Ano inválido")
  .max(new Date().getFullYear() + 1, "Ano inválido");

//Quilometragem nunca e negativa; se nao vier começa em 0
const kmAtual = z
  .number("O km deve ser um número")
  .int("O km deve ser inteiro")
  .min(0, "O km não pode ser negativo")
  .default(0);

//Corpo esperado em POST e PUT /api/veiculos
export const veiculoSchema = z.object({ placa, marca, modelo, ano, kmAtual });