"""SQLAlchemy ORM 模型 — 看板数据表"""

from datetime import date
from sqlalchemy import String, Float, Integer, Date, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class RevenueBudget(Base):
    __tablename__ = "revenue_budget"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))  # e.g. "2026-04"
    category: Mapped[str] = mapped_column(String(20))  # revenue/gross_profit/expense
    actual: Mapped[float] = mapped_column(Float)
    budget: Mapped[float] = mapped_column(Float)
    rate: Mapped[float] = mapped_column(Float)


class ExpenseDetail(Base):
    __tablename__ = "expense_detail"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))
    category: Mapped[str] = mapped_column(String(50))
    amount: Mapped[float] = mapped_column(Float)
    amount_ly: Mapped[float] = mapped_column(Float)  # last year same period


class DepartmentSales(Base):
    __tablename__ = "department_sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))
    dept: Mapped[str] = mapped_column(String(50))
    revenue: Mapped[float] = mapped_column(Float)
    revenue_change: Mapped[float] = mapped_column(Float)
    gross_profit_rate: Mapped[float] = mapped_column(Float)
    gross_profit: Mapped[float] = mapped_column(Float)
    margin_share: Mapped[float] = mapped_column(Float)


class CustomerRanking(Base):
    __tablename__ = "customer_ranking"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))
    name: Mapped[str] = mapped_column(String(100))
    revenue: Mapped[float] = mapped_column(Float)
    share: Mapped[float] = mapped_column(Float)
    gross_rate: Mapped[float] = mapped_column(Float)


class ARAging(Base):
    __tablename__ = "ar_aging"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))
    dept: Mapped[str] = mapped_column(String(50))
    ar30: Mapped[float] = mapped_column(Float)
    ar3060: Mapped[float] = mapped_column(Float)
    ar60180: Mapped[float] = mapped_column(Float)
    ar180360: Mapped[float] = mapped_column(Float)
    ar360p: Mapped[float] = mapped_column(Float)


class InventoryProduct(Base):
    __tablename__ = "inventory_product"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))
    name: Mapped[str] = mapped_column(String(100))
    amount: Mapped[float] = mapped_column(Float)
    aging_days: Mapped[int] = mapped_column(Integer)


class FreightChannel(Base):
    __tablename__ = "freight_channel"

    id: Mapped[int] = mapped_column(primary_key=True)
    period: Mapped[str] = mapped_column(String(10))
    channel: Mapped[str] = mapped_column(String(30))
    freight: Mapped[float] = mapped_column(Float)
    tickets: Mapped[int] = mapped_column(Integer)
    avg_per_ticket: Mapped[float] = mapped_column(Float)
    fee_ratio: Mapped[float] = mapped_column(Float)
