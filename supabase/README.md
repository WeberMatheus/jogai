# Configuração do Supabase

## Ativar moderação administrativa

1. Aplique `drizzle/migrations/0001_admin_space_moderation.sql` ao projeto Supabase conectado.
2. No SQL Editor do Supabase, conceda a função de administrador somente a uma conta confiável, substituindo o e-mail:

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'::public.app_role
   FROM auth.users
   WHERE email = 'admin@example.com'
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

3. Faça login com essa conta. O link **Administração** estará disponível no menu.

A migração impede que estabelecimentos publiquem ou suspendam espaços por conta própria. A aprovação e a suspensão ficam restritas a administradores tanto na interface quanto no banco via RLS e trigger. A migração é local e precisa ser aplicada explicitamente ao banco remoto.
