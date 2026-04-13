from pydantic import BaseModel

class ReviewCreate(BaseModel):
    reviewer_id: int
    reviewee_id: int
    rating: int
    review_text: str