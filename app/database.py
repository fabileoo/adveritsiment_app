import os
import pyodbc

# Подключение к SQL Server
conn = pyodbc.connect(
     f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
    f"SERVER={os.getenv('DB_SERVER')};"
    f"DATABASE={os.getenv('DB_DATABASE')};"
    f"UID={os.getenv('DB_UID')};"
    f"PWD={os.getenv('DB_PWD')};"
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




