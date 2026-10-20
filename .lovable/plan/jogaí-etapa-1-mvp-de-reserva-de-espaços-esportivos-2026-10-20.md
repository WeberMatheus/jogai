# Jogaí — Etapa 1 (MVP de reserva de espaços esportivos)

Site responsivo em português (Brasil) para encontrar espaços esportivos e solicitar reservas, com a marca Jogaí (logo enviado).

## Visual
- Logo Jogaí no topo e como ícone do site.
- Paleta inspirada no logo: azul elétrico como cor principal, verde-limão como destaque, fundo claro com detalhes em azul-marinho escuro.
- Títulos em fonte forte e arredondada (estilo do "Jogaí"), cards com cantos bem arredondados, mobile-first.

## Telas
1. **Início / Catálogo** (`/`) — busca por modalidade e bairro, filtros de preço máximo e comodidades, cards (foto, nome, modalidade, bairro, preço/hora), estado vazio.
2. **Página do espaço** (`/espacos/:id`) — galeria de fotos, descrição, endereço, modalidades, preço, comodidades, regras. Formulário "Solicitar reserva" (data, horário, duração, nome, telefone) mostrando o valor total antes do envio. Sem login: pede para entrar e volta ao espaço. Após enviar: "Solicitação enviada. Aguarde a confirmação do estabelecimento."
3. **Entrar / Cadastrar** (`/entrar`) — e-mail e senha; no cadastro escolhe perfil *Usuário* ou *Estabelecimento*.
4. **Minhas solicitações** (`/minhas-solicitacoes`) — lista com status pendente / confirmada / recusada.
5. **Painel do estabelecimento** (`/painel`) — criar/editar espaços (com upload de fotos e opção publicar) e lista de solicitações recebidas com Aceitar / Recusar.

Cabeçalho muda conforme a sessão: links do perfil e botão Sair.

## Regras
- Só espaços publicados aparecem na busca.
- Preço exibido antes do envio.
- Solicitação fica "pendente" até o estabelecimento aceitar.
- Estabelecimento só vê e edita os próprios espaços e solicitações; usuário só vê as próprias solicitações.
- Sem pagamento, avaliações, notificações etc.

## Dados de exemplo
Alguns espaços de demonstração publicados para o catálogo não começar vazio (com fotos geradas). Esses dados são fictícios.

## Detalhes técnicos
- Lovable Cloud: autenticação por e-mail/senha, banco e armazenamento de fotos (bucket público `space-photos`, escrita só pelo dono).
- Tabelas: `profiles` (id, nome, tipo), `spaces` (conforme brief + `regras`), `booking_requests` (conforme brief, `contato` com nome/telefone, status enum). Tipo de perfil guardado separado em `user_roles` (enum `usuario`/`estabelecimento`) com função `has_role`, para evitar escalada de privilégio; `profiles` guarda o nome.
- Trigger cria profile + role a partir dos metadados do cadastro.
- RLS: leitura pública de espaços publicados; dono lê/edita os seus (inclusive não publicados); solicitação inserida pelo próprio usuário com status pendente; dono do espaço lê e atualiza status das solicitações dos seus espaços.
- Rotas protegidas sob `_authenticated`; catálogo e página do espaço públicos com metadados próprios.
- Validação com zod nos formulários; testes para cálculo do total e regra de status inicial.
