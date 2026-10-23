export type Review = {
  id: string;
  space_id: string;
  autor_nome: string;
  nota: number; // 1 a 5
  comentario: string;
  data: string;
};

const SEED_REVIEWS: Record<string, Review[]> = {
  default: [
    {
      id: "seed-1",
      space_id: "default",
      autor_nome: "Rafael Mendes",
      nota: 5,
      comentario:
        "Excelente estrutura! Gramado impecável e iluminação perfeita para jogos noturnos.",
      data: "2026-10-15",
    },
    {
      id: "seed-2",
      space_id: "default",
      autor_nome: "Camila Duarte",
      nota: 5,
      comentario: "Vestiários limpíssimos e ótimo atendimento da equipe. Voltaremos sempre!",
      data: "2026-10-18",
    },
    {
      id: "seed-3",
      space_id: "default",
      autor_nome: "Lucas Silveira",
      nota: 4,
      comentario: "Quadra muito boa e estacionamento amplo. Fácil acesso na região.",
      data: "2026-10-20",
    },
  ],
};

const STORAGE_KEY = "jogai_reviews_v1";

export function getReviewsForSpace(spaceId: string): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: Record<string, Review[]> = raw ? JSON.parse(raw) : {};
    const local = stored[spaceId] ?? [];
    const seed = SEED_REVIEWS[spaceId] ?? SEED_REVIEWS.default;
    return [...local, ...seed];
  } catch {
    return SEED_REVIEWS.default;
  }
}

export function addReview(
  spaceId: string,
  review: Omit<Review, "id" | "space_id" | "data">,
): Review {
  const newReview: Review = {
    ...review,
    id: "rev-" + crypto.randomUUID(),
    space_id: spaceId,
    data: new Date().toISOString().slice(0, 10),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: Record<string, Review[]> = raw ? JSON.parse(raw) : {};
    stored[spaceId] = [newReview, ...(stored[spaceId] ?? [])];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (e) {
    console.error("Falha ao salvar review localmente", e);
  }

  return newReview;
}

export function getSpaceRating(spaceId: string): { average: number; count: number } {
  const reviews = getReviewsForSpace(spaceId);
  if (!reviews.length) return { average: 5.0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.nota, 0);
  const average = Math.round((sum / reviews.length) * 10) / 10;
  return { average, count: reviews.length };
}
