import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { bookingTotal, formatBRL } from "@/lib/booking";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/minhas-solicitacoes")({
  head: () => ({
    meta: [
      { title: "Minhas solicitações — Jogaí" },
      { name: "description", content: "Acompanhe o status das suas solicitações de reserva." },
      { property: "og:title", content: "Minhas solicitações — Jogaí" },
      { property: "og:description", content: "Acompanhe o status das suas solicitações de reserva." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*, spaces(nome, preco_hora, bairro, modalidade)")
        .eq("user_id", u.user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Minhas solicitações</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Acompanhe o status de cada solicitação de reserva que você enviou.
      </p>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-64 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed bg-card p-10 text-center">
          <div className="mb-3 text-5xl">📋</div>
          <p className="font-display text-lg font-bold">Você ainda não fez nenhuma solicitação.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Encontre um espaço e solicite a sua primeira reserva!
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Encontrar um espaço
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3" aria-label="Lista de solicitações">
          {data.map((r) => {
            const dataFormatada = new Date(r.data + "T00:00").toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            const total = bookingTotal(Number(r.spaces?.preco_hora ?? 0), r.duracao_horas);

            return (
              <li
                key={r.id}
                className="group rounded-3xl border bg-card p-4 transition hover:shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Nome e link para o espaço */}
                    <div className="flex items-center gap-2">
                      <Link
                        to="/espacos/$id"
                        params={{ id: r.space_id }}
                        className="font-display font-bold hover:text-primary transition truncate"
                      >
                        {r.spaces?.nome}
                      </Link>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>

                    {/* Modalidade e bairro */}
                    {(r.spaces?.modalidade || r.spaces?.bairro) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[r.spaces?.modalidade, r.spaces?.bairro].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    {/* Data, horário e duração */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {dataFormatada}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {r.horario.slice(0, 5)} · {r.duracao_horas}h
                      </span>
                      <span className="font-display font-bold text-foreground">
                        {formatBRL(total)}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={r.status} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
