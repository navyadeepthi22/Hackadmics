import { FileText, Upload, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Documents Uploaded", value: "24", icon: FileText, change: "+3 this month", color: "text-primary" },
  { label: "Verified Files", value: "21", icon: Upload, change: "87.5% rate", color: "text-success" },
  { label: "Total Points", value: "1,280", icon: Trophy, change: "Rank #4", color: "text-gamification" },
  { label: "Activities", value: "18", icon: TrendingUp, change: "6 as organizer", color: "text-primary" },
];

const recentUploads = [
  { name: "FDP on Machine Learning.pdf", status: "verified", date: "Mar 12, 2026", points: 50 },
  { name: "Webinar Certificate - AI Ethics.pdf", status: "pending", date: "Mar 10, 2026", points: 0 },
  { name: "National Seminar - Data Science.pdf", status: "verified", date: "Mar 8, 2026", points: 40 },
];

interface OverviewSectionProps {
  onNavigate: (tab: "upload" | "activity" | "leaderboard") => void;
}

const OverviewSection = ({ onNavigate }: OverviewSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, Dr. Priya Sharma</h1>
        <p className="text-muted-foreground mt-1">Here's your activity overview for NAAC Criteria 6</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
                <p className={`text-2xl font-display font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Recent Uploads</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("activity")} className="text-primary">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentUploads.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.points > 0 && (
                    <span className="text-xs font-semibold text-gamification">+{doc.points} pts</span>
                  )}
                  <Badge variant={doc.status === "verified" ? "default" : "secondary"}
                    className={doc.status === "verified" ? "bg-success text-success-foreground" : ""}>
                    {doc.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full justify-start" onClick={() => onNavigate("upload")}>
              <Upload className="w-4 h-4 mr-2" /> Upload New Document
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("leaderboard")}>
              <Trophy className="w-4 h-4 mr-2" /> View Leaderboard
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("activity")}>
              <TrendingUp className="w-4 h-4 mr-2" /> My Activity Log
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;
