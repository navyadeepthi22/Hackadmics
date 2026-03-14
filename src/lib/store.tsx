/**
 * Application State Store
 * Central React Context that connects all dynamic sections.
 * Manages uploads, activities, user profile, and computed state.
 */

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import {
  calculateActivityPoints,
  applyDecay,
  applyWeeklyCap,
  getWeekStart,
  computeRankings,
  computeSponsorMatch,
  evaluateBadges,
  type RankedEntry,
  type AchievementBadge,
} from "./pointsEngine";
import {
  buildUserProfile,
  recommendEvents,
  recommendNews,
  recommendResearchTrends,
  type ScoredEvent,
  type ScoredNews,
  type ScoredResearchTrend,
  type UserProfile,
} from "./recommendationEngine";
import {
  DuplicateDetector,
  type DocumentRecord,
  type DuplicateCheckResult,
} from "./duplicateDetection";
import {
  classifyFile,
  type ClassificationResult,
} from "./fileClassifier";
import {
  assessFraudRisk,
  TokenBucketRateLimiter,
  type FraudAssessment,
} from "./securityUtils";

// ---- Types ----

export type ActivityStatus = "verified" | "pending" | "rejected";

export interface ActivityRecord {
  id: string;
  name: string;
  type: string;
  role: string;
  date: string;
  status: ActivityStatus;
  points: number;
  department: string;
  fileName: string;
  tags: string[];
  duplicateInfo?: DuplicateCheckResult;
  fraudAssessment?: FraudAssessment;
  classification?: ClassificationResult;
}

export interface FacultyUser {
  id: string;
  name: string;
  department: string;
  email: string;
  role: "faculty" | "admin";
}

export interface SponsorInfo {
  name: string;
  area: string;
  tags: string[];
}

// ---- Simulated other-faculty data for leaderboard ----

const OTHER_FACULTY: { id: string; name: string; dept: string; activities: { type: string; role: string; date: string }[] }[] = [
  {
    id: "f1", name: "Dr. Rajesh Kumar", dept: "Electronics",
    activities: [
      { type: "FDP", role: "Resource Person", date: "2026-03-10" },
      { type: "Conference", role: "Organizer", date: "2026-02-20" },
      { type: "Workshop", role: "Resource Person", date: "2026-01-15" },
      { type: "Seminar", role: "Organizer", date: "2025-12-10" },
      { type: "Webinar", role: "Resource Person", date: "2025-11-05" },
      { type: "FDP", role: "Organizer", date: "2025-10-20" },
      { type: "Conference", role: "Panelist", date: "2025-09-15" },
      { type: "Hackathon", role: "Organizer", date: "2025-08-10" },
    ],
  },
  {
    id: "f2", name: "Dr. Meena Iyer", dept: "Computer Science",
    activities: [
      { type: "FDP", role: "Organizer", date: "2026-03-08" },
      { type: "Webinar", role: "Resource Person", date: "2026-02-15" },
      { type: "Conference", role: "Resource Person", date: "2026-01-10" },
      { type: "Seminar", role: "Organizer", date: "2025-12-05" },
      { type: "Workshop", role: "Participant", date: "2025-11-15" },
      { type: "FDP", role: "Resource Person", date: "2025-10-10" },
      { type: "Hackathon", role: "Co-organizer", date: "2025-09-20" },
    ],
  },
  {
    id: "f3", name: "Dr. Anil Verma", dept: "Mathematics",
    activities: [
      { type: "Seminar", role: "Resource Person", date: "2026-03-05" },
      { type: "Webinar", role: "Organizer", date: "2026-02-10" },
      { type: "Conference", role: "Participant", date: "2026-01-20" },
      { type: "FDP", role: "Participant", date: "2025-12-15" },
      { type: "Workshop", role: "Organizer", date: "2025-11-10" },
      { type: "Seminar", role: "Resource Person", date: "2025-10-05" },
    ],
  },
  {
    id: "f5", name: "Dr. Suresh Nair", dept: "Physics",
    activities: [
      { type: "Webinar", role: "Resource Person", date: "2026-02-25" },
      { type: "Seminar", role: "Participant", date: "2026-01-15" },
      { type: "Conference", role: "Participant", date: "2025-12-20" },
      { type: "FDP", role: "Attendee", date: "2025-11-05" },
    ],
  },
  {
    id: "f6", name: "Dr. Kavita Reddy", dept: "Civil",
    activities: [
      { type: "Workshop", role: "Organizer", date: "2026-02-15" },
      { type: "Seminar", role: "Participant", date: "2026-01-10" },
      { type: "FDP", role: "Participant", date: "2025-12-10" },
    ],
  },
];

