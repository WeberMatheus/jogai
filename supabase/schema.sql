-- =============================================================
--  JogAí — Schema Supabase (PostgreSQL)
--  Projeto: sueyzxyqizkfnedityem
--  Execute no SQL Editor do Supabase Dashboard
-- =============================================================

-- --------------------------------------------------------
-- 0. Extensões necessárias
-- --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- 1. PROFILES
--    Extensão da tabela auth.users do Supabase Auth.
--    Armazena nome, papel e avatar do usuário.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  papel       TEXT NOT NULL DEFAULT 'praticante'
              CHECK (papel IN ('praticante', 'estabelecimento', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: cria profile automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 2. SPACES (Espaços esportivos)
--    Quadras, campos, piscinas, etc.
--    Colunas baseadas em SpaceCard.tsx e booking.ts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome          TEXT NOT NULL,
  descricao     TEXT NOT NULL DEFAULT '',
  modalidade    TEXT NOT NULL,
  endereco      TEXT NOT NULL,
  bairro        TEXT NOT NULL,
  cidade        TEXT NOT NULL DEFAULT 'São Paulo',
  estado        TEXT NOT NULL DEFAULT 'SP',
  preco_hora    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (preco_hora >= 0),
  comodidades   TEXT[] NOT NULL DEFAULT '{}',
  regras        TEXT NOT NULL DEFAULT '',
  fotos         TEXT[] NOT NULL DEFAULT '{}',
  publicado     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_spaces_updated_at
  BEFORE UPDATE ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_spaces_publicado    ON public.spaces(publicado);
CREATE INDEX IF NOT EXISTS idx_spaces_modalidade   ON public.spaces(modalidade);
CREATE INDEX IF NOT EXISTS idx_spaces_bairro       ON public.spaces(bairro);
CREATE INDEX IF NOT EXISTS idx_spaces_owner_id     ON public.spaces(owner_id);

-- --------------------------------------------------------
-- 3. BOOKINGS (Reservas / Solicitações)
--    Status: pendente → confirmada | recusada | cancelada
--    Colunas baseadas em booking.ts e bookingSchema
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id          UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data              DATE NOT NULL,
  horario           TEXT NOT NULL,          -- ex: "14:00"
  duracao_horas     INTEGER NOT NULL DEFAULT 1 CHECK (duracao_horas BETWEEN 1 AND 12),
  contato_nome      TEXT NOT NULL,
  contato_telefone  TEXT NOT NULL,
  total             NUMERIC(10,2),          -- preco_hora * duracao_horas
  status            TEXT NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente','confirmada','recusada','cancelada')),
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_bookings_space_id  ON public.bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id   ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status    ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_data      ON public.bookings(data);

-- --------------------------------------------------------
-- 4. REVIEWS (Avaliações)
--    Baseado em reviews.ts (nota 1–5, comentário, autor)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id    UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  autor_nome  TEXT NOT NULL,
  nota        INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario  TEXT NOT NULL DEFAULT '',
  data        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_space_id ON public.reviews(space_id);

-- View: nota média por espaço (usada em SpaceCard)
CREATE OR REPLACE VIEW public.spaces_rating AS
  SELECT
    space_id,
    ROUND(AVG(nota)::NUMERIC, 1)  AS average,
    COUNT(*)                       AS total
  FROM public.reviews
  GROUP BY space_id;

-- --------------------------------------------------------
-- 5. MATCHES (Partidas — página /partidas)
--    Organizador convoca jogadores para uma partida aberta
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id       UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  organizador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo         TEXT NOT NULL,
  modalidade     TEXT NOT NULL,
  data           DATE NOT NULL,
  horario        TEXT NOT NULL,
  duracao_horas  INTEGER NOT NULL DEFAULT 1,
  vagas_total    INTEGER NOT NULL DEFAULT 10,
  vagas_ocupadas INTEGER NOT NULL DEFAULT 0,
  nivel          TEXT NOT NULL DEFAULT 'aberto'
                 CHECK (nivel IN ('iniciante','intermediario','avancado','aberto')),
  descricao      TEXT,
  status         TEXT NOT NULL DEFAULT 'aberta'
                 CHECK (status IN ('aberta','fechada','cancelada','encerrada')),
  bairro         TEXT,
  cidade         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_matches_status     ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_modalidade ON public.matches(modalidade);
CREATE INDEX IF NOT EXISTS idx_matches_data       ON public.matches(data);

-- --------------------------------------------------------
-- 6. MATCH_PARTICIPANTS (Participantes de partidas)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_participants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nome       TEXT NOT NULL,
  telefone   TEXT,
  status     TEXT NOT NULL DEFAULT 'confirmado'
             CHECK (status IN ('confirmado','lista_espera','cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_match_user
  ON public.match_participants(match_id, user_id)
  WHERE user_id IS NOT NULL;

-- Trigger: atualiza vagas_ocupadas em matches
CREATE OR REPLACE FUNCTION public.sync_vagas_ocupadas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.matches
  SET vagas_ocupadas = (
    SELECT COUNT(*) FROM public.match_participants
    WHERE match_id = COALESCE(NEW.match_id, OLD.match_id)
      AND status = 'confirmado'
  )
  WHERE id = COALESCE(NEW.match_id, OLD.match_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_vagas
  AFTER INSERT OR UPDATE OR DELETE ON public.match_participants
  FOR EACH ROW EXECUTE FUNCTION public.sync_vagas_ocupadas();

-- --------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_self"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- spaces: leitura pública de publicados; dono faz tudo
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spaces_select_public"  ON public.spaces FOR SELECT
  USING (publicado = TRUE OR auth.uid() = owner_id);
CREATE POLICY "spaces_insert_owner"   ON public.spaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "spaces_update_owner"   ON public.spaces FOR UPDATE
  USING (auth.uid() = owner_id);
CREATE POLICY "spaces_delete_owner"   ON public.spaces FOR DELETE
  USING (auth.uid() = owner_id);

-- bookings: usuário vê as próprias; dono do espaço vê todas do espaço
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_user"  ON public.bookings FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT owner_id FROM public.spaces WHERE id = space_id)
  );
CREATE POLICY "bookings_insert_auth"  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "bookings_update_owner" ON public.bookings FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (SELECT owner_id FROM public.spaces WHERE id = space_id)
  );

-- reviews: leitura pública; autenticado insere; dono edita/deleta
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all"    ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert_auth"   ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "reviews_delete_own"    ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- matches: leitura pública abertas; autenticado cria; organizador edita
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select_public" ON public.matches FOR SELECT USING (TRUE);
CREATE POLICY "matches_insert_auth"   ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = organizador_id);
CREATE POLICY "matches_update_org"    ON public.matches FOR UPDATE
  USING (auth.uid() = organizador_id);
CREATE POLICY "matches_delete_org"    ON public.matches FOR DELETE
  USING (auth.uid() = organizador_id);

-- match_participants: leitura pública; autenticado insere; dono deleta
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_select_all"  ON public.match_participants FOR SELECT USING (TRUE);
CREATE POLICY "mp_insert_auth" ON public.match_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "mp_delete_own"  ON public.match_participants FOR DELETE
  USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 8. DADOS DE EXEMPLO (seed) — remova em produção
-- --------------------------------------------------------
INSERT INTO public.spaces (nome, modalidade, descricao, endereco, bairro, cidade, preco_hora, comodidades, publicado)
VALUES
  ('Arena JogAí Centro', 'Futebol society', 'Gramado sintético de última geração, iluminação LED e vestiários completos.', 'Av. Paulista, 1234', 'Centro', 'São Paulo', 120.00, ARRAY['Estacionamento','Vestiário','Iluminação','Bebedouro'], TRUE),
  ('Quadra Beach Villa', 'Beach tennis', 'Areia importada, ambiente premium com bar e arquibancada coberta.', 'Rua das Flores, 89', 'Vila Mariana', 'São Paulo', 90.00, ARRAY['Bar','Arquibancada','Iluminação'], TRUE),
  ('Futsal Arena Norte', 'Futsal', 'Quadra poliesportiva coberta com piso de alta performance.', 'Rua Norte, 456', 'Santana', 'São Paulo', 80.00, ARRAY['Vestiário','Iluminação','Bebedouro'], TRUE),
  ('Piscina Olímpica Bosque', 'Natação', 'Piscina de 25m aquecida, raias divididas por nível.', 'Alameda dos Bosques, 200', 'Perdizes', 'São Paulo', 150.00, ARRAY['Vestiário','Aquecimento','Bebedouro'], TRUE)
ON CONFLICT DO NOTHING;
