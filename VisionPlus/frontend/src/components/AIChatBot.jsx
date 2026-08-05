import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSmartToy,
  MdClose,
  MdSend,
  MdDeleteSweep,
  MdContentCopy,
  MdRefresh,
  MdHelpOutline,
} from "react-icons/md";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import {
  askChatbot,
  getChatHistory,
  clearChatHistory,
} from "../services/api";
import { Spinner } from "./Loader";

const SUGGESTED_PROMPTS = [
  "Summarize today's alerts",
  "Explain this report",
  "Show crowd density trends",
  "What caused today's highest risk?",
  "Show recent investigations",
  "Summarize uploaded videos",
  "Explain dashboard statistics",
];

// Helper to format timestamps
function formatTime(timeStr) {
  if (!timeStr) return "";
  try {
    const cleanStr = timeStr.replace(" ", "T");
    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return timeStr.slice(11, 16);
  } catch {
    return "";
  }
}

// Custom Markdown + Code Block Parser
function parseMarkdown(text) {
  if (!text) return "";
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "";
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <div key={index} className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#090d16] shadow-inner text-xs">
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 text-slate-400 border-b border-white/5">
            <span className="font-mono text-[10px] uppercase tracking-wider">{language || "code"}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("Code copied!");
              }}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/5 hover:text-white transition-colors"
            >
              <MdContentCopy className="text-xs" />
              <span>Copy</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-slate-300 whitespace-pre-wrap select-text">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const lines = part.split("\n");
    return (
      <div key={index} className="space-y-1.5 whitespace-pre-wrap select-text">
        {lines.map((line, lIdx) => {
          if (!line.trim() && lIdx > 0 && lIdx < lines.length - 1) return <div key={lIdx} className="h-2" />;

          const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
          if (bulletMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2 ml-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span dangerouslySetInnerHTML={{ __html: formatInline(bulletMatch[1]) }} />
              </div>
            );
          }

          const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const text = headerMatch[2];
            const sizeClass = level === 1 ? "text-lg font-bold mt-3" : level === 2 ? "text-base font-semibold mt-2" : "text-sm font-medium mt-1.5";
            return (
              <div key={lIdx} className={`text-white ${sizeClass}`} dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
            );
          }

          return (
            <p key={lIdx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          );
        })}
      </div>
    );
  });
}

function formatInline(text) {
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/40 px-1.5 py-0.5 rounded text-xs font-mono text-primary-light border border-white/5">$1</code>');
  return formatted;
}

