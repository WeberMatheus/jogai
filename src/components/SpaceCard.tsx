import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Star } from "lucide-react";
import { resolvePhotos } from "@/lib/auth";
import { formatBRL } from "@/lib/booking";

export type SpaceRow = {
  id: string;
  nome: string;
  modalidade: string;
  bairro: string;
  preco_hora: number;
  fotos: string[];
};

export function usePhotos(paths: string[] | undefined) {
  const [urls, setUrls] = useState<string[]>([]);
  const key = (paths ?? []).join("|");
  useEffect(() => {
    if (!paths?.length) return setUrls([]);
    resolvePhotos(paths).then(setUrls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return urls;
}

export function SpaceCard({ space }: { space: SpaceRow }) {
  const [foto] = usePhotos(space.fotos.slice(0, 1));
  return (
    <Link
      to="/espacos/$id"
      params={{ id: space.id }}
      className="group relative overflow-hidden rounded-3xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`${space.nome} — ${space.modalidade} em ${space.bairro}`}
    >
      {/* Foto */}
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {foto ? (
          <img
            src={foto}
            alt={space.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground/30">
            🏟️
          </div>
        )}
        {/* Overlay no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Conteúdo */}
      <div className="space-y-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
            {space.modalidade}
          </span>
          {/* Placeholder de avaliação — removível quando o DB suportar */}
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-warning text-warning" />
            Novo
          </span>
        </div>
        <h3 className="line-clamp-1 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
          {space.nome}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {space.bairro}
          </span>
          <span className="font-display text-base font-bold text-primary">
            {formatBRL(Number(space.preco_hora))}
            <span className="text-xs font-medium text-muted-foreground">/h</span>
          </span>
        </div>
      </div>

      {/* CTA no hover */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-transform duration-300 group-hover:translate-y-0">
        Ver detalhes e reservar →
      </div>
    </Link>
  );
}