const SPONSORS: SponsorInfo[] = [
  { name: "IEEE Computer Society", area: "AI & ML Conferences", tags: ["AI", "Machine Learning", "Deep Learning", "NLP", "Data Science"] },
  { name: "ACM India Council", area: "Computing Education", tags: ["Computer Science", "Education", "Research", "Conference"] },
  { name: "AICTE", area: "Faculty Development Programs", tags: ["FDP", "Workshop", "Faculty", "Education", "Policy"] },
  { name: "DST India", area: "Research Grants", tags: ["Research", "Grants", "Science", "Innovation"] },
  { name: "Microsoft Research", area: "Cloud & AI Innovation", tags: ["Cloud Computing", "AI", "Machine Learning", "Innovation", "DevOps"] },
];

// ---- Initial seed data for current user activities ----

const SEED_ACTIVITIES: Omit<ActivityRecord, "points">[] = [
  { id: "a1", name: "FDP on Machine Learning", type: "FDP", role: "Participant", date: "2026-03-12", status: "verified", department: "Computer Science", fileName: "FDP_ML_Certificate.pdf", tags: ["AI", "Machine Learning"] },
  { id: "a2", name: "Webinar - AI Ethics in Education", type: "Webinar", role: "Resource Person", date: "2026-03-10", status: "pending", department: "Computer Science", fileName: "AI_Ethics_Webinar_Cert.pdf", tags: ["AI", "Ethics", "Education"] },
  { id: "a3", name: "National Seminar on Data Science", type: "Seminar", role: "Organizer", date: "2026-03-08", status: "verified", department: "Computer Science", fileName: "DataScience_Seminar.pdf", tags: ["Data Science", "Research"] },
  { id: "a4", name: "Workshop on Cloud Computing", type: "Workshop", role: "Participant", date: "2026-03-05", status: "verified", department: "Computer Science", fileName: "Cloud_Workshop.pdf", tags: ["Cloud Computing", "DevOps"] },
  { id: "a5", name: "Guest Lecture - Cybersecurity", type: "Guest Lecture", role: "Attendee", date: "2026-02-28", status: "rejected", department: "Computer Science", fileName: "Cybersecurity_Lecture.pdf", tags: ["Cybersecurity"] },
  { id: "a6", name: "International Conference on IoT", type: "Conference", role: "Co-organizer", date: "2026-02-20", status: "verified", department: "Computer Science", fileName: "IoT_Conference.pdf", tags: ["IoT", "Edge Computing"] },
  { id: "a7", name: "Hackathon - Smart India", type: "Hackathon", role: "Organizer", date: "2026-02-15", status: "verified", department: "Computer Science", fileName: "SmartIndia_Hackathon.pdf", tags: ["Innovation", "AI", "Hackathon"] },
];

// ---- State Shape ----

interface AppState {
  user: FacultyUser;
  activities: ActivityRecord[];
  uploadTimestamps: number[]; // track upload velocity
}

type AppAction =
  | { type: "ADD_ACTIVITY"; payload: ActivityRecord }
  | { type: "UPDATE_ACTIVITY_STATUS"; payload: { id: string; status: ActivityStatus; points: number } }
  | { type: "RECORD_UPLOAD_TIMESTAMP" }
  | { type: "SET_USER"; payload: FacultyUser };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_ACTIVITY":
      return { ...state, activities: [action.payload, ...state.activities] };
    case "UPDATE_ACTIVITY_STATUS":
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === action.payload.id
            ? { ...a, status: action.payload.status, points: action.payload.points }
            : a
        ),
      };
    case "RECORD_UPLOAD_TIMESTAMP":
      return { ...state, uploadTimestamps: [...state.uploadTimestamps, Date.now()] };
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ---- Computed Values (selectors) ----

function computeInitialActivities(): ActivityRecord[] {
  return SEED_ACTIVITIES.map((a) => {
    const points = a.status === "verified" ? calculateActivityPoints(a.type, a.role) : 0;
    return { ...a, points };
  });
}

// ---- Context ----

