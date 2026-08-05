from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import require_admin
from app.models.camera import Camera
from app.models.user import User
from app.schemas.camera import CameraCreate, CameraUpdate

router = APIRouter(prefix="/camera", tags=["Camera"])


@router.post("/")
def add_camera(camera: CameraCreate, db: Session = Depends(get_db)):
    new = Camera(**camera.model_dump())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.get("/")
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()


@router.get("/{camera_id}")
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    return cam


@router.patch("/{camera_id}")
def update_camera(camera_id: int, payload: CameraUpdate, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(cam, field, val)
    db.commit()
    db.refresh(cam)
    return cam


@router.delete("/{camera_id}")
def delete_camera(
    camera_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(cam)
    db.commit()
    return {"message": "Camera deleted"}
