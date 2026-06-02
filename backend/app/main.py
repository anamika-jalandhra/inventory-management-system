from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order

from app.routes.product import router as product_router
from app.routes.customer import router as customer_router
from app.routes.order import router as order_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory API",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will restrict later after frontend is deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)

@app.get("/")
def root():
    return {"message": "Inventory Management API Running"}