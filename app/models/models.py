from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    username: str
    balance: float

class Race(BaseModel):
    race_id: str
    track: str
    bots: List[str]
    status: str = "pending"
    winner: Optional[str] = None

class Bet(BaseModel):
    user_id: str
    race_is: str
    bot_id : str
    amount: float
    
