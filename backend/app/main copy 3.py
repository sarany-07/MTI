from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
# Import DB session
from app.database import get_db, SessionLocal, Base, engine
from app import models, schemas
# Import models (tables)
import app.models as models
import datetime

from fastapi.middleware.cors import CORSMiddleware
import random  # for random selection

from collections import defaultdict
from app.email_utils import send_email, send_html_email
# Create FastAPI app

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}



@app.post("/departments/")
def create_department(name: str, db: Session = Depends(get_db)):
    
    # Create department object (NOT yet saved in DB)
    dept = models.Department(department_name=name)
    
    # Add to session (like staging area)
    db.add(dept)
    
    # Save to database (commit = permanent save)
    db.commit()
    
    # Refresh gets updated data (like auto-generated ID)
    db.refresh(dept)
    
    # Return created department
    return dept


@app.post("/users/")
def create_user(
    name: str,
    email: str,
    role: str,
    department_id: int,
    form_url: str = None,
    db: Session = Depends(get_db)
):
    
    # Create user object
    user = models.User(
        name=name,
        email=email,
        role=role,
        form_url=form_url,
        department_id=department_id
    )
    
    # Add to session
    db.add(user)
    
    # Save to DB
    db.commit()
    
    # Get updated data (like user_id)
    db.refresh(user)
    
    # Return created user
    return user


@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    
    # Query all users from DB
    users = db.query(models.User).all()
    
    # Return list of users
    return users


@app.get("/departments/")
def get_departments(db: Session = Depends(get_db)):
    
    # Fetch all departments 
    departments = db.query(models.Department).all()
    
    return departments


@app.post("/assign-reviews/")
def assign_reviews(num: int = 4, db: Session = Depends(get_db)):

    # Month handling
    now = datetime.datetime.now()
    month_year_str = now.strftime("%Y-%m")
    month_label = now.strftime("%B %Y")

    # Create batch
    batch = models.AssignmentBatch(
        month_year=month_year_str,
        label=month_label
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    users = db.query(models.User).all()

    # -----------------------------
    # GROUP USERS BY DEPARTMENT
    # -----------------------------
    dept_users_map = defaultdict(list)
    for user in users:
        dept_users_map[user.department_id].append(user)

    # -----------------------------
    # CREATE ORDERED USER LIST
    # -----------------------------
    all_users = []
    for dept_id, dept_users in dept_users_map.items():
        for u in dept_users:
            all_users.append((u, dept_id))

    # -----------------------------
    # MONTH OFFSET (rotation key)
    # -----------------------------
    # Example: 2025-01 → 1, 2025-02 → 2
    month_offset = now.month

    assignments_map = defaultdict(list)

    # -----------------------------
    # ASSIGN LOGIC
    # -----------------------------
    for i, (user, user_dept) in enumerate(all_users):

        assigned = []

        for dept_id, dept_users in dept_users_map.items():

            # Skip same department
            if dept_id == user_dept:
                continue

            n = len(dept_users)

            # Rotation logic
            idx = (i + month_offset) % n

            reviewer = dept_users[idx]

            assigned.append(reviewer)

        # Limit to required number (if more departments)
        assigned = assigned[:num]

        # Save to DB
        for target in assigned:
            assignment = models.ReviewAssignment(
                reviewer_id=user.user_id,
                reviewee_id=target.user_id,
                batch_id=batch.id
            )
            db.add(assignment)

            assignments_map[user.user_id].append(target)

    db.commit()

    # SEND EMAILS
    for user in users:
        assigned_people = assignments_map[user.user_id]

        if not assigned_people:
            continue

        assigned_details = [
             {
                 "name": p.name,
                 "email": p.email,
                 "role": p.role,
                 "form_url": p.form_url
             } for p in assigned_people
        ]

        send_html_email(
            to_email=user.email,
            subject=f"Review Assignment - {month_label}",
            recipient_name=user.name,
            assigned_users=assigned_details
        )

    return {"message": "Assignments created and emails sent!", "batch_id": batch.id}




# Dependency (DB session)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# @app.post("/submit-review/")
# def submit_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    
#     # 1️⃣ Check if reviewer already gave 4 reviews
#     review_count = db.query(models.Review).filter(
#         models.Review.reviewer_id == review.reviewer_id
#     ).count()

#     if review_count >= 4:
#         raise HTTPException(status_code=400, detail="Review limit reached (4 only)")

#     # 2️⃣ Prevent self-review
#     if review.reviewer_id == review.reviewee_id:
#         raise HTTPException(status_code=400, detail="You cannot review yourself")

#     # 3️⃣ Save review
#     new_review = models.Review(
#         reviewer_id=review.reviewer_id,
#         reviewee_id=review.reviewee_id,
#         rating=review.rating,
#         review_text=review.review_text
#     )

#     db.add(new_review)
#     db.commit()

#     return {"message": "Review submitted successfully"}


@app.post("/submit-review/")
def submit_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):

    # 1️⃣ Check assignment exists
    assignment = db.query(models.ReviewAssignment).filter(
        models.ReviewAssignment.reviewer_id == review.reviewer_id,
        models.ReviewAssignment.reviewee_id == review.reviewee_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=400,
            detail="You are not allowed to review this user"
        )

    # 3️⃣ Prevent duplicate review
    existing_review = db.query(models.Review).filter(
        models.Review.reviewer_id == review.reviewer_id,
        models.Review.reviewee_id == review.reviewee_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You already reviewed this user"
        )

    # 4️⃣ Save review
    new_review = models.Review(
        reviewer_id=review.reviewer_id,
        reviewee_id=review.reviewee_id,
        rating=review.rating,
        review_text=review.review_text
    )

    db.add(new_review)
    db.commit()

    return {"message": "Review submitted successfully"}



