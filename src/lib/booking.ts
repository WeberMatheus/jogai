import { z } from "zod";

export const INITIAL_STATUS = "pendente" as const;

export const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  recusada: "Recusada",
};

export function bookingTotal(precoHora: number, duracaoHoras: number): number {
  return Math.round(precoHora * duracaoHoras * 100) / 100;
}

export function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export const bookingSchema = z.object({
  data: z.string().min(1, "Escolha a data"),
  horario: z.string().min(1, "Escolha o horário"),
  duracao_horas: z.coerce.number().int().min(1).max(12),
  contato_nome: z.string().trim().min(2, "Informe seu nome").max(100),
  contato_telefone: z.string().trim().regex(/^[\d\s()+-]{8,20}$/, "Telefone inválido"),
});

export const spaceSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(120),
  descricao: z.string().trim().max(2000),
  endereco: z.string().trim().min(3, "Informe o endereço").max(200),
  bairro: z.string().trim().min(2, "Informe o bairro").max(80),
  modalidade: z.string().trim().min(2, "Informe a modalidade").max(60),
  preco_hora: z.coerce.number().min(0, "Preço inválido").max(100000),
  comodidades: z.array(z.string().trim().min(1).max(40)).max(20),
  regras: z.string().trim().max(2000),
  publicado: z.boolean(),
});

export const COMODIDADES = [
  "Estacionamento",
  "Vestiário",
  "Iluminação",
  "Bar",
  "Bebedouro",
  "Arquibancada",
  "Aquecimento",
  "Aluguel de equipamento",
];
