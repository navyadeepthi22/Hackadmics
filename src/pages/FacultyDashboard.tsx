import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, LayoutDashboard, Trophy, Activity, MessageSquare,
  LogOut, ChevronLeft, ChevronRight, GraduationCap, FileText, Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UploadSection from "@/components/dashboard/UploadSection";
import ActivitySection from "@/components/dashboard/ActivitySection";
import LeaderboardSection from "@/components/dashboard/LeaderboardSection";
import OverviewSection from "@/components/dashboard/OverviewSection";
import RecommendationsSection from "@/components/dashboard/RecommendationsSection";
import ChatbotFAB from "@/components/ChatbotFAB";
import { AppProvider } from "@/lib/store";

type Tab = "overview" | "upload" | "activity" | "leaderboard" | "recommendations";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Upload Documents", icon: Upload },
  { id: "activity", label: "My Activity", icon: Activity },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
];

const FacultyDashboardContent = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Faculty";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-30 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <p className="font-display font-bold text-sm leading-tight">NAAC C6</p>
              <p className="text-xs text-sidebar-foreground/60">Faculty Portal</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-sm font-display font-semibold truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">Computer Science Dept.</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border shadow-sm flex items-center justify-center text-foreground hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-6 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "overview" && <OverviewSection onNavigate={setActiveTab} />}
              {activeTab === "upload" && <UploadSection />}
              {activeTab === "activity" && <ActivitySection />}
              {activeTab === "leaderboard" && <LeaderboardSection />}
              {activeTab === "recommendations" && <RecommendationsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ChatbotFAB />
    </div>
  );
};

const FacultyDashboard = () => (
  <AppProvider>
    <FacultyDashboardContent />
  </AppProvider>
);

export default FacultyDashboard;