@app.get("/submit-review/")
def get_reviews(db: Session = Depends(get_db)):
    
    # Query all users from DB
    reviews = db.query(models.Review).all()
    
    # Return list of users
    return reviews



@app.get("/reviews/")
def get_all_reviews(db: Session = Depends(get_db)):
    
    # Fetch all reviews
    reviews = db.query(models.Review).all()
    
    return reviews


@app.get("/reviews/filter/")
def filter_reviews(
    reviewer_id: int = None,
    reviewee_id: int = None,
    rating: int = None,
    db: Session = Depends(get_db)
):
    
    query = db.query(models.Review)

    # Apply filters dynamically
    if reviewer_id:
        query = query.filter(models.Review.reviewer_id == reviewer_id)

    if reviewee_id:
        query = query.filter(models.Review.reviewee_id == reviewee_id)

    if rating:
        query = query.filter(models.Review.rating == rating)

    return query.all()


@app.get("/reviews/average/")
def average_rating(db: Session = Depends(get_db)):
    
    result = db.query(
        models.Review.reviewee_id,
        func.avg(models.Review.rating).label("avg_rating")
    ).group_by(models.Review.reviewee_id).all()
    
    return result

@app.get("/reviews/detailed/")
def detailed_reviews(db: Session = Depends(get_db)):
    
    result = db.query(
        models.Review.review_id,
        models.User.name.label("reviewer_name"),
        models.Review.reviewee_id,
        models.Review.rating,
        models.Review.review_text
    ).join(
        models.User,
        models.Review.reviewer_id == models.User.user_id
    ).all()
    
    return result


@app.get("/assignment-batches/")
def get_assignment_batches(db: Session = Depends(get_db)):
    return db.query(models.AssignmentBatch).order_by(models.AssignmentBatch.id.desc()).all()


@app.get("/assignments/")
def get_assignments(batch_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.ReviewAssignment)
    if batch_id:
        query = query.filter(models.ReviewAssignment.batch_id == batch_id)
    return query.all()



# @app.delete("/users/{user_id}")
# def delete_assignment(user_id: int, db: Session = Depends(get_db)):

