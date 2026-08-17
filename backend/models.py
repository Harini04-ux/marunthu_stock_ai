from sqlalchemy import Column, Integer, String, Date
from database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String, nullable=False)
    batch_number = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    expiry_date = Column(Date, nullable=False)
    reorder_level = Column(Integer, default=10)