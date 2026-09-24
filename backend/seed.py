"""Seed do Floguinho — a rede social de De Volta aos 15, com o dono kauanrobert.

Run: cd /app/backend && python seed.py   (idempotente)
Senhas: todos os personagens usam "senha123"; o dono usa "kauan123".
"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from lib.db import db, ensure_indexes

hash_password = CryptContext(schemes=["pbkdf2_sha256"]).hash

U = "https://images.unsplash.com"
P = "https://images.pexels.com/photos"

USERS: list[dict] = [
    {
        "username": "kauanrobert",
        "display_name": "Kauan Robert",
        "avatar": f"{P}/12871465/pexels-photo-12871465.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "bio": "fundador e dono do Floguinho ☺ aqui é 2006 pra sempre. qualquer coisa, recado no meu flog.",
        "password": "kauan123",
        "is_owner": True,
        "verified": True,
    },
    {
        "username": "Anitah_malukah2006",
        "display_name": "Anita",
        "avatar": f"{U}/photo-1662850886700-4ec19bd30d11?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "17 anos ★ sonhando acordada desde sempre ★ f/f? sigo de volta, juro de dedinho",
        "password": "senha123",
        "verified": True,
    },
    {
        "username": "Caiow_mendes06",
        "display_name": "Caio Mendes",
        "avatar": f"{U}/photo-1600603406200-5b2a104684ac?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "futebol, pastel e uma boa foto. não me chama no domingo que tem jogo",
        "password": "senha123",
    },
    {
        "username": "Brendah_cd",
        "display_name": "Brenda",
        "avatar": f"{U}/photo-1612203304476-2ed23c55b5b9?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "moda é meu idioma ★ brilho não é demais, é o mínimo",
        "password": "senha123",
    },
    {
        "username": "Joelsilva_rj",
        "display_name": "Joel Silva",
        "avatar": f"{U}/photo-1614321375197-c5083895b054?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "informática é vida. montei esse flog no PC da lan house mesmo",
        "password": "senha123",
    },
    {
        "username": "Luh_almeida",
        "display_name": "Luiza",
        "avatar": f"{P}/33418602/pexels-photo-33418602.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "bio": "paz, praia e música boa. a vida é agora",
        "password": "senha123",
    },
    {
        "username": "Celsinhow",
        "display_name": "Celso",
        "avatar": f"{U}/photo-1587397845856-e6cf49176c70?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "irmão da Anita. fim de tarde é na quadra ou na praia",
        "password": "senha123",
    },
    {
        "username": "Veronicah_stars",
        "display_name": "Verônica",
        "avatar": f"{U}/photo-1607569708758-0270aa4651bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "arte em todo lugar, só abrir os olhos ★",
        "password": "senha123",
    },
    {
        "username": "Henrique_rock",
        "display_name": "Henrique",
        "avatar": f"{P}/8929305/pexels-photo-8929305.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "bio": "guitarra + floguinho = minha vida rock in roll d+++",
        "password": "senha123",
    },
    {
        "username": "carol_cutee",
        "display_name": "Carol",
        "avatar": f"{P}/30372403/pexels-photo-30372403.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
        "bio": "photographer amadora ♥ achando bonito em tudo",
        "password": "senha123",
    },
    {
        "username": "Fabricio_sk8",
        "display_name": "Fábio",
        "avatar": f"{U}/flagged/photo-1595514191830-3e96a518989b?crop=entropy&cs=srgb&fm=jpg&q=85&w=400&h=400&fit=crop",
        "bio": "skate, som e rua. quem é do bairro me conhece",
        "password": "senha123",
    },
]

# (username, foto, legenda, filtro, horas_atras)
POSTS: list[tuple[str, str, str, str, int]] = [
    ("kauanrobert", f"{P}/8885024/pexels-photo-8885024.jpeg?auto=compress&cs=tinysrgb&w=900",
     "BEM-VINDOS AO FLOGUINHO!! ♥ a rede é minha, as fotos são nossas. respeitem os flogs e boa sorte com os fãs ☺ bjinhus, dono",
     "y2k", 720),
    ("Anitah_malukah2006", f"{P}/17243584/pexels-photo-17243584.jpeg?auto=compress&cs=tinysrgb&w=900",
     "minha mega sony 5.1 chegou!! tirando foto de tudo por aqui ★·.·´¯`·.·★ bjinhus pra vcs", "y2k", 300),
    ("Brendah_cd", f"{P}/16652542/pexels-photo-16652542.jpeg?auto=compress&cs=tinysrgb&w=900",
     "look do dia pra sair com as migas ~ hoje ninguém me segura ;*", "n2006", 260),
    ("Caiow_mendes06", f"{P}/12243682/pexels-photo-12243682.jpeg?auto=compress&cs=tinysrgb&w=900",
     "racha de sábado na quadra. quem perder compra pastel pra geral", "normal", 210),
    ("Luh_almeida", f"{U}/photo-1739378976611-fb3552ae17ec?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
     "praia com a galera do colégio ♥ não troco esse dia por nada", "n2006", 170),
    ("Joelsilva_rj", f"{U}/photo-1660220818015-2b9f5c42ce28?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
     "setup novo montado!! AMD Sempron + monitor de 15 polegadas, tô voando na net", "normal", 130),
    ("Veronicah_stars", f"{P}/30241415/pexels-photo-30241415.jpeg?auto=compress&cs=tinysrgb&w=900",
     "grafite é arte sim, quem discorda pode recusar ♥", "hard", 96),
    ("Celsinhow", f"{U}/photo-1668194645738-ef8dbb426086?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
     "o pôr do sol ontem tava insano, menos o placar kkkk", "normal", 72),
    ("kauanrobert", f"{U}/photo-1699730164892-d7c433524ff3?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
     "primeira sexta do floguinho no ar!! brindem, já somos dezenas de fãs ♥ valeu geral", "n2006", 48),
    ("carol_cutee", f"{P}/8973451/pexels-photo-8973451.jpeg?auto=compress&cs=tinysrgb&w=900",
     "neon é meu humor permanente, digam o que quiserem", "y2k", 30),
    ("Fabricio_sk8", f"{U}/photo-1511988617509-a57c8a288659?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
     "os meninos do bairro reunidos, nada pode dar errado (pode)", "normal", 20),
    ("Henrique_rock", f"{U}/photo-1681641090195-5adb0c54eeb0?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
     "ensaio acústico da banda no fim de tarde, vamo que vamo", "n2006", 8),
]

# (índice do post, username, recado, horas_atras)
COMMENTS: list[tuple[int, str, str, int]] = [
    (0, "Anitah_malukah2006", "finalmente uma rede pra gente!! ♥ f/f? cmg tá valendo", 700),
    (0, "Brendah_cd", "parabéns pelo flog, dono!! tá lindo", 690),
    (0, "Joelsilva_rj", "depois que eu atualizar o PC eu posto tbm kk", 680),
    (1, "carol_cutee", "que câmera é essa?? quero uma !!", 290),
    (1, "Caiow_mendes06", "faz um ensaio da galera da quadra aí", 280),
    (1, "Luh_almeida", "linda d+ ♥", 270),
    (2, "Anitah_malukah2006", "vocÊ é a pessoa mais estilosa que eu conheço", 250),
    (2, "carol_cutee", "amei o look!! posta o link dessa cinta", 240),
    (3, "Celsinhow", "amanhã eu tô lá, vou de caneta", 200),
    (3, "Fabricio_sk8", "perdi o racha de novo kkk semana que vem eu vou", 190),
    (4, "Brendah_cd", "que saudade desse dia ♥♥", 160),
    (4, "kauanrobert", "a rede agradece essa foto, tá demais!", 150),
    (5, "Henrique_rock", "quando eu crescer vou ter um desses", 120),
    (5, "kauanrobert", "dono aprova esse setup ☺", 110),
    (7, "Anitah_malukah2006", "kkkkk o placar a gente esquece, o pôr do sol não", 60),
    (7, "Luh_almeida", "paraiba isso, que foto!!", 55),
    (8, "Joelsilva_rj", "15 fãs em uma semana, tá voando", 40),
    (8, "Anitah_malukah2006", "obg pelo espaço, vou postar todo dia!!", 35),
    (9, "Brendah_cd", "as cores desse lugar!! amei", 25),
    (9, "Veronicah_stars", "me leva na próxima ♥", 20),
    (10, "Caiow_mendes06", "o pieiro é de sempre kkk", 15),
    (11, "Anitah_malukah2006", "quando é o show?? quero ir !!", 6),
    (11, "Celsinhow", "vamo junto, quem canta é a gente", 5),
]
COMMENTS += [
    (6, "carol_cutee", "arte sim!! cada parede tem história", 85),
    (10, "Henrique_rock", "ó os meninos aí, sempre reunidos", 12),
]

# quem segue quem (follower, following)
FOLLOWS: list[tuple[str, str]] = [
    ("Anitah_malukah2006", "kauanrobert"), ("Caiow_mendes06", "kauanrobert"),
    ("Brendah_cd", "kauanrobert"), ("Joelsilva_rj", "kauanrobert"),
    ("Luh_almeida", "kauanrobert"), ("Celsinhow", "kauanrobert"),
    ("Veronicah_stars", "kauanrobert"), ("Henrique_rock", "kauanrobert"),
    ("carol_cutee", "kauanrobert"), ("Fabricio_sk8", "kauanrobert"),
    ("kauanrobert", "Anitah_malukah2006"), ("kauanrobert", "Caiow_mendes06"),
    ("kauanrobert", "Brendah_cd"), ("kauanrobert", "Joelsilva_rj"),
    ("kauanrobert", "Luh_almeida"), ("kauanrobert", "Celsinhow"),
    ("kauanrobert", "Veronicah_stars"), ("kauanrobert", "Henrique_rock"),
    ("kauanrobert", "carol_cutee"), ("kauanrobert", "Fabricio_sk8"),
    ("Anitah_malukah2006", "Caiow_mendes06"), ("Anitah_malukah2006", "Brendah_cd"),
    ("Anitah_malukah2006", "Luh_almeida"), ("Brendah_cd", "Anitah_malukah2006"),
    ("Brendah_cd", "Luh_almeida"), ("Brendah_cd", "carol_cutee"),
    ("Caiow_mendes06", "Celsinhow"), ("Celsinhow", "Caiow_mendes06"),
    ("Celsinhow", "Anitah_malukah2006"), ("Joelsilva_rj", "Fabricio_sk8"),
    ("Fabricio_sk8", "Joelsilva_rj"), ("Fabricio_sk8", "Henrique_rock"),
    ("Henrique_rock", "Fabricio_sk8"), ("Henrique_rock", "Anitah_malukah2006"),
    ("Veronicah_stars", "carol_cutee"), ("carol_cutee", "Veronicah_stars"),
    ("carol_cutee", "Anitah_malukah2006"), ("Luh_almeida", "Anitah_malukah2006"),
    ("Luh_almeida", "Celsinhow"), ("Joelsilva_rj", "Anitah_malukah2006"),
]

# (índice do post, [quem curtiu])
LIKES: list[tuple[int, list[str]]] = [
    (0, ["Anitah_malukah2006", "Brendah_cd", "Joelsilva_rj", "carol_cutee", "Celsinhow"]),
    (1, ["kauanrobert", "carol_cutee", "Caiow_mendes06", "Luh_almeida", "Brendah_cd", "Veronicah_stars"]),
    (2, ["Anitah_malukah2006", "carol_cutee", "Luh_almeida"]),
    (3, ["Celsinhow", "Fabricio_sk8", "kauanrobert"]),
    (4, ["Brendah_cd", "Anitah_malukah2006", "kauanrobert", "carol_cutee"]),
    (5, ["Henrique_rock", "kauanrobert", "Fabricio_sk8"]),
    (6, ["carol_cutee", "Brendah_cd", "Anitah_malukah2006"]),
    (7, ["Luh_almeida", "Anitah_malukah2006", "kauanrobert"]),
    (8, ["Joelsilva_rj", "Anitah_malukah2006", "Henrique_rock", "Brendah_cd"]),
    (9, ["Veronicah_stars", "Brendah_cd", "Luh_almeida"]),
    (10, ["Caiow_mendes06", "Henrique_rock", "Joelsilva_rj"]),
    (11, ["Anitah_malukah2006", "Celsinhow", "kauanrobert", "carol_cutee"]),
]


async def main() -> None:
    # Limpa as coleções existentes para garantir que o seed recarrega tudo limpo e sem travamentos
    await db.users.delete_many({})
    await db.posts.delete_many({})
    await db.comments.delete_many({})
    await db.follows.delete_many({})
    await db.messages.delete_many({})

    now = datetime.now(timezone.utc)
    user_ids: dict[str, str] = {}
    avatars: dict[str, str | None] = {}

    for u in USERS:
        doc = {
            "id": uuid.uuid4().hex,
            "username": u["username"],
            "username_lower": u["username"].lower(),
            "display_name": u["display_name"],
            "email": f"{u['username'].lower()}@floguinho.com",
            "password_hash": hash_password(u["password"]),
            "avatar_url": u["avatar"],
            "bio": u["bio"],
            "is_owner": u.get("is_owner", False),
            "verified": u.get("verified", False),
            "created_at": now - timedelta(days=30),
        }
        await db.users.insert_one(doc)
        user_ids[u["username"]] = doc["id"]
        avatars[u["username"]] = u["avatar"]

    post_ids: list[str] = []
    for username, photo, caption, filter_name, hours in POSTS:
        doc = {
            "id": uuid.uuid4().hex,
            "user_id": user_ids[username],
            "username": username,
            "username_lower": username.lower(),
            "avatar_url": avatars[username],
            "photo_url": photo,
            "caption": caption,
            "filter_name": filter_name,
            "is_owner": username == "kauanrobert",
            "liked_by": [],
            "created_at": now - timedelta(hours=hours),
        }
        await db.posts.insert_one(doc)
        post_ids.append(doc["id"])

    for post_idx, username, text, hours in COMMENTS:
        await db.comments.insert_one(
            {
                "id": uuid.uuid4().hex,
                "post_id": post_ids[post_idx],
                "user_id": user_ids[username],
                "username": username,
                "avatar_url": avatars[username],
                "text": text,
                "created_at": now - timedelta(hours=hours),
            }
        )

    for follower, following in FOLLOWS:
        await db.follows.insert_one(
            {
                "id": uuid.uuid4().hex,
                "follower_id": user_ids[follower],
                "following_id": user_ids[following],
                "created_at": now - timedelta(days=10),
            }
        )

    for post_idx, usernames in LIKES:
        await db.posts.update_one(
            {"id": post_ids[post_idx]},
            {"$set": {"liked_by": [user_ids[u] for u in usernames]}},
        )

    # Inserção das mensagens de chat iniciais (Anita e Brenda)
    kauan_id = user_ids["kauanrobert"]
    anita_id = user_ids["Anitah_malukah2006"]
    brenda_id = user_ids["Brendah_cd"]

    messages_seed = [
        {
            "id": uuid.uuid4().hex,
            "from_id": anita_id,
            "from_username": "Anitah_malukah2006",
            "to_id": kauan_id,
            "to_username": "kauanrobert",
            "text": "E aí dono! Adorei a rede nova, sério mesmo ★",
            "read": True,
            "created_at": now - timedelta(hours=2),
        },
        {
            "id": uuid.uuid4().hex,
            "from_id": kauan_id,
            "from_username": "kauanrobert",
            "to_id": anita_id,
            "to_username": "Anitah_malukah2006",
            "text": "Valeu Anita! Aproveita bastante o Floguinho ☺",
            "read": True,
            "created_at": now - timedelta(hours=1, minutes=50),
        },
        {
            "id": uuid.uuid4().hex,
            "from_id": brenda_id,
            "from_username": "Brendah_cd",
            "to_id": kauan_id,
            "to_username": "kauanrobert",
            "text": "Kauan, tem como colocar um filtro mais brilhante no upload de foto? ;*",
            "read": False,
            "created_at": now - timedelta(minutes=15),
        },
    ]

    for msg in messages_seed:
        await db.messages.insert_one(msg)

    await ensure_indexes()
    print(f"seed ok: {len(USERS)} flogs, {len(POSTS)} fotos, {len(COMMENTS)} recados, {len(messages_seed)} mensagens de chat")


if __name__ == "__main__":
    asyncio.run(main())