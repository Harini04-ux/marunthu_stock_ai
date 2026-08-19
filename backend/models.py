from sqlalchemy import Column, Integer, String, Date, Boolean
from database import Base
from datetime import date


# ============================================================
# MEDICINE STOCK TABLE
# ============================================================

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    medicine_name = Column(
        String,
        nullable=False
    )

    batch_number = Column(
        String,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    expiry_date = Column(
        Date,
        nullable=False
    )

    reorder_level = Column(
        Integer,
        default=10
    )


# ============================================================
# MEDICINE CONSUMPTION TABLE
# ============================================================

class Consumption(Base):
    __tablename__ = "consumption"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    medicine_id = Column(
        Integer,
        nullable=False
    )

    quantity_used = Column(
        Integer,
        nullable=False
    )

    consumed_date = Column(
        Date,
        default=date.today
    )


# ============================================================
# MEDICINE INDENT MANAGEMENT TABLE
# ============================================================

class Indent(Base):
    __tablename__ = "indents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Unique indent number
    indent_number = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    # Medicine ID
    medicine_id = Column(
        Integer,
        nullable=False
    )

    # Quantity requested by PHC
    requested_quantity = Column(
        Integer,
        nullable=False
    )

    # Current available stock
    current_stock = Column(
        Integer,
        nullable=False
    )

    # AI predicted quantity required
    predicted_quantity = Column(
        Integer,
        nullable=False
    )

    # Priority
    # Low / Medium / High
    priority = Column(
        String,
        default="Medium"
    )

    # Reason for indent
    reason = Column(
        String,
        nullable=True
    )

    # Indent status
    # Pending / Approved / Rejected
    status = Column(
        String,
        default="Pending"
    )

    # Date indent was requested
    requested_date = Column(
        Date,
        default=date.today
    )

    # Date indent was approved
    approved_date = Column(
        Date,
        nullable=True
    )


# ============================================================
# USER AUTHENTICATION TABLE
# ============================================================

class User(Base):
    __tablename__ = "users"

    # User ID
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Login username
    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    # Hashed password
    #
    # IMPORTANT:
    # We store the hashed password,
    # NOT the original password.
    password_hash = Column(
        String,
        nullable=False
    )

    # User role
    #
    # Examples:
    # pharmacist
    # admin
    #
    role = Column(
        String,
        default="pharmacist"
    )

    # Account status
    #
    # True  = active
    # False = inactive
    is_active = Column(
        Boolean,
        default=True
    )