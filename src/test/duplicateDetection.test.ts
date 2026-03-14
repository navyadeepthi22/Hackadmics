import { describe, it, expect } from "vitest";
import {
  normalizeText,
  tokenize,
  cosineSimilarity,
  computeTextSimilarity,
  DuplicateDetector,
} from "@/lib/duplicateDetection";

describe("duplicateDetection", () => {
  describe("normalizeText", () => {
    it("lowercases and removes punctuation", () => {
      expect(normalizeText("Hello, World!")).toBe("hello world");
    });

    it("collapses whitespace", () => {
      expect(normalizeText("  multiple   spaces  ")).toBe("multiple spaces");
    });
  });

  describe("tokenize", () => {
    it("removes stop words", () => {
      const tokens = tokenize("The quick brown fox is jumping");
      expect(tokens).not.toContain("the");
      expect(tokens).not.toContain("is");
      expect(tokens).toContain("quick");
      expect(tokens).toContain("brown");
      expect(tokens).toContain("fox");
    });

    it("removes single-character tokens", () => {
      const tokens = tokenize("a b c fox dog");
      expect(tokens).not.toContain("b");
      expect(tokens).not.toContain("c");
      expect(tokens).toContain("fox");
      expect(tokens).toContain("dog");
    });
  });

  describe("cosineSimilarity", () => {
    it("returns 1 for identical vectors", () => {
      const vec = new Map([["a", 0.5], ["b", 0.5]]);
      expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 5);
    });

    it("returns 0 for orthogonal vectors", () => {
      const vecA = new Map([["a", 1]]);
      const vecB = new Map([["b", 1]]);
      expect(cosineSimilarity(vecA, vecB)).toBe(0);
    });
  });

  describe("computeTextSimilarity", () => {
    it("returns high similarity for same tokens", () => {
      const tokens = ["machine", "learning", "workshop"];
      const sim = computeTextSimilarity(tokens, tokens);
      expect(sim).toBeCloseTo(1, 5);
    });

    it("returns lower similarity for different tokens", () => {
      const tokensA = ["machine", "learning", "workshop"];
      const tokensB = ["cybersecurity", "network", "hacking"];
      const sim = computeTextSimilarity(tokensA, tokensB);
      expect(sim).toBe(0);
    });
  });

  describe("DuplicateDetector", () => {
    it("detects exact duplicates by hash", () => {
      const detector = new DuplicateDetector();
      detector.addDocument({
        id: "doc1",
        fileName: "test.pdf",
        hash: "abc123",
        textTokens: ["machine", "learning"],
        userId: "user1",
        eventType: "FDP",
        academicYear: "2025-2026",
        uploadDate: "2026-01-01",
      });

      const result = detector.checkDuplicate(
        "abc123", ["machine", "learning"], "FDP", "2025-2026"
      );
      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateType).toBe("exact");
      expect(result.similarity).toBe(1.0);
    });

    it("reports no duplicate for unique documents", () => {
      const detector = new DuplicateDetector();
      detector.addDocument({
        id: "doc1",
        fileName: "test.pdf",
        hash: "abc123",
        textTokens: ["machine", "learning"],
        userId: "user1",
        eventType: "FDP",
        academicYear: "2025-2026",
        uploadDate: "2026-01-01",
      });

      const result = detector.checkDuplicate(
        "xyz789", ["cybersecurity", "network"], "FDP", "2025-2026"
      );
      expect(result.isDuplicate).toBe(false);
      expect(result.duplicateType).toBe("none");
    });

    it("uses blocking strategy - only compares within same type and year", () => {
      const detector = new DuplicateDetector();
      detector.addDocument({
        id: "doc1",
        fileName: "test.pdf",
        hash: "abc123",
        textTokens: ["machine", "learning", "workshop"],
        userId: "user1",
        eventType: "FDP",
        academicYear: "2025-2026",
        uploadDate: "2026-01-01",
      });

      // Different event type - should not find near-duplicate
      const result = detector.checkDuplicate(
        "xyz789", ["machine", "learning", "workshop"], "Seminar", "2025-2026"
      );
      expect(result.isDuplicate).toBe(false);
    });
  });
});
