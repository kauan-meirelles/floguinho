"""Shared Mongo handle — import `client`/`db` from here (server.py, routers, seed.py)."""

import logging
import os
from pathlib import Path

certifi_ok = True
try:
    import certifi
except ImportError:
    certifi_ok = False

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

# Carrega o .env explicitamente subindo duas pastas a partir de lib/ para a raiz do projeto (floguinho/.env)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

mongo_url = os.environ["MONGO_URL"]

# Conecta passando o certifi e ignorando falhas estritas de handshake no Windows se necessário
client_kwargs = {"tls": True, "tlsAllowInvalidCertificates": True}
if certifi_ok:
    client_kwargs["tlsCAFile"] = certifi.where()

client = AsyncIOMotorClient(mongo_url, **client_kwargs)
db = client[os.environ["DB_NAME"]]

logger = logging.getLogger(__name__)

# One entry per collection: every field a route filters, sorts, or dedupes on. Applied by ensure_indexes() at startup.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [IndexModel([("timestamp", DESCENDING)], name="timestamp_desc")],
    "users": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("username_lower", ASCENDING)], name="username_lower", unique=True),
    ],
    "sessions": [
        IndexModel([("token", ASCENDING)], name="token", unique=True),
        IndexModel([("user_id", ASCENDING)], name="user_id"),
    ],
    "follows": [
        IndexModel(
            [("follower_id", ASCENDING), ("following_id", ASCENDING)], name="pair", unique=True
        ),
        IndexModel([("following_id", ASCENDING)], name="following_idx"),
    ],
    "posts": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("created_at", DESCENDING)], name="created_desc"),
        IndexModel([("username_lower", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
    ],
    "comments": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("post_id", ASCENDING), ("created_at", ASCENDING)], name="post_created"),
    ],
    "messages": [
        IndexModel([("to_id", ASCENDING), ("from_id", ASCENDING)], name="to_from"),
        IndexModel([("from_id", ASCENDING), ("to_id", ASCENDING)], name="from_to"),
        IndexModel([("to_id", ASCENDING), ("read", ASCENDING)], name="to_read"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)