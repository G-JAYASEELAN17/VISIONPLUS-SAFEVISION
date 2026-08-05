from pydantic import BaseModel


class ChatAskRequest(BaseModel):
    question: str


class ChatAskResponse(BaseModel):
    answer: str


class ChatHistoryItem(BaseModel):
    id: int
    role: str
    content: str
    created_at: str
