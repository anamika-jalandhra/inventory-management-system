from pydantic import BaseModel

class ProductCreate(BaseModel):
    sku: str
    name: str
    description: str
    price: float
    stock_quantity: int

class ProductUpdate(BaseModel):
    name: str
    description: str
    price: float
    stock_quantity: int