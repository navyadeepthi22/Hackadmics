import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, BarChart3, Shield, LogOut,
  GraduationCap, CheckCircle2, Clock, XCircle, TrendingUp, AlertTriangle,
  Download, Table
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const stats = [
  { label: "Total Faculty", value: "156", icon: Users, color: "text-primary" },
  { label: "Documents Uploaded", value: "1,847", icon: FileText, color: "text-accent" },
  { label: "Verified", value: "1,623", icon: CheckCircle2, color: "text-success" },
  { label: "Pending Review", value: "142", icon: Clock, color: "text-gamification" },
  { label: "Rejected", value: "82", icon: XCircle, color: "text-destructive" },
  { label: "Duplicates Detected", value: "23", icon: AlertTriangle, color: "text-destructive" },
];

const departmentData = [
  { dept: "Computer Science", faculty: 28, uploads: 412, verified: 389, pending: 15, rejected: 8, duplicates: 5, points: 18400 },
  { dept: "Electronics", faculty: 22, uploads: 356, verified: 334, pending: 14, rejected: 6, duplicates: 4, points: 15200 },
  { dept: "Mechanical", faculty: 20, uploads: 298, verified: 271, pending: 18, rejected: 7, duplicates: 3, points: 12800 },
  { dept: "Mathematics", faculty: 18, uploads: 245, verified: 228, pending: 10, rejected: 5, duplicates: 2, points: 10600 },
  { dept: "Physics", faculty: 16, uploads: 198, verified: 181, pending: 12, rejected: 4, duplicates: 1, points: 8400 },
  { dept: "Civil", faculty: 15, uploads: 178, verified: 160, pending: 11, rejected: 5, duplicates: 2, points: 7200 },
];

