import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, X } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel do estabelecimento — Jogaí" },
      { name: "description", content: "Gerencie seus espaços e as solicitações de reserva." },
      { property: "og:title", content: "Painel do estabelecimento — Jogaí" },
      { property: "og:description", content: "Gerencie seus espaços e as solicitações de reserva." },
    ],
  }),
  component: Painel,
});

type Space = {
  id: string; nome: string; descricao: string; endereco: string; bairro: string; modalidade: string;
  preco_hora: number; comodidades: string[]; fotos: string[]; regras: string; publicado: boolean;
};

const empty: Omit<Space, "id"> = {
  nome: "", descricao: "", endereco: "", bairro: "", modalidade: "", preco_hora: 0,
  comodidades: [], fotos: [], regras: "", publicado: false,
};

function Painel() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Omit<Space, "id"> & { id?: string }) | null>(null);

  const spaces = useQuery({
    queryKey: ["my-spaces", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("spaces").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
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
    if (error) return toast.error("Não foi possível atualizar.");
    toast.success(status === "confirmada" ? "Solicitação aceita" : "Solicitação recusada");
    qc.invalidateQueries({ queryKey: ["owner-requests"] });
  }

  if (role === "usuario")
    return <p className="p-10 text-center text-muted-foreground">Este painel é para contas de estabelecimento.</p>;

  const pendentes = (requests.data ?? []).filter((r) => r.status === "pendente").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Painel do estabelecimento</h1>
      <Tabs defaultValue="solicitacoes" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="solicitacoes" className="rounded-full">Solicitações {pendentes > 0 && `(${pendentes})`}</TabsTrigger>
          <TabsTrigger value="espacos" className="rounded-full">Meus espaços</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitacoes" className="mt-4 space-y-3">
          {(requests.data ?? []).length === 0 && <p className="rounded-3xl border border-dashed bg-card p-8 text-center text-muted-foreground">Nenhuma solicitação ainda.</p>}
          {(requests.data ?? []).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card p-4">
              <div>
                <p className="font-display font-bold">{r.spaces?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(r.data + "T00:00").toLocaleDateString("pt-BR")} às {r.horario.slice(0, 5)} · {r.duracao_horas}h · {formatBRL(bookingTotal(Number(r.spaces?.preco_hora ?? 0), r.duracao_horas))}
                </p>
                <p className="text-sm">{r.contato_nome} · {r.contato_telefone}</p>
              </div>
              {r.status === "pendente" ? (
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-full" onClick={() => setStatus(r.id, "confirmada")}>Aceitar</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(r.id, "recusada")}>Recusar</Button>
                </div>
              ) : (
                <StatusBadge status={r.status} />
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="espacos" className="mt-4">
          {editing ? (
            <SpaceForm initial={editing} onDone={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["my-spaces"] }); qc.invalidateQueries({ queryKey: ["spaces"] }); }} />
          ) : (
            <>
              <Button className="rounded-full" onClick={() => setEditing({ ...empty })}><Plus /> Novo espaço</Button>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(spaces.data ?? []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-3xl border bg-card p-4">
                    <div>
                      <p className="font-display font-bold">{s.nome}</p>
                      <p className="text-sm text-muted-foreground">{s.modalidade} · {formatBRL(Number(s.preco_hora))}/h · {s.publicado ? "Publicado" : "Rascunho"}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(s)} aria-label="Editar"><Pencil /></Button>
                  </div>
                ))}
                {spaces.data?.length === 0 && <p className="text-muted-foreground">Você ainda não cadastrou espaços.</p>}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SpaceForm({ initial, onDone }: { initial: Omit<Space, "id"> & { id?: string }; onDone: () => void }) {
  const { user } = useAuth();
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const previews = usePhotos(f.fotos);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

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
    if (!p.success) return toast.error(p.error.issues[0].message);
    setSaving(true);
    const payload = { ...p.data, fotos: f.fotos };
    const { error } = f.id
      ? await supabase.from("spaces").update(payload).eq("id", f.id)
      : await supabase.from("spaces").insert({ ...payload, owner_id: user!.id });
    setSaving(false);
    if (error) return toast.error("Não foi possível salvar.");
    toast.success("Espaço salvo");
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-3xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{f.id ? "Editar espaço" : "Novo espaço"}</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onDone} aria-label="Fechar"><X /></Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Nome</Label><Input value={f.nome} onChange={set("nome")} /></div>
        <div><Label>Modalidade</Label><Input value={f.modalidade} onChange={set("modalidade")} placeholder="Futsal, Tênis…" /></div>
        <div><Label>Endereço</Label><Input value={f.endereco} onChange={set("endereco")} /></div>
        <div><Label>Bairro</Label><Input value={f.bairro} onChange={set("bairro")} /></div>
        <div><Label>Preço por hora (R$)</Label><Input type="number" min={0} step="0.01" value={f.preco_hora} onChange={set("preco_hora")} /></div>
        <div className="flex items-end gap-2 pb-2"><Switch checked={f.publicado} onCheckedChange={(v) => setF({ ...f, publicado: v })} /><Label>Publicado na busca</Label></div>
      </div>
      <div><Label>Descrição</Label><Textarea value={f.descricao} onChange={set("descricao")} /></div>
      <div><Label>Regras</Label><Textarea value={f.regras} onChange={set("regras")} /></div>
      <div>
        <Label>Comodidades</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {COMODIDADES.map((c) => {
            const on = f.comodidades.includes(c);
            return (
              <button type="button" key={c} onClick={() => setF({ ...f, comodidades: on ? f.comodidades.filter((x) => x !== c) : [...f.comodidades, c] })}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${on ? "border-primary bg-primary text-primary-foreground" : ""}`}>{c}</button>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Fotos</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {previews.map((u, i) => (
            <div key={u} className="relative">
              <img src={u} alt="" className="h-20 w-28 rounded-xl object-cover" />
              <button type="button" onClick={() => setF({ ...f, fotos: f.fotos.filter((_, j) => j !== i) })} className="absolute -right-1 -top-1 rounded-full bg-ink p-0.5 text-ink-foreground" aria-label="Remover"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <Input type="file" accept="image/*" multiple className="mt-2" onChange={(e) => upload(e.target.files)} disabled={uploading} />
      </div>
      <Button type="submit" className="rounded-full" disabled={saving || uploading}>{saving ? "Salvando…" : "Salvar espaço"}</Button>
    </form>
  );
}
