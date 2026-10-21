# Plataforma de Esportes — Etapa 1 (Lovable)

Crie um site responsivo, em português (Brasil), para **encontrar e solicitar reserva de espaços esportivos** (quadras, campos, piscinas) em uma cidade.

## Telas

1. **Home / Catálogo** (pública, sem login)
   - Busca por modalidade e região
   - Filtros: preço máximo e comodidades
   - Cards: foto, nome, modalidade, bairro, preço por hora
   - Estado vazio quando não houver resultados

2. **Página do espaço** (pública)
   - Fotos, descrição, endereço, modalidades, preço, comodidades, regras
   - Formulário **"Solicitar reserva"**: data, horário, duração, nome, telefone
   - Ao enviar, exigir login e mostrar: "Solicitação enviada. Aguarde a confirmação do estabelecimento."

3. **Login / Cadastro** (e-mail e senha) com dois perfis: *usuário* e *estabelecimento*

4. **Minhas solicitações** (usuário): lista com status `pendente`, `confirmada`, `recusada`

5. **Painel do estabelecimento**
   - Criar e editar espaços (nome, descrição, endereço, modalidade, preço/hora, comodidades, fotos)
   - Lista de solicitações com botões **Aceitar** e **Recusar**

## Dados (Supabase)

- `profiles`: id, nome, tipo (`usuario` | `estabelecimento`)
- `spaces`: id, owner_id, nome, descricao, endereco, bairro, modalidade, preco_hora, comodidades[], fotos[], publicado
- `booking_requests`: id, space_id, user_id, data, horario, duracao_horas, contato, status

## Regras

- Só espaços com `publicado = true` aparecem na busca.
- Mostrar o preço antes do envio da solicitação.
- Solicitação **não é reserva confirmada** até o estabelecimento aceitar.
- Estabelecimento só vê e edita os próprios espaços e solicitações (RLS).
- Sem pagamento nesta etapa.

## Visual

Moderno e limpo, mobile-first, cor principal verde ou azul, cards com cantos arredondados.

## Fora desta etapa

Pagamento, avaliações, promoções, notificações, partidas, campeonatos, painel de administrador.
