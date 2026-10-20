CREATE TYPE public.app_role AS ENUM ('usuario','estabelecimento');
CREATE TYPE public.booking_status AS ENUM ('pendente','confirmada','recusada');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome',''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,
    CASE WHEN NEW.raw_user_meta_data->>'tipo' = 'estabelecimento' THEN 'estabelecimento'::public.app_role ELSE 'usuario'::public.app_role END);
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  endereco text NOT NULL DEFAULT '',
  bairro text NOT NULL DEFAULT '',
  modalidade text NOT NULL,
  preco_hora numeric(10,2) NOT NULL CHECK (preco_hora >= 0),
  comodidades text[] NOT NULL DEFAULT '{}',
  fotos text[] NOT NULL DEFAULT '{}',
  regras text NOT NULL DEFAULT '',
  publicado boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spaces TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spaces TO authenticated;
GRANT ALL ON public.spaces TO service_role;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published spaces public" ON public.spaces FOR SELECT TO anon, authenticated USING (publicado = true);
CREATE POLICY "owner reads own" ON public.spaces FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "owner inserts" ON public.spaces FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(),'estabelecimento'));
CREATE POLICY "owner updates" ON public.spaces FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner deletes" ON public.spaces FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  data date NOT NULL,
  horario time NOT NULL,
  duracao_horas integer NOT NULL CHECK (duracao_horas BETWEEN 1 AND 12),
  contato_nome text NOT NULL,
  contato_telefone text NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_requests TO authenticated;
GRANT UPDATE (status) ON public.booking_requests TO authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own" ON public.booking_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "owner reads space requests" ON public.booking_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.owner_id = auth.uid()));
CREATE POLICY "user creates pending" ON public.booking_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pendente'
    AND EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.publicado = true));
CREATE POLICY "owner updates status" ON public.booking_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.owner_id = auth.uid()));

CREATE POLICY "space photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'space-photos');
CREATE POLICY "space photos owner upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'space-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "space photos owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'space-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.spaces (nome, descricao, endereco, bairro, modalidade, preco_hora, comodidades, fotos, regras, publicado) VALUES
('Arena Society Centro','Campo de society com grama sintética nova e iluminação de LED.','Rua das Palmeiras, 120','Centro','Futebol society',180,'{Estacionamento,Vestiário,Iluminação,Bar}','{/images/society.jpg}','Chuteira society obrigatória. Tolerância de 10 minutos.',true),
('Quadra Beach Vila Mar','Quadra de areia para beach tennis e vôlei.','Av. Beira Rio, 455','Vila Mar','Beach tennis',90,'{Iluminação,Bebedouro,Vestiário}','{/images/beach.jpg}','Proibido calçado na areia.',true),
('Ginásio Poliesportivo Norte','Quadra coberta para futsal, vôlei e basquete.','Rua Amazonas, 88','Zona Norte','Futsal',120,'{Vestiário,Arquibancada,Estacionamento}','{/images/futsal.jpg}','Uso de tênis com sola clara.',true),
('Clube Aquático Jardim','Piscina semiolímpica aquecida para treinos e natação livre.','Rua das Flores, 300','Jardim América','Natação',70,'{Vestiário,Aquecimento,Estacionamento}','{/images/piscina.jpg}','Touca obrigatória. Ducha antes de entrar.',true),
('Tennis Point Sul','Quadra de saibro com iluminação e raquetes para aluguel.','Av. Sul, 1500','Zona Sul','Tênis',110,'{Iluminação,Vestiário,Aluguel de equipamento}','{/images/tenis.jpg}','Sapatilha de tênis obrigatória.',true);