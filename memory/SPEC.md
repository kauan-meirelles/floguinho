# Floguinho — SPEC

Rede social fictícia "Floguinho" da série *De Volta aos 15* (Netflix). Português (pt-BR).
App mobile-style: frame escuro petrol (#0C232A) centralizado no desktop, acentos laranja (#FF6B00) e rosa (#D91B5C), login quase-preto (#0D1117) réplica da referência.

## Auth
- Sessão = cookie httpOnly `flog_session` (30 dias). Backend: `/api/auth/signup|login|logout|me`. Senhas: pbkdf2_sha256 (passlib).
- Frontend: `RequireAuth` consulta `["me"]` (GET /api/auth/me); 401 → redirect /login. `beginSession()`/`endSession()` em `src/lib/session.ts` limpam o cache do react-query.

## Modelo de dados (Mongo, db "app")
- `users`: id (uuid hex), username, username_lower (único), display_name, email, password_hash, avatar_url, bio, is_owner, created_at
- `sessions`: token (único), user_id, created_at
- `follows`: id, follower_id, following_id (par único), created_at — "virar fã"
- `posts`: id, user_id, username, username_lower, avatar_url, photo_url, caption, filter_name, is_owner, liked_by [user_id], created_at
- `comments`: id, post_id, user_id, username, avatar_url, text, created_at
- `messages`: id, from_id, from_username, to_id, to_username, text, read, created_at — DMs privadas entre flogs

## Endpoints (/api, todos exigem sessão exceto /auth/*, POST /uploads e GET /uploads/{name})
- POST /auth/signup · POST /auth/login · POST /auth/logout · GET /auth/me
- GET /users?q= (busca, ordena por fãs) · GET /users/{username} (perfil + fans/migos/fotos + is_following) · PUT /users/me (display_name, bio, avatar_url) · POST /users/password · POST /users/{username}/follow (toggle)
- GET /posts?username=&skip=&limit= (feed hydratado com comentários/likes) · POST /posts · GET /posts/{id} · POST /posts/{id}/like (toggle) · POST /posts/{id}/comments · DELETE /posts/{id} (só o autor)
- POST /uploads (multipart, máx 10MB, jpg/png/gif/webp, **público** — o cadastro sobe a foto antes da conta existir) → {url: "/api/uploads/<name>"} · GET /uploads/{name} (arquivo salvo em backend/uploads/)
- POST /messages {to_username, text} · GET /messages/conversations (última msg + não lidas) · GET /messages/with/{username} (thread asc, marca como lidas) · GET /messages/unread-count

## Telas
- /login e /signup: réplica da referência (caixa com borda laranja "Entrar na minha conta", inputs marfim, botões laranja/rosa, easter egg NETFLIX).
- / (Feed): faixa de floguinhos (users por fãs) + post cards (curtir com pulso, recados inline, apagar se meu).
- /explore: busca de flogs + botão "virar fã" + grade das últimas fotos (modal de detalhe).
- /create: upload OU link + filtros retrô (normal, 2006, sépia, contraste, y2k — CSS filter) + legenda.
- /u/:username: perfil (avatar, username laranja, coroa se dono, Fãs/Migos/Fotos, "virar fã" ou "editar perfil", botão "Chat", grade do álbum → modal).
- /chat e /chat/:username: lista de conversas e ecrã de chat individual (DM privado entre flogs).
- /settings: pílulas laranja Conta/Preferências/Notificações; Editar Perfil (dialog), Mudar Senha (dialog), Email, Privacidade, Sessões, Filtros; Desconectar (rosa).

## Chat (/chat e /chat/:username)
- DM privado entre flogs, coleção `messages` (from_id/from_username, to_id/to_username, text, photo_url, read, created_at). Texto e/ou foto anexada (upload). Tempo quase real por polling (thread 4s, conversas 6s, selo da aba 10s).
- Entradas: aba "Chat" na barra inferior (com badge rosa de não lidas), botão "Chat" no perfil de outro usuário, "ver flog" dentro da thread.
- Seed: conversa de Anitah e Brenda com o dono (a da Brenda fica não lida para demonstrar o selo).


## Selo de verificado
- Campo `verified` em users; aparece no perfil, nos cards de post, no Flogos e no header do chat (selo azul BadgeCheck).
- Quem dá o selo: só o dono (kauanrobert), botão "dar selo / tirar selo" no perfil de cada flog. Verificados no seed: kauanrobert, Anitah_malukah2006, Brendah_cd.

## Seed (backend/seed.py, idempotente)
- Dono: **kauanrobert** (is_owner=true) + 10 personagens: Anitah_malukah2006 (Anita), Caiow_mendes06, Brendah_cd, Joelsilva_rj, Luh_almeida, Celsinhow, Veronicah_stars, Henrique_rock, carol_cutee, Fabricio_sk8.
- 12 fotos com legendas estilo flogão, 25 recados, ~40 follows, likes distribuídos, conversas iniciais de chat (Anitah e Brenda). Credenciais em memory/test_credentials.md.