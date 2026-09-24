from typing import List
from fastapi import FastAPI, APIRouter
from models import StatusCheck
# Certifica-te de importar a instância do banco de dados (ex: de db import db, ou motor/pymongo)
from lib.db import db

app = FastAPI()
api_router = APIRouter()

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Feature routers — every endpoint stays under the /api prefix via api_router.
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.posts import router as posts_router
from routers.uploads import router as uploads_router
from routers.messages import router as messages_router

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(posts_router)
api_router.include_router(uploads_router)
api_router.include_router(messages_router)

# Include the router in the main app under the /api prefix
app.include_router(api_router, prefix="/api")