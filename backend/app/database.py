import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv


load_dotenv()

# Base is REQUIRED for models
Base = declarative_base()

# Get DB URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine with SSL support for cloud databases (Neon, Render, etc.)
if DATABASE_URL:
    connect_args = {}

    # PostgreSQL with sslmode in URL — SQLAlchemy handles it via the URL param
    # For MySQL with SSL, you'd add ssl_ca etc. to connect_args
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print(f"✅ Database connected ({DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else 'local'})")
    except Exception as e:
        print(f"❌ DB connection failed: {e}")
        engine = None
        SessionLocal = None
        print("Database not configured yet")
else:
    print("⚠️ DATABASE_URL not set — skipping DB connection")
    engine = None
    SessionLocal = None


# This function creates a new database session for each request
def get_db():
    if SessionLocal is None:
        raise Exception("Database not configured yet")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
