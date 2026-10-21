import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-ink text-ink-foreground/80 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Marca */}
          <div>
            <Link to="/" className="font-display text-2xl font-extrabold text-ink-foreground">
              Jogaí
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-ink-foreground/60">
              Encontre quadras, campos e piscinas na sua cidade. Reserve em minutos.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-ink-foreground/20 p-2 transition hover:border-lime hover:text-lime"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="rounded-full border border-ink-foreground/20 p-2 transition hover:border-lime hover:text-lime"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="mailto:contato@jogai.com.br"
                aria-label="E-mail"
                className="rounded-full border border-ink-foreground/20 p-2 transition hover:border-lime hover:text-lime"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-foreground/40">
              Plataforma
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="transition hover:text-lime">
                  Buscar espaços
                </Link>
              </li>
              <li>
                <Link to="/entrar" className="transition hover:text-lime">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/entrar" className="transition hover:text-lime">
                  Cadastrar estabelecimento
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-foreground/40">
              Legal
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-ink-foreground/40">Termos de uso</span>
              </li>
              <li>
                <span className="cursor-default text-ink-foreground/40">Política de privacidade</span>
              </li>
              <li>
                <span className="cursor-default text-ink-foreground/40">Cancelamento e reembolso</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-ink-foreground/10 pt-6 text-xs text-ink-foreground/40 sm:flex-row">
          <p>© {year} Jogaí. Todos os direitos reservados.</p>
          <p>A reserva só é confirmada após o aceite do estabelecimento. Sem cobranças nesta versão.</p>
        </div>
      </div>
    </footer>
  );
}
