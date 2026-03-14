/**
 * Recommendation Engine
 * 
 * Level 0: Rules + tag matching (fast MVP)
 * Level 1: Content-based with TF-IDF / cosine similarity
 * 
 * Recommends events, news, and research trends based on user profile.
 */

export interface UserProfile {
  department: string;
  interests: string[];  // tags derived from uploads
  uploadedEventTypes: string[];
  roles: string[];
}

export interface EventItem {
  id: number;
  title: string;
  organizer: string;
  date: string;
  location: string;
  type: string;
  tags: string[];
  link: string;
}

export interface ScoredEvent extends EventItem {
  relevance: number; // 0–100
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
}

export interface ScoredNews extends NewsItem {
  relevance: number;
}

export interface ResearchTrend {
  area: string;
  trend: "Hot" | "Rising" | "Emerging";
  papers: number;
  tags: string[];
}

export interface ScoredResearchTrend extends ResearchTrend {
  relevance: number;
}

// ---- Event Catalog ----
const EVENT_CATALOG: EventItem[] = [
  {
    id: 1, title: "5-Day FDP on Deep Learning & NLP", organizer: "IIT Madras",
    date: "Apr 14–18, 2026", location: "Online", type: "FDP",
    tags: ["AI", "Machine Learning", "NLP", "Deep Learning"], link: "#",
  },
  {
    id: 2, title: "International Webinar on Quantum Computing", organizer: "MIT & IEEE",
    date: "Apr 22, 2026", location: "Virtual", type: "Webinar",
    tags: ["Quantum Computing", "Emerging Tech", "Physics"], link: "#",
  },
  {
    id: 3, title: "National Seminar on Cybersecurity Trends 2026", organizer: "NIT Trichy",
    date: "May 5–6, 2026", location: "NIT Trichy, Tamil Nadu", type: "Seminar",
    tags: ["Cybersecurity", "Network Security", "Ethical Hacking"], link: "#",
  },
  {
    id: 4, title: "Workshop on IoT & Edge Computing", organizer: "Anna University",
    date: "May 12–14, 2026", location: "Chennai", type: "Workshop",
    tags: ["IoT", "Edge Computing", "Embedded Systems"], link: "#",
  },
  {
    id: 5, title: "AICTE Sponsored FDP on Blockchain Technology", organizer: "VIT Vellore",
    date: "Jun 2–6, 2026", location: "Hybrid", type: "FDP",
    tags: ["Blockchain", "Distributed Systems", "Cryptography"], link: "#",
  },
  {
    id: 6, title: "International Conference on Data Science & AI", organizer: "Stanford University & ACM",
    date: "Jun 15–17, 2026", location: "Virtual", type: "Conference",
    tags: ["Data Science", "AI", "Research", "Big Data"], link: "#",
  },
  {
    id: 7, title: "Workshop on Robotics and Automation", organizer: "IIT Bombay",
    date: "Jul 1–3, 2026", location: "Mumbai", type: "Workshop",
    tags: ["Robotics", "Automation", "Mechanical", "Electronics"], link: "#",
  },
  {
    id: 8, title: "FDP on Cloud Native Development", organizer: "IIIT Hyderabad",
    date: "Jul 10–14, 2026", location: "Online", type: "FDP",
    tags: ["Cloud Computing", "DevOps", "Microservices", "Kubernetes"], link: "#",
  },
  {
    id: 9, title: "Seminar on Sustainable Engineering", organizer: "IISc Bangalore",
    date: "Jul 20, 2026", location: "Bangalore", type: "Seminar",
    tags: ["Sustainable Computing", "Green Engineering", "Civil", "Environmental"], link: "#",
  },
  {
    id: 10, title: "Hackathon on Smart Healthcare Solutions", organizer: "AIIMS & Microsoft",
    date: "Aug 5–7, 2026", location: "New Delhi", type: "Hackathon",
    tags: ["Healthcare", "AI", "Machine Learning", "Innovation"], link: "#",
  },
];

const NEWS_CATALOG: NewsItem[] = [
  {
    id: 1, title: "AICTE Announces New Guidelines for Faculty FDP Credits",
    source: "AICTE Official", date: "Mar 12, 2026",
    summary: "Faculty can now earn additional credits for completing AICTE-recognized FDPs in emerging technologies.",
    category: "Policy", tags: ["AICTE", "FDP", "Policy", "Credits"],
  },
  {
    id: 2, title: "UGC Mandates Digital Literacy Programs Across Universities",
    source: "UGC India", date: "Mar 10, 2026",
    summary: "Universities to implement mandatory digital literacy workshops for all faculty members by 2027.",
    category: "Policy", tags: ["UGC", "Digital Literacy", "Policy"],
  },
  {
    id: 3, title: "Top 10 Emerging Research Areas in Computer Science for 2026",
    source: "IEEE Spectrum", date: "Mar 8, 2026",
    summary: "Generative AI, quantum machine learning, and neuromorphic computing lead the list.",
    category: "Research", tags: ["AI", "Research", "Computer Science", "Quantum"],
  },
  {
    id: 4, title: "New Funding Opportunities for Faculty-Led Research Projects",
    source: "DST India", date: "Mar 5, 2026",
    summary: "Department of Science & Technology opens applications for grants up to ₹25 lakhs.",
    category: "Funding", tags: ["Funding", "Research", "Grants", "DST"],
  },
  {
    id: 5, title: "National Education Policy 2026 Updates on Faculty Evaluation",
    source: "MHRD", date: "Mar 3, 2026",
    summary: "New performance metrics for faculty evaluation emphasizing research output and skill development.",
    category: "Policy", tags: ["NEP", "Faculty", "Evaluation", "Policy"],
  },
];

