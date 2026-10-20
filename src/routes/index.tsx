import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SpaceCard, type SpaceRow } from "@/components/SpaceCard";
import { COMODIDADES, formatBRL } from "@/lib/booking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jogaí — Encontre e reserve espaços esportivos" },
      { name: "description", content: "Quadras, campos e piscinas na sua cidade. Compare preços e solicite sua reserva." },
      { property: "og:title", content: "Jogaí — Encontre e reserve espaços esportivos" },
      { property: "og:description", content: "Quadras, campos e piscinas na sua cidade. Compare preços e solicite sua reserva." },
    ],
  }),
  component: Index,
});

type Row = SpaceRow & { comodidades: string[] };

function Index() {
  const [modalidade, setModalidade] = useState("");
  const [regiao, setRegiao] = useState("");
  const [precoMax, setPrecoMax] = useState(300);
  const [coms, setComs] = useState<string[]>([]);

  const { data = [], isLoading } = useQuery({
    queryKey: ["spaces", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spaces")
        .select("id,nome,modalidade,bairro,preco_hora,fotos,comodidades")
        .eq("publicado", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const filtered = useMemo(() => {
    const m = modalidade.trim().toLowerCase();
    const r = regiao.trim().toLowerCase();
    return data.filter(
      (s) =>
        (!m || s.modalidade.toLowerCase().includes(m)) &&
        (!r || s.bairro.toLowerCase().includes(r)) &&
        Number(s.preco_hora) <= precoMax &&
        coms.every((c) => s.comodidades.includes(c)),
    );
  }, [data, modalidade, regiao, precoMax, coms]);

  return (
    <div>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Achou o espaço? <span className="bg-brand bg-clip-text text-transparent">Jogaí.</span>
          </h1>
          <p className="mt-3 max-w-lg text-ink-foreground/70">Quadras, campos e piscinas perto de você.</p>
          <div className="mt-6 grid gap-2 rounded-3xl bg-card p-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input placeholder="Modalidade (ex.: futsal)" value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="h-12 rounded-2xl border-0 bg-muted text-foreground" />
            <Input placeholder="Bairro ou região" value={regiao} onChange={(e) => setRegiao(e.target.value)} className="h-12 rounded-2xl border-0 bg-muted text-foreground" />
            <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-semibold text-ink">
              <Search className="h-4 w-4" /> {filtered.length} espaços
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[240px_1fr]">
        <aside className="space-y-6 rounded-3xl border bg-card p-5 md:sticky md:top-20 md:self-start">
          <div>
            <p className="mb-3 text-sm font-semibold">Preço máximo: {formatBRL(precoMax)}/h</p>
            <Slider min={20} max={300} step={10} value={[precoMax]} onValueChange={([v]) => setPrecoMax(v ?? 300)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Comodidades</p>
            <div className="flex flex-wrap gap-2">
              {COMODIDADES.map((c) => {
                const on = coms.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => setComs(on ? coms.filter((x) => x !== c) : [...coms, c])}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando espaços…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card p-10 text-center">
              <p className="font-display text-xl font-bold">Nenhum espaço encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">Tente outra modalidade, região ou aumente o preço máximo.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <SpaceCard key={s.id} space={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
