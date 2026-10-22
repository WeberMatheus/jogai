import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/booking";

export const Route = createFileRoute("/partidas")({
  head: () => ({
    meta: [
      { title: "Partidas e Jogos Abertos — Jogaí" },
      { name: "description", content: "Encontre partidas precisando de jogadores ou monte seu jogo." },
      { property: "og:title", content: "Partidas e Jogos Abertos — Jogaí" },
      { property: "og:description", content: "Encontre partidas precisando de jogadores ou monte seu jogo." },
    ],
  }),
  component: PartidasPage,
});

type Partida = {
  id: string;
  modalidade: string;
  local_nome: string;
  bairro: string;
  data: string;
  horario: string;
  nivel: "Iniciante" | "Intermediário" | "Avançado" | "Todos os níveis";
  vagas_totais: number;
  vagas_abertas: number;
  preco_por_pessoa: number;
  organizador: string;
  contato: string;
};

const SEED_PARTIDAS: Partida[] = [
  {
    id: "p-1",
    modalidade: "Futebol society",
    local_nome: "Arena Society Centro",
    bairro: "Centro",
    data: "2026-10-24",
    horario: "19:00",
    nivel: "Intermediário",
    vagas_totais: 14,
    vagas_abertas: 3,
    preco_por_pessoa: 20,
    organizador: "Matheus Silva",
    contato: "(11) 98888-1111",
  },
  {
    id: "p-2",
    modalidade: "Beach tennis",
    local_nome: "Quadra Beach Vila Mar",
    bairro: "Vila Mar",
    data: "2026-10-25",
    horario: "09:00",
    nivel: "Iniciante",
    vagas_totais: 4,
    vagas_abertas: 1,
    preco_por_pessoa: 25,
    organizador: "Beatriz Lima",
    contato: "(11) 97777-2222",
  },
  {
    id: "p-3",
    modalidade: "Futsal",
    local_nome: "Ginásio Poliesportivo Norte",
    bairro: "Zona Norte",
    data: "2026-10-26",
    horario: "20:30",
    nivel: "Todos os níveis",
    vagas_totais: 10,
    vagas_abertas: 2,
    preco_por_pessoa: 18,
    organizador: "Rodrigo Costa",
    contato: "(11) 96666-3333",
  },
  {
    id: "p-4",
    modalidade: "Tênis",
    local_nome: "Tennis Point Sul",
    bairro: "Zona Sul",
    data: "2026-10-27",
    horario: "18:00",
    nivel: "Intermediário",
    vagas_totais: 2,
    vagas_abertas: 1,
    preco_por_pessoa: 55,
    organizador: "Felipe Gomes",
    contato: "(11) 95555-4444",
  },
];

