import { describe, it, expect } from "vitest";
import {
  calculateActivityPoints,
  applyDecay,
  applyWeeklyCap,
  getWeekStart,
  computeRankings,
  computeSponsorMatch,
  evaluateBadges,
  DEFAULT_POINTS_CONFIG,
} from "@/lib/pointsEngine";

describe("pointsEngine", () => {
  describe("calculateActivityPoints", () => {
    it("calculates base points for FDP Participant", () => {
      const points = calculateActivityPoints("FDP", "Participant");
      expect(points).toBe(50); // 50 * 1.0 + 0
    });

    it("applies role multiplier for Resource Person", () => {
      const points = calculateActivityPoints("FDP", "Resource Person");
      expect(points).toBe(85); // 50 * 1.5 + 10
    });

    it("applies organizer bonus", () => {
      const points = calculateActivityPoints("Conference", "Organizer");
      expect(points).toBe(94); // 60 * 1.4 + 10
    });

    it("uses default points for unknown event types", () => {
      const points = calculateActivityPoints("Unknown", "Participant");
      expect(points).toBe(30); // 30 * 1.0
    });
  });

  describe("applyDecay", () => {
    it("does not decay recent activities", () => {
      const now = new Date();
      const result = applyDecay(100, now, now);
      expect(result).toBe(100);
    });

    it("halves points at half-life", () => {
      const now = new Date();
      const halfLifeAgo = new Date(now.getTime() - DEFAULT_POINTS_CONFIG.decayHalfLifeDays * 24 * 60 * 60 * 1000);
      const result = applyDecay(100, halfLifeAgo, now);
      expect(result).toBe(50);
    });

    it("quarters points at 2x half-life", () => {
      const now = new Date();
      const twoHalfLivesAgo = new Date(now.getTime() - 2 * DEFAULT_POINTS_CONFIG.decayHalfLifeDays * 24 * 60 * 60 * 1000);
      const result = applyDecay(100, twoHalfLivesAgo, now);
      expect(result).toBe(25);
    });
  });

  describe("applyWeeklyCap", () => {
    it("allows points within cap", () => {
      expect(applyWeeklyCap(50, 100)).toBe(50);
    });

    it("caps points at remaining weekly limit", () => {
      expect(applyWeeklyCap(50, 180)).toBe(20);
    });

    it("returns 0 when cap is reached", () => {
      expect(applyWeeklyCap(50, 200)).toBe(0);
    });
  });

  describe("getWeekStart", () => {
    it("returns a date string", () => {
      const result = getWeekStart(new Date("2026-03-14"));
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("computeRankings", () => {
    it("ranks by decayed points descending", () => {
      const entries = [
        { userId: "a", name: "A", department: "CS", totalPoints: 100, decayedPoints: 80, eventCount: 3, mostRecentDate: new Date(), activityDiversity: 2 },
        { userId: "b", name: "B", department: "CS", totalPoints: 200, decayedPoints: 150, eventCount: 5, mostRecentDate: new Date(), activityDiversity: 4 },
      ];
      const ranked = computeRankings(entries);
      expect(ranked[0].userId).toBe("b");
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
    });

    it("applies tie-breaker by most recent date", () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const entries = [
        { userId: "a", name: "A", department: "CS", totalPoints: 100, decayedPoints: 100, eventCount: 3, mostRecentDate: yesterday, activityDiversity: 2 },
        { userId: "b", name: "B", department: "CS", totalPoints: 100, decayedPoints: 100, eventCount: 3, mostRecentDate: now, activityDiversity: 2 },
      ];
      const ranked = computeRankings(entries);
      expect(ranked[0].userId).toBe("b");
    });

    it("assigns badges based on rank", () => {
      const entries = [
        { userId: "a", name: "A", department: "CS", totalPoints: 500, decayedPoints: 500, eventCount: 10, mostRecentDate: new Date(), activityDiversity: 5 },
      ];
      const ranked = computeRankings(entries);
      expect(ranked[0].badge).toBe("Gold Researcher");
    });
  });

  describe("computeSponsorMatch", () => {
    it("returns higher match for overlapping tags", () => {
      const match = computeSponsorMatch(["AI", "ML", "NLP"], ["AI", "ML", "Data Science"]);
      expect(match).toBeGreaterThan(50);
    });

    it("returns 50 for no overlap", () => {
      const match = computeSponsorMatch(["AI", "ML"], ["Robotics", "Mechanical"]);
      expect(match).toBe(50);
    });

    it("returns 0 for empty arrays", () => {
      expect(computeSponsorMatch([], ["AI"])).toBe(0);
    });
  });

  describe("evaluateBadges", () => {
    it("earns First Upload badge", () => {
      const badges = evaluateBadges(1, 0, 0, 10);
      expect(badges.find((b) => b.name === "First Upload")?.earned).toBe(true);
    });

    it("earns Top Performer badge at rank 3", () => {
      const badges = evaluateBadges(10, 5, 10, 3);
      expect(badges.find((b) => b.name === "Top Performer")?.earned).toBe(true);
    });

    it("does not earn Organizer Pro with < 5 events", () => {
      const badges = evaluateBadges(5, 3, 5, 10);
      expect(badges.find((b) => b.name === "Organizer Pro")?.earned).toBe(false);
    });
  });
});
