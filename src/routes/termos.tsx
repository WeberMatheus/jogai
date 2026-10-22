import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, FileText, Ban, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/termos")({
  validateSearch: (s: Record<string, unknown>): { aba?: string } => {
    const a = s["aba"];
    return typeof a === "string" ? { aba: a } : {};
  },
  head: () => ({
    meta: [
      { title: "Termos, Privacidade e Regras — Jogaí" },
      {
        name: "description",
        content:
          "Termos de uso, política de privacidade (LGPD) e regras de cancelamento da plataforma Jogaí.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  const { aba } = Route.useSearch();
  const [activeTab, setActiveTab] = useState(
    aba === "privacidade" || aba === "cancelamento" ? aba : "termos",
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Navegação de volta */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao início
      </Link>

      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Transparência & Confiança
        </span>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Políticas e Diretrizes do Jogaí
        </h1>
        <p className="mt-2 text-muted-foreground">
          Conheça os termos de uso, a política de privacidade e as regras de agendamento e
          cancelamento.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted p-1">
          <TabsTrigger
            value="termos"
            className="flex items-center gap-2 rounded-full text-xs sm:text-sm"
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">Termos de Uso</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacidade"
            className="flex items-center gap-2 rounded-full text-xs sm:text-sm"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="truncate">Privacidade</span>
          </TabsTrigger>
          <TabsTrigger
            value="cancelamento"
            className="flex items-center gap-2 rounded-full text-xs sm:text-sm"
          >
            <Ban className="h-4 w-4 shrink-0" />
            <span className="truncate">Cancelamento</span>
          </TabsTrigger>
        </TabsList>

        {/* ── 1. Termos de Uso ── */}
        <TabsContent
          value="termos"
          className="rounded-3xl border bg-card p-6 sm:p-8 space-y-6 text-foreground leading-relaxed"
        >
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> 1. Natureza do Serviço Jogaí
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              O Jogaí é uma plataforma digital que conecta praticantes de esportes a proprietários e
              administradores de espaços esportivos (quadras, campos, piscinas, estúdios e
              ginásios).
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">2. Solicitação vs Confirmação de Reserva</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O envio de um formulário de reserva através da plataforma constitui uma{" "}
              <strong>solicitação prévia</strong>, não caracterizando garantia imediata de horário
              até que o estabelecimento responsável aceite formalmente o pedido no painel de
              controle.
            </p>
            <div className="mt-3 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                💡 Sem pagamento antecipado nesta etapa:
              </p>
              Nenhum dado bancário ou cartão de crédito é exigido na plataforma. Os pagamentos e
              acertos são efetuados diretamente com o estabelecimento parceiro conforme acordado
              entre as partes.
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">3. Responsabilidades dos Estabelecimentos</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                Manter atualizados os valores por hora, comodidades e fotos reais das instalações.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                Responder às solicitações com presteza (aceite ou recusa).
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                Garantir condições de higiene, segurança e infraestrutura divulgadas.
              </li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">4. Conduta do Usuário</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O usuário compromete-se a fornecer dados reais de contato (nome e telefone/WhatsApp) e
              respeitar o regulamento interno e as normas de cada espaço contratado.
            </p>
          </div>
        </TabsContent>

        {/* ── 2. Privacidade (LGPD) ── */}
        <TabsContent
          value="privacidade"
          className="rounded-3xl border bg-card p-6 sm:p-8 space-y-6 text-foreground leading-relaxed"
        >
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Política de Privacidade e Proteção de
              Dados (LGPD)
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              O Jogaí trata a segurança e a privacidade das informações dos seus usuários com a
              máxima seriedade, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
              13.709/2018).
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">1. Dados Coletados</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Coletamos apenas as informações estritamente necessárias para a prestação do serviço:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Nome e e-mail para autenticação e gestão de perfil;</li>
              <li>Telefone de contato para envio e acompanhamento das reservas;</li>
              <li>Dados dos estabelecimentos (endereço, modalidade, preços e fotos).</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">2. Uso e Compartilhamento dos Dados</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Os dados de contato informados em uma solicitação de reserva são disponibilizados{" "}
              <strong>única e exclusivamente</strong> ao estabelecimento solicitado para fins de
              alinhamento e confirmação da partida. O Jogaí nunca comercializa dados para terceiros.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">3. Segurança e RLS</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Utilizamos infraestrutura em nuvem segura com controle de acesso granular baseado em
              funções (Row Level Security - RLS). Estabelecimentos só têm acesso aos seus próprios
              espaços e solicitações correspondentes.
            </p>
          </div>
        </TabsContent>

        {/* ── 3. Cancelamento e Reembolso ── */}
        <TabsContent
          value="cancelamento"
          className="rounded-3xl border bg-card p-6 sm:p-8 space-y-6 text-foreground leading-relaxed"
        >
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Ban className="h-5 w-5 text-primary" /> Política de Cancelamento e Reembolso
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Orientações sobre alteração de planos, cancelamentos e pontualidade nos espaços
              esportivos.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">1. Cancelamento de Solicitações Pendentes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Enquanto a solicitação estiver com status <strong>Pendente</strong>, nenhum
              compromisso formal foi consumado. Caso o usuário desista, recomenda-se avisar o
              estabelecimento via WhatsApp para liberar a vaga a outros esportistas.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">2. Cancelamento de Reservas Confirmadas</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Após o aceite pelo estabelecimento:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>
                Cancelamentos com antecedência igual ou superior a 24 horas não geram qualquer
                penalidade;
              </li>
              <li>
                Cancelamentos em cima da hora ou não comparecimento (no-show) sujeitam-se às regras
                particulares de cada espaço anunciadas na descrição do estabelecimento.
              </li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-base">3. Condições Climáticas e Casos Fortuitos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Para quadras abertas (areia, society descoberto ou tênis), havendo chuvas torrenciais
              ou impossibilidade de uso, a remarcação deve ser combinada diretamente com a
              administração do local sem ônus.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