interface AppContextValue {
  state: AppState;
  // Actions
  addActivity: (activity: Omit<ActivityRecord, "points">) => void;
  updateActivityStatus: (id: string, status: ActivityStatus) => void;
  recordUploadTimestamp: () => void;
  // Computed values
  getUserProfile: () => UserProfile;
  getTotalPoints: () => number;
  getVerifiedCount: () => number;
  getWeeklyPoints: () => number;
  getRecommendedEvents: () => ScoredEvent[];
  getRecommendedNews: () => ScoredNews[];
  getRecommendedResearch: () => ScoredResearchTrend[];
  getLeaderboard: () => RankedEntry[];
  getBadges: () => AchievementBadge[];
  getSponsorMatches: () => { name: string; area: string; match: string }[];
  getRecentActivities: () => ActivityRecord[];
  getUploadVelocity: () => { lastHour: number; lastDay: number };
  // Engines
  duplicateDetector: DuplicateDetector;
  rateLimiter: TokenBucketRateLimiter;
  classifyUploadedFile: (file: File) => ClassificationResult;
  checkFraudRisk: (params: {
    isDuplicate: boolean;
    duplicateSimilarity: number;
    isAcademicYearValid: boolean;
    fileSize: number;
    hasMetadata: boolean;
  }) => FraudAssessment;
}

const AppContext = createContext<AppContextValue | null>(null);

// Singleton instances
const duplicateDetector = new DuplicateDetector();
const rateLimiter = new TokenBucketRateLimiter({
  maxTokens: 10,
  refillRate: 0.5, // 1 token per 2 seconds
  refillInterval: 1000,
});

// Pre-seed the duplicate detector with existing documents
const initialActivities = computeInitialActivities();
for (const activity of initialActivities) {
  duplicateDetector.addDocument({
    id: activity.id,
    fileName: activity.fileName,
    hash: `seed_hash_${activity.id}`, // placeholder hashes for seed data
    textTokens: activity.name.toLowerCase().split(/\s+/),
    userId: "current_user",
    eventType: activity.type,
    academicYear: "2025-2026",
    uploadDate: activity.date,
  });
}