#     db.query(models.User).filter(
#         models.User.user_id == user_id
#     ).delete()
#     db.commit()
#     return {"message": "User deleted"}



@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    # 🔹 Delete related reviews
    db.query(models.Review).filter(
        (models.Review.reviewer_id == user_id) |
        (models.Review.reviewee_id == user_id)
    ).delete(synchronize_session=False)

    # 🔹 Delete assignments
    db.query(models.ReviewAssignment).filter(
        (models.ReviewAssignment.reviewer_id == user_id) |
        (models.ReviewAssignment.reviewee_id == user_id)
    ).delete(synchronize_session=False)

    # 🔹 Delete user
    db.query(models.User).filter(models.User.user_id == user_id).delete()

    db.commit()

    return {"message": f"User {user_id} deleted"}


@app.delete("/users/")
def delete_all_users(db: Session = Depends(get_db)):

    # 🔹 Delete all reviews
    db.query(models.Review).delete()

    # 🔹 Delete all assignments
    db.query(models.ReviewAssignment).delete()

    # 🔹 Delete all users
    db.query(models.User).delete()

    db.commit()

    return {"message": "All users deleted"}


@app.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):

    # Optional: remove users in that department
    db.query(models.User).filter(
        models.User.department_id == department_id
    ).delete()

    db.query(models.Department).filter(
        models.Department.department_id == department_id
    ).delete()

    db.commit()

    return {"message": "Department deleted"}


# ================= MANUAL ASSIGN =================

@app.post("/manual-assign/")
def manual_assign(request: schemas.ManualAssignRequest, db: Session = Depends(get_db)):
    """
    Manually assign selected users to selected Reviewer and send email notifications.
    - reviewer_ids: list of user IDs who will receive the assignment (Reviewer)
    - reviewee_ids: list of user IDs to be assigned (reviewees)
    """

    # Validate Reviewer IDs
    m_reviewers = db.query(models.User).filter(
        models.User.user_id.in_(request.reviewer_ids)
    ).all()

    print(m_reviewers)

    if not m_reviewers:
        raise HTTPException(status_code=404, detail="No valid recipients found")

    # Validate Reviewee IDs
    assignees = db.query(models.User).filter(
        models.User.user_id.in_(request.reviewee_ids)
    ).all()

    if not assignees:
        raise HTTPException(status_code=404, detail="No valid assignees found")

    created_count = 0
    skipped_count = 0
    email_success = 0
    email_failed = 0

    for recipient in m_reviewers:
        assigned_user_details = []

        for assignee in assignees:
            # Skip self-assignment
            if recipient.user_id == assignee.user_id:
                skipped_count += 1
                continue

            # Check if assignment already exists
            existing = db.query(models.ReviewAssignment).filter(
                models.ReviewAssignment.reviewer_id == recipient.user_id,
                models.ReviewAssignment.reviewee_id == assignee.user_id
            ).first()

            if existing:
                skipped_count += 1
                # Still include in email even if already assigned
                assigned_user_details.append({
                    "name": assignee.name,
                    "email": assignee.email,
                    "role": assignee.role,
                    "form_url": assignee.form_url
                })
                continue

            # Create new assignment
            assignment = models.ReviewAssignment(
                reviewer_id=recipient.user_id,
                reviewee_id=assignee.user_id
            )
            db.add(assignment)
            created_count += 1

            assigned_user_details.append({
                "name": assignee.name,
                "email": assignee.email,
                "role": assignee.role,
                "form_url": assignee.form_url
            })

        # Send HTML email to this recipient
        if assigned_user_details:
            success = send_html_email(
                to_email=recipient.email,
                subject="Manual Review Assignment",
                recipient_name=recipient.name,
                assigned_users=assigned_user_details
            )
            if success:
                email_success += 1
            else:
                email_failed += 1

    db.commit()

    return {
        "message": "Manual assignments processed!",
        "assignments_created": created_count,
        "assignments_skipped": skipped_count,
        "emails_sent": email_success,
        "emails_failed": email_failed
    }