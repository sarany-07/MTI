import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.database import engine

with engine.begin() as conn:
    try:
        # 1. Drop foreign key that implicitly depends on the unique index
        conn.execute(text("ALTER TABLE review_list DROP FOREIGN KEY review_list_ibfk_1;"))
        print("Dropped FK")
        
        # 2. Drop unique index
        conn.execute(text("ALTER TABLE review_list DROP INDEX reviewer_id;"))
        print("Dropped UNIQUE index")
        
        # 3. Add regular index for reviewer_id
        conn.execute(text("ALTER TABLE review_list ADD KEY (reviewer_id);"))
        print("Re-added KEY for reviewer_id")
        
        # 4. Re-add foreign key
        conn.execute(text("ALTER TABLE review_list ADD CONSTRAINT review_list_ibfk_1 FOREIGN KEY (reviewer_id) REFERENCES users(user_id);"))
        print("Re-added FK")

        print("Successfully removed the unique constraint on reviewer_id!")
    except Exception as e:
        print("Error during constraints modification:", e)
