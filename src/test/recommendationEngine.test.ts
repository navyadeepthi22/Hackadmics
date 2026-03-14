import { describe, it, expect } from "vitest";
import {
  buildUserProfile,
  recommendEvents,
  recommendNews,
  recommendResearchTrends,
} from "@/lib/recommendationEngine";

describe("recommendationEngine", () => {
  describe("buildUserProfile", () => {
    it("includes department tags and uploaded tags", () => {
      const profile = buildUserProfile("Computer Science", ["FDP"], ["AI", "IoT"], ["Participant"]);
      expect(profile.interests).toContain("AI");
      expect(profile.interests).toContain("IoT");
      // Department tags for CS include Machine Learning
      expect(profile.interests).toContain("Machine Learning");
    });

    it("deduplicates interests", () => {
      const profile = buildUserProfile("Computer Science", ["FDP"], ["AI"], ["Participant"]);
      const aiCount = profile.interests.filter((t) => t === "AI").length;
      expect(aiCount).toBe(1);
    });
  });

  describe("recommendEvents", () => {
    it("returns events sorted by relevance", () => {
      const profile = buildUserProfile("Computer Science", ["FDP", "FDP"], ["AI", "Machine Learning"], ["Participant"]);
      const events = recommendEvents(profile);
      expect(events.length).toBeGreaterThan(0);
      // First event should have highest relevance
      for (let i = 1; i < events.length; i++) {
        expect(events[i - 1].relevance).toBeGreaterThanOrEqual(events[i].relevance);
      }
    });

    it("boosts events matching uploaded types", () => {
      const profileWithFDP = buildUserProfile("Computer Science", ["FDP", "FDP", "FDP"], ["AI"], ["Participant"]);
      const profileWithoutFDP = buildUserProfile("Computer Science", [], ["AI"], ["Participant"]);
      const eventsWithFDP = recommendEvents(profileWithFDP);
      const eventsWithoutFDP = recommendEvents(profileWithoutFDP);
      // Find the FDP events in each
      const fdpWithBoost = eventsWithFDP.find((e) => e.type === "FDP");
      const fdpWithoutBoost = eventsWithoutFDP.find((e) => e.type === "FDP");
      if (fdpWithBoost && fdpWithoutBoost) {
        expect(fdpWithBoost.relevance).toBeGreaterThanOrEqual(fdpWithoutBoost.relevance);
      }
    });
  });

  describe("recommendNews", () => {
    it("returns news sorted by relevance", () => {
      const profile = buildUserProfile("Computer Science", [], ["AI"], []);
      const news = recommendNews(profile);
      expect(news.length).toBeGreaterThan(0);
      for (let i = 1; i < news.length; i++) {
        expect(news[i - 1].relevance).toBeGreaterThanOrEqual(news[i].relevance);
      }
    });
  });

  describe("recommendResearchTrends", () => {
    it("returns research trends sorted by relevance", () => {
      const profile = buildUserProfile("Computer Science", [], ["AI"], []);
      const trends = recommendResearchTrends(profile);
      expect(trends.length).toBeGreaterThan(0);
      for (let i = 1; i < trends.length; i++) {
        expect(trends[i - 1].relevance).toBeGreaterThanOrEqual(trends[i].relevance);
      }
    });
  });
});
