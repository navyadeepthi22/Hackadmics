import { FileText, Upload, Trophy, TrendingUp, ArrowRight, Shield, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

interface OverviewSectionProps {
  onNavigate: (tab: "upload" | "activity" | "leaderboard") => void;
}

const OverviewSection = ({ onNavigate }: OverviewSectionProps) => {
  const { state, getTotalPoints, getVerifiedCount, getLeaderboard, getRecentActivities } = useAppStore();

  const totalPoints = getTotalPoints();
  const verifiedCount = getVerifiedCount();
  const totalActivities = state.activities.length;
  const leaderboard = getLeaderboard();
  const currentRank = leaderboard.find((e) => e.userId === state.user.id)?.rank || "-";
  const organizerCount = state.activities.filter(
    (a) => a.status === "verified" && (a.role === "Organizer" || a.role === "Co-organizer")
  ).length;
  const verifiedRate = totalActivities > 0 ? ((verifiedCount / totalActivities) * 100).toFixed(1) : "0";

  const recentActivities = getRecentActivities().slice(0, 3);

  const stats = [
    { label: "Documents Uploaded", value: totalActivities.toString(), icon: FileText, change: `+${state.activities.filter((a) => { const d = new Date(a.date); const now = new Date(); return d.getMonth() === now.getMonth(); }).length} this month`, color: "text-primary" },
    { label: "Verified Files", value: verifiedCount.toString(), icon: Upload, change: `${verifiedRate}% rate`, color: "text-success" },
    { label: "Total Points", value: totalPoints.toLocaleString(), icon: Trophy, change: `Rank #${currentRank}`, color: "text-gamification" },
    { label: "Activities", value: totalActivities.toString(), icon: TrendingUp, change: `${organizerCount} as organizer`, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, {state.user.name}</h1>
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
            {recentActivities.length > 0 ? (
              recentActivities.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date} &bull; {doc.type} &bull; {doc.role}</p>
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
              ))
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No uploads yet. Start by uploading a document!</p>
              </div>
            )}
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

          {/* Security Info */}
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <p className="text-xs font-display font-semibold text-primary">Security Active</p>
            </div>
            <p className="text-xs text-muted-foreground">Rate limiting, duplicate detection, and fraud checks are enabled for all uploads.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;