function PartidasPage() {
  const { user } = useAuth();
  const [partidas, setPartidas] = useState<Partida[]>(() => {
    try {
      const saved = localStorage.getItem("jogai_partidas_v1");
      return saved ? JSON.parse(saved) : SEED_PARTIDAS;
    } catch {
      return SEED_PARTIDAS;
    }
  });

  const [filtroMod, setFiltroMod] = useState("Todos");
  const [modalCriar, setModalCriar] = useState(false);
  const [participando, setParticipando] = useState<string[]>([]);

  // Novo formulário de partida
  const [novo, setNovo] = useState({
    modalidade: "Futebol society",
    local_nome: "",
    bairro: "",
    data: "",
    horario: "",
    nivel: "Intermediário" as Partida["nivel"],
    vagas_totais: 10,
    preco_por_pessoa: 20,
    organizador: "",
    contato: "",
  });

  function salvarPartidas(atualizadas: Partida[]) {
    setPartidas(atualizadas);
    try {
      localStorage.setItem("jogai_partidas_v1", JSON.stringify(atualizadas));
    } catch (e) {
      console.error(e);
    }
  }

  function entrarNaPartida(p: Partida) {
    if (participando.includes(p.id)) {
      toast.info("Você já confirmou interesse nesta partida!");
      return;
    }
    if (p.vagas_abertas <= 0) {
      toast.error("Vagas esgotadas para esta partida!");
      return;
    }

    const atualizadas = partidas.map((item) =>
      item.id === p.id ? { ...item, vagas_abertas: item.vagas_abertas - 1 } : item,
    );
    salvarPartidas(atualizadas);
    setParticipando([...participando, p.id]);
    toast.success(`Vaga confirmada na partida de ${p.modalidade}! Entre em contato com ${p.organizador}: ${p.contato}`);
  }

  function criarPartida(e: React.FormEvent) {
    e.preventDefault();
    if (!novo.local_nome.trim() || !novo.data || !novo.horario) {
      return void toast.error("Preencha todos os campos obrigatórios.");
    }
    const criada: Partida = {
      id: "partida-" + crypto.randomUUID(),
      modalidade: novo.modalidade,
      local_nome: novo.local_nome.trim(),
      bairro: novo.bairro.trim() || "Local",
      data: novo.data,
      horario: novo.horario,
      nivel: novo.nivel,
      vagas_totais: Number(novo.vagas_totais),
      vagas_abertas: Number(novo.vagas_totais) - 1, // o criador já ocupa 1 vaga
      preco_por_pessoa: Number(novo.preco_por_pessoa),
      organizador: novo.organizador.trim() || user?.user_metadata?.nome || "Capitão",
      contato: novo.contato.trim() || "(11) 99999-9999",
    };

    salvarPartidas([criada, ...partidas]);
    setModalCriar(false);
    toast.success("Partida pública criada com sucesso!");
  }

  const modalidades = ["Todos", "Futebol society", "Beach tennis", "Futsal", "Tênis"];

  const filtradas = partidas.filter((p) =>
    filtroMod === "Todos" ? true : p.modalidade.toLowerCase() === filtroMod.toLowerCase(),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header & Hero */}
      <div className="rounded-3xl bg-ink p-8 text-ink-foreground shadow-card sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-lime">
              <Users className="h-3.5 w-3.5" /> Comunidade de Atletas Jogaí
            </span>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              Partidas Abertas & Jogadores
            </h1>
            <p className="text-sm text-ink-foreground/80 sm:text-base leading-relaxed">
              Faltou gente pro jogo? Encontre participantes para completar sua partida ou junte-se a jogos abertos na sua cidade.
            </p>
          </div>

          <Button
            onClick={() => setModalCriar(true)}
            size="lg"
            variant="lime"
            className="rounded-full font-bold shadow-lg shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Criar partida aberta
          </Button>
        </div>

        {/* Filter chips */}
        <div className="mt-8 flex flex-wrap items-center gap-2 pt-4 border-t border-ink-foreground/15 text-xs">
          <span className="text-ink-foreground/60 mr-1">Filtrar por:</span>
          {modalidades.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFiltroMod(m)}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
                filtroMod === m
                  ? "bg-lime text-ink shadow-sm"
                  : "bg-ink-foreground/10 text-ink-foreground hover:bg-ink-foreground/20"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">
            Jogos disponíveis ({filtradas.length})
          </h2>
        </div>

        {filtradas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-lg font-bold">Nenhuma partida encontrada nesta modalidade.</p>
            <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a convidar os amigos e abrir vagas!</p>
            <Button onClick={() => setModalCriar(true)} className="mt-4 rounded-full" variant="outline">
              Criar partida
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((p) => {
              const isEntrou = participando.includes(p.id);
              const esgotado = p.vagas_abertas <= 0 && !isEntrou;
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        {p.modalidade}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {p.nivel}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground line-clamp-1">
                        {p.local_nome}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" /> {p.bairro}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/60 p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(p.data + "T00:00").toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {p.horario}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-1.5">
                        <span className="text-muted-foreground">Vagas restantes:</span>
                        <span className={`font-bold ${p.vagas_abertas <= 2 ? "text-destructive" : "text-success"}`}>
                          {p.vagas_abertas} de {p.vagas_totais} vagas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Organizador</span>
                        <span className="text-xs font-semibold text-foreground">{p.organizador}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground block">Custo por atleta</span>
                        <span className="font-display text-base font-extrabold text-primary">
                          {p.preco_por_pessoa === 0 ? "Grátis" : formatBRL(p.preco_por_pessoa)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border/60 pt-3">
                    {isEntrou ? (
                      <div className="flex items-center justify-center gap-1.5 rounded-full bg-success/15 py-2 text-xs font-bold text-success">
                        <CheckCircle2 className="h-4 w-4" /> Vaga garantida!
                      </div>
                    ) : (
                      <Button
                        onClick={() => entrarNaPartida(p)}
                        disabled={esgotado}
                        className="w-full rounded-full font-bold text-xs shadow-sm"
                        variant={esgotado ? "outline" : "default"}
                      >
                        {esgotado ? "Vagas esgotadas" : "Quero jogar / Garantir vaga"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Criar Partida Aberta */}
      {modalCriar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display text-xl font-bold text-foreground">
                Criar partida aberta
              </h2>
              <button
                type="button"
                onClick={() => setModalCriar(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={criarPartida} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="partida-mod" className="text-xs font-semibold">Modalidade</Label>
                <select
                  id="partida-mod"
                  value={novo.modalidade}
                  onChange={(e) => setNovo({ ...novo, modalidade: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="Futebol society">Futebol society</option>
                  <option value="Beach tennis">Beach tennis</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Tênis">Tênis</option>
                  <option value="Vôlei">Vôlei</option>
                  <option value="Basquete">Basquete</option>
                </select>
              </div>

              <div>
                <Label htmlFor="partida-local" className="text-xs font-semibold">Nome do espaço / Quadra</Label>
                <Input
                  id="partida-local"
                  value={novo.local_nome}
                  onChange={(e) => setNovo({ ...novo, local_nome: e.target.value })}
                  placeholder="Ex.: Arena Society Centro"
                  required
                  className="mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="partida-bairro" className="text-xs font-semibold">Bairro / Região</Label>
                  <Input
                    id="partida-bairro"
                    value={novo.bairro}
                    onChange={(e) => setNovo({ ...novo, bairro: e.target.value })}
                    placeholder="Ex.: Centro"
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="partida-nivel" className="text-xs font-semibold">Nível do jogo</Label>
                  <select
                    id="partida-nivel"
                    value={novo.nivel}
                    onChange={(e) => setNovo({ ...novo, nivel: e.target.value as Partida["nivel"] })}
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="Todos os níveis">Todos os níveis</option>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="partida-data" className="text-xs font-semibold">Data</Label>
                  <Input
                    id="partida-data"
                    type="date"
                    value={novo.data}
                    onChange={(e) => setNovo({ ...novo, data: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="partida-horario" className="text-xs font-semibold">Horário</Label>
                  <Input
                    id="partida-horario"
                    type="time"
                    value={novo.horario}
                    onChange={(e) => setNovo({ ...novo, horario: e.target.value })}
                    required
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="partida-vagas" className="text-xs font-semibold">Vagas totais</Label>
                  <Input
                    id="partida-vagas"
                    type="number"
                    min={2}
                    max={30}
                    value={novo.vagas_totais}
                    onChange={(e) => setNovo({ ...novo, vagas_totais: Number(e.target.value) })}
                    required
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="partida-custo" className="text-xs font-semibold">Custo por atleta (R$)</Label>
                  <Input
                    id="partida-custo"
                    type="number"
                    min={0}
                    step={1}
                    value={novo.preco_por_pessoa}
                    onChange={(e) => setNovo({ ...novo, preco_por_pessoa: Number(e.target.value) })}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="partida-org" className="text-xs font-semibold">Seu nome (Organizador)</Label>
                  <Input
                    id="partida-org"
                    value={novo.organizador}
                    onChange={(e) => setNovo({ ...novo, organizador: e.target.value })}
                    placeholder="Ex.: Lucas"
                    required
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="partida-tel" className="text-xs font-semibold">WhatsApp de contato</Label>
                  <Input
                    id="partida-tel"
                    value={novo.contato}
                    onChange={(e) => setNovo({ ...novo, contato: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full rounded-full font-bold h-11" variant="lime">
                  Publicar partida
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
