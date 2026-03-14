import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_QUESTIONS = [
  "How do I upload a certificate?",
  "What file formats are accepted?",
  "How are points calculated?",
  "What is NAAC Criteria 6?",
  "How to become a resource person?",
  "How do I check my verification status?",
];

const RESPONSES: Record<string, string> = {
  "How do I upload a certificate?": "Navigate to **Upload Documents** from the sidebar. Drag and drop your certificate (PDF, JPG, PNG up to 10MB) into the upload zone. Our AI will automatically extract metadata like your name, event date, and venue. Select your role and event type, then click Submit.",
  "What file formats are accepted?": "We accept **PDF**, **JPG**, **JPEG**, and **PNG** files up to **10MB** in size. PDFs are recommended for best AI extraction accuracy.",
  "How are points calculated?": "Points are awarded based on your role:\n- **Resource Person**: 60 points\n- **Organizer**: 50 points\n- **Co-organizer**: 40 points\n- **Participant/Attendee**: 30 points\n\nBonus points for verified certificates!",
  "What is NAAC Criteria 6?": "NAAC Criteria 6 covers **Governance, Leadership and Management**. It evaluates institutional vision, faculty empowerment, financial management, and quality assurance mechanisms. Your document uploads contribute to sub-criteria 6.3 (Faculty Empowerment Strategies).",
  "How to become a resource person?": "To be recognized as a **Resource Person**, upload the event certificate where you are listed as a speaker/trainer. Select 'Resource Person' from the role dropdown. Verified resource person activities earn higher points and unlock sponsor recommendations.",
  "How do I check my verification status?": "Go to **My Activity** from the sidebar. Each document shows its current status:\n- 🟢 **Verified** – AI validated successfully\n- 🟡 **Pending** – Under review\n- 🔴 **Rejected** – Needs re-upload",
};

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

const ChatbotFAB = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", content: "Hi! I'm your NAAC Criteria 6 assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    const response = RESPONSES[text] || "I'm here to help with NAAC Criteria 6 queries. Please select from the quick questions or ask about document uploads, points, and verification.";
    const botMsg: Message = { id: Date.now() + 1, role: "bot", content: response };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageSquare className="w-6 h-6 text-primary-foreground" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-h-[500px] bg-card rounded-xl shadow-2xl border z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center gap-3">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-display font-semibold text-sm">NAAC Assistant</p>
                <p className="text-xs opacity-80">Ask about criteria 6, uploads & more</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs px-2.5 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Type your question..."
                className="text-sm h-9"
              />
              <Button size="sm" className="h-9 px-3" onClick={() => handleSend(input)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotFAB;
