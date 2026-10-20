import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/jogai-logo.jpg.asset.json";

export function SiteHeader() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo.url} alt="Jogaí" className="h-11 w-11 rounded-xl object-cover" />
          <span className="font-display text-xl font-extrabold">Jogaí</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              {role === "estabelecimento" ? (
                <Link to="/painel" className="rounded-full px-3 py-2 hover:bg-ink-foreground/10">
                  Painel
                </Link>
              ) : (
                <Link to="/minhas-solicitacoes" className="rounded-full px-3 py-2 hover:bg-ink-foreground/10">
                  Minhas solicitações
                </Link>
              )}
              <Button size="sm" variant="lime" onClick={sair}>
                Sair
              </Button>
            </>
          ) : (
            <Button size="sm" variant="lime" asChild>
              <Link to="/entrar">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
