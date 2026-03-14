import { Trophy, Medal, Award, Star, TrendingUp, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const leaderboard = [
  { rank: 1, name: "Dr. Rajesh Kumar", dept: "Electronics", points: 2140, badge: "Gold Researcher", events: 32 },
  { rank: 2, name: "Dr. Meena Iyer", dept: "Computer Science", points: 1890, badge: "Silver Scholar", events: 28 },
  { rank: 3, name: "Dr. Anil Verma", dept: "Mathematics", points: 1650, badge: "Bronze Mentor", events: 24 },
  { rank: 4, name: "Dr. Priya Sharma", dept: "Computer Science", points: 1280, badge: "Rising Star", events: 18, isCurrentUser: true },
  { rank: 5, name: "Dr. Suresh Nair", dept: "Physics", points: 1100, badge: "Active Contributor", events: 15 },
  { rank: 6, name: "Dr. Kavita Reddy", dept: "Civil", points: 980, badge: "Active Contributor", events: 12 },
];

const badges = [
  { name: "First Upload", icon: Award, earned: true, description: "Upload your first document" },
  { name: "Organizer Pro", icon: Star, earned: true, description: "Organize 5+ events" },
  { name: "Research Pioneer", icon: Lightbulb, earned: false, description: "Submit 10 research papers" },
  { name: "Top Performer", icon: Trophy, earned: false, description: "Reach Top 3 on leaderboard" },
];

const sponsors = [
  { name: "IEEE Computer Society", match: "95%", area: "AI & ML Conferences" },
  { name: "ACM India Council", match: "88%", area: "Computing Education" },
  { name: "AICTE", match: "82%", area: "Faculty Development Programs" },
];

const rankIcons = [Trophy, Medal, Award];

const LeaderboardSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Leaderboard & Rewards</h1>
        <p className="text-muted-foreground mt-1">Rankings, badges, and sponsor recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rankings */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gamification" /> Faculty Rankings
          </h2>
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const RankIcon = entry.rank <= 3 ? rankIcons[entry.rank - 1] : null;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.isCurrentUser ? "bg-primary/5 border border-primary/20" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                      entry.rank === 1 ? "bg-gamification text-gamification-foreground" :
                      entry.rank === 2 ? "bg-muted-foreground/20 text-foreground" :
                      entry.rank === 3 ? "bg-gamification/30 text-gamification" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {RankIcon ? <RankIcon className="w-4 h-4" /> : entry.rank}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.name} {entry.isCurrentUser && <span className="text-primary">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.dept} • {entry.events} events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs border-gamification/30 text-gamification">{entry.badge}</Badge>
                    <span className="font-display font-bold text-gamification">{entry.points.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Badges + Sponsors */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-gamification" /> Your Badges
            </h2>
            <div className="space-y-3">
              {badges.map((badge) => (
                <div key={badge.name} className={`flex items-center gap-3 p-2 rounded-lg ${badge.earned ? "bg-gamification/5" : "bg-muted/50 opacity-50"}`}>
                  <div className={`p-1.5 rounded-lg ${badge.earned ? "bg-gamification/10" : "bg-muted"}`}>
                    <badge.icon className={`w-4 h-4 ${badge.earned ? "text-gamification" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                  {badge.earned && <Badge className="ml-auto bg-gamification text-gamification-foreground text-xs">Earned</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Suggested Sponsors
            </h2>
            <p className="text-xs text-muted-foreground mb-3">Based on your activity as an organizer</p>
            <div className="space-y-3">
              {sponsors.map((s) => (
                <div key={s.name} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <Badge variant="outline" className="text-xs text-success border-success/30">{s.match} match</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.area}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSection;
