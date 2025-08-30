from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    username: str
    balance: float

