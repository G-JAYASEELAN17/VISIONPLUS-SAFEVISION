import os
import uuid

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import require_admin
from app.models.video import Video
from app.models.user import User

router = APIRouter(prefix="/video", tags=["Video"])
UPLOAD_FOLDER = "uploads/videos"
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB
ALLOWED_TYPES = {"video/mp4", "video/avi", "video/mov", "video/mkv", "video/x-msvideo"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate content type
    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

    # Safe unique filename (avoid collisions / path traversal)
    ext = os.path.splitext(file.filename or "video")[-1] or ".mp4"
    safe_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, safe_name)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 500 MB limit")

    with open(file_path, "wb") as f:
        f.write(content)

    video = Video(filename=file.filename or safe_name, filepath=file_path)
    db.add(video)
    db.commit()
    db.refresh(video)

    return {"message": "Video uploaded successfully", "video_id": video.id, "filename": video.filename}


@router.get("/")
def get_videos(db: Session = Depends(get_db)):
    return db.query(Video).order_by(Video.uploaded_at.desc()).all()


@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if os.path.exists(video.filepath):
        os.remove(video.filepath)
    db.delete(video)
    db.commit()
    return {"message": "Video deleted"}
