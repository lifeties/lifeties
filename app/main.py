from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from .config import SECRET_KEY
from .db import Base, engine
from .routers import admin, host, public, venue

Base.metadata.create_all(engine)

app = FastAPI(title="LifeTies 데모", docs_url=None, redoc_url=None)
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, same_site="lax", https_only=False)
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")
for r in (public.router, host.router, venue.router, admin.router):
    app.include_router(r)


@app.get("/healthz")
def healthz():
    return {"ok": True}
