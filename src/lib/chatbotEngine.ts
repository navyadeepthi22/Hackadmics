/**
 * Chatbot Engine
 * 
 * A. Intent classification via fuzzy keyword matching
 * B. Entity extraction using regex patterns
 * C. Retrieval-Augmented response generation (template-based with context insertion)
 */

export interface ChatIntent {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

export interface KnowledgeChunk {
  id: string;
  topic: string;
  keywords: string[];
  content: string;
  followUps: string[];
}

// ---- Knowledge Base (chunks for RAG-style retrieval) ----
const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "upload_process",
    topic: "Uploading Documents",
    keywords: ["upload", "certificate", "document", "file", "submit", "drag", "drop", "browse"],
    content: `Navigate to **Upload Documents** from the sidebar. Drag and drop your certificate (PDF, JPG, PNG up to 10MB) into the upload zone. Our AI will automatically:
1. **Classify** your document type (certificate, FDP report, research paper, etc.)
2. **Extract metadata** like your name, event date, venue, and event type
3. **Check for duplicates** against existing uploads
4. **Validate** the academic year

Select your role and event type, then click Submit.`,
    followUps: ["What file formats are accepted?", "How are points calculated?", "How does duplicate detection work?"],
  },
  {
    id: "file_formats",
    topic: "Accepted File Formats",
    keywords: ["format", "pdf", "jpg", "png", "jpeg", "file", "type", "size", "accept"],
    content: `We accept the following file formats:
- **PDF** — Recommended for best AI extraction accuracy
- **JPG / JPEG** — For scanned certificates
- **PNG** — For screenshot certificates

Maximum file size: **10MB**. Files are classified automatically using AI-powered document analysis.`,
    followUps: ["How do I upload a certificate?", "Why was my document rejected?"],
  },
  {
    id: "points_calculation",
    topic: "Points Calculation",
    keywords: ["points", "score", "calculate", "earn", "credit", "reward", "rank"],
    content: `Points are calculated dynamically based on your role and event type:

**Base Points by Event Type:**
| Event Type | Base Points |
|------------|------------|
| Conference | 60 pts |
| Hackathon | 55 pts |
| FDP | 50 pts |
| Workshop | 40 pts |
| Seminar | 35 pts |
| Guest Lecture | 35 pts |
| Webinar | 30 pts |

**Role Multipliers:**
- Resource Person: 1.5×
- Organizer: 1.4× + 10 bonus pts
- Co-organizer: 1.2× + 10 bonus pts
- Panelist: 1.1×
- Participant: 1.0×
- Attendee: 0.8×

Points also undergo **exponential decay** (50% every 6 months) to encourage recent activity, and a **weekly cap of 200 points** prevents gaming.`,
    followUps: ["How to become a resource person?", "What are the recommendations for me?"],
  },
  {
    id: "naac_criteria_6",
    topic: "NAAC Criteria 6",
    keywords: ["naac", "criteria", "criterion", "6", "governance", "leadership", "management", "accreditation"],
    content: `NAAC Criteria 6 covers **Governance, Leadership and Management**. It evaluates:
- Institutional vision and strategic planning
- Faculty empowerment strategies (sub-criteria 6.3)
- Financial management and resource mobilization
- Quality assurance mechanisms

Your document uploads directly contribute to **sub-criteria 6.3 (Faculty Empowerment Strategies)** by documenting participation in FDPs, workshops, conferences, and other professional development activities.`,
    followUps: ["How are points calculated?", "How do I upload a certificate?"],
  },
  {
    id: "academic_year",
    topic: "Academic Year",
    keywords: ["academic", "year", "current", "period", "july", "june", "2025", "2026", "date", "valid"],
    content: `The current academic year is **July 2025 – June 2026**. 

Only documents with event dates falling within this period will be accepted for verification. Documents with dates outside this range will be automatically rejected with an "Academic Year Mismatch" warning.

The system validates dates using AI-extracted metadata and regex pattern matching.`,
    followUps: ["Why was my document rejected?", "How do I upload a certificate?"],
  },
  {
    id: "verification_status",
    topic: "Verification Status",
    keywords: ["verification", "status", "check", "verified", "pending", "review", "approved"],
    content: `Go to **My Activity** from the sidebar to see all your documents and their verification status:

- 🟢 **Verified** — AI validated, academic year confirmed, no duplicates found
- 🟡 **Pending** — Under review (manual verification needed)
- 🔴 **Rejected** — Failed validation (academic year mismatch, duplicate, or unreadable)

Each entry shows the activity name, type, your role, date, and points earned. The verification process uses multiple checks including document classification, metadata extraction, and fraud detection.`,
    followUps: ["Why was my document rejected?", "How does duplicate detection work?"],
  },
  {
    id: "rejection_reasons",
    topic: "Document Rejection",
    keywords: ["reject", "rejected", "fail", "failed", "why", "reason", "invalid", "error", "problem"],
    content: `Documents can be rejected for several reasons:

1. **Academic Year Mismatch** — The event date is not within July 2025 – June 2026
2. **Duplicate Detected** — This document (or a very similar one) was already uploaded. We use SHA-256 hashing for exact matches and text similarity for near-duplicates.
3. **Unreadable Content** — AI couldn't extract metadata (try a clearer scan)
4. **Fraud Risk** — Multiple risk signals detected (unusual upload patterns, suspicious file properties)
5. **Missing Required Fields** — Key metadata like event name or date couldn't be determined

Check **My Activity** for the specific rejection reason and re-upload if needed.`,
    followUps: ["How do I upload a certificate?", "How does duplicate detection work?", "What is the current academic year?"],
  },
  {
    id: "resource_person",
    topic: "Becoming a Resource Person",
    keywords: ["resource", "person", "speaker", "trainer", "expert", "present", "role"],
    content: `To be recognized as a **Resource Person**, upload the event certificate where you are listed as a speaker/trainer. Select 'Resource Person' from the role dropdown.

**Benefits:**
- Highest point multiplier (1.5×)
- Bonus organizer-tier points (+10)
- Higher visibility on the leaderboard
- Better sponsor match recommendations
- Faster badge progression toward "Top Performer"`,
    followUps: ["How are points calculated?", "What are the recommendations for me?"],
  },
  {
    id: "recommendations",
    topic: "Personalized Recommendations",
    keywords: ["recommend", "suggestion", "event", "upcoming", "interest", "personalized", "match"],
    content: `Check the **Recommendations** tab in the sidebar! Our content-based recommendation engine analyzes your profile to show:

📅 **Upcoming Events** — FDPs, webinars, conferences matched to your department and interests using tag similarity scoring
📰 **Latest News** — AICTE/UGC policies and funding opportunities relevant to your field
📚 **Research Trends** — Trending research areas aligned with your academic profile

Recommendations are dynamically computed based on your upload history, department, roles, and interaction patterns. Each item shows a relevance percentage indicating how well it matches your profile.`,
    followUps: ["How to become a resource person?", "How are points calculated?"],
  },
  {
    id: "duplicate_detection",
    topic: "Duplicate Detection",
    keywords: ["duplicate", "copy", "same", "similar", "detect", "hash", "matching"],
    content: `Our system uses a multi-layer duplicate detection pipeline:

**Layer 1: Exact Duplicates**
- SHA-256 cryptographic hashing of file bytes
- Any identical file is instantly detected

**Layer 2: Near-Duplicates**
- Text normalization (lowercase, remove boilerplate, stemming)
- TF-IDF vectorization + cosine similarity scoring
- Threshold: 75% similarity = flagged as near-duplicate
- Blocking strategy: only compares within same event type and academic year for efficiency

**Layer 3: Cross-User Search**
- Compares against all faculty uploads across departments
- Prevents multi-submission of the same certificate by different users

Duplicate submissions are flagged and won't earn points.`,
    followUps: ["Why was my document rejected?", "How do I check my verification status?"],
  },
  {
    id: "leaderboard",
    topic: "Leaderboard & Gamification",
    keywords: ["leaderboard", "rank", "ranking", "badge", "gamification", "compete", "top", "position"],
    content: `The **Leaderboard** shows faculty rankings based on dynamically calculated points:

**Ranking Algorithm:**
- Primary sort: Decayed points (recent activities count more)
- Tie-breaker 1: Most recent contribution date
- Tie-breaker 2: Activity diversity (more event types = higher rank)

**Badges:**
- 🏆 First Upload — Upload your first document
- ⭐ Organizer Pro — Organize 5+ events
- 💡 Research Pioneer — Submit 10 research papers
- 🥇 Top Performer — Reach Top 3 on leaderboard

**Sponsor Matching:** Based on content similarity between your profile tags and sponsor focus areas (Jaccard similarity).`,
    followUps: ["How are points calculated?", "How to become a resource person?"],
  },
  {
    id: "security",
    topic: "Security & Integrity",
    keywords: ["security", "safe", "privacy", "protect", "integrity", "rate", "limit", "fraud"],
    content: `We take security seriously:

🔒 **Rate Limiting** — Token bucket algorithm prevents abuse (max uploads per hour/day)
🛡 **Fraud Detection** — Rule-based risk scoring combining:
  - Duplicate detection signals
  - Upload velocity anomalies
  - Academic year validation
  - File size checks
  - Metadata extraction success

🔐 **RBAC** — Role-based access control ensures faculty only see their own data, while admins have full management access.

All files are validated for type and size before processing.`,
    followUps: ["How does duplicate detection work?", "Why was my document rejected?"],
  },
];

