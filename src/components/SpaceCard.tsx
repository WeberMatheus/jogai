import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
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
      className="group overflow-hidden rounded-3xl border bg-card shadow-card transition hover:-translate-y-1"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {foto && (
          <img src={foto} alt={space.nome} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
      </div>
      <div className="space-y-1 p-4">
        <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
          {space.modalidade}
        </span>
        <h3 className="text-lg font-bold">{space.nome}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {space.bairro}
          </span>
          <span className="font-display text-base font-bold text-primary">
            {formatBRL(Number(space.preco_hora))}
            <span className="text-xs font-medium text-muted-foreground">/h</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
