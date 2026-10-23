import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração — Jogaí" },
      { name: "description", content: "Revise e modere os espaços esportivos cadastrados." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { role, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const spaces = useQuery({
    queryKey: ["admin-spaces"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spaces")
        .select("id,nome,modalidade,bairro,preco_hora,publicado,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function setPublished(id: string, publicado: boolean) {
    const { error } = await supabase.from("spaces").update({ publicado }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a publicação do espaço.");
      return;
    }
    toast.success(publicado ? "Espaço aprovado e publicado." : "Espaço suspenso.");
    await queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
    await queryClient.invalidateQueries({ queryKey: ["spaces"] });
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <ShieldCheck className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-lg font-bold">Acesso restrito</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta área é exclusiva para administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-extrabold">Moderação de espaços</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aprove cadastros ou suspenda espaços publicados.
          </p>
        </div>
      </div>

      {spaces.isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : spaces.isError ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
        >
          Não foi possível carregar os espaços para moderação. Tente novamente.
          <Button variant="outline" className="ml-3" onClick={() => void spaces.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : spaces.data.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          Nenhum espaço cadastrado para revisar.
        </div>
      ) : (
        <ul className="mt-6 space-y-3" aria-label="Espaços para moderação">
          {spaces.data.map((space) => (
            <li
              key={space.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-card p-5"
            >
              <div className="min-w-0">
                <h2 className="font-display font-bold">{space.nome}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {space.modalidade} · {space.bairro} · {formatBRL(Number(space.preco_hora))}/h
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${space.publicado ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"}`}
                >
                  {space.publicado ? "Publicado" : "Aguardando aprovação"}
                </span>
              </div>
              <Button
                variant={space.publicado ? "outline" : "default"}
                className="rounded-full"
                onClick={() => void setPublished(space.id, !space.publicado)}
                disabled={spaces.isFetching}
                aria-label={space.publicado ? `Suspender ${space.nome}` : `Aprovar ${space.nome}`}
              >
                {space.publicado ? <EyeOff /> : <Check />}
                {space.publicado ? "Suspender" : "Aprovar"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