export default function AIChatBot({ mode = "floating" }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const bottomRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading, scrollToBottom]);

  // Load chat history
  const loadHistory = useCallback(async () => {
    try {
      const { data } = await getChatHistory();
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }, []);

  // Fetch history for full-screen mode immediately, or on drawer open
  useEffect(() => {
    if (mode === "fullscreen" || open) {
      loadHistory();
    }
  }, [mode, open, loadHistory]);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSend = async (textToSend) => {
    const text = (textToSend || question).trim();
    if (!text) return;

    if (!textToSend) setQuestion("");
    setLastQuestion(text);

    // Optimistic user message append
    const localTimestamp = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content: text,
        created_at: localTimestamp,
      },
    ]);
    setLoading(true);

    try {
      const { data } = await askChatbot(text);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer || "No answer returned.",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.detail ||
        "Request failed. Verify your network or backend connectivity.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: errorMsg,
          created_at: new Date().toISOString(),
          isError: true,
        },
      ]);
      toast.error("AI Assistant request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuestion) {
      handleSend(lastQuestion);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      setLastQuestion("");
      setShowClearConfirm(false);
      toast.success("Conversation history cleared");
    } catch {
      toast.error("Failed to clear chat history");
    }
  };

  // Render main chat layout
  const renderChatContent = () => (
    <div className="flex h-full w-full flex-col bg-surface-card/60 backdrop-blur-2xl border border-white/5 relative overflow-hidden rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-gradient-to-r from-[#0F172A] to-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary glow text-white shadow-lg">
            <MdSmartToy className="text-xl" />
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">VisionPlus AI Assistant</h2>
            <p className="text-[10px] text-primary-light font-medium tracking-wide uppercase">Active Security Copilot</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              title="Clear Conversation"
              aria-label="Clear chat history"
            >
              <MdDeleteSweep className="text-xl" />
            </button>
          )}
          {mode === "floating" && (
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Close Assistant Panel"
            >
              <MdClose className="text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex h-full flex-col items-center justify-center text-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-text-muted mb-4 shadow-inner"
            >
              <MdHelpOutline className="text-3xl" />
            </motion.div>
            <h3 className="text-base font-semibold text-white">Ask VisionPlus Intelligence</h3>
            <p className="mt-1 max-w-xs text-xs text-text-muted leading-relaxed">
              Get details about zone analytics, risk scores, camera status, notifications, and analytics reports.
            </p>

            {/* Clickable suggested prompts */}
            <div className="mt-6 w-full max-w-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light mb-3 block">Suggested Queries</span>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt)}
                    className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/40 px-3.5 py-2 text-left text-xs text-slate-300 transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message Log */
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-md ${
                    m.role === "user"
                      ? "bg-[#1E293B] text-slate-300 border border-white/10"
                      : "bg-gradient-to-br from-primary to-secondary text-white"
                  }`}
                >
                  {m.role === "user" ? initials : <MdSmartToy className="text-base" />}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col max-w-[80%] space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-lg border relative group/msg ${
                      m.role === "user"
                        ? "bg-[#6366f1]/20 border-[#6366f1]/15 text-white"
                        : "bg-surface-elevated/40 border-white/5 text-slate-200"
                    }`}
                  >
                    {parseMarkdown(m.content)}

                    {/* Quick utility controls */}
                    {m.role === "assistant" && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(m.content);
                            toast.success("Copied to clipboard");
                          }}
                          className="p-1 rounded bg-[#0b0f19] border border-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Copy Answer"
                        >
                          <MdContentCopy size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp */}
                  <span className={`text-[10px] text-text-muted px-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                    {formatTime(m.created_at)}
                  </span>
                </div>
              </div>
            ))}

            {/* Error Retry Option */}
            {messages[messages.length - 1]?.isError && (
              <div className="flex justify-start pl-12">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-xs text-primary-light hover:text-primary transition-colors focus:outline-none"
                >
                  <MdRefresh className="text-sm" />
                  <span>Retry last question</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Thinking State */}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
              <MdSmartToy className="text-base" />
            </div>
            <div className="flex flex-col space-y-1 max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-surface-elevated/40 border border-white/5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Tray */}
      <div className="border-t border-white/10 p-4 bg-[#0B1120]/80">
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message... (Shift+Enter for newline)"
            rows={1}
            aria-label="Ask assistant a question"
            className="flex-1 resize-none rounded-xl bg-surface-elevated px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none border border-white/5 focus:border-primary/50 transition-all max-h-24 scrollbar-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !question.trim()}
            className="rounded-xl bg-primary hover:bg-primary-dark p-3.5 text-white transition-colors shadow-card flex items-center justify-center disabled:opacity-40"
            aria-label="Send query"
          >
            <MdSend className="text-lg" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal overlay */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-white mb-2">Clear Conversation</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                This will delete your entire chat logs from the system. You cannot undo this.
              </p>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg px-3.5 py-2 font-semibold text-text-secondary hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="rounded-lg bg-danger px-3.5 py-2 font-semibold text-white hover:bg-danger/80 transition-all shadow-md"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  // Return structure based on mode
  if (mode === "fullscreen") {
    return <div className="h-full w-full">{renderChatContent()}</div>;
  }

  return (
    <>
      {/* Floating Action Circle */}
      {!open && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary hover:bg-primary-dark shadow-glow text-white select-none cursor-pointer"
          aria-label="Open AI Assistant Panel"
        >
          <MdSmartToy className="text-2xl" />
        </motion.button>
      )}

      {/* Right Drawer Sliding Container */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            {/* Click outside to close backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto cursor-pointer"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-full w-full max-w-[400px] pointer-events-auto p-4 md:p-6"
            >
              {renderChatContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}