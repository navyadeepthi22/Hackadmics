import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, BarChart3, Shield, LogOut,
  GraduationCap, CheckCircle2, Clock, XCircle, TrendingUp, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Faculty", value: "156", icon: Users, color: "text-primary" },
  { label: "Documents Uploaded", value: "1,847", icon: FileText, color: "text-accent" },
  { label: "Verified", value: "1,623", icon: CheckCircle2, color: "text-success" },
  { label: "Pending Review", value: "142", icon: Clock, color: "text-gamification" },
  { label: "Rejected", value: "82", icon: XCircle, color: "text-destructive" },
  { label: "Duplicates Detected", value: "23", icon: AlertTriangle, color: "text-destructive" },
];

const departmentData = [
  { dept: "Computer Science", faculty: 28, uploads: 412, verified: 389, points: 18400 },
  { dept: "Electronics", faculty: 22, uploads: 356, verified: 334, points: 15200 },
  { dept: "Mechanical", faculty: 20, uploads: 298, verified: 271, points: 12800 },
  { dept: "Mathematics", faculty: 18, uploads: 245, verified: 228, points: 10600 },
  { dept: "Physics", faculty: 16, uploads: 198, verified: 181, points: 8400 },
  { dept: "Civil", faculty: 15, uploads: 178, verified: 160, points: 7200 },
];

const recentActivity = [
  { faculty: "Dr. Rajesh Kumar", action: "Uploaded FDP Certificate", dept: "Electronics", time: "5 min ago", status: "pending" },
  { faculty: "Dr. Meena Iyer", action: "Webinar - AI Ethics verified", dept: "Computer Science", time: "12 min ago", status: "verified" },
  { faculty: "Dr. Anil Verma", action: "Duplicate detected", dept: "Mathematics", time: "25 min ago", status: "flagged" },
  { faculty: "Dr. Kavita Reddy", action: "Conference paper submitted", dept: "Civil", time: "1 hr ago", status: "pending" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col z-30">
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-destructive/80 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sm">NAAC C6</p>
            <p className="text-xs text-sidebar-foreground/60">Admin Command Center</p>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "departments", label: "Departments", icon: BarChart3 },
            { id: "faculty", label: "Faculty", icon: Users },
            { id: "documents", label: "Documents", icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                activeSection === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Admin Command Center</h1>
            <p className="text-muted-foreground mt-1">NAAC Criteria 6 — Governance & Faculty Management Overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4 text-center hover:shadow-md transition-shadow">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Table */}
            <Card className="lg:col-span-2 p-5">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Department-wise Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-display font-semibold text-muted-foreground">Department</th>
                      <th className="text-center py-2 font-display font-semibold text-muted-foreground">Faculty</th>
                      <th className="text-center py-2 font-display font-semibold text-muted-foreground">Uploads</th>
                      <th className="text-center py-2 font-display font-semibold text-muted-foreground">Verified</th>
                      <th className="text-right py-2 font-display font-semibold text-muted-foreground">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentData.map((d) => (
                      <tr key={d.dept} className="border-b border-muted/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{d.dept}</td>
                        <td className="py-3 text-center text-muted-foreground">{d.faculty}</td>
                        <td className="py-3 text-center text-muted-foreground">{d.uploads}</td>
                        <td className="py-3 text-center">
                          <span className="text-success font-medium">{d.verified}</span>
                          <span className="text-muted-foreground text-xs ml-1">({Math.round(d.verified / d.uploads * 100)}%)</span>
                        </td>
                        <td className="py-3 text-right font-display font-bold text-gamification">{d.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-5">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Recent Activity
              </h2>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium text-foreground">{a.faculty}</p>
                    <p className="text-xs text-muted-foreground">{a.action}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">{a.dept} • {a.time}</span>
                      <Badge variant="outline" className={`text-xs ${
                        a.status === "verified" ? "text-success border-success/30" :
                        a.status === "flagged" ? "text-destructive border-destructive/30" :
                        "text-gamification border-gamification/30"
                      }`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
