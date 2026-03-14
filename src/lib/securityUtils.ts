/**
 * Security & Integrity Utilities
 * 
 * 1. Rate Limiting - Token bucket algorithm
 * 2. RBAC - Role-based access control
 * 3. Fraud Detection - Rule-based anomaly detection
 */

// ---- Rate Limiting (Token Bucket) ----

export interface RateLimiterConfig {
  maxTokens: number;        // bucket capacity
  refillRate: number;        // tokens added per second
  refillInterval: number;    // interval in ms
}

export class TokenBucketRateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(config: RateLimiterConfig) {
    this.maxTokens = config.maxTokens;
    this.tokens = config.maxTokens;
    this.refillRate = config.refillRate;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Try to consume a token. Returns true if allowed, false if rate limited.
   */
  tryConsume(tokens: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  /**
   * Get remaining tokens.
   */
  getRemaining(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// ---- RBAC (Role-Based Access Control) ----

export type UserRole = "faculty" | "admin" | "reviewer" | "guest";

export interface Permission {
  action: string;
  resource: string;
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  faculty: [
    { action: "create", resource: "upload" },
    { action: "read", resource: "own_activity" },
    { action: "read", resource: "leaderboard" },
    { action: "read", resource: "recommendations" },
    { action: "read", resource: "own_profile" },
    { action: "use", resource: "chatbot" },
  ],
  admin: [
    { action: "create", resource: "upload" },
    { action: "read", resource: "all_activity" },
    { action: "read", resource: "own_activity" },
    { action: "read", resource: "leaderboard" },
    { action: "read", resource: "recommendations" },
    { action: "read", resource: "own_profile" },
    { action: "manage", resource: "users" },
    { action: "verify", resource: "documents" },
    { action: "delete", resource: "documents" },
    { action: "use", resource: "chatbot" },
    { action: "read", resource: "analytics" },
    { action: "manage", resource: "settings" },
  ],
  reviewer: [
    { action: "read", resource: "all_activity" },
    { action: "verify", resource: "documents" },
    { action: "read", resource: "leaderboard" },
    { action: "use", resource: "chatbot" },
  ],
  guest: [
    { action: "read", resource: "leaderboard" },
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, action: string, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.some(
    (p) => (p.action === action || p.action === "manage") && p.resource === resource
  );
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// ---- Fraud Detection (Rules + Anomaly) ----

export interface FraudSignal {
  signal: string;
  severity: "low" | "medium" | "high";
  score: number; // 0–1
}

export interface FraudAssessment {
  riskScore: number; // 0–1
  riskLevel: "low" | "medium" | "high";
  signals: FraudSignal[];
}

/**
 * Assess fraud risk for an upload based on rule-based signals.
 */
export function assessFraudRisk(params: {
  isDuplicate: boolean;
  duplicateSimilarity: number;
  uploadsInLastHour: number;
  uploadsInLastDay: number;
  isAcademicYearValid: boolean;
  fileSize: number;
  hasMetadata: boolean;
}): FraudAssessment {
  const signals: FraudSignal[] = [];

  // Rule 1: Duplicate submission
  if (params.isDuplicate) {
    signals.push({
      signal: "Duplicate document detected",
      severity: "high",
      score: 0.8,
    });
  } else if (params.duplicateSimilarity > 0.5) {
    signals.push({
      signal: `High similarity (${(params.duplicateSimilarity * 100).toFixed(0)}%) with existing document`,
      severity: "medium",
      score: 0.4,
    });
  }

  // Rule 2: Upload velocity anomaly
  if (params.uploadsInLastHour > 5) {
    signals.push({
      signal: `${params.uploadsInLastHour} uploads in the last hour (unusual spike)`,
      severity: "high",
      score: 0.7,
    });
  } else if (params.uploadsInLastDay > 15) {
    signals.push({
      signal: `${params.uploadsInLastDay} uploads today (above average)`,
      severity: "medium",
      score: 0.3,
    });
  }

  // Rule 3: Academic year mismatch
  if (!params.isAcademicYearValid) {
    signals.push({
      signal: "Event date outside current academic year",
      severity: "medium",
      score: 0.5,
    });
  }

  // Rule 4: Suspiciously small file
  if (params.fileSize < 5 * 1024) { // < 5KB
    signals.push({
      signal: "Very small file size (possible blank/template document)",
      severity: "low",
      score: 0.2,
    });
  }

  // Rule 5: Missing metadata
  if (!params.hasMetadata) {
    signals.push({
      signal: "Could not extract metadata from document",
      severity: "low",
      score: 0.15,
    });
  }

  // Compute weighted risk score
  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
  const riskScore = Math.min(1, totalScore / (signals.length > 0 ? 1 + Math.log(signals.length) : 1));

  const riskLevel = riskScore >= 0.6 ? "high" : riskScore >= 0.3 ? "medium" : "low";

  return { riskScore, riskLevel, signals };
}
