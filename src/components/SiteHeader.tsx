import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, X, LayoutDashboard, ClipboardList, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/jogai-logo.jpg.asset.json";

export function SiteHeader() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  async function sair() {
    setOpen(false);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-ink text-ink-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-xl"
          >
            <img src={logo.url} alt="Jogaí" className="h-11 w-11 rounded-xl object-cover" />
            <span className="font-display text-xl font-extrabold tracking-tight">Jogaí</span>
          </Link>

          {/* Nav desktop */}
          <nav
            className="hidden items-center gap-1 text-sm sm:flex"
            aria-label="Navegação principal"
          >
            {user ? (
              <>
                {role === "estabelecimento" ? (
                  <Link
                    to="/painel"
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium transition hover:bg-ink-foreground/10 [&.active]:bg-ink-foreground/10"
                    aria-label="Painel do estabelecimento"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Painel
                  </Link>
                ) : (
                  <Link
                    to="/minhas-solicitacoes"
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 font-medium transition hover:bg-ink-foreground/10 [&.active]:bg-ink-foreground/10"
                    aria-label="Minhas solicitações"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Minhas solicitações
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="lime"
                  onClick={sair}
                  className="flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </Button>
              </>
            ) : (
              <Button size="sm" variant="lime" asChild>
                <Link to="/entrar" className="flex items-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </Link>
              </Button>
            )}
          </nav>

          {/* Hambúrguer mobile */}
          <button
            className="flex items-center justify-center rounded-full p-2 transition hover:bg-ink-foreground/10 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <nav
            className="absolute right-0 top-[60px] flex h-[calc(100vh-60px)] w-72 flex-col gap-1 bg-ink p-4 shadow-2xl"
            aria-label="Menu mobile"
            onClick={(e) => e.stopPropagation()}
          >
            {user ? (
              <>
                {role === "estabelecimento" ? (
                  <Link
                    to="/painel"
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition hover:bg-ink-foreground/10"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5 text-lime" />
                    Painel do estabelecimento
                  </Link>
                ) : (
                  <Link
                    to="/minhas-solicitacoes"
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition hover:bg-ink-foreground/10"
                    onClick={() => setOpen(false)}
                  >
                    <ClipboardList className="h-5 w-5 text-lime" />
                    Minhas solicitações
                  </Link>
                )}
                <div className="mt-auto border-t border-ink-foreground/10 pt-4">
                  <button
                    onClick={sair}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-medium text-destructive transition hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sair da conta
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/entrar"
                className="flex items-center gap-3 rounded-2xl bg-lime px-4 py-3 font-semibold text-lime-foreground"
                onClick={() => setOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                Entrar / Cadastrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
