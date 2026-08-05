import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSmartToy,
  MdClose,
  MdSend,
} from "react-icons/md";
import toast from "react-hot-toast";
import {
  askChatbot,
  getChatHistory,
} from "../services/api";

export default function AIChatBot() {

  const [open, setOpen] = useState(false);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {

    if (!open) return;

    loadHistory();

  }, [open]);

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  async function loadHistory() {

    try {

      const { data } =
        await getChatHistory();

      setMessages(data || []);

    } catch {}

  }

  async function send() {

    if (!question.trim()) return;

    const text = question;

    setQuestion("");

    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    try {

      const { data } =
        await askChatbot(text);

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.answer ||
            "No response",
        },
      ]);

    } catch (err) {

      // Graceful fallback when the backend/chatbot endpoint is unreachable
      // or errors out, instead of silently swallowing the failure.
      const message =
        err?.response?.data?.detail ||
        "SafeVision AI is temporarily unavailable. Please try again in a moment.";

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: message,
        },
      ]);

      toast.error("Chatbot request failed");

    } finally {

      setLoading(false);

    }

  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-2xl"
      >
        <MdSmartToy className="text-3xl text-white" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 50,
            }}
            className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[380px] flex-col rounded-3xl border border-surface-border bg-surface-card shadow-2xl"
          >
            <div className="flex items-center justify-between rounded-t-3xl bg-primary p-5">
              <div>
                <h2 className="font-bold text-white">SafeVision AI</h2>
                <p className="text-xs text-white/70">Crowd Intelligence Assistant</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white">
                <MdClose size={25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : "bg-surface-elevated text-slate-200"
                    }`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && <div className="text-slate-400">AI is thinking...</div>}
              <div ref={bottomRef} />
            </div>

            <div className="flex gap-2 border-t border-surface-border p-4">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask SafeVision AI..."
                className="flex-1 rounded-xl bg-surface-elevated px-4 py-3 text-white outline-none"
              />
              <button onClick={send} className="rounded-xl bg-primary p-3 text-white">
                <MdSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
</>

)

}