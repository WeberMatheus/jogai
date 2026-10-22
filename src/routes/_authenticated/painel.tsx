import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, X, Bell, CalendarDays, Clock, User, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { usePhotos } from "@/components/SpaceCard";
import { StatusBadge } from "@/components/StatusBadge";
import { bookingTotal, COMODIDADES, formatBRL, spaceSchema } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel do estabelecimento — Jogaí" },
      { name: "description", content: "Gerencie seus espaços e as solicitações de reserva." },
      { property: "og:title", content: "Painel do estabelecimento — Jogaí" },
      {
        property: "og:description",
        content: "Gerencie seus espaços e as solicitações de reserva.",
      },
    ],
  }),
  component: Painel,
});

type Space = {
  id: string;
  nome: string;
  descricao: string;
  endereco: string;
  bairro: string;
  modalidade: string;
  preco_hora: number;
  comodidades: string[];
  fotos: string[];
  regras: string;
  publicado: boolean;
};

const empty: Omit<Space, "id"> = {
  nome: "",
  descricao: "",
  endereco: "",
  bairro: "",
  modalidade: "",
  preco_hora: 0,
  comodidades: [],
  fotos: [],
  regras: "",
  publicado: false,
};

function Painel() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Omit<Space, "id"> & { id?: string }) | null>(null);
  const [activeTab, setActiveTab] = useState("solicitacoes");
  const [statusFilter, setStatusFilter] = useState<
    "todas" | "pendente" | "confirmada" | "recusada"
  >("todas");

  const spaces = useQuery({
    queryKey: ["my-spaces", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Space[];
    },
  });

  const requests = useQuery({
    queryKey: ["owner-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*, spaces!inner(nome, preco_hora, owner_id)")
        .eq("spaces.owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: "confirmada" | "recusada") {
    const { error } = await supabase.from("booking_requests").update({ status }).eq("id", id);
    if (error) return void toast.error("Não foi possível atualizar.");
    toast.success(status === "confirmada" ? "✅ Solicitação aceita!" : "❌ Solicitação recusada.");
    qc.invalidateQueries({ queryKey: ["owner-requests"] });
  }

  async function deleteSpace(id: string, nome: string) {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o espaço "${nome}"? Esta ação removerá o espaço e não pode ser desfeita.`,
      )
    )
      return;
    const { error } = await supabase.from("spaces").delete().eq("id", id);
    if (error) return void toast.error("Não foi possível excluir o espaço.");
    toast.success("Espaço excluído com sucesso!");
    qc.invalidateQueries({ queryKey: ["my-spaces"] });
    qc.invalidateQueries({ queryKey: ["spaces"] });
  }

  if (role === "usuario")
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-3 text-5xl">🔒</div>
          <p className="font-display text-lg font-bold">Acesso restrito</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Este painel é exclusivo para contas de estabelecimento.
          </p>
        </div>
      </div>
    );

  const pendentes = (requests.data ?? []).filter((r) => r.status === "pendente").length;
  const loading = requests.isLoading || spaces.isLoading;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Painel do estabelecimento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seus espaços e responda às solicitações de reserva.
          </p>
        </div>
        {pendentes > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning">
            <Bell className="h-4 w-4 animate-bounce" />
            {pendentes} solicitaç{pendentes > 1 ? "ões" : "ão"} pendente{pendentes > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="solicitacoes" className="rounded-full relative">
            Solicitações
            {pendentes > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white">
                {pendentes}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="espacos" className="rounded-full">
            Meus espaços
            {(spaces.data?.length ?? 0) > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({spaces.data?.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Solicitações ── */}
        <TabsContent value="solicitacoes" className="mt-4 space-y-3">
          {/* Filtros de status */}
          {!loading && (requests.data ?? []).length > 0 && (
            <div
              className="flex flex-wrap gap-2 pb-1"
              role="tablist"
              aria-label="Filtrar por status"
            >
              {(["todas", "pendente", "confirmada", "recusada"] as const).map((st) => {
                const count =
                  st === "todas"
                    ? (requests.data?.length ?? 0)
                    : (requests.data ?? []).filter((r) => r.status === st).length;
                const label =
                  st === "todas"
                    ? "Todas"
                    : st === "pendente"
                      ? "Pendentes"
                      : st === "confirmada"
                        ? "Confirmadas"
                        : "Recusadas";
                const on = statusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      on
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-4 w-56 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (requests.data ?? []).length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card p-8 text-center">
              <div className="mb-3 text-4xl">📭</div>
              <p className="font-medium text-muted-foreground">Nenhuma solicitação ainda.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Quando usuários solicitarem reservas nos seus espaços, elas aparecerão aqui.
              </p>
            </div>
          ) : (requests.data ?? []).filter(
              (r) => statusFilter === "todas" || r.status === statusFilter,
            ).length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card p-8 text-center">
              <p className="font-medium text-muted-foreground">
                Nenhuma solicitação com status "{statusFilter}".
              </p>
              <button
                onClick={() => setStatusFilter("todas")}
                className="mt-2 text-xs font-semibold text-primary underline"
              >
                Ver todas as solicitações
              </button>
            </div>
          ) : (
            (requests.data ?? [])
              .filter((r) => statusFilter === "todas" || r.status === statusFilter)
              .map((r) => {
                const dataFormatada = new Date(r.data + "T00:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                return (
                  <div
                    key={r.id}
                    className={`rounded-3xl border bg-card p-4 transition ${r.status === "pendente" ? "border-warning/30 bg-warning/5" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold">{r.spaces?.nome}</p>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {dataFormatada}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {r.horario.slice(0, 5)} · {r.duracao_horas}h
                          </span>
                          <span className="font-display font-bold text-foreground">
                            {formatBRL(
                              bookingTotal(Number(r.spaces?.preco_hora ?? 0), r.duracao_horas),
                            )}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            {r.contato_nome}
                          </span>
                          <a
                            href={`https://wa.me/55${r.contato_telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline transition"
                            title="Conversar no WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {r.contato_telefone}
                          </a>
                        </div>
                      </div>
                      {r.status === "pendente" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() => setStatus(r.id, "confirmada")}
                          >
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setStatus(r.id, "recusada")}
                          >
                            Recusar
                          </Button>
                        </div>
                      ) : (
                        <StatusBadge status={r.status} />
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </TabsContent>

        {/* ── Espaços ── */}
        <TabsContent value="espacos" className="mt-4">
          {editing ? (
            <SpaceForm
              initial={editing}
              onDone={() => {
                setEditing(null);
                qc.invalidateQueries({ queryKey: ["my-spaces"] });
                qc.invalidateQueries({ queryKey: ["spaces"] });
              }}
            />
          ) : (
            <>
              <Button className="rounded-full" onClick={() => setEditing({ ...empty })}>
                <Plus />
                Novo espaço
              </Button>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {loading
                  ? [1, 2].map((i) => (
                      <div key={i} className="rounded-3xl border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-36 rounded-lg" />
                            <Skeleton className="h-4 w-48 rounded-lg" />
                          </div>
                          <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                      </div>
                    ))
                  : (spaces.data ?? []).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-3xl border bg-card p-4 transition hover:shadow-card"
                      >
                        <div>
                          <p className="font-display font-bold">{s.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {s.modalidade} · {formatBRL(Number(s.preco_hora))}/h ·{" "}
                            <span
                              className={s.publicado ? "text-success" : "text-muted-foreground"}
                            >
                              {s.publicado ? "Publicado" : "Rascunho"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditing(s)}
                            aria-label={`Editar ${s.nome}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteSpace(s.id, s.nome)}
                            aria-label={`Excluir ${s.nome}`}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                {!loading && spaces.data?.length === 0 && (
                  <div className="col-span-2 rounded-3xl border border-dashed bg-card p-8 text-center">
                    <div className="mb-2 text-4xl">🏟️</div>
                    <p className="text-muted-foreground">Você ainda não cadastrou espaços.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Clique em "Novo espaço" para começar.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SpaceForm({
  initial,
  onDone,
}: {
  initial: Omit<Space, "id"> & { id?: string };
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const previews = usePhotos(f.fotos);

  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF({ ...f, [k]: e.target.value });

  async function upload(files: FileList | null) {
    if (!files || !user) return;
    setUploading(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const path = `${user.id}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
      const { error } = await supabase.storage.from("space-photos").upload(path, file);
      if (error) toast.error("Falha ao enviar " + file.name);
      else added.push(path);
    }
    setF((p) => ({ ...p, fotos: [...p.fotos, ...added] }));
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = spaceSchema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Dados inválidos");
    setSaving(true);
    const payload = { ...p.data, fotos: f.fotos };
    const { error } = f.id
      ? await supabase.from("spaces").update(payload).eq("id", f.id)
      : await supabase.from("spaces").insert({ ...payload, owner_id: user!.id });
    setSaving(false);
    if (error) return void toast.error("Não foi possível salvar.");
    toast.success("Espaço salvo com sucesso!");
    onDone();
  }

  return (
    <form
      onSubmit={save}
      className="space-y-5 rounded-3xl border bg-card p-5"
      aria-label="Formulário de espaço"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{f.id ? "Editar espaço" : "Novo espaço"}</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onDone} aria-label="Fechar">
          <X />
        </Button>
      </div>

      {/* Dados básicos */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="esp-nome">Nome do espaço *</Label>
          <Input
            id="esp-nome"
            value={f.nome}
            onChange={set("nome")}
            placeholder="Ex.: Quadra do Parque"
          />
        </div>
        <div>
          <Label htmlFor="esp-modalidade">Modalidade *</Label>
          <Input
            id="esp-modalidade"
            value={f.modalidade}
            onChange={set("modalidade")}
            placeholder="Futsal, Tênis, Natação…"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {[
              "Futsal",
              "Society",
              "Tênis",
              "Basquete",
              "Vôlei",
              "Beach Tennis",
              "Natação",
              "Padel",
            ].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setF({ ...f, modalidade: m })}
                className="rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
              >
                + {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="esp-endereco">Endereço completo *</Label>
          <Input
            id="esp-endereco"
            value={f.endereco}
            onChange={set("endereco")}
            placeholder="Rua, número"
          />
        </div>
        <div>
          <Label htmlFor="esp-bairro">Bairro *</Label>
          <Input
            id="esp-bairro"
            value={f.bairro}
            onChange={set("bairro")}
            placeholder="Nome do bairro"
          />
        </div>
        <div>
          <Label htmlFor="esp-preco">Preço por hora (R$) *</Label>
          <Input
            id="esp-preco"
            type="number"
            min={0}
            step="0.01"
            value={f.preco_hora}
            onChange={set("preco_hora")}
          />
        </div>
        <div className="flex items-end gap-3 pb-2">
          <Switch
            id="esp-publicado"
            checked={f.publicado}
            onCheckedChange={(v) => setF({ ...f, publicado: v })}
          />
          <Label htmlFor="esp-publicado" className="cursor-pointer">
            {f.publicado ? "✅ Publicado na busca" : "⏸️ Rascunho (não visível)"}
          </Label>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="esp-descricao">Descrição</Label>
        <Textarea
          id="esp-descricao"
          value={f.descricao}
          onChange={set("descricao")}
          placeholder="Descreva o espaço, diferenciais, estrutura…"
          rows={3}
        />
      </div>

      {/* Regras e horários */}
      <div>
        <Label htmlFor="esp-regras">Regras, horários e informações importantes</Label>
        <Textarea
          id="esp-regras"
          value={f.regras}
          onChange={set("regras")}
          rows={4}
          placeholder={
            "Ex.:\nHorário de funcionamento: Seg–Sex 8h–22h, Sáb 8h–18h\nPagamento: pix ou dinheiro no local\nCancelamento: até 24h antes sem custo"
          }
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Informe horários de funcionamento, forma de pagamento e política de cancelamento.
        </p>
      </div>

      {/* Comodidades */}
      <div>
        <Label>Comodidades</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {COMODIDADES.map((c) => {
            const on = f.comodidades.includes(c);
            return (
              <button
                type="button"
                key={c}
                onClick={() =>
                  setF({
                    ...f,
                    comodidades: on ? f.comodidades.filter((x) => x !== c) : [...f.comodidades, c],
                  })
                }
                aria-pressed={on}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fotos */}
      <div>
        <Label>Fotos</Label>
        {previews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previews.map((u, i) => (
              <div key={u} className="relative">
                <img src={u} alt={`Foto ${i + 1}`} className="h-20 w-28 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setF({ ...f, fotos: f.fotos.filter((_, j) => j !== i) })}
                  className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white shadow"
                  aria-label={`Remover foto ${i + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          multiple
          className="mt-2"
          onChange={(e) => upload(e.target.files)}
          disabled={uploading}
          aria-label="Enviar fotos do espaço"
        />
        {uploading && (
          <p className="mt-1 text-xs text-muted-foreground animate-pulse">Enviando fotos…</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="rounded-full" disabled={saving || uploading}>
          {saving ? "Salvando…" : "Salvar espaço"}
        </Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