/**
 * Normalize input text for matching.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

/**
 * Compute keyword match score between query and a knowledge chunk.
 * Uses weighted term frequency.
 */
function chunkRelevance(query: string, chunk: KnowledgeChunk): number {
  const queryWords = normalize(query).split(/\s+/);
  let matchCount = 0;
  let totalWeight = 0;

  for (const keyword of chunk.keywords) {
    const kw = normalize(keyword);
    totalWeight += 1;
    for (const word of queryWords) {
      if (kw.includes(word) || word.includes(kw)) {
        matchCount += 1;
        break;
      }
    }
  }

  // Also check topic
  const topicWords = normalize(chunk.topic).split(/\s+/);
  for (const word of queryWords) {
    if (topicWords.some((tw) => tw.includes(word) || word.includes(tw))) {
      matchCount += 0.5;
    }
  }

  return totalWeight > 0 ? matchCount / (totalWeight + topicWords.length) : 0;
}

/**
 * Retrieve the most relevant knowledge chunks for a query (RAG retrieval step).
 * Returns top-K chunks by relevance.
 */
export function retrieveChunks(query: string, topK: number = 2): KnowledgeChunk[] {
  const scored = KNOWLEDGE_BASE.map((chunk) => ({
    chunk,
    score: chunkRelevance(query, chunk),
  }));

  scored.sort((a, b) => b.score - a.score);

  const MIN_CHUNK_RELEVANCE_THRESHOLD = 0.05;
  return scored
    .filter((s) => s.score > MIN_CHUNK_RELEVANCE_THRESHOLD)
    .slice(0, topK)
    .map((s) => s.chunk);
}

