from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
print(os)
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


print(SessionLocal)


# This function creates a new database session for each request
def get_db():
    db = SessionLocal()   # create connection
    try:
        yield db          # give connection to API
    finally:
        db.close()        # always close connection (important!)
















# def test_connection():
#     try:
#         with engine.connect() as connection:
#             result = connection.execute(text("SELECT 1"))
#             print("✅ Database connected successfully:", result.scalar())
#     except Exception as e:
#         print("❌ Database connection failed:", e)


# test_connection()