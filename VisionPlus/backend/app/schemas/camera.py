from pydantic import BaseModel


class CameraCreate(BaseModel):
    camera_name: str
    location: str
    stream_url: str


class CameraUpdate(BaseModel):
    camera_name: str | None = None
    location: str | None = None
    stream_url: str | None = None
    status: str | None = None
