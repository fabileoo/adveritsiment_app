from fastapi import FastAPI, HTTPException, Depends, Body, Request
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4
import pyodbc
from passlib.hash import bcrypt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
import jwt
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import shutil
from fastapi import UploadFile, File, Request
import os
from fastapi import Form
import stripe
from dotenv import load_dotenv
from argon2 import PasswordHasher
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import PlainTextResponse
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import bcrypt

load_dotenv()


ph = PasswordHasher()
app = FastAPI()
#anti-dudos
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return PlainTextResponse("Too Many Requests", status_code=429)
#platezka
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_ENDPOINT_SECRET")

#rasylka --- kak rabotajet ??
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import secrets  


MAIL_CONFIG = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=(os.getenv("MAIL_STARTTLS") == "True"),
    MAIL_SSL_TLS=(os.getenv("MAIL_SSL_TLS") == "True"),
    USE_CREDENTIALS=(os.getenv("USE_CREDENTIALS") == "True")
)


fm = FastMail(MAIL_CONFIG)

#avatary
AVATAR_DIR = "static/avatars/"
os.makedirs(AVATAR_DIR, exist_ok=True)

#clasic avatar
app.mount("/static", StaticFiles(directory="static"), name="static")

#jwt token
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})

    
    cursor.execute("SELECT id FROM users WHERE username = ?", data["sub"])
    user = cursor.fetchone()
    if user:
        to_encode["user_id"] = user[0]

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_reset_token(email: str, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = {"sub": email, "action": "reset_password"}
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/users/request-password-reset")
@limiter.limit("5/minute")

async def request_password_reset(request: Request, email: str = Body(..., embed=True)):
    cursor.execute("SELECT * FROM users WHERE email = ?", email)
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reset_token = create_reset_token(email)
    reset_link = f"http://127.0.0.1:3000/reset-password?token={reset_token}"
    
    message = MessageSchema(
        subject="Reset your password",
        recipients=[email],
        body=f"Click this link to reset your password: {reset_link}",
        subtype="html"
    )
    
    try:
        await fm.send_message(message)
        return {"message": "Password reset email sent."}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send password reset email")
class ResetPasswordData(BaseModel):
    token: str
    new_password: str

@app.post("/users/reset-password")
@limiter.limit("5/minute")
async def reset_password(request: Request, data: ResetPasswordData):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("action") != "reset_password":
            raise HTTPException(status_code=400, detail="Invalid token action")
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token payload")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    new_hashed_password = ph.hash(data.new_password)
    
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", new_hashed_password, email)
    conn.commit()
    
    return {"message": "Password has been reset successfully."}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id") 
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        cursor.execute("SELECT username FROM users WHERE id = ?", user_id)
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user[0]  
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

from fastapi.middleware.cors import CORSMiddleware

#link good work ??
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


try:
    conn = pyodbc.connect(
        "DRIVER={" + os.getenv("DB_DRIVER") + "};"
        "SERVER=" + os.getenv("DB_SERVER") + ";"
        "DATABASE=" + os.getenv("DB_DATABASE") + ";"
        "UID=" + os.getenv("DB_UID") + ";"
        "PWD=" + os.getenv("DB_PWD") + ";"
        "TrustServerCertificate=yes;"
    )
    cursor = conn.cursor()
except pyodbc.Error as e:
    print("Error connecting to SQL Server:", e)
    raise e


class User(BaseModel):
    user_name: str = Field(..., max_length=50)
    password: str
    email: str = Field(..., max_length=255)


import bcrypt

#popolniashka ??
@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
       
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        username = payment_intent["metadata"].get("username")
        amount = payment_intent["amount_received"] / 100 
        
       
        cursor.execute("UPDATE users SET balance = balance + ? WHERE username = ?", amount, username)
        cursor.execute("UPDATE transactions SET status = ? WHERE user_id = ? AND amount = ? AND status = ?", "completed", username, amount, "pending")
        conn.commit()
    
   
    
    return {"status": "success"}

@app.post("/users/deposit")
async def deposit_balance(
    amount: float = Body(..., embed=True),  # сумма в долларах (или нужной валюте)
    current_user: str = Depends(get_current_user)
):
    try:
        # Создаем PaymentIntent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe принимает сумму в центах
            currency="usd",
            metadata={"username": current_user}
        )
        
        # Сохраняем запись о транзакции со статусом "pending"
        cursor.execute(
            "INSERT INTO transactions (user_id, amount, type, status, timestamp) VALUES (?, ?, ?, ?, ?)",
            current_user, amount, "deposit", "pending", datetime.utcnow()
        )
        conn.commit()
        
        return {"client_secret": payment_intent["client_secret"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/users/upload-avatar")
async def upload_avatar(
    username: str = Depends(get_current_user), 
    file: UploadFile = File(...)
):
    if file.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only PNG and JPG are allowed.")

    file_ext = file.filename.split(".")[-1]
    filename = f"{username}.{file_ext}"
    file_path = os.path.join(AVATAR_DIR, filename)

    # ✅ Создаем папку, если ее нет
    os.makedirs(AVATAR_DIR, exist_ok=True)

    # ✅ Проверяем, записывается ли файл
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    relative_avatar_url = f"/static/avatars/{filename}"
    print(f"✅ Сохраненный путь в БД: {relative_avatar_url}")

    cursor.execute("UPDATE users SET avatar_url = ? WHERE username = ?", (relative_avatar_url, username))
    conn.commit()

    return {"message": "Avatar uploaded successfully", "avatar_url": relative_avatar_url}

@app.get("/users/me")
async def read_users_me(username: str = Depends(get_current_user)):
    cursor.execute("SELECT username, balance, avatar_url FROM users WHERE username = ?", username)
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user[0],
        "balance": user[1],
        "avatar_url": user[2] if user[2] else "/static/default-avatar.png"
    }


@app.post("/users/register")
@limiter.limit("5/minute")
async def register_user(request: Request, user: User):
    cursor.execute("SELECT * FROM users WHERE username = ?", user.user_name)
    existing_user = cursor.fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    cursor.execute("SELECT * FROM users WHERE email = ?", user.email)
    existing_email = cursor.fetchone()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Используем Argon2 для хеширования пароля
    hashed_password = ph.hash(user.password)
    
    cursor.execute(
        "INSERT INTO users (username, email, password, balance, is_verified) VALUES (?, ?, ?, ?, ?)",
        user.user_name, user.email, hashed_password, 0.0, 0
    )
    conn.commit()

    confirmation_token = create_access_token({"sub": user.email})
    message = MessageSchema(
        subject="Confirm your email",
        recipients=[user.email],
        body=f"Click this link to confirm your email: http://127.0.0.1:8000/users/confirm?token={confirmation_token}",
        subtype="html"
    )

    try:
        await fm.send_message(message)
        return {"message": "User registered successfully! Confirmation email sent!"}
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send confirmation email")

class LoginData(BaseModel):
    user_name: str
    password: str

@app.post("/users/login")
@limiter.limit("5/minute")
async def login_user(request: Request,data: LoginData):
    cursor.execute("SELECT username, email, password, balance, is_verified FROM users WHERE username = ? OR email = ?", data.user_name, data.user_name)
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    username, email, hashed_password, balance, is_verified = user
    try:
        ph.verify(hashed_password, data.password)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please check your email.")
    
    access_token = create_access_token(data={"sub": username})
    return {"message": "Login successful", "username": username, "email": email, "balance": balance, "access_token": access_token}

#podtwerzdenije poczty
@app.post("/users/send-confirmation")
async def send_confirmation_email(email: str):
    cursor.execute("SELECT * FROM users WHERE email = ?", email)
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    confirmation_token = create_access_token({"sub": email})  # Генерируем токен

    message = MessageSchema(
        subject="Confirm your email",
        recipients=[email],
        body=f"Click this link to confirm your email: http://127.0.0.1:8000/users/confirm?token={confirmation_token}",
        subtype="html"
    )

    await fm.send_message(message)
    return {"message": "Confirmation email sent!"}



class UpdateUser(BaseModel):
    username: str
    password: Optional[str] = None

@app.patch("/users/update")
async def update_user(data: UpdateUser, username: str = Depends(get_current_user)):
    cursor.execute("SELECT id FROM users WHERE username = ?", username)
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    if data.password:
        hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", hashed_password, user_id)

    if data.username and data.username != username:
        cursor.execute("SELECT * FROM users WHERE username = ?", data.username)
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")

        cursor.execute("UPDATE users SET username = ? WHERE id = ?", data.username, user_id)

    conn.commit()

    # ✅ Создаем новый токен с обновленным user_id и username
    new_token = create_access_token({"sub": data.username})

    return {"message": "Profile updated successfully", "new_username": data.username, "new_token": new_token}


@app.delete("/users/delete")
async def delete_user(username: str = Depends(get_current_user)):  # ✅ Правильный способ получать username
    cursor.execute("SELECT * FROM users WHERE username = ?", username)
    user = cursor.fetchone()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("DELETE FROM users WHERE username = ?", username)
    conn.commit()
    
    return {"message": "User deleted successfully"}

from fastapi.responses import RedirectResponse

#podtwerzdenije email polzowateel
@app.get("/users/confirm")
async def confirm_email(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    cursor.execute("UPDATE users SET is_verified = 1 WHERE email = ?", email)
    conn.commit()
    
    # ✅ Редиректим на React-страницу подтверждения
    return RedirectResponse(url="http://127.0.0.1:3000/email-confirm?success=true")


@app.get("/users/{username}")
async def get_user(username: str):
    cursor.execute("SELECT * FROM users WHERE username = ?", username)
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user[1], "balance": user[2]}  # Индексы совпадают со структурой таблицы

@app.patch("/users/{username}/balance")
async def update_user_balance(username: str, amount: float):
    cursor.execute("SELECT balance FROM users WHERE username = ?", username)
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_balance = user[0] + amount
    cursor.execute("UPDATE users SET balance = ? WHERE username = ?", new_balance, username)
    conn.commit()
    return {"message": "Balance updated successfully", "new_balance": new_balance}

#  kak rabotajet ??
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
