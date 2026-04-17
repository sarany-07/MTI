import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.database import engine

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE review_list ADD COLUMN batch_id INT NULL;"))
        print("Added batch_id")
    except Exception as e:
        print("Error adding batch_id:", e)

    try:
        conn.execute(text("ALTER TABLE review_list ADD COLUMN assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        print("Added assigned_at")
    except Exception as e:
        print("Error adding assigned_at:", e)
    
    # Adding foreign key constraint
    try:
        conn.execute(text("ALTER TABLE review_list ADD CONSTRAINT fk_batch_id FOREIGN KEY (batch_id) REFERENCES assignment_batches(id);"))
        print("Added foreign key")
    except Exception as e:
        print("Error adding foreign key:", e)

    