const DEFAULT_USER: FacultyUser = {
  id: "current_user",
  name: localStorage.getItem("userName") || "Dr. Priya Sharma",
  department: "Computer Science",
  email: "faculty@naac.edu",
  role: "faculty",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: DEFAULT_USER,
    activities: initialActivities,
    uploadTimestamps: [],
  });

  const addActivity = useCallback(
    (activity: Omit<ActivityRecord, "points">) => {
      const points = activity.status === "verified"
        ? applyWeeklyCap(
            calculateActivityPoints(activity.type, activity.role),
            state.activities
              .filter((a) => {
                const weekStart = getWeekStart(new Date());
                return getWeekStart(new Date(a.date)) === weekStart && a.status === "verified";
              })
              .reduce((sum, a) => sum + a.points, 0)
          )
        : 0;

      dispatch({ type: "ADD_ACTIVITY", payload: { ...activity, points } });
    },
    [state.activities]
  );

  const updateActivityStatus = useCallback(
    (id: string, status: ActivityStatus) => {
      const activity = state.activities.find((a) => a.id === id);
      if (!activity) return;
      const points = status === "verified" ? calculateActivityPoints(activity.type, activity.role) : 0;
      dispatch({ type: "UPDATE_ACTIVITY_STATUS", payload: { id, status, points } });
    },
    [state.activities]
  );

  const recordUploadTimestamp = useCallback(() => {
    dispatch({ type: "RECORD_UPLOAD_TIMESTAMP" });
  }, []);

  // Computed values

  const getUserProfile = useCallback((): UserProfile => {
    const types = state.activities.filter((a) => a.status === "verified").map((a) => a.type);
    const tags = state.activities.filter((a) => a.status === "verified").flatMap((a) => a.tags);
    const roles = state.activities.filter((a) => a.status === "verified").map((a) => a.role);
    return buildUserProfile(state.user.department, types, tags, roles);
  }, [state.activities, state.user.department]);

  const getTotalPoints = useCallback((): number => {
    return state.activities
      .filter((a) => a.status === "verified")
      .reduce((sum, a) => sum + applyDecay(a.points, new Date(a.date)), 0);
  }, [state.activities]);

  const getVerifiedCount = useCallback((): number => {
    return state.activities.filter((a) => a.status === "verified").length;
  }, [state.activities]);

  const getWeeklyPoints = useCallback((): number => {
    const weekStart = getWeekStart(new Date());
    return state.activities
      .filter((a) => a.status === "verified" && getWeekStart(new Date(a.date)) === weekStart)
      .reduce((sum, a) => sum + a.points, 0);
  }, [state.activities]);

  const getRecommendedEvents = useCallback((): ScoredEvent[] => {
    return recommendEvents(getUserProfile());
  }, [getUserProfile]);

  const getRecommendedNews = useCallback((): ScoredNews[] => {
    return recommendNews(getUserProfile());
  }, [getUserProfile]);

  const getRecommendedResearch = useCallback((): ScoredResearchTrend[] => {
    return recommendResearchTrends(getUserProfile());
  }, [getUserProfile]);

  const getLeaderboard = useCallback((): RankedEntry[] => {
    const now = new Date();

    // Current user entry
    const currentUserPoints = getTotalPoints();
    const verifiedActivities = state.activities.filter((a) => a.status === "verified");
    const currentUserEntry: Omit<RankedEntry, "rank" | "badge"> = {
      userId: state.user.id,
      name: state.user.name,
      department: state.user.department,
      totalPoints: verifiedActivities.reduce((sum, a) => sum + a.points, 0),
      decayedPoints: currentUserPoints,
      eventCount: verifiedActivities.length,
      mostRecentDate: verifiedActivities.length > 0
        ? new Date(Math.max(...verifiedActivities.map((a) => new Date(a.date).getTime())))
        : null,
      activityDiversity: new Set(verifiedActivities.map((a) => a.type)).size,
    };

    // Other faculty entries
    const otherEntries: Omit<RankedEntry, "rank" | "badge">[] = OTHER_FACULTY.map((f) => {
      const points = f.activities.reduce(
        (sum, a) => sum + applyDecay(calculateActivityPoints(a.type, a.role), new Date(a.date), now),
        0
      );
      const mostRecent = f.activities.length > 0
        ? new Date(Math.max(...f.activities.map((a) => new Date(a.date).getTime())))
        : null;
      return {
        userId: f.id,
        name: f.name,
        department: f.dept,
        totalPoints: f.activities.reduce((sum, a) => sum + calculateActivityPoints(a.type, a.role), 0),
        decayedPoints: points,
        eventCount: f.activities.length,
        mostRecentDate: mostRecent,
        activityDiversity: new Set(f.activities.map((a) => a.type)).size,
      };
    });

    return computeRankings([currentUserEntry, ...otherEntries]);
  }, [getTotalPoints, state.activities, state.user]);

  const getBadges = useCallback((): AchievementBadge[] => {
    const verified = state.activities.filter((a) => a.status === "verified");
    const uploadCount = verified.length;
    const organizerCount = verified.filter(
      (a) => a.role === "Organizer" || a.role === "Co-organizer"
    ).length;
    const researchCount = verified.filter(
      (a) => a.type === "Conference" || a.type === "Seminar"
    ).length;
    const leaderboard = getLeaderboard();
    const currentRank = leaderboard.find((e) => e.userId === state.user.id)?.rank || 999;
    return evaluateBadges(uploadCount, organizerCount, researchCount, currentRank);
  }, [state.activities, state.user.id, getLeaderboard]);

  const getSponsorMatches = useCallback((): { name: string; area: string; match: string }[] => {
    const profile = getUserProfile();
    return SPONSORS.map((s) => ({
      name: s.name,
      area: s.area,
      match: `${computeSponsorMatch(profile.interests, s.tags)}%`,
    })).sort((a, b) => parseInt(b.match) - parseInt(a.match));
  }, [getUserProfile]);

  const getRecentActivities = useCallback((): ActivityRecord[] => {
    return [...state.activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [state.activities]);

  const getUploadVelocity = useCallback((): { lastHour: number; lastDay: number } => {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    return {
      lastHour: state.uploadTimestamps.filter((t) => t >= hourAgo).length,
      lastDay: state.uploadTimestamps.filter((t) => t >= dayAgo).length,
    };
  }, [state.uploadTimestamps]);

  const classifyUploadedFile = useCallback((file: File): ClassificationResult => {
    return classifyFile(file.name, file.type, file.size);
  }, []);

  const checkFraudRisk = useCallback(
    (params: {
      isDuplicate: boolean;
      duplicateSimilarity: number;
      isAcademicYearValid: boolean;
      fileSize: number;
      hasMetadata: boolean;
    }): FraudAssessment => {
      const velocity = getUploadVelocity();
      return assessFraudRisk({
        ...params,
        uploadsInLastHour: velocity.lastHour,
        uploadsInLastDay: velocity.lastDay,
      });
    },
    [getUploadVelocity]
  );

  const value: AppContextValue = {
    state,
    addActivity,
    updateActivityStatus,
    recordUploadTimestamp,
    getUserProfile,
    getTotalPoints,
    getVerifiedCount,
    getWeeklyPoints,
    getRecommendedEvents,
    getRecommendedNews,
    getRecommendedResearch,
    getLeaderboard,
    getBadges,
    getSponsorMatches,
    getRecentActivities,
    getUploadVelocity,
    duplicateDetector,
    rateLimiter,
    classifyUploadedFile,
    checkFraudRisk,
  };

  return React.createElement(AppContext.Provider, { value }, children);
}

export function useAppStore(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppProvider");
  }
  return context;
}
