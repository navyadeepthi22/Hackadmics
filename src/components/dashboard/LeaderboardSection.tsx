import { Trophy, Medal, Award, Star, TrendingUp, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

const rankIcons = [Trophy, Medal, Award];
const badgeIcons: Record<string, React.ElementType> = {
  Award: Award,
  Star: Star,
  Lightbulb: Lightbulb,
  Trophy: Trophy,
};

const LeaderboardSection = () => {
  const { getLeaderboard, getBadges, getSponsorMatches, state } = useAppStore();
  const leaderboard = getLeaderboard();
  const badges = getBadges();
  const sponsors = getSponsorMatches();

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
          <p className="text-xs text-muted-foreground mb-3">
            Ranked by decayed points (recent activity weighted higher) with tie-breakers for recency and diversity
          </p>
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const RankIcon = entry.rank <= 3 ? rankIcons[entry.rank - 1] : null;
              const isCurrentUser = entry.userId === state.user.id;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isCurrentUser ? "bg-primary/5 border border-primary/20" : "bg-muted/50 hover:bg-muted"
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
                        {entry.name} {isCurrentUser && <span className="text-primary">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.department} &bull; {entry.eventCount} events &bull; {entry.activityDiversity} types
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs border-gamification/30 text-gamification">{entry.badge}</Badge>
                    <span className="font-display font-bold text-gamification">{entry.decayedPoints.toLocaleString()}</span>
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
              {badges.map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Award;
                return (
                  <div key={badge.name} className={`flex items-center gap-3 p-2 rounded-lg ${badge.earned ? "bg-gamification/5" : "bg-muted/50 opacity-50"}`}>
                    <div className={`p-1.5 rounded-lg ${badge.earned ? "bg-gamification/10" : "bg-muted"}`}>
                      <IconComponent className={`w-4 h-4 ${badge.earned ? "text-gamification" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                    {badge.earned && <Badge className="ml-auto bg-gamification text-gamification-foreground text-xs">Earned</Badge>}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Suggested Sponsors
            </h2>
            <p className="text-xs text-muted-foreground mb-3">Matched using content similarity between your profile and sponsor focus areas</p>
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
