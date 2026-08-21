from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import Medicine, Consumption, Indent, User
from pydantic import BaseModel
from datetime import date, timedelta, datetime
from jose import JWTError, jwt
from passlib.context import CryptContext
import tempfile
import os
import joblib
import speech_recognition as sr

from ocr import extract_text


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Marunthu Stock AI",
    description="Intelligent Pharmacy Management System",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://sentences-latin-albert-organizing.trycloudflare.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTHENTICATION
# ============================================================

SECRET_KEY = "marunthu-stock-ai-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


# ============================================================
# LOAD ML MODEL
# ============================================================

model = joblib.load("medicine_stock_model.pkl")


# ============================================================
# CREATE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# SCHEMAS
# ============================================================

class MedicineCreate(BaseModel):
    medicine_name: str
    batch_number: str
    quantity: int
    expiry_date: date
    reorder_level: int = 10
    phc_id: int = 1


class ConsumptionCreate(BaseModel):
    medicine_id: int
    quantity_used: int


class IndentCreate(BaseModel):
    medicine_id: int
    requested_quantity: int
    current_stock: int
    predicted_quantity: int
    priority: str = "Medium"
    reason: str = ""


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "pharmacist"


class LoginRequest(BaseModel):
    username: str
    password: str


# ============================================================
# HELPER - PHC DISPLAY NAME
# ============================================================

def get_phc_name(medicine):
    phc_id = getattr(medicine, "phc_id", None)

    if phc_id is None:
        return "Unknown PHC"

    return f"PHC-{phc_id}"


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================
# JWT
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Marunthu Stock AI Backend is Running",
        "version": "1.0.0"
    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/register")
def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        return {
            "success": False,
            "message": "Username already exists"
        }

    # bcrypt supports passwords up to 72 bytes.
    # Prevent an unhandled 500 error for longer passwords.
    if len(data.password.encode("utf-8")) > 72:
        return {
            "success": False,
            "message": "Password must be 72 bytes or less"
        }

    hashed_password = hash_password(data.password)

    new_user = User(
        username=data.username,
        password_hash=hashed_password,
        role=data.role,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User registered successfully",
        "user_id": new_user.id,
        "username": new_user.username,
        "role": new_user.role
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login_user(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user:
        return {
            "success": False,
            "message": "Invalid username or password"
        }

    if not user.is_active:
        return {
            "success": False,
            "message": "User account is inactive"
        }

    if not verify_password(data.password, user.password_hash):
        return {
            "success": False,
            "message": "Invalid username or password"
        }

    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role
        },
        expires_delta=timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/me")
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if username is None:
            return {
                "success": False,
                "message": "Invalid token"
            }

    except JWTError:
        return {
            "success": False,
            "message": "Invalid or expired token"
        }

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    return {
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "is_active": user.is_active
        }
    }


# ============================================================
# ADD MEDICINE
# ============================================================

@app.post("/medicines")
def add_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db)
):
    new_medicine = Medicine(
        medicine_name=medicine.medicine_name,
        batch_number=medicine.batch_number,
        quantity=medicine.quantity,
        expiry_date=medicine.expiry_date,
        reorder_level=medicine.reorder_level,
        phc_id=medicine.phc_id
    )

    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)

    return {
        "success": True,
        "message": "Medicine added successfully",
        "medicine_id": new_medicine.id,
        "phc_id": getattr(new_medicine, "phc_id", None)
    }


# ============================================================
# SEARCH MEDICINE
# ============================================================

@app.get("/medicines/search")
def search_medicine(
    name: str,
    db: Session = Depends(get_db)
):
    medicines = db.query(Medicine).filter(
        Medicine.medicine_name.ilike(f"%{name}%")
    ).all()

    return medicines


# ============================================================
# GET ALL MEDICINES
# ============================================================

@app.get("/medicines")
def get_medicines(
    db: Session = Depends(get_db)
):
    return db.query(Medicine).all()


# ============================================================
# LOW STOCK
# ============================================================

@app.get("/medicines/low-stock")
def get_low_stock(
    db: Session = Depends(get_db)
):
    return db.query(Medicine).filter(
        Medicine.quantity <= Medicine.reorder_level
    ).all()


