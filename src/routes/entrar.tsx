import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
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
      {
        name: "description",
        content: "Acesse sua conta Jogaí como jogador ou estabelecimento esportivo.",
      },
      { property: "og:title", content: "Entrar ou cadastrar — Jogaí" },
      {
        property: "og:description",
        content: "Acesse sua conta Jogaí como jogador ou estabelecimento esportivo.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(255),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres").max(72),
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "cadastrar" | "recuperar">("entrar");
  const [tipo, setTipo] = useState<"usuario" | "estabelecimento">("usuario");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false);

  const isReservaRedirect = redirect?.includes("/espacos/");

  async function recuperarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      return void toast.error("Informe um e-mail válido para recuperação.");
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/entrar",
    });
    setLoading(false);
    if (error) return void toast.error(error.message);
    setRecuperacaoEnviada(true);
    toast.success("E-mail de recuperação enviado com sucesso!");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse({ email, senha });
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Dados inválidos");

    setLoading(true);
    if (modo === "entrar") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setLoading(false);
      if (error) {
        return void toast.error("E-mail ou senha incorretos (ou e-mail ainda não confirmado).");
      }
      toast.success("Bem-vindo de volta!");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const userRoles = (roles ?? []).map((r) => r.role);
      const destination = userRoles.includes("admin")
        ? "/admin"
        : userRoles.includes("estabelecimento")
          ? "/painel"
          : "/";
      navigate({ to: redirect ?? destination });
    } else {
      if (nome.trim().length < 2) {
        setLoading(false);
        return void toast.error(
          tipo === "usuario" ? "Informe seu nome completo" : "Informe o nome do estabelecimento",
        );
      }
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: window.location.origin + (redirect ?? ""),
          data: { nome: nome.trim(), tipo },
        },
      });
      setLoading(false);
      if (error) return void toast.error(error.message);
      setConfirmar(true);
      toast.success("Conta criada! Verifique seu e-mail.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Banner se veio do fluxo de reserva */}
      {isReservaRedirect && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center text-sm font-medium text-foreground">
          ⚽ <strong>Quase lá!</strong> Entre na sua conta ou crie uma rapidinho para solicitar a
          sua reserva.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Lado Esquerdo: Benefícios e Perfil */}
        <div className="space-y-6 lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Dois perfis em uma só plataforma
          </div>

          <div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              {modo === "entrar" ? "Acesse sua conta no Jogaí" : "Crie sua conta gratuita"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              A forma mais simples de conectar praticantes de esporte e donos de quadras, campos e
              piscinas.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div
              className={`rounded-2xl border p-4 transition ${
                tipo === "usuario" && modo === "cadastrar"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Perfil Jogador</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Busque espaços esportivos na cidade, compare preços e solicite reservas sem
                    taxas.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 transition ${
                tipo === "estabelecimento" && modo === "cadastrar"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Perfil Estabelecimento</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cadastre suas quadras e campos, divulgue horários e receba solicitações direto
                    no seu painel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" /> Conexão segura e autenticada
            </p>
            <p>Seus dados estão protegidos com criptografia e regras de segurança RLS.</p>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-card">
            {confirmar ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="text-2xl font-extrabold">Confira seu e-mail</h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                  Enviamos um link de confirmação para{" "}
                  <strong className="text-foreground">{email}</strong>. Clique no link para ativar
                  sua conta e entrar.
                </p>
                <div className="pt-2">
                  <Button
                    className="rounded-full px-6"
                    variant="outline"
                    onClick={() => {
                      setConfirmar(false);
                      setModo("entrar");
                    }}
                  >
                    Ir para Entrar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {modo === "recuperar" ? (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-extrabold">Recuperar acesso</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Informe o e-mail cadastrado e enviaremos as instruções para você redefinir
                        sua senha.
                      </p>
                    </div>

                    {recuperacaoEnviada ? (
                      <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center space-y-3">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                        <p className="font-semibold text-sm">E-mail enviado!</p>
                        <p className="text-xs text-muted-foreground">
                          Se houver uma conta com o e-mail <strong>{email}</strong>, você receberá
                          um link seguro de recuperação em instantes.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            setRecuperacaoEnviada(false);
                            setModo("entrar");
                          }}
                        >
                          Voltar ao login
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={recuperarSenha} className="space-y-4">
                        <div>
                          <Label htmlFor="rec-email">Seu e-mail</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="rec-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seu@email.com"
                              className="h-11 rounded-2xl pl-10"
                              autoComplete="email"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="h-12 w-full rounded-full text-base font-semibold"
                          disabled={loading}
                        >
                          {loading ? "Enviando…" : "Enviar link de recuperação"}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setModo("entrar")}
                            className="text-xs text-primary hover:underline"
                          >
                            Lembrou sua senha? Voltar ao login
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Abas Entrar / Cadastrar */}
                    <div className="mb-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => setModo("entrar")}
                        className={`rounded-full py-2 transition ${
                          modo === "entrar"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Entrar
                      </button>
                      <button
                        type="button"
                        onClick={() => setModo("cadastrar")}
                        className={`rounded-full py-2 transition ${
                          modo === "cadastrar"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Criar conta
                      </button>
                    </div>

                    <form onSubmit={submit} className="space-y-4" noValidate>
                      {modo === "cadastrar" && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Tipo de conta
                            </Label>
                            <div className="mt-1.5 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setTipo("usuario")}
                                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition ${
                                  tipo === "usuario"
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-background hover:bg-muted"
                                }`}
                              >
                                <User className="h-4 w-4" />
                                Jogador
                              </button>
                              <button
                                type="button"
                                onClick={() => setTipo("estabelecimento")}
                                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition ${
                                  tipo === "estabelecimento"
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-background hover:bg-muted"
                                }`}
                              >
                                <Building2 className="h-4 w-4" />
                                Estabelecimento
                              </button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="auth-nome">
                              {tipo === "usuario" ? "Seu nome completo" : "Nome do estabelecimento"}
                            </Label>
                            <Input
                              id="auth-nome"
                              value={nome}
                              onChange={(e) => setNome(e.target.value)}
                              placeholder={
                                tipo === "usuario" ? "Ex.: Carlos Eduardo" : "Ex.: Arena Gol & Bola"
                              }
                              maxLength={100}
                              className="mt-1 h-11 rounded-2xl"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="auth-email">E-mail</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="auth-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="h-11 rounded-2xl pl-10"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auth-senha">Senha</Label>
                          {modo === "cadastrar" ? (
                            <span className="text-xs text-muted-foreground">
                              Mínimo 6 caracteres
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setModo("recuperar")}
                              className="text-xs text-primary hover:underline"
                            >
                              Esqueceu a senha?
                            </button>
                          )}
                        </div>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="auth-senha"
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="••••••••"
                            className="h-11 rounded-2xl pl-10 pr-10"
                            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                          >
                            {mostrarSenha ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="h-12 w-full rounded-full text-base font-semibold transition"
                        disabled={loading}
                      >
                        {loading ? (
                          "Aguarde…"
                        ) : modo === "entrar" ? (
                          <span className="flex items-center justify-center gap-2">
                            Entrar <ArrowRight className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Criar conta como {tipo === "usuario" ? "Jogador" : "Estabelecimento"}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>

                      <p className="pt-2 text-center text-xs text-muted-foreground">
                        Ao continuar, você concorda com os{" "}
                        <Link
                          to="/termos"
                          search={{ aba: "termos" }}
                          className="text-primary hover:underline font-medium"
                        >
                          termos de uso e privacidade
                        </Link>{" "}
                        do Jogaí.
                      </p>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
