from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    sku = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)

    description = Column(String)

    price = Column(Float, nullable=False)

    stock_quantity = Column(Integer, default=0)