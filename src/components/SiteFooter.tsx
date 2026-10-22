import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, HelpCircle, FileText, Lock, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const logoUrl = "/jogai-logo.png";

type LegalTopic = "termos" | "privacidade" | "regras" | "suporte" | null;

export function SiteFooter() {
  const [topic, setTopic] = useState<LegalTopic>(null);

  return (
    <footer className="mt-16 border-t border-border/80 bg-card text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logoUrl}
                alt="Jogaí"
                className="h-10 w-10 rounded-xl object-contain bg-black p-0.5 shadow-sm transition-transform group-hover:scale-105"
              />
              <span className="font-display text-xl font-extrabold tracking-tight">
                Joga<span className="text-lime">í</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              A plataforma local para encontrar, comparar e reservar quadras, campos e piscinas esportivas na sua cidade.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Plataforma segura • Transparência de preços e horários</span>
            </div>
          </div>

          {/* Modalidades Populares */}
          <div className="space-y-3 text-sm">
            <p className="font-display font-bold text-foreground">Modalidades</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Futebol society</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Beach tennis</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Futsal e Poliesportivo</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Tênis e Saibro</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Natação e Piscinas</Link>
              </li>
            </ul>
          </div>

          {/* Institucional e Legal */}
          <div className="space-y-3 text-sm">
            <p className="font-display font-bold text-foreground">Institucional e Regras</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => setTopic("termos")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> Termos de Uso
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setTopic("privacidade")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" /> Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setTopic("regras")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Regras de Reserva e Cancelamento
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setTopic("suporte")}
                  className="hover:text-primary transition-colors text-left flex items-center gap-1.5 text-primary font-semibold"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Suporte e Denúncias
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Jogaí — Todos os direitos reservados.</p>
          <p className="text-[11px]">
            Conforme PRD v1.0 • Etapa 1 MVP de Descoberta e Solicitação de Espaços
          </p>
        </div>
      </div>

      {/* Legal Dialogs */}
      <Dialog open={topic !== null} onOpenChange={(open) => !open && setTopic(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl rounded-3xl">
          {topic === "termos" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Termos de Uso
                </DialogTitle>
                <DialogDescription>
                  Condições gerais de navegação e utilização da plataforma Jogaí.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground pt-2">
                <p>
                  <strong>1. Objeto e Natureza da Plataforma:</strong> O Jogaí conecta praticantes de esportes a estabelecimentos esportivos (quadras, campos, piscinas). A plataforma atua como catálogo e intermediadora das solicitações de reserva.
                </p>
                <p>
                  <strong>2. Solicitações de Reserva:</strong> Toda solicitação submetida pelo usuário é recebida como pedido <em>pendente</em> e depende da confirmação expressa do estabelecimento para se tornar uma reserva efetiva.
                </p>
                <p>
                  <strong>3. Responsabilidade das Informações:</strong> O estabelecimento é o único responsável por manter atualizados os preços, horários de funcionamento, regras de uso do local e comodidades disponíveis.
                </p>
                <p>
                  <strong>4. Pagamentos:</strong> Nesta versão inicial (MVP), a plataforma não realiza cobranças financeiras diretas nem retém cartões de crédito. O acerto do valor informado é realizado diretamente entre usuário e estabelecimento.
                </p>
              </div>
            </>
          )}

          {topic === "privacidade" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Política de Privacidade
                </DialogTitle>
                <DialogDescription>
                  Como coletamos, utilizamos e protegemos seus dados pessoais.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground pt-2">
                <p>
                  <strong>1. Dados Coletados:</strong> Para jogadores, coletamos nome, e-mail e telefone de contato para comunicação das reservas. Para estabelecimentos, dados do local, endereço e contatos comerciais.
                </p>
                <p>
                  <strong>2. Finalidade:</strong> Os dados de contato fornecidos na solicitação de reserva são compartilhados exclusivamente com o estabelecimento responsável pelo espaço reservado, viabilizando o atendimento.
                </p>
                <p>
                  <strong>3. Armazenamento e Segurança:</strong> Utilizamos infraestrutura segura com controle rigoroso de acesso (Row Level Security), garantindo que apenas as partes envolvidas tenham acesso às informações.
                </p>
                <p>
                  <strong>4. Seus Direitos:</strong> Você pode atualizar seus dados ou solicitar a exclusão de sua conta a qualquer momento entrando em contato com nosso canal de suporte.
                </p>
              </div>
            </>
          )}

          {topic === "regras" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Regras de Reserva e Cancelamento
                </DialogTitle>
                <DialogDescription>
                  Transparência total sobre o fluxo de agendamentos e cancelamentos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground pt-2">
                <p>
                  <strong>1. Solicitação de Reserva:</strong> Ao enviar o formulário, seu pedido entra com status <em>Pendente</em>. O estabelecimento receberá a notificação em seu painel e poderá <em>Aceitar</em> ou <em>Recusar</em> com base na disponibilidade da quadra.
                </p>
                <p>
                  <strong>2. Confirmação:</strong> A reserva só é considerada confirmada quando o estabelecimento altera o status para <em>Confirmada</em>.
                </p>
                <p>
                  <strong>3. Cancelamentos:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Enquanto a solicitação estiver pendente, não há nenhum compromisso financeiro.</li>
                  <li>Após a confirmação, caso o usuário não possa comparecer, deve avisar o estabelecimento com o máximo de antecedência possível via telefone/WhatsApp.</li>
                  <li>O estabelecimento pode recusar a solicitação caso haja conflito de agenda ou manutenção.</li>
                </ul>
                <p>
                  <strong>4. Cobrança e Preços:</strong> O preço exibido na plataforma é o valor integral por hora informado pelo local, sem cobrança de taxas de conveniência nesta etapa da plataforma.
                </p>
              </div>
            </>
          )}

          {topic === "suporte" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" /> Central de Suporte e Denúncias
                </DialogTitle>
                <DialogDescription>
                  Canal oficial de atendimento, dúvidas ou denúncias de anúncios divergentes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-xs leading-relaxed text-muted-foreground pt-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/60 p-3.5 space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Dúvidas e Parcerias:
                    </p>
                    <a href="mailto:suporte@jogai.app" className="font-bold text-primary underline block">
                      suporte@jogai.app
                    </a>
                  </div>

                  <div className="rounded-2xl bg-muted/60 p-3.5 space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-destructive" /> Denúncias e Moderação:
                    </p>
                    <a href="mailto:denuncia@jogai.app" className="font-bold text-destructive underline block">
                      denuncia@jogai.app
                    </a>
                  </div>
                </div>

                <SupportTicketForm onDone={() => setTopic(null)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}

function SupportTicketForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<"duvida" | "denuncia" | "parceria">("duvida");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [protocolo, setProtocolo] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !mensagem.trim()) {
      return void toast.error("Preencha seu e-mail e a mensagem.");
    }
    const cod = "JOGAI-" + Math.floor(100000 + Math.random() * 900000);
    setProtocolo(cod);
    setEnviado(true);
    toast.success("Mensagem enviada com sucesso!");
  }

  if (enviado) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-2">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
        <p className="font-display font-bold text-foreground">Solicitação registrada!</p>
        <p className="text-xs text-muted-foreground">
          Protocolo: <strong className="text-primary font-mono">{protocolo}</strong>
        </p>
        <p className="text-[11px] text-muted-foreground">
          Nossa equipe analisará sua solicitação e responderá no e-mail informado em até 24 horas úteis.
        </p>
        <Button size="sm" variant="outline" className="mt-2 rounded-full" onClick={onDone}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <p className="font-semibold text-foreground">Envie uma mensagem direta:</p>

      <div className="grid grid-cols-3 gap-1.5">
        {(["duvida", "denuncia", "parceria"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTipo(t)}
            className={`rounded-xl border py-1.5 text-[11px] font-semibold capitalize transition ${
              tipo === t
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "duvida" ? "Dúvida" : t === "denuncia" ? "Denúncia" : "Parceria"}
          </button>
        ))}
      </div>

      <div>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail para resposta"
          required
          className="h-9 rounded-xl text-xs"
        />
      </div>

      <div>
        <Textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Descreva detalhadamente o ocorrido, dúvida ou link do espaço..."
          required
          className="rounded-xl text-xs min-h-[70px]"
          maxLength={600}
        />
      </div>

      <Button type="submit" size="sm" className="w-full rounded-full font-bold">
        <Send className="mr-1.5 h-3.5 w-3.5" /> Enviar solicitação
      </Button>
    </form>
  );
}
