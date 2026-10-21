import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { CheckCircle2, MapPin, Clock, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { usePhotos } from "@/components/SpaceCard";
import { bookingSchema, bookingTotal, formatBRL, INITIAL_STATUS } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/espacos/$id")({
  component: SpacePage,
});

function SpacePage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enviado, setEnviado] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ data: "", horario: "", duracao_horas: "1", contato_nome: "", contato_telefone: "" });

  const { data: space, isLoading } = useQuery({
    queryKey: ["space", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("spaces").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const fotos = usePhotos(space?.fotos);

  // SEO dinâmico via efeito de título — atualiza o título quando o espaço carrega
  if (typeof document !== "undefined" && space?.nome) {
    document.title = `${space.nome} — Jogaí`;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Skeleton className="mb-6 h-[300px] w-full rounded-3xl sm:h-[380px]" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-2/3 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-[360px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!space)
    return (
      <div className="p-10 text-center">
        <div className="mb-4 text-5xl">🏟️</div>
        <p className="font-display text-xl font-bold">Espaço não encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">Este espaço pode ter sido removido ou não existe.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-primary underline">
          <ChevronLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
      </div>
    );

  const total = bookingTotal(Number(space.preco_hora), Number(form.duracao_horas) || 0);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  // Preenche nome automaticamente se o usuário estiver logado
  useEffect(() => {
    if (user && !form.contato_nome) {
      const nomeAuth = (user.user_metadata?.["nome"] as string) ?? "";
      if (nomeAuth) {
        setForm((prev) => ({ ...prev, contato_nome: nomeAuth }));
      }
    }
  }, [user]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.info("Entre na sua conta para enviar a solicitação.");
      navigate({ to: "/entrar", search: { redirect: `/espacos/${id}` } });
      return;
    }
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) return void toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
    setSending(true);
    const { error } = await supabase.from("booking_requests").insert({
      ...parsed.data,
      space_id: id,
      user_id: user.id,
      status: INITIAL_STATUS,
    });
    setSending(false);
    if (error) return void toast.error("Não foi possível enviar. Tente novamente.");
    setEnviado(true);
    toast.success("Solicitação enviada. Aguarde a confirmação do estabelecimento.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-primary">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{space.nome}</span>
      </nav>

      {/* Galeria de fotos */}
      <div className="grid gap-3 sm:grid-cols-3">
        {fotos.length ? (
          fotos.slice(0, 3).map((f, i) => (
            <img
              key={f}
              src={f}
              alt={`${space.nome} — foto ${i + 1}`}
              className={`w-full rounded-3xl object-cover ${
                fotos.length === 1
                  ? "aspect-[21/9] sm:col-span-3"
                  : i === 0
                  ? "aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-full"
                  : "aspect-[16/10]"
              }`}
            />
          ))
        ) : (
          <div className="aspect-[16/10] rounded-3xl bg-muted sm:col-span-3 flex items-center justify-center text-5xl text-muted-foreground/30">
            🏟️
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              {space.modalidade}
            </span>
            <h1 className="mt-2 text-3xl font-extrabold">{space.nome}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {space.endereco} — {space.bairro}
            </p>
          </div>

          {/* Descrição */}
          {space.descricao && (
            <p className="leading-relaxed text-muted-foreground">{space.descricao}</p>
          )}

          {/* Comodidades */}
          {space.comodidades.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Comodidades</h2>
              <div className="flex flex-wrap gap-2">
                {space.comodidades.map((c) => (
                  <span key={c} className="rounded-full border bg-card px-3 py-1 text-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Regras */}
          {space.regras && (
            <div>
              <h2 className="mb-2 text-lg font-bold">Regras do espaço</h2>
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="whitespace-pre-line text-sm text-muted-foreground">{space.regras}</p>
              </div>
            </div>
          )}

          {/* Informações de contato / Nota */}
          <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              A reserva é uma <strong className="text-foreground">solicitação</strong> — ela só é confirmada após o aceite do estabelecimento. Nenhum pagamento é cobrado agora.
            </p>
          </div>
        </div>

        {/* Card de reserva */}
        <aside className="rounded-3xl border bg-card p-5 shadow-card lg:sticky lg:top-20 lg:self-start">
          {enviado ? (
            <div className="space-y-3 py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
              <p className="font-display text-lg font-bold">Solicitação enviada!</p>
              <p className="text-sm text-muted-foreground">
                Solicitação enviada. Aguarde a confirmação do estabelecimento.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/minhas-solicitacoes">Ver minhas solicitações</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-3" aria-label="Formulário de solicitação de reserva">
              <p className="font-display text-2xl font-extrabold text-primary">
                {formatBRL(Number(space.preco_hora))}
                <span className="text-sm font-medium text-muted-foreground"> /hora</span>
              </p>
              <h2 className="text-lg font-bold">Solicitar reserva</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="res-data">Data</Label>
                  <Input
                    id="res-data"
                    type="date"
                    value={form.data}
                    onChange={set("data")}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div>
                  <Label htmlFor="res-horario">Horário</Label>
                  <Input id="res-horario" type="time" value={form.horario} onChange={set("horario")} />
                </div>
              </div>

              <div>
                <Label htmlFor="res-duracao">Duração</Label>
                <select
                  id="res-duracao"
                  value={form.duracao_horas}
                  onChange={set("duracao_horas")}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {[1, 2, 3, 4, 5, 6].map((h) => (
                    <option key={h} value={h}>
                      {h} hora{h > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="res-nome">Seu nome</Label>
                <Input id="res-nome" value={form.contato_nome} onChange={set("contato_nome")} maxLength={100} />
              </div>
              <div>
                <Label htmlFor="res-tel">Telefone</Label>
                <Input
                  id="res-tel"
                  value={form.contato_telefone}
                  onChange={set("contato_telefone")}
                  placeholder="(11) 99999-9999"
                  maxLength={20}
                />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
                <span className="text-sm text-muted-foreground">Total estimado</span>
                <span className="font-display text-lg font-bold">{formatBRL(total)}</span>
              </div>

              <Button type="submit" className="h-11 w-full rounded-full" disabled={sending}>
                {sending ? "Enviando…" : "Solicitar reserva"}
              </Button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
