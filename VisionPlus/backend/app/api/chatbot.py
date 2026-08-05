from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat_message import ChatMessage
from app.schemas.chatbot import ChatAskRequest, ChatAskResponse, ChatHistoryItem
from app.services.chatbot_service import answer_question

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/ask", response_model=ChatAskResponse)
def ask(
    payload: ChatAskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return answer_question(db=db, user_id=current_user.id, question=payload.question)


@router.get("/history", response_model=list[ChatHistoryItem])
def history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    limit = max(1, min(limit, 200))
    # NOTE: order by id as a tiebreaker, not just created_at. SQLite's
    # func.now() only has 1-second precision, so a question+answer pair
    # inserted in the same second tie on created_at and would otherwise
    # sort non-deterministically (assistant reply appearing before the
    # user's own question).
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
        .limit(limit)
        .all()
    )
    return [
        ChatHistoryItem(id=r.id, role=r.role, content=r.content, created_at=str(r.created_at))
        for r in reversed(rows)
    ]


@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}
