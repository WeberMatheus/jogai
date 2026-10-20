import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/StatusBadge";
import { bookingTotal, formatBRL } from "@/lib/booking";

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
        .select("*, spaces(nome, preco_hora, bairro)")
        .eq("user_id", u.user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Minhas solicitações</h1>
      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Carregando…</p>
      ) : data.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed bg-card p-10 text-center">
          <p className="font-bold">Você ainda não fez nenhuma solicitação.</p>
          <Link to="/" className="text-primary underline">Encontrar um espaço</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-4">
              <div>
                <Link to="/espacos/$id" params={{ id: r.space_id }} className="font-display font-bold hover:text-primary">{r.spaces?.nome}</Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(r.data + "T00:00").toLocaleDateString("pt-BR")} às {r.horario.slice(0, 5)} · {r.duracao_horas}h ·{" "}
                  {formatBRL(bookingTotal(Number(r.spaces?.preco_hora ?? 0), r.duracao_horas))}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
