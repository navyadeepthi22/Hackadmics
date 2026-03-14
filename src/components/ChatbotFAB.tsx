import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_QUESTIONS = [
  "How do I upload a certificate?",
  "What file formats are accepted?",
  "How are points calculated?",
  "What is NAAC Criteria 6?",
  "What is the current academic year?",
  "How do I check my verification status?",
  "Why was my document rejected?",
  "How to become a resource person?",
  "What are the recommendations for me?",
  "How does duplicate detection work?",
];

const RESPONSES: Record<string, string> = {
  "How do I upload a certificate?": "Navigate to **Upload Documents** from the sidebar. Drag and drop your certificate (PDF, JPG, PNG up to 10MB) into the upload zone. Our AI will automatically extract metadata like your name, event date, and venue. Select your role and event type, then click Submit.",
  "What file formats are accepted?": "We accept **PDF**, **JPG**, **JPEG**, and **PNG** files up to **10MB** in size. PDFs are recommended for best AI extraction accuracy.",
  "How are points calculated?": "Points are awarded based on your role:\n- **Resource Person**: 60 points\n- **Organizer**: 50 points\n- **Co-organizer**: 40 points\n- **Participant/Attendee**: 30 points\n\nBonus points for verified certificates!",
  "What is NAAC Criteria 6?": "NAAC Criteria 6 covers **Governance, Leadership and Management**. It evaluates institutional vision, faculty empowerment, financial management, and quality assurance mechanisms. Your document uploads contribute to sub-criteria 6.3 (Faculty Empowerment Strategies).",
  "What is the current academic year?": "The current academic year is **July 2025 – June 2026**. Only documents with event dates falling within this period will be accepted for verification. Documents outside this range will be automatically rejected.",
  "How do I check my verification status?": "Go to **My Activity** from the sidebar. Each document shows its current status:\n- 🟢 **Verified** – AI validated and within academic year\n- 🟡 **Pending** – Under review\n- 🔴 **Rejected** – Invalid academic year or needs re-upload",
  "Why was my document rejected?": "Documents can be rejected for several reasons:\n1. **Academic Year Mismatch** – The event date is not within July 2025 – June 2026\n2. **Invalid Certificate** – QR code validation failed\n3. **Duplicate Detected** – This document was already uploaded\n4. **Unreadable Content** – AI couldn't extract metadata\n\nCheck **My Activity** for the specific rejection reason.",
  "How to become a resource person?": "To be recognized as a **Resource Person**, upload the event certificate where you are listed as a speaker/trainer. Select 'Resource Person' from the role dropdown. Verified resource person activities earn the highest points (60 pts) and unlock sponsor recommendations.",
  "What are the recommendations for me?": "Check the **Recommendations** tab in the sidebar! It shows:\n- 📅 **Upcoming FDPs, webinars & events** from other universities matched to your interests\n- 📰 **Latest news** on AICTE/UGC policies and funding opportunities\n- 📚 **Research trends** aligned with your academic profile\n\nAll recommendations are personalized based on your upload history.",
  "How does duplicate detection work?": "Our system uses **AI-powered cybersecurity tools** to detect duplicates:\n- File hash comparison for exact matches\n- Metadata similarity analysis for near-duplicates\n- Cross-faculty duplicate checking across departments\n\nDuplicate submissions are flagged and won't earn points.",
};

// Generate follow-up suggestions based on last question
function getSuggestions(lastQuestion: string): string[] {
  const suggestionMap: Record<string, string[]> = {
    "How do I upload a certificate?": ["What file formats are accepted?", "What is the current academic year?", "How are points calculated?"],
    "What file formats are accepted?": ["How do I upload a certificate?", "Why was my document rejected?"],
    "How are points calculated?": ["How to become a resource person?", "What are the recommendations for me?"],
    "What is NAAC Criteria 6?": ["How are points calculated?", "How do I upload a certificate?"],
    "What is the current academic year?": ["Why was my document rejected?", "How do I upload a certificate?"],
    "How do I check my verification status?": ["Why was my document rejected?", "How does duplicate detection work?"],
    "Why was my document rejected?": ["What is the current academic year?", "How does duplicate detection work?", "How do I upload a certificate?"],
    "How to become a resource person?": ["How are points calculated?", "What are the recommendations for me?"],
    "What are the recommendations for me?": ["How to become a resource person?", "How are points calculated?"],
    "How does duplicate detection work?": ["Why was my document rejected?", "How do I check my verification status?"],
  };
  return suggestionMap[lastQuestion] || QUICK_QUESTIONS.slice(0, 3);
}

interface Message {
  id: number;
  role: "user" | "bot";
  content: string;
}

const ChatbotFAB = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", content: "Hi! I'm your NAAC Criteria 6 assistant. Ask me about uploads, verification, points, recommendations, or academic year policies!" },
  ]);
  const [input, setInput] = useState("");
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    const response = RESPONSES[text] || "I'm here to help with NAAC Criteria 6 queries. Try asking about document uploads, academic year validation, points calculation, recommendations, or verification status.";
    const botMsg: Message = { id: Date.now() + 1, role: "bot", content: response };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setLastUserQuestion(text);
    setInput("");
  };

  const suggestions = lastUserQuestion ? getSuggestions(lastUserQuestion) : QUICK_QUESTIONS.slice(0, 4);

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
            className="fixed bottom-24 right-6 w-96 max-h-[520px] bg-card rounded-xl shadow-2xl border z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center gap-3">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-display font-semibold text-sm">NAAC Assistant</p>
                <p className="text-xs opacity-80">Ask about criteria 6, uploads, recommendations & more</p>
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
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gamification" /> Suggested questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((q) => (
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