# ============================================================
# EXPIRING SOON
# ============================================================

@app.get("/medicines/expiring-soon")
def get_expiring_medicines(
    db: Session = Depends(get_db)
):
    today = date.today()
    next_30_days = today + timedelta(days=30)

    return db.query(Medicine).filter(
        Medicine.expiry_date >= today,
        Medicine.expiry_date <= next_30_days
    ).all()


# ============================================================
# PHARMACIST DASHBOARD
# ============================================================

@app.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db)
):
    medicines = db.query(Medicine).all()

    total_medicines = len(medicines)

    total_stock = sum(
        medicine.quantity for medicine in medicines
    )

    low_stock = db.query(Medicine).filter(
        Medicine.quantity <= Medicine.reorder_level
    ).count()

    today = date.today()
    next_30_days = today + timedelta(days=30)

    expiring_soon = db.query(Medicine).filter(
        Medicine.expiry_date >= today,
        Medicine.expiry_date <= next_30_days
    ).count()

    pending_indents = db.query(Indent).filter(
        Indent.status == "Pending"
    ).count()

    return {
        "total_medicines": total_medicines,
        "total_stock": total_stock,
        "low_stock": low_stock,
        "expiring_soon": expiring_soon,
        "pending_indents": pending_indents
    }


# ============================================================
# DHO DASHBOARD
# ============================================================

@app.get("/dho/dashboard")
def get_dho_dashboard(
    db: Session = Depends(get_db)
):
    # IMPORTANT:
    # Medicine now uses phc_id because the database contains
    # phc_id and does not contain phc_name.

    medicines = db.query(Medicine).all()

    today = date.today()
    next_30_days = today + timedelta(days=30)

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    phc_ids = {
        getattr(medicine, "phc_id", None)
        for medicine in medicines
        if getattr(medicine, "phc_id", None) is not None
    }

    total_phcs = len(phc_ids)

    total_medicines = len(medicines)

    total_stock = sum(
        medicine.quantity for medicine in medicines
    )

    low_stock_medicines = [
        medicine
        for medicine in medicines
        if medicine.quantity <= medicine.reorder_level
    ]

    expiring_medicines = [
        medicine
        for medicine in medicines
        if (
            medicine.expiry_date >= today
            and medicine.expiry_date <= next_30_days
        )
    ]

    pending_indents = db.query(Indent).filter(
        Indent.status == "Pending"
    ).all()

    # --------------------------------------------------------
    # PHC-WISE SUMMARY
    # --------------------------------------------------------

    phc_data = {}

    for medicine in medicines:

        phc_id = getattr(medicine, "phc_id", None)

        if phc_id is None:
            phc_id = 0

        phc_name = f"PHC-{phc_id}" if phc_id != 0 else "Unknown PHC"

        if phc_id not in phc_data:
            phc_data[phc_id] = {
                "phc_id": phc_id,
                "phc_name": phc_name,
                "total_medicines": 0,
                "total_stock": 0,
                "low_stock": 0,
                "expiring_soon": 0,
                "pending_indents": 0,
                "status": "Healthy"
            }

        phc_data[phc_id]["total_medicines"] += 1
        phc_data[phc_id]["total_stock"] += medicine.quantity

        if medicine.quantity <= medicine.reorder_level:
            phc_data[phc_id]["low_stock"] += 1

        if (
            medicine.expiry_date >= today
            and medicine.expiry_date <= next_30_days
        ):
            phc_data[phc_id]["expiring_soon"] += 1

    # --------------------------------------------------------
    # PENDING INDENTS PHC-WISE
    # --------------------------------------------------------

    for indent in pending_indents:

        medicine = db.query(Medicine).filter(
            Medicine.id == indent.medicine_id
        ).first()

        if medicine:

            phc_id = getattr(medicine, "phc_id", None)

            if phc_id is None:
                phc_id = 0

            phc_name = (
                f"PHC-{phc_id}"
                if phc_id != 0
                else "Unknown PHC"
            )

            if phc_id not in phc_data:
                phc_data[phc_id] = {
                    "phc_id": phc_id,
                    "phc_name": phc_name,
                    "total_medicines": 0,
                    "total_stock": 0,
                    "low_stock": 0,
                    "expiring_soon": 0,
                    "pending_indents": 0,
                    "status": "Healthy"
                }

            phc_data[phc_id]["pending_indents"] += 1

    # --------------------------------------------------------
    # PHC STATUS
    # --------------------------------------------------------

    for phc_id, data in phc_data.items():

        if data["low_stock"] > 0:
            data["status"] = "Critical"

        elif data["expiring_soon"] > 0:
            data["status"] = "Warning"

        elif data["pending_indents"] > 0:
            data["status"] = "Pending"

        else:
            data["status"] = "Healthy"

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "success": True,

        "dashboard_date": str(today),

        "summary": {
            "total_phcs": total_phcs,
            "total_medicines": total_medicines,
            "total_stock": total_stock,
            "low_stock": len(low_stock_medicines),
            "expiring_soon": len(expiring_medicines),
            "pending_indents": len(pending_indents)
        },

        "phc_wise_data": list(phc_data.values()),

        "low_stock_medicines": [
            {
                "id": medicine.id,
                "phc_id": getattr(medicine, "phc_id", None),
                "phc_name": get_phc_name(medicine),
                "medicine_name": medicine.medicine_name,
                "batch_number": medicine.batch_number,
                "quantity": medicine.quantity,
                "reorder_level": medicine.reorder_level
            }
            for medicine in low_stock_medicines
        ],

        "expiring_medicines": [
            {
                "id": medicine.id,
                "phc_id": getattr(medicine, "phc_id", None),
                "phc_name": get_phc_name(medicine),
                "medicine_name": medicine.medicine_name,
                "batch_number": medicine.batch_number,
                "quantity": medicine.quantity,
                "expiry_date": str(medicine.expiry_date)
            }
            for medicine in expiring_medicines
        ],

        "pending_indents": [
            {
                "id": indent.id,
                "indent_number": indent.indent_number,
                "medicine_id": indent.medicine_id,
                "requested_quantity": indent.requested_quantity,
                "current_stock": indent.current_stock,
                "predicted_quantity": indent.predicted_quantity,
                "priority": indent.priority,
                "reason": indent.reason,
                "status": indent.status,
                "requested_date": str(indent.requested_date)
            }
            for indent in pending_indents
        ]
    }


