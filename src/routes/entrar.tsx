import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/entrar")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => {
    const r = s["redirect"];
    return typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? { redirect: r } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar — Jogaí" },
      { name: "description", content: "Acesse sua conta Jogaí como jogador ou estabelecimento." },
      { property: "og:title", content: "Entrar ou cadastrar — Jogaí" },
      { property: "og:description", content: "Acesse sua conta Jogaí como jogador ou estabelecimento." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(72),
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [tipo, setTipo] = useState<"usuario" | "estabelecimento">("usuario");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse({ email, senha });
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Dados inválidos");
    setLoading(true);
    if (modo === "entrar") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setLoading(false);
      if (error) return void toast.error("E-mail ou senha incorretos (ou e-mail ainda não confirmado).");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const isEst = (roles ?? []).some((r) => r.role === "estabelecimento");
      navigate({ to: redirect ?? (isEst ? "/painel" : "/") });
    } else {
      if (nome.trim().length < 2) {
        setLoading(false);
        return void toast.error("Informe seu nome");
      }
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin + (redirect ?? ""), data: { nome: nome.trim(), tipo } },
      });
      setLoading(false);
      if (error) return void toast.error(error.message);
      setConfirmar(true);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border bg-card p-6 shadow-card">
        {confirmar ? (
          <div className="py-6 text-center">
            <h1 className="text-2xl font-extrabold">Confira seu e-mail</h1>
            <p className="mt-2 text-muted-foreground">Enviamos um link de confirmação para {email}. Depois é só entrar.</p>
            <Button className="mt-4 rounded-full" variant="outline" onClick={() => { setConfirmar(false); setModo("entrar"); }}>Ir para Entrar</Button>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold">
              {(["entrar", "cadastrar"] as const).map((m) => (
                <button key={m} onClick={() => setModo(m)} className={`rounded-full py-2 ${modo === m ? "bg-card shadow" : "text-muted-foreground"}`}>
                  {m === "entrar" ? "Entrar" : "Cadastrar"}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="space-y-4">
              {modo === "cadastrar" && (
                <>
                  <div>
                    <Label>Eu sou</Label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {(["usuario", "estabelecimento"] as const).map((t) => (
                        <button type="button" key={t} onClick={() => setTipo(t)} className={`rounded-2xl border p-3 text-sm font-semibold ${tipo === t ? "border-primary bg-accent text-accent-foreground" : ""}`}>
                          {t === "usuario" ? "Jogador" : "Estabelecimento"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><Label>{tipo === "usuario" ? "Seu nome" : "Nome do estabelecimento"}</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} /></div>
                </>
              )}
              <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Senha</Label><Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
              <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
                {loading ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
