import pyodbc

# Подключение к SQL Server
conn = pyodbc.connect(
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=localhost,1433;"
    "DATABASE=totalizator;"
    "UID=SA;"
    "PWD=Lily2828;"
    "TrustServerCertificate=yes;"
)

cursor = conn.cursor()

def add_user(username:str, balance: float):
    cursor.execute("INSERT INTO users (username, balance) VALUES (?, ?)", username, balance)
    conn.commit()
    return cursor.rowcount

def get_user(username: str):
    cursor.execute("Select * from users Where username = ?", username)
    return cursor.fetchone()

def update_balance(username: str, amount: float):
    cursor.execute("Update users set balance = balance + ? where username = ?", amount, username)
    cursor.commit()

def create_race(race_id: str, track: str, status: str = "pending"):
    cursor.execute("Insert Into races (race_id, track, status) values(?,?,?)", race_id, track, status) 
    conn.commit()
    return cursor.rowcount   

def update_race_status(race_id:str, status: str, winner: str = None):
    cursor.execute("Update races Set status = ?, winner = ? where race_id = ?", status, winner, race_id)
    conn.commit()
    return cursor.rowcount

def add_bet(user_id: int, race_id: int, bot_id: str, amount: float)  :
    cursor.execute("Insert Into bets (user_id, race_id, bot_id, amount) values (?,?,?,?)", user_id, race_id, bot_id, amount)
    cursor.commit()
    return cursor.rowcount

def get_bets_by_user(user_id: int):
    cursor.execute("Select * from bets where user_id = ?", user_id)
    return cursor.fetchall()

def get_bets_by_race(race_id: int):
    cursor.execute("Select * from bets where race_id = ?", race_id )
    return cursor.fetchall()