# ============================================================
# UPDATE MEDICINE
# ============================================================

@app.put("/medicines/{medicine_id}")
def update_medicine(
    medicine_id: int,
    medicine: MedicineCreate,
    db: Session = Depends(get_db)
):
    existing_medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if not existing_medicine:
        return {
            "success": False,
            "message": "Medicine not found"
        }

    existing_medicine.medicine_name = medicine.medicine_name
    existing_medicine.batch_number = medicine.batch_number
    existing_medicine.quantity = medicine.quantity
    existing_medicine.expiry_date = medicine.expiry_date
    existing_medicine.reorder_level = medicine.reorder_level
    existing_medicine.phc_id = medicine.phc_id

    db.commit()
    db.refresh(existing_medicine)

    return {
        "success": True,
        "message": "Medicine updated successfully",
        "medicine_id": existing_medicine.id
    }


# ============================================================
# DELETE MEDICINE
# ============================================================

@app.delete("/medicines/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if not medicine:
        return {
            "success": False,
            "message": "Medicine not found"
        }

    db.delete(medicine)
    db.commit()

    return {
        "success": True,
        "message": "Medicine deleted successfully",
        "medicine_id": medicine_id
    }


# ============================================================
# CONSUME MEDICINE
# ============================================================

@app.put("/medicines/{medicine_id}/consume")
def consume_medicine(
    medicine_id: int,
    quantity_used: int,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if not medicine:
        return {
            "success": False,
            "message": "Medicine not found"
        }

    if quantity_used <= 0:
        return {
            "success": False,
            "message": "Quantity must be greater than 0"
        }

    if medicine.quantity < quantity_used:
        return {
            "success": False,
            "message": "Insufficient stock"
        }

    medicine.quantity -= quantity_used

    db.commit()
    db.refresh(medicine)

    return {
        "success": True,
        "message": "Stock updated successfully",
        "medicine_name": medicine.medicine_name,
        "remaining_quantity": medicine.quantity
    }


# ============================================================
# CONSUMPTION
# ============================================================

@app.post("/consumption")
def add_consumption(
    data: ConsumptionCreate,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == data.medicine_id
    ).first()

    if not medicine:
        return {
            "success": False,
            "message": "Medicine not found"
        }

    if data.quantity_used <= 0:
        return {
            "success": False,
            "message": "Quantity must be greater than 0"
        }

    if medicine.quantity < data.quantity_used:
        return {
            "success": False,
            "message": "Insufficient stock"
        }

    medicine.quantity -= data.quantity_used

    consumption = Consumption(
        medicine_id=data.medicine_id,
        quantity_used=data.quantity_used,
        consumed_date=date.today()
    )

    db.add(consumption)
    db.commit()
    db.refresh(consumption)

    return {
        "success": True,
        "message": "Consumption recorded successfully",
        "medicine_id": data.medicine_id,
        "quantity_used": data.quantity_used,
        "remaining_stock": medicine.quantity
    }


# ============================================================
# STOCK PREDICTION
# ============================================================

@app.get("/prediction/{medicine_id}")
def predict_stock(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if not medicine:
        return {
            "success": False,
            "message": "Medicine not found"
        }

    consumption_records = db.query(Consumption).filter(
        Consumption.medicine_id == medicine_id
    ).all()

    if not consumption_records:
        return {
            "medicine_name": medicine.medicine_name,
            "message": "Not enough consumption data for prediction"
        }

    total_used = sum(
        record.quantity_used
        for record in consumption_records
    )

    days = len(consumption_records)

    average_daily_usage = total_used / days

    predicted_30_day_demand = round(
        average_daily_usage * 30
    )

    current_stock = medicine.quantity

    if current_stock < predicted_30_day_demand:
        reorder_required = True
        recommended_order = (
            predicted_30_day_demand - current_stock
        )
    else:
        reorder_required = False
        recommended_order = 0

    return {
        "medicine_id": medicine.id,
        "medicine_name": medicine.medicine_name,
        "current_stock": current_stock,
        "average_daily_usage": round(
            average_daily_usage, 2
        ),
        "predicted_30_day_demand": predicted_30_day_demand,
        "reorder_required": reorder_required,
        "recommended_order_quantity": recommended_order
    }


# ============================================================
# NOTIFICATIONS
# ============================================================

@app.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db)
):
    today = date.today()
    next_30_days = today + timedelta(days=30)

    low_stock = db.query(Medicine).filter(
        Medicine.quantity <= Medicine.reorder_level
    ).all()

    expiring = db.query(Medicine).filter(
        Medicine.expiry_date >= today,
        Medicine.expiry_date <= next_30_days
    ).all()

    notifications = []

    for medicine in low_stock:
        notifications.append({
            "type": "LOW_STOCK",
            "medicine_id": medicine.id,
            "medicine_name": medicine.medicine_name,
            "batch_number": medicine.batch_number,
            "phc_id": getattr(medicine, "phc_id", None),
            "phc_name": get_phc_name(medicine),
            "message": f"{medicine.medicine_name} stock is low",
            "quantity": medicine.quantity,
            "reorder_level": medicine.reorder_level,
            "expiry_date": str(medicine.expiry_date)
        })

    for medicine in expiring:
        notifications.append({
            "type": "EXPIRY",
            "medicine_id": medicine.id,
            "medicine_name": medicine.medicine_name,
            "batch_number": medicine.batch_number,
            "phc_id": getattr(medicine, "phc_id", None),
            "phc_name": get_phc_name(medicine),
            "message": f"{medicine.medicine_name} is expiring soon",
            "quantity": medicine.quantity,
            "reorder_level": medicine.reorder_level,
            "expiry_date": str(medicine.expiry_date)
        })

    return {
        "success": True,
        "total_notifications": len(notifications),
        "notifications": notifications
    }


# ============================================================
# OCR MEDICINE
# ============================================================

@app.post("/ocr")
async def ocr_medicine(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:
        temp.write(await file.read())
        temp_path = temp.name

    try:
        text = extract_text(temp_path)

        medicine_name = "Unknown Medicine"
        batch_number = "UNKNOWN"
        quantity = 0
        expiry_date = None
        reorder_level = 10

        lines = [
            line.strip()
            for line in text.split("\n")
            if line.strip()
        ]

        for line in lines:
            if "medicine_name" in line.lower():
                continue

            if "paracetamol" in line.lower():
                medicine_name = "Paracetamol 500mg"
                break

        for line in lines:
            if "batch" in line.lower():
                parts = line.split()

                for part in parts:
                    if any(char.isdigit() for char in part):
                        batch_number = part
                        break

        for line in lines:
            if "quantity" in line.lower():
                continue

            if line.isdigit():
                number = int(line)

                if number > 0:
                    quantity = number
                    break

        for line in lines:
            if "expiry" in line.lower():
                continue

            try:
                expiry_date = date.fromisoformat(line)
                break
            except ValueError:
                pass

        if expiry_date is None:
            expiry_date = date.today()

        new_medicine = Medicine(
            medicine_name=medicine_name,
            batch_number=batch_number,
            quantity=quantity,
            expiry_date=expiry_date,
            reorder_level=reorder_level,
            phc_id=1
        )

        db.add(new_medicine)
        db.commit()
        db.refresh(new_medicine)

        return {
            "success": True,
            "message": "Medicine extracted and saved successfully",
            "medicine": {
                "id": new_medicine.id,
                "medicine_name": new_medicine.medicine_name,
                "batch_number": new_medicine.batch_number,
                "quantity": new_medicine.quantity,
                "expiry_date": str(new_medicine.expiry_date),
                "reorder_level": new_medicine.reorder_level,
                "phc_id": getattr(new_medicine, "phc_id", None),
                "phc_name": get_phc_name(new_medicine)
            },
            "extracted_text": text
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ============================================================
# VOICE INPUT
# ============================================================

@app.post("/voice")
async def voice_input(
    file: UploadFile = File(...)
):
    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp:
        temp.write(await file.read())
        temp_path = temp.name

    try:
        recognizer = sr.Recognizer()

        with sr.AudioFile(temp_path) as source:
            audio = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio)

            return {
                "success": True,
                "text": text
            }

        except sr.UnknownValueError:
            return {
                "success": False,
                "message": "Could not understand the voice"
            }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ============================================================
# MACHINE LEARNING PREDICTION
# ============================================================

@app.post("/predict")
def predict_consumption(
    quantity: int,
    reorder_level: int
):
    prediction = model.predict([
        [quantity, reorder_level]
    ])

    return {
        "current_stock": quantity,
        "reorder_level": reorder_level,
        "predicted_consumption": round(
            float(prediction[0]), 2
        )
    }


# ============================================================
# CREATE INDENT
# ============================================================

@app.post("/indents")
def create_indent(
    data: IndentCreate,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == data.medicine_id
    ).first()

    if not medicine:
        return {
            "success": False,
            "message": "Medicine not found"
        }

    if data.requested_quantity <= 0:
        return {
            "success": False,
            "message": "Requested quantity must be greater than 0"
        }

    indent_count = db.query(Indent).count() + 1

    indent_number = (
        f"IND-"
        f"{date.today().strftime('%Y%m%d')}-"
        f"{indent_count:03d}"
    )

    new_indent = Indent(
        indent_number=indent_number,
        medicine_id=data.medicine_id,
        requested_quantity=data.requested_quantity,
        current_stock=data.current_stock,
        predicted_quantity=data.predicted_quantity,
        priority=data.priority,
        reason=data.reason,
        status="Pending",
        requested_date=date.today()
    )

    db.add(new_indent)
    db.commit()
    db.refresh(new_indent)

    return {
        "success": True,
        "message": "Indent created successfully",
        "indent": {
            "id": new_indent.id,
            "indent_number": new_indent.indent_number,
            "medicine_id": new_indent.medicine_id,
            "medicine_name": medicine.medicine_name,
            "phc_id": getattr(medicine, "phc_id", None),
            "phc_name": get_phc_name(medicine),
            "requested_quantity": new_indent.requested_quantity,
            "current_stock": new_indent.current_stock,
            "predicted_quantity": new_indent.predicted_quantity,
            "priority": new_indent.priority,
            "reason": new_indent.reason,
            "status": new_indent.status,
            "requested_date": str(new_indent.requested_date)
        }
    }


# ============================================================
# GET ALL INDENTS
# ============================================================

@app.get("/indents")
def get_indents(
    db: Session = Depends(get_db)
):
    indents = db.query(Indent).all()

    result = []

    for indent in indents:

        medicine = db.query(Medicine).filter(
            Medicine.id == indent.medicine_id
        ).first()

        result.append({
            "id": indent.id,
            "indent_number": indent.indent_number,
            "medicine_id": indent.medicine_id,
            "medicine_name": (
                medicine.medicine_name
                if medicine
                else "Unknown"
            ),
            "phc_id": (
                getattr(medicine, "phc_id", None)
                if medicine
                else None
            ),
            "phc_name": (
                get_phc_name(medicine)
                if medicine
                else "Unknown PHC"
            ),
            "requested_quantity": indent.requested_quantity,
            "current_stock": indent.current_stock,
            "predicted_quantity": indent.predicted_quantity,
            "priority": indent.priority,
            "reason": indent.reason,
            "status": indent.status,
            "requested_date": str(indent.requested_date),
            "approved_date": (
                str(indent.approved_date)
                if indent.approved_date
                else None
            )
        })

    return {
        "total_indents": len(result),
        "indents": result
    }


# ============================================================
# GET ONE INDENT
# ============================================================

@app.get("/indents/{indent_id}")
def get_indent(
    indent_id: int,
    db: Session = Depends(get_db)
):
    indent = db.query(Indent).filter(
        Indent.id == indent_id
    ).first()

    if not indent:
        return {
            "success": False,
            "message": "Indent not found"
        }

    medicine = db.query(Medicine).filter(
        Medicine.id == indent.medicine_id
    ).first()

    return {
        "id": indent.id,
        "indent_number": indent.indent_number,
        "medicine_id": indent.medicine_id,
        "medicine_name": (
            medicine.medicine_name
            if medicine
            else "Unknown"
        ),
        "phc_id": (
            getattr(medicine, "phc_id", None)
            if medicine
            else None
        ),
        "phc_name": (
            get_phc_name(medicine)
            if medicine
            else "Unknown PHC"
        ),
        "requested_quantity": indent.requested_quantity,
        "current_stock": indent.current_stock,
        "predicted_quantity": indent.predicted_quantity,
        "priority": indent.priority,
        "reason": indent.reason,
        "status": indent.status,
        "requested_date": str(indent.requested_date),
        "approved_date": (
            str(indent.approved_date)
            if indent.approved_date
            else None
        )
    }


# ============================================================
# APPROVE INDENT
# ============================================================

@app.put("/indents/{indent_id}/approve")
def approve_indent(
    indent_id: int,
    db: Session = Depends(get_db)
):
    indent = db.query(Indent).filter(
        Indent.id == indent_id
    ).first()

    if not indent:
        return {
            "success": False,
            "message": "Indent not found"
        }

    if indent.status != "Pending":
        return {
            "success": False,
            "message": f"Indent is already {indent.status}"
        }

    indent.status = "Approved"
    indent.approved_date = date.today()

    db.commit()
    db.refresh(indent)

    return {
        "success": True,
        "message": "Indent approved successfully",
        "indent_id": indent.id,
        "indent_number": indent.indent_number,
        "status": indent.status,
        "approved_date": str(indent.approved_date)
    }


# ============================================================
# REJECT INDENT
# ============================================================

@app.put("/indents/{indent_id}/reject")
def reject_indent(
    indent_id: int,
    db: Session = Depends(get_db)
):
    indent = db.query(Indent).filter(
        Indent.id == indent_id
    ).first()

    if not indent:
        return {
            "success": False,
            "message": "Indent not found"
        }

    if indent.status != "Pending":
        return {
            "success": False,
            "message": f"Indent is already {indent.status}"
        }

    indent.status = "Rejected"

    db.commit()
    db.refresh(indent)

    return {
        "success": True,
        "message": "Indent rejected successfully",
        "indent_id": indent.id,
        "indent_number": indent.indent_number,
        "status": indent.status
    }
