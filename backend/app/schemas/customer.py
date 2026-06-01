from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str


class CustomerUpdate(BaseModel):
    name: str
    email: str
    phone: str