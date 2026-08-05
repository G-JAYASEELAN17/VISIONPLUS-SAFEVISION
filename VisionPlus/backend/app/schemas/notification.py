from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    level: str
    video_id: int | None = None
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True