const RESEARCH_CATALOG: ResearchTrend[] = [
  { area: "Explainable AI in Healthcare", trend: "Rising", papers: 342, tags: ["AI", "Healthcare", "Explainability"] },
  { area: "Federated Learning for Privacy", trend: "Hot", papers: 218, tags: ["AI", "Machine Learning", "Privacy", "Distributed"] },
  { area: "Edge AI for Smart Cities", trend: "Rising", papers: 185, tags: ["AI", "IoT", "Edge Computing", "Smart Cities"] },
  { area: "Sustainable Computing", trend: "Emerging", papers: 124, tags: ["Green Computing", "Sustainability", "Energy"] },
  { area: "Quantum Machine Learning", trend: "Hot", papers: 156, tags: ["Quantum Computing", "Machine Learning", "Physics"] },
  { area: "Autonomous Vehicle Systems", trend: "Rising", papers: 201, tags: ["Robotics", "AI", "Automation", "Electronics"] },
  { area: "Blockchain in Supply Chain", trend: "Emerging", papers: 89, tags: ["Blockchain", "Supply Chain", "Distributed Systems"] },
  { area: "Neuromorphic Computing", trend: "Emerging", papers: 67, tags: ["Hardware", "AI", "Brain-inspired", "Electronics"] },
];

// ---- Department → Interest Tag Mapping ----
const DEPARTMENT_TAGS: Record<string, string[]> = {
  "Computer Science": ["AI", "Machine Learning", "Data Science", "Cybersecurity", "Cloud Computing"],
  Electronics: ["IoT", "Embedded Systems", "Electronics", "Robotics", "Automation"],
  Mechanical: ["Robotics", "Automation", "Mechanical", "Manufacturing"],
  Civil: ["Sustainable Computing", "Green Engineering", "Civil", "Environmental"],
  Mathematics: ["Data Science", "AI", "Quantum Computing", "Research"],
  Physics: ["Quantum Computing", "Physics", "Research", "Emerging Tech"],
};

/**
 * Build a user profile from their upload history.
 */
export function buildUserProfile(
  department: string,
  uploadedTypes: string[],
  uploadedTags: string[],
  roles: string[]
): UserProfile {
  const deptTags = DEPARTMENT_TAGS[department] || [];
  const allInterests = [...new Set([...deptTags, ...uploadedTags])];
  return {
    department,
    interests: allInterests,
    uploadedEventTypes: uploadedTypes,
    roles,
  };
}

/**
 * Compute tag-based relevance score between user interests and item tags.
 * Uses weighted Jaccard similarity scaled to 0–100.
 */
function tagRelevance(userTags: string[], itemTags: string[]): number {
  if (userTags.length === 0 || itemTags.length === 0) return 50; // default baseline
  const userSet = new Set(userTags.map((t) => t.toLowerCase()));
  const itemSet = new Set(itemTags.map((t) => t.toLowerCase()));
  let matches = 0;
  for (const tag of itemSet) {
    if (userSet.has(tag)) matches++;
  }
  // Weighted: matches / item tags count (how well the item fits the user)
  const precision = matches / itemSet.size;
  // Also consider coverage: matches / user tags count
  const recall = matches / userSet.size;
  // F1-like score
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const MIN_RELEVANCE_SCORE = 50;
  const RELEVANCE_SCORE_RANGE = 50;
  return Math.round(MIN_RELEVANCE_SCORE + f1 * RELEVANCE_SCORE_RANGE);
}

/**
 * Event type affinity boost: if user frequently uploads a type, boost that type.
 */
function typeAffinityBoost(userTypes: string[], eventType: string): number {
  const count = userTypes.filter((t) => t === eventType).length;
  return Math.min(count * 3, 15); // up to 15 bonus points
}

/**
 * Recommend events ranked by relevance to the user profile.
 */
export function recommendEvents(profile: UserProfile): ScoredEvent[] {
  return EVENT_CATALOG.map((event) => {
    const baseRelevance = tagRelevance(profile.interests, event.tags);
    const typeBoost = typeAffinityBoost(profile.uploadedEventTypes, event.type);
    const relevance = Math.min(99, baseRelevance + typeBoost);
    return { ...event, relevance };
  }).sort((a, b) => b.relevance - a.relevance);
}

/**
 * Recommend news items ranked by relevance.
 */
export function recommendNews(profile: UserProfile): ScoredNews[] {
  return NEWS_CATALOG.map((news) => {
    const relevance = tagRelevance(profile.interests, news.tags);
    return { ...news, relevance };
  }).sort((a, b) => b.relevance - a.relevance);
}

/**
 * Recommend research trends ranked by relevance.
 */
export function recommendResearchTrends(profile: UserProfile): ScoredResearchTrend[] {
  return RESEARCH_CATALOG.map((trend) => {
    const relevance = tagRelevance(profile.interests, trend.tags);
    return { ...trend, relevance };
  }).sort((a, b) => b.relevance - a.relevance);
}
