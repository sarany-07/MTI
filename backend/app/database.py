import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Base is REQUIRED for models
Base = declarative_base()

# Get DB URL
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# Only connect if valid MySQL URL
if DATABASE_URL and DATABASE_URL.startswith("mysql"):
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        print("✅ Database connected")
    except Exception as e:
        print("❌ DB connection failed:", e)
else:
    print("⚠️ Skipping DB connection (DB not ready)")


# This function creates a new database session for each request
def get_db():
    if SessionLocal is None:
        raise Exception("Database not configured yet")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
















# def test_connection():
#     try:
#         with engine.connect() as connection:
#             result = connection.execute(text("SELECT 1"))
#             print("✅ Database connected successfully:", result.scalar())
#     except Exception as e:
#         print("❌ Database connection failed:", e)


# test_connection()
