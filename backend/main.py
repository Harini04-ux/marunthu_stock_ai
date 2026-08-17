from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import Medicine
from pydantic import BaseModel
from datetime import date, timedelta

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marunthu Stock AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Input data format
class MedicineCreate(BaseModel):
    medicine_name: str
    batch_number: str
    quantity: int
    expiry_date: date
    reorder_level: int = 10


@app.get("/")
def home():
    return {
        "message": "Marunthu Stock AI Backend is Running"
    }


# Add medicine
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
        reorder_level=medicine.reorder_level
    )

    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)

    return {
        "message": "Medicine added successfully",
        "medicine_id": new_medicine.id
    }


# View medicines
@app.get("/medicines")
def get_medicines(db: Session = Depends(get_db)):
    medicines = db.query(Medicine).all()

    return medicines
@app.get("/medicines/low-stock")
def get_low_stock(db: Session = Depends(get_db)):
    medicines = db.query(Medicine).filter(
        Medicine.quantity <= Medicine.reorder_level
    ).all()

    return medicines
@app.get("/medicines/expiring-soon")
def get_expiring_medicines(db: Session = Depends(get_db)):
    today = date.today()
    next_30_days = today + timedelta(days=30)

    medicines = db.query(Medicine).filter(
        Medicine.expiry_date >= today,
        Medicine.expiry_date <= next_30_days
    ).all()

    return medicines
@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):

    total_medicines = db.query(Medicine).count()

    total_stock = sum(
        medicine.quantity
        for medicine in db.query(Medicine).all()
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

    return {
        "total_medicines": total_medicines,
        "total_stock": total_stock,
        "low_stock": low_stock,
        "expiring_soon": expiring_soon
    }
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
        return {"message": "Medicine not found"}

    existing_medicine.medicine_name = medicine.medicine_name
    existing_medicine.batch_number = medicine.batch_number
    existing_medicine.quantity = medicine.quantity
    existing_medicine.expiry_date = medicine.expiry_date
    existing_medicine.reorder_level = medicine.reorder_level

    db.commit()
    db.refresh(existing_medicine)

    return {
        "message": "Medicine updated successfully",
        "medicine_id": existing_medicine.id
    }
@app.delete("/medicines/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if not medicine:
        return {"message": "Medicine not found"}

    db.delete(medicine)
    db.commit()

    return {
        "message": "Medicine deleted successfully",
        "medicine_id": medicine_id
    }
@app.get("/medicines/search")
def search_medicine(
    name: str,
    db: Session = Depends(get_db)
):
    medicines = db.query(Medicine).filter(
        Medicine.medicine_name.ilike(f"%{name}%")
    ).all()

    return medicines
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
        return {"message": "Medicine not found"}

    if medicine.quantity < quantity_used:
        return {"message": "Insufficient stock"}

    medicine.quantity -= quantity_used
    db.commit()
    db.refresh(medicine)

    return {
        "message": "Stock updated successfully",
        "medicine_name": medicine.medicine_name,
        "remaining_quantity": medicine.quantity
    }