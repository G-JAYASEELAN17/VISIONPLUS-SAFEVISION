import AIChatBot from '../components/AIChatBot'

export default function ChatbotPage() {
  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col">
      <AIChatBot mode="fullscreen" />
    </div>
  )
}
