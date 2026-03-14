import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  { id: 1, name: "FDP on Machine Learning", type: "FDP", role: "Participant", date: "Mar 12, 2026", status: "verified", points: 50 },
  { id: 2, name: "Webinar - AI Ethics in Education", type: "Webinar", role: "Resource Person", date: "Mar 10, 2026", status: "pending", points: 0 },
  { id: 3, name: "National Seminar on Data Science", type: "Seminar", role: "Organizer", date: "Mar 8, 2026", status: "verified", points: 60 },
  { id: 4, name: "Workshop on Cloud Computing", type: "Workshop", role: "Participant", date: "Mar 5, 2026", status: "verified", points: 40 },
  { id: 5, name: "Guest Lecture - Cybersecurity", type: "Guest Lecture", role: "Attendee", date: "Feb 28, 2026", status: "rejected", points: 0 },
  { id: 6, name: "International Conference on IoT", type: "Conference", role: "Co-organizer", date: "Feb 20, 2026", status: "verified", points: 70 },
  { id: 7, name: "Hackathon - Smart India", type: "Hackathon", role: "Organizer", date: "Feb 15, 2026", status: "verified", points: 80 },
];

const statusMap = {
  verified: { icon: CheckCircle2, color: "bg-success text-success-foreground", label: "Verified" },
  pending: { icon: Clock, color: "bg-gamification text-gamification-foreground", label: "Pending" },
  rejected: { icon: XCircle, color: "bg-destructive text-destructive-foreground", label: "Rejected" },
};

const ActivitySection = () => {
  const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Activity</h1>
          <p className="text-muted-foreground mt-1">Track all your uploaded documents and their status</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Points</p>
          <p className="text-2xl font-display font-bold text-gamification">{totalPoints}</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((a) => {
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
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{a.role}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{a.date}</span>
                    </div>
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
      </div>
    </div>
  );
};

export default ActivitySection;