/**
 * Extract entities from user query using regex patterns.
 */
export function extractEntities(query: string): Record<string, string> {
  const entities: Record<string, string> = {};

  // Date patterns
  const dateMatch = query.match(
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+\d{1,2}(?:[\s,]+\d{4})?/i
  );
  if (dateMatch) entities.date = dateMatch[0];

  // Event type patterns
  const eventTypes = ["FDP", "webinar", "workshop", "seminar", "conference", "hackathon", "guest lecture"];
  for (const type of eventTypes) {
    if (query.toLowerCase().includes(type.toLowerCase())) {
      entities.eventType = type;
      break;
    }
  }

  // Role patterns
  const roles = ["resource person", "organizer", "participant", "attendee", "co-organizer", "panelist"];
  for (const role of roles) {
    if (query.toLowerCase().includes(role)) {
      entities.role = role;
      break;
    }
  }

  // Points/number patterns
  const pointsMatch = query.match(/(\d+)\s*(?:points?|pts)/i);
  if (pointsMatch) entities.points = pointsMatch[1];

  return entities;
}

/**
 * Generate a response for a user query using RAG-style retrieval.
 */
export function generateResponse(query: string): {
  response: string;
  followUps: string[];
} {
  const chunks = retrieveChunks(query, 2);

  if (chunks.length === 0) {
    return {
      response:
        "I'm here to help with NAAC Criteria 6 queries! Try asking about:\n" +
        "• Document uploads and verification\n" +
        "• Points calculation and leaderboard\n" +
        "• Recommendations and research trends\n" +
        "• Duplicate detection\n" +
        "• Academic year policies",
      followUps: ["How do I upload a certificate?", "How are points calculated?", "What is NAAC Criteria 6?"],
    };
  }

  // Use the top chunk as the primary answer
  const primaryChunk = chunks[0];
  let response = primaryChunk.content;

  // If we have a second relevant chunk, add a brief mention
  if (chunks.length > 1 && chunks[1]) {
    const secondary = chunks[1];
    // Only mention if it's a different topic
    if (secondary.topic !== primaryChunk.topic) {
      response += `\n\n💡 *Related: ${secondary.topic}* — ${secondary.content.split("\n")[0]}`;
    }
  }

  // Merge follow-up suggestions from retrieved chunks (deduplicated)
  const followUpSet = new Set<string>();
  for (const chunk of chunks) {
    for (const fu of chunk.followUps) {
      followUpSet.add(fu);
    }
  }
  const followUps = [...followUpSet].slice(0, 4);

  return { response, followUps };
}
