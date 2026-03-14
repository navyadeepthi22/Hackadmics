/**
 * File Classification Engine
 * Rule-based: MIME type + filename patterns
 * Classifies uploaded documents by type (certificate, FDP report, research paper, etc.)
 */

export type DocumentType =
  | "certificate"
  | "fdp_report"
  | "research_paper"
  | "workshop_report"
  | "seminar_report"
  | "conference_paper"
  | "guest_lecture_report"
  | "hackathon_report"
  | "webinar_certificate"
  | "unknown";

export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number; // 0–1
  signals: string[];
}

interface PatternRule {
  pattern: RegExp;
  type: DocumentType;
  weight: number;
  signal: string;
}

const FILENAME_RULES: PatternRule[] = [
  { pattern: /certificate/i, type: "certificate", weight: 0.6, signal: "filename contains 'certificate'" },
  { pattern: /cert[_\-\s]?/i, type: "certificate", weight: 0.4, signal: "filename abbreviation 'cert'" },
  { pattern: /fdp/i, type: "fdp_report", weight: 0.7, signal: "filename contains 'FDP'" },
  { pattern: /faculty[\s_-]?develop/i, type: "fdp_report", weight: 0.7, signal: "filename contains 'faculty development'" },
  { pattern: /research[\s_-]?paper/i, type: "research_paper", weight: 0.7, signal: "filename contains 'research paper'" },
  { pattern: /paper[\s_-]?\d/i, type: "research_paper", weight: 0.4, signal: "filename matches paper numbering pattern" },
  { pattern: /workshop/i, type: "workshop_report", weight: 0.6, signal: "filename contains 'workshop'" },
  { pattern: /seminar/i, type: "seminar_report", weight: 0.6, signal: "filename contains 'seminar'" },
  { pattern: /conference/i, type: "conference_paper", weight: 0.6, signal: "filename contains 'conference'" },
  { pattern: /guest[\s_-]?lecture/i, type: "guest_lecture_report", weight: 0.6, signal: "filename contains 'guest lecture'" },
  { pattern: /hackathon/i, type: "hackathon_report", weight: 0.6, signal: "filename contains 'hackathon'" },
  { pattern: /webinar/i, type: "webinar_certificate", weight: 0.6, signal: "filename contains 'webinar'" },
];

const MIME_TYPE_WEIGHTS: Record<string, number> = {
  "application/pdf": 0.2,
  "image/jpeg": 0.1,
  "image/png": 0.1,
  "image/jpg": 0.1,
};

const EXTENSION_TYPE_BOOST: Record<string, DocumentType[]> = {
  ".pdf": ["certificate", "fdp_report", "research_paper", "conference_paper"],
  ".jpg": ["certificate", "webinar_certificate"],
  ".jpeg": ["certificate", "webinar_certificate"],
  ".png": ["certificate", "webinar_certificate"],
};

/**
 * Classifies a file based on its name and MIME type using rule-based approach.
 */
export function classifyFile(
  fileName: string,
  mimeType?: string,
  fileSize?: number
): ClassificationResult {
  const scores: Partial<Record<DocumentType, number>> = {};
  const signals: string[] = [];

  // Apply filename pattern rules
  for (const rule of FILENAME_RULES) {
    if (rule.pattern.test(fileName)) {
      scores[rule.type] = (scores[rule.type] || 0) + rule.weight;
      signals.push(rule.signal);
    }
  }

  // Apply MIME type weight
  if (mimeType && MIME_TYPE_WEIGHTS[mimeType]) {
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    const boostedTypes = EXTENSION_TYPE_BOOST[ext] || [];
    for (const type of boostedTypes) {
      scores[type] = (scores[type] || 0) + MIME_TYPE_WEIGHTS[mimeType];
      signals.push(`MIME type ${mimeType} boosts ${type}`);
    }
  }

  // File size heuristic: large PDFs are more likely research papers
  if (fileSize && fileSize > 2 * 1024 * 1024) {
    scores["research_paper"] = (scores["research_paper"] || 0) + 0.1;
    signals.push("large file size suggests research paper");
  }

  // Find the best match
  let bestType: DocumentType = "unknown";
  let bestScore = 0;
  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as DocumentType;
    }
  }

  // Normalize confidence to 0–1
  const confidence = Math.min(bestScore, 1);

  return {
    documentType: bestType,
    confidence,
    signals,
  };
}

/**
 * Returns a human-readable label for a document type.
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    certificate: "Certificate",
    fdp_report: "FDP Report",
    research_paper: "Research Paper",
    workshop_report: "Workshop Report",
    seminar_report: "Seminar Report",
    conference_paper: "Conference Paper",
    guest_lecture_report: "Guest Lecture Report",
    hackathon_report: "Hackathon Report",
    webinar_certificate: "Webinar Certificate",
    unknown: "Unknown Document",
  };
  return labels[type];
}

/**
 * Validates file type and size.
 */
export function validateFile(file: File): { valid: boolean; reason?: string } {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, reason: `File type ${file.type} is not supported. Use PDF, JPG, or PNG.` };
  }
  if (file.size > maxSize) {
    return { valid: false, reason: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit.` };
  }
  return { valid: true };
}
