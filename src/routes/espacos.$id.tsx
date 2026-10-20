import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { usePhotos } from "@/components/SpaceCard";
import { bookingSchema, bookingTotal, formatBRL, INITIAL_STATUS } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/espacos/$id")({
  head: () => ({
    meta: [
      { title: "Espaço esportivo — Jogaí" },
      { name: "description", content: "Veja fotos, preço e comodidades e solicite sua reserva no Jogaí." },
      { property: "og:title", content: "Espaço esportivo — Jogaí" },
      { property: "og:description", content: "Veja fotos, preço e comodidades e solicite sua reserva no Jogaí." },
    ],
  }),
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

  if (isLoading) return <p className="p-8 text-muted-foreground">Carregando…</p>;
  if (!space)
    return (
      <div className="p-10 text-center">
        <p className="font-display text-xl font-bold">Espaço não encontrado</p>
        <Link to="/" className="text-primary underline">Voltar ao catálogo</Link>
      </div>
    );

  const total = bookingTotal(Number(space.preco_hora), Number(form.duracao_horas) || 0);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

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
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {fotos.length ? (
          fotos.slice(0, 3).map((f, i) => (
            <img key={f} src={f} alt={space.nome} className={`w-full rounded-3xl object-cover ${i === 0 ? "aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-full" : "aspect-[16/10]"}`} />
          ))
        ) : (
          <div className="aspect-[16/10] rounded-3xl bg-muted sm:col-span-3" />
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{space.modalidade}</span>
            <h1 className="mt-2 text-3xl font-extrabold">{space.nome}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {space.endereco} — {space.bairro}
            </p>
          </div>
          {space.descricao && <p className="leading-relaxed">{space.descricao}</p>}
          {space.comodidades.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-bold">Comodidades</h2>
              <div className="flex flex-wrap gap-2">
                {space.comodidades.map((c) => (
                  <span key={c} className="rounded-full border bg-card px-3 py-1 text-sm">{c}</span>
                ))}
              </div>
            </div>
          )}
          {space.regras && (
            <div>
              <h2 className="mb-2 text-lg font-bold">Regras</h2>
              <p className="whitespace-pre-line text-muted-foreground">{space.regras}</p>
            </div>
          )}
        </div>

        <aside className="rounded-3xl border bg-card p-5 shadow-card lg:sticky lg:top-20 lg:self-start">
          {enviado ? (
            <div className="space-y-3 py-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <p className="font-display text-lg font-bold">Solicitação enviada.</p>
              <p className="text-sm text-muted-foreground">Aguarde a confirmação do estabelecimento.</p>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/minhas-solicitacoes">Ver minhas solicitações</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-3">
              <p className="font-display text-2xl font-extrabold text-primary">
                {formatBRL(Number(space.preco_hora))}<span className="text-sm font-medium text-muted-foreground"> /hora</span>
              </p>
              <h2 className="text-lg font-bold">Solicitar reserva</h2>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Data</Label><Input type="date" value={form.data} onChange={set("data")} min={new Date().toISOString().slice(0, 10)} /></div>
                <div><Label>Horário</Label><Input type="time" value={form.horario} onChange={set("horario")} /></div>
              </div>
              <div>
                <Label>Duração</Label>
                <select value={form.duracao_horas} onChange={set("duracao_horas")} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  {[1, 2, 3, 4, 5, 6].map((h) => <option key={h} value={h}>{h} hora{h > 1 ? "s" : ""}</option>)}
                </select>
              </div>
              <div><Label>Nome</Label><Input value={form.contato_nome} onChange={set("contato_nome")} maxLength={100} /></div>
              <div><Label>Telefone</Label><Input value={form.contato_telefone} onChange={set("contato_telefone")} placeholder="(11) 99999-9999" maxLength={20} /></div>
              <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
                <span className="text-sm">Total estimado</span>
                <span className="font-display text-lg font-bold">{formatBRL(total)}</span>
              </div>
              <Button type="submit" className="h-11 w-full rounded-full" disabled={sending}>
                {sending ? "Enviando…" : "Solicitar reserva"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">A reserva só é confirmada após o aceite do estabelecimento. Sem pagamento agora.</p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
