import { describe, it, expect } from "vitest";
import {
  TokenBucketRateLimiter,
  hasPermission,
  getPermissions,
  assessFraudRisk,
} from "@/lib/securityUtils";

describe("securityUtils", () => {
  describe("TokenBucketRateLimiter", () => {
    it("allows initial requests within capacity", () => {
      const limiter = new TokenBucketRateLimiter({ maxTokens: 5, refillRate: 1, refillInterval: 1000 });
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
    });

    it("denies requests after exhausting tokens", () => {
      const limiter = new TokenBucketRateLimiter({ maxTokens: 2, refillRate: 0.01, refillInterval: 1000 });
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(false);
    });

    it("reports remaining tokens", () => {
      const limiter = new TokenBucketRateLimiter({ maxTokens: 5, refillRate: 1, refillInterval: 1000 });
      expect(limiter.getRemaining()).toBe(5);
      limiter.tryConsume();
      expect(limiter.getRemaining()).toBe(4);
    });
  });

  describe("RBAC", () => {
    it("grants faculty upload permission", () => {
      expect(hasPermission("faculty", "create", "upload")).toBe(true);
    });

    it("denies faculty user management", () => {
      expect(hasPermission("faculty", "manage", "users")).toBe(false);
    });

    it("grants admin all permissions", () => {
      expect(hasPermission("admin", "create", "upload")).toBe(true);
      expect(hasPermission("admin", "manage", "users")).toBe(true);
      expect(hasPermission("admin", "verify", "documents")).toBe(true);
    });

    it("restricts guest permissions", () => {
      expect(hasPermission("guest", "create", "upload")).toBe(false);
      expect(hasPermission("guest", "read", "leaderboard")).toBe(true);
    });

    it("returns permissions list for a role", () => {
      const perms = getPermissions("reviewer");
      expect(perms.length).toBeGreaterThan(0);
      expect(perms.some((p) => p.action === "verify" && p.resource === "documents")).toBe(true);
    });
  });

  describe("assessFraudRisk", () => {
    it("returns low risk for normal uploads", () => {
      const result = assessFraudRisk({
        isDuplicate: false,
        duplicateSimilarity: 0.1,
        uploadsInLastHour: 1,
        uploadsInLastDay: 3,
        isAcademicYearValid: true,
        fileSize: 500 * 1024,
        hasMetadata: true,
      });
      expect(result.riskLevel).toBe("low");
      expect(result.signals.length).toBe(0);
    });

    it("flags duplicates as high risk", () => {
      const result = assessFraudRisk({
        isDuplicate: true,
        duplicateSimilarity: 1.0,
        uploadsInLastHour: 1,
        uploadsInLastDay: 3,
        isAcademicYearValid: true,
        fileSize: 500 * 1024,
        hasMetadata: true,
      });
      expect(result.riskLevel).toBe("high");
      expect(result.signals.some((s) => s.signal.includes("Duplicate"))).toBe(true);
    });

    it("flags upload velocity anomaly", () => {
      const result = assessFraudRisk({
        isDuplicate: false,
        duplicateSimilarity: 0,
        uploadsInLastHour: 10,
        uploadsInLastDay: 20,
        isAcademicYearValid: true,
        fileSize: 500 * 1024,
        hasMetadata: true,
      });
      expect(result.signals.some((s) => s.signal.includes("uploads in the last hour"))).toBe(true);
    });

    it("flags academic year mismatch", () => {
      const result = assessFraudRisk({
        isDuplicate: false,
        duplicateSimilarity: 0,
        uploadsInLastHour: 1,
        uploadsInLastDay: 1,
        isAcademicYearValid: false,
        fileSize: 500 * 1024,
        hasMetadata: true,
      });
      expect(result.signals.some((s) => s.signal.includes("academic year"))).toBe(true);
    });

    it("flags small files", () => {
      const result = assessFraudRisk({
        isDuplicate: false,
        duplicateSimilarity: 0,
        uploadsInLastHour: 1,
        uploadsInLastDay: 1,
        isAcademicYearValid: true,
        fileSize: 1024, // 1KB
        hasMetadata: true,
      });
      expect(result.signals.some((s) => s.signal.includes("small file size"))).toBe(true);
    });
  });
});
