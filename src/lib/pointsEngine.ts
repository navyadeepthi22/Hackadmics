/**
 * Points & Scoring Engine
 * 
 * A. Points calculation - rule-based scoring by doc type + role + organizer + duration
 * B. Decay functions - older activities contribute less (exponential decay)
 * C. Caps/thresholds - prevent gaming (max points per week)
 * D. Ranking - sort by points with tie-breakers
 */

export interface PointsConfig {
  /** Base points by event type */
  eventTypePoints: Record<string, number>;
  /** Multiplier by role */
  roleMultiplier: Record<string, number>;
  /** Bonus for organizer-tier events */
  organizerBonus: number;
  /** Half-life for decay (days) */
  decayHalfLifeDays: number;
  /** Max points per week cap */
  weeklyPointsCap: number;
}

export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  eventTypePoints: {
    FDP: 50,
    Workshop: 40,
    Conference: 60,
    Seminar: 35,
    Webinar: 30,
    "Guest Lecture": 35,
    Hackathon: 55,
  },
  roleMultiplier: {
    "Resource Person": 1.5,
    Organizer: 1.4,
    "Co-organizer": 1.2,
    Panelist: 1.1,
    Participant: 1.0,
    Attendee: 0.8,
  },
  organizerBonus: 10,
  decayHalfLifeDays: 180, // 6 months
  weeklyPointsCap: 200,
};

/**
 * Calculate raw points for a single activity.
 */
export function calculateActivityPoints(
  eventType: string,
  role: string,
  config: PointsConfig = DEFAULT_POINTS_CONFIG
): number {
  const basePoints = config.eventTypePoints[eventType] || 30;
  const multiplier = config.roleMultiplier[role] || 1.0;
  const bonus =
    role === "Organizer" || role === "Co-organizer" || role === "Resource Person"
      ? config.organizerBonus
      : 0;

  return Math.round(basePoints * multiplier + bonus);
}

/**
 * Apply exponential decay to points based on activity age.
 * Points decay by 50% every `halfLifeDays`.
 */
export function applyDecay(
  points: number,
  activityDate: Date,
  referenceDate: Date = new Date(),
  halfLifeDays: number = DEFAULT_POINTS_CONFIG.decayHalfLifeDays
): number {
  const daysDiff = (referenceDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 0) return points;
  const decayFactor = Math.pow(0.5, daysDiff / halfLifeDays);
  return Math.round(points * decayFactor);
}

/**
 * Apply weekly points cap: returns the adjusted points if the cap would be exceeded.
 */
export function applyWeeklyCap(
  newPoints: number,
  existingWeeklyPoints: number,
  cap: number = DEFAULT_POINTS_CONFIG.weeklyPointsCap
): number {
  const remaining = Math.max(0, cap - existingWeeklyPoints);
  return Math.min(newPoints, remaining);
}

/**
 * Get the ISO week start date for a given date.
 */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export interface RankedEntry {
  userId: string;
  name: string;
  department: string;
  totalPoints: number;
  decayedPoints: number;
  eventCount: number;
  mostRecentDate: Date | null;
  activityDiversity: number; // number of unique event types
  rank: number;
  badge: string;
}

/**
 * Compute rankings from a list of user activities.
 * Tie-breakers: most recent contribution, then activity diversity.
 */
export function computeRankings(
  entries: Omit<RankedEntry, "rank" | "badge">[]
): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => {
    // Primary: decayed points descending
    if (b.decayedPoints !== a.decayedPoints) return b.decayedPoints - a.decayedPoints;
    // Tie-breaker 1: most recent activity
    const dateA = a.mostRecentDate?.getTime() || 0;
    const dateB = b.mostRecentDate?.getTime() || 0;
    if (dateB !== dateA) return dateB - dateA;
    // Tie-breaker 2: activity diversity
    return b.activityDiversity - a.activityDiversity;
  });

  return sorted.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    badge: getBadgeForRank(i + 1, entry.decayedPoints),
  }));
}

/**
 * Assign badge based on rank and points.
 */
const BADGE_THRESHOLDS = {
  RISING_STAR_POINTS: 1000,
  ACTIVE_CONTRIBUTOR_POINTS: 500,
} as const;

function getBadgeForRank(rank: number, points: number): string {
  if (rank === 1) return "Gold Researcher";
  if (rank === 2) return "Silver Scholar";
  if (rank === 3) return "Bronze Mentor";
  if (points >= BADGE_THRESHOLDS.RISING_STAR_POINTS) return "Rising Star";
  if (points >= BADGE_THRESHOLDS.ACTIVE_CONTRIBUTOR_POINTS) return "Active Contributor";
  return "Newcomer";
}

/**
 * Compute sponsor match percentage using tag-based content similarity.
 */
export function computeSponsorMatch(
  userTags: string[],
  sponsorTags: string[]
): number {
  if (userTags.length === 0 || sponsorTags.length === 0) return 0;
  const userSet = new Set(userTags.map((t) => t.toLowerCase()));
  const sponsorSet = new Set(sponsorTags.map((t) => t.toLowerCase()));
  let intersection = 0;
  for (const tag of sponsorSet) {
    if (userSet.has(tag)) intersection++;
  }
  const union = new Set([...userSet, ...sponsorSet]).size;
  // Jaccard similarity
  const jaccard = union > 0 ? intersection / union : 0;
  // Scale to a more useful range (50–100%)
  return Math.round(50 + jaccard * 50);
}

export interface AchievementBadge {
  name: string;
  description: string;
  earned: boolean;
  icon: string;
}

/**
 * Evaluate which achievement badges a user has earned based on their activity.
 */
export function evaluateBadges(
  uploadCount: number,
  organizerCount: number,
  researchCount: number,
  rank: number
): AchievementBadge[] {
  return [
    {
      name: "First Upload",
      description: "Upload your first document",
      earned: uploadCount >= 1,
      icon: "Award",
    },
    {
      name: "Organizer Pro",
      description: "Organize 5+ events",
      earned: organizerCount >= 5,
      icon: "Star",
    },
    {
      name: "Research Pioneer",
      description: "Submit 10 research papers",
      earned: researchCount >= 10,
      icon: "Lightbulb",
    },
    {
      name: "Top Performer",
      description: "Reach Top 3 on leaderboard",
      earned: rank <= 3,
      icon: "Trophy",
    },
  ];
}
