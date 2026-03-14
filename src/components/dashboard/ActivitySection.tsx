import { useState } from "react";
import { FileText, CheckCircle2, Clock, XCircle, TrendingUp, TrendingDown, BarChart3, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

const statusMap = {
  verified: { icon: CheckCircle2, color: "bg-success text-success-foreground", label: "Verified" },
  pending: { icon: Clock, color: "bg-gamification text-gamification-foreground", label: "Pending" },
  rejected: { icon: XCircle, color: "bg-destructive text-destructive-foreground", label: "Rejected" },
};

const ActivitySection = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const { getRecentActivities, getTotalPoints, getWeeklyPoints, getVerifiedCount, state } = useAppStore();

  const allActivities = getRecentActivities();
  const totalPoints = getTotalPoints();
  const weeklyPoints = getWeeklyPoints();
  const verifiedCount = getVerifiedCount();

  // Apply filters
  const filteredActivities = allActivities.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    return true;
  });

  // Compute insights
  const pendingCount = allActivities.filter((a) => a.status === "pending").length;
  const uniqueTypes = new Set(allActivities.map((a) => a.type)).size;

  // Week-over-week growth (simplified)
  const thisWeekCount = allActivities.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;
  const prevWeekCount = allActivities.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return d >= twoWeeksAgo && d < weekAgo;
  }).length;
  const growthRate = prevWeekCount > 0 ? ((thisWeekCount - prevWeekCount) / prevWeekCount * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Activity</h1>
          <p className="text-muted-foreground mt-1">Track all your uploaded documents and their status</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Points (decayed)</p>
          <p className="text-2xl font-display font-bold text-gamification">{totalPoints}</p>
        </div>
      </div>

      {/* Insights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Verified</p>
          <p className="text-lg font-display font-bold text-success">{verifiedCount}</p>
          <p className="text-xs text-muted-foreground">{allActivities.length > 0 ? ((verifiedCount / allActivities.length) * 100).toFixed(0) : 0}% rate</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-lg font-display font-bold text-gamification">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">awaiting review</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Weekly Points</p>
          <p className="text-lg font-display font-bold text-primary">{weeklyPoints}</p>
          <p className="text-xs text-muted-foreground">of 200 cap</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Week Growth</p>
          <div className="flex items-center gap-1">
            <p className={`text-lg font-display font-bold ${growthRate >= 0 ? "text-success" : "text-destructive"}`}>
              {growthRate >= 0 ? "+" : ""}{growthRate.toFixed(0)}%
            </p>
            {growthRate >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
          </div>
          <p className="text-xs text-muted-foreground">{uniqueTypes} activity types</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FDP">FDP</SelectItem>
            <SelectItem value="Webinar">Webinar</SelectItem>
            <SelectItem value="Seminar">Seminar</SelectItem>
            <SelectItem value="Workshop">Workshop</SelectItem>
            <SelectItem value="Conference">Conference</SelectItem>
            <SelectItem value="Guest Lecture">Guest Lecture</SelectItem>
            <SelectItem value="Hackathon">Hackathon</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filteredActivities.length} of {allActivities.length} activities</span>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((a) => {
          const status = statusMap[a.status as keyof typeof statusMap];
          return (
            <Card key={a.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{a.type}</span>
                      <span className="text-xs text-muted-foreground">&bull;</span>
                      <span className="text-xs text-muted-foreground">{a.role}</span>
                      <span className="text-xs text-muted-foreground">&bull;</span>
                      <span className="text-xs text-muted-foreground">{a.date}</span>
                    </div>
                    {a.tags && a.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {a.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.points > 0 && <span className="text-sm font-display font-bold text-gamification">+{a.points}</span>}
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredActivities.length === 0 && (
          <Card className="p-8 text-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activities match your filters</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ActivitySection;
