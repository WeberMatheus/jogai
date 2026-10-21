import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Zap, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SpaceCard, type SpaceRow } from "@/components/SpaceCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
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

const MODALIDADES_RAPIDAS = ["Futsal", "Tênis", "Natação", "Basquete", "Vôlei", "Padel"];

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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        {/* Gradiente animado de fundo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.86 0.2 135 / 0.5), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.52 0.23 262 / 0.4), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-semibold text-lime">
            <Zap className="h-3 w-3 fill-lime" />
            Plataforma de reserva de espaços esportivos
          </div>

          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Achou o espaço?{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.86 0.2 135), oklch(0.8 0.15 200) 45%, oklch(0.6 0.23 262))",
              }}
            >
              Jogaí.
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-lg text-ink-foreground/70">
            Quadras, campos e piscinas perto de você. Reserve em minutos, sem complicação.
          </p>

          {/* Barra de busca */}
          <div className="mt-8 grid gap-2 rounded-3xl bg-card p-2 sm:grid-cols-[1fr_1fr_auto] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
            <Input
              id="busca-modalidade"
              placeholder="Modalidade (ex.: futsal)"
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="h-12 rounded-2xl border-0 bg-muted text-foreground placeholder:text-muted-foreground"
              aria-label="Filtrar por modalidade"
            />
            <Input
              id="busca-regiao"
              placeholder="Bairro ou região"
              value={regiao}
              onChange={(e) => setRegiao(e.target.value)}
              className="h-12 rounded-2xl border-0 bg-muted text-foreground placeholder:text-muted-foreground"
              aria-label="Filtrar por bairro ou região"
            />
            <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-semibold text-ink">
              <Search className="h-4 w-4" />
              {isLoading ? "…" : `${filtered.length} espaço${filtered.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Atalhos por modalidade */}
          <div className="mt-4 flex flex-wrap gap-2">
            {MODALIDADES_RAPIDAS.map((m) => (
              <button
                key={m}
                onClick={() => setModalidade(modalidade === m ? "" : m)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  modalidade === m
                    ? "border-lime bg-lime text-lime-foreground"
                    : "border-ink-foreground/20 text-ink-foreground/70 hover:border-lime/50 hover:text-lime"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catálogo ── */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar de filtros */}
        <aside
          className="space-y-6 rounded-3xl border bg-card p-5 md:sticky md:top-20 md:self-start"
          aria-label="Filtros"
        >
          <div>
            <p className="mb-3 text-sm font-semibold">
              Preço máximo: <span className="text-primary">{formatBRL(precoMax)}/h</span>
            </p>
            <Slider
              min={20}
              max={300}
              step={10}
              value={[precoMax]}
              onValueChange={([v]) => setPrecoMax(v ?? 300)}
              aria-label="Preço máximo por hora"
            />
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
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                    aria-pressed={on}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Limpar filtros */}
          {(modalidade || regiao || coms.length > 0 || precoMax < 300) && (
            <button
              onClick={() => { setModalidade(""); setRegiao(""); setComs([]); setPrecoMax(300); }}
              className="w-full rounded-full border border-dashed py-1.5 text-xs font-medium text-muted-foreground transition hover:border-destructive hover:text-destructive"
            >
              Limpar filtros
            </button>
          )}
        </aside>

        {/* Grid de espaços */}
        <section aria-label="Espaços disponíveis">
          {isLoading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card p-10 text-center">
              <div className="mb-4 text-5xl">🏟️</div>
              <p className="font-display text-xl font-bold">Nenhum espaço encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outra modalidade, região ou aumente o preço máximo.
              </p>
              {(modalidade || regiao || coms.length > 0) && (
                <button
                  onClick={() => { setModalidade(""); setRegiao(""); setComs([]); setPrecoMax(300); }}
                  className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Limpar filtros
                </button>
              )}
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

      {/* ── Como funciona ── */}
      <section className="border-t bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simples e rápido</span>
            <h2 className="mt-1 text-3xl font-extrabold sm:text-4xl">Como funciona o Jogaí</h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Conectamos praticantes de esportes aos melhores locais da cidade em 3 passos descomplicados.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-extrabold text-primary">
                1
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Encontre o espaço ideal</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Filtre por modalidade (futsal, tênis, basquete, natação), compare preços por hora, fotos e comodidades no seu bairro.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-extrabold text-primary">
                2
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Solicite sua reserva</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Escolha a data, o melhor horário e envie sua solicitação em segundos. Sem pagamento antecipado nesta etapa.
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-extrabold text-primary">
                3
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">Confirmação direta</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                O estabelecimento analisa a solicitação e confirma. Você acompanha todo o status na sua conta em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Banner Estabelecimento ── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground sm:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 90% 20%, oklch(0.86 0.2 135 / 0.6), transparent)",
            }}
          />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-semibold text-lime">
              <Building2 className="h-3.5 w-3.5" /> Para proprietários de quadras e arenas
            </div>
            <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              Tem um espaço esportivo? Anuncie no Jogaí
            </h2>
            <p className="mt-2 text-sm text-ink-foreground/75 leading-relaxed sm:text-base">
              Cadastre suas quadras, campos ou piscinas, receba solicitações de reserva diretamente no painel e aumente a ocupação dos seus horários.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/entrar"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-ink transition hover:opacity-95"
              >
                Cadastrar meu espaço <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