// Full faculty data for Excel export
const allFacultyData = [
  { name: "Dr. Rajesh Kumar", dept: "Electronics", email: "rajesh@naac.edu", role: "Resource Person", eventType: "FDP", eventName: "FDP on AI/ML", eventDate: "2026-01-15", venue: "IIT Madras", status: "Verified", points: 60, academicYear: "2025-2026" },
  { name: "Dr. Meena Iyer", dept: "Computer Science", email: "meena@naac.edu", role: "Organizer", eventType: "Webinar", eventName: "AI Ethics Webinar", eventDate: "2026-02-20", venue: "VIT Chennai", status: "Verified", points: 50, academicYear: "2025-2026" },
  { name: "Dr. Anil Verma", dept: "Mathematics", email: "anil@naac.edu", role: "Participant", eventType: "Seminar", eventName: "National Math Seminar", eventDate: "2026-03-01", venue: "NIT Trichy", status: "Pending", points: 0, academicYear: "2025-2026" },
  { name: "Dr. Priya Sharma", dept: "Computer Science", email: "priya@naac.edu", role: "Co-organizer", eventType: "Workshop", eventName: "Cloud Computing Workshop", eventDate: "2026-02-10", venue: "Anna University", status: "Verified", points: 40, academicYear: "2025-2026" },
  { name: "Dr. Suresh Nair", dept: "Physics", email: "suresh@naac.edu", role: "Resource Person", eventType: "Guest Lecture", eventName: "Quantum Mechanics Lecture", eventDate: "2026-01-25", venue: "IISc Bangalore", status: "Verified", points: 60, academicYear: "2025-2026" },
  { name: "Dr. Kavita Reddy", dept: "Civil", email: "kavita@naac.edu", role: "Participant", eventType: "Conference", eventName: "Intl. Conf. on Structures", eventDate: "2025-12-15", venue: "BITS Pilani", status: "Verified", points: 30, academicYear: "2025-2026" },
  { name: "Dr. Mohan Das", dept: "Mechanical", email: "mohan@naac.edu", role: "Organizer", eventType: "FDP", eventName: "FDP on 3D Printing", eventDate: "2026-03-05", venue: "PSG Tech", status: "Verified", points: 50, academicYear: "2025-2026" },
  { name: "Dr. Lakshmi S", dept: "Electronics", email: "lakshmi@naac.edu", role: "Attendee", eventType: "Webinar", eventName: "IoT Trends Webinar", eventDate: "2026-02-28", venue: "Online", status: "Rejected", points: 0, academicYear: "2025-2026" },
  { name: "Dr. Ramesh P", dept: "Computer Science", email: "ramesh@naac.edu", role: "Panelist", eventType: "Seminar", eventName: "Data Science Seminar", eventDate: "2026-01-18", venue: "SRM University", status: "Verified", points: 40, academicYear: "2025-2026" },
  { name: "Dr. Anitha K", dept: "Mathematics", email: "anitha@naac.edu", role: "Participant", eventType: "Workshop", eventName: "LaTeX Workshop", eventDate: "2026-02-05", venue: "IIT Bombay", status: "Verified", points: 30, academicYear: "2025-2026" },
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
  const [exportDept, setExportDept] = useState<string>("all");
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleExportExcel = () => {
    const filtered = exportDept === "all"
      ? allFacultyData
      : allFacultyData.filter((f) => f.dept === exportDept);

    if (filtered.length === 0) {
      toast({ title: "No data", description: "No records found for the selected department", variant: "destructive" });
      return;
    }

    const exportData = filtered.map((f) => ({
      "Faculty Name": f.name,
      "Department": f.dept,
      "Email": f.email,
      "Role": f.role,
      "Event Type": f.eventType,
      "Event Name": f.eventName,
      "Event Date": f.eventDate,
      "Venue": f.venue,
      "Verification Status": f.status,
      "Points Earned": f.points,
      "Academic Year": f.academicYear,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Data");

    // Add department summary sheet
    const deptSummary = exportDept === "all"
      ? departmentData
      : departmentData.filter((d) => d.dept === exportDept);

    const summarySheet = XLSX.utils.json_to_sheet(deptSummary.map((d) => ({
      "Department": d.dept,
      "Total Faculty": d.faculty,
      "Total Uploads": d.uploads,
      "Verified": d.verified,
      "Pending": d.pending,
      "Rejected": d.rejected,
      "Duplicates": d.duplicates,
      "Total Points": d.points,
      "Verification Rate": `${Math.round(d.verified / d.uploads * 100)}%`,
    })));
    XLSX.utils.book_append_sheet(wb, summarySheet, "Department Summary");

    const fileName = exportDept === "all"
      ? "NAAC_C6_All_Departments_2025-2026.xlsx"
      : `NAAC_C6_${exportDept.replace(/\s/g, "_")}_2025-2026.xlsx`;

    XLSX.writeFile(wb, fileName);
    toast({ title: "Excel exported!", description: `${filtered.length} records exported to ${fileName}` });
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
            { id: "export", label: "Export Data", icon: Download },
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Admin Command Center</h1>
              <p className="text-muted-foreground mt-1">NAAC Criteria 6 — Academic Year: July 2025 – June 2026</p>
            </div>
            <Button onClick={handleExportExcel} className="font-display font-semibold">
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Button>
          </div>

          {/* Export Section (shown when export tab is active) */}
          {activeSection === "export" && (
            <Card className="p-6">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Table className="w-5 h-5 text-primary" /> Export Faculty Data to Excel
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Download department-wise faculty data including all upload parameters, verification status, points, and event details.
              </p>
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Department</label>
                  <Select value={exportDept} onValueChange={setExportDept}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departmentData.map((d) => (
                        <SelectItem key={d.dept} value={d.dept}>{d.dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExportExcel} className="font-display font-semibold">
                  <Download className="w-4 h-4 mr-2" /> Generate & Download Excel
                </Button>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs font-display font-semibold text-foreground mb-2">Excel includes:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>✓ Faculty Name & Email</span>
                  <span>✓ Department</span>
                  <span>✓ Role (Resource Person, etc.)</span>
                  <span>✓ Event Type & Name</span>
                  <span>✓ Event Date & Venue</span>
                  <span>✓ Verification Status</span>
                  <span>✓ Points Earned</span>
                  <span>✓ Academic Year</span>
                  <span>✓ Department Summary Sheet</span>
                </div>
              </div>
            </Card>
          )}

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
