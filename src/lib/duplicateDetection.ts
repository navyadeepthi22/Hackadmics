/**
 * Duplicate Detection Engine
 * 
 * A. Exact duplicate detection - SHA-256 hash of file bytes
 * B. Near-duplicate detection - Text similarity (normalized text + cosine similarity)
 * C. Cross-user duplicate search via blocking (same year/type)
 */

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: "exact" | "near" | "none";
  matchedDocumentId?: string;
  similarity: number; // 0–1
  details: string;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  hash: string;
  textTokens: string[];
  userId: string;
  eventType: string;
  academicYear: string;
  uploadDate: string;
}

/**
 * Compute SHA-256 hash of file content using Web Crypto API.
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Normalize text for comparison: lowercase, remove extra whitespace, remove punctuation.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize text into words (simple whitespace tokenizer with stop-word removal).
 */
export function tokenize(text: string): string[] {
  const STOP_WORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "then", "once", "and", "but", "or", "nor",
    "not", "so", "yet", "both", "each", "few", "more", "most", "other",
    "some", "such", "no", "only", "own", "same", "than", "too", "very",
    "just", "because", "if", "when", "where", "how", "all", "any", "this",
    "that", "these", "those", "it", "its", "he", "she", "they", "them",
    "we", "us", "you", "your", "their", "our", "my", "his", "her",
  ]);
  const normalized = normalizeText(text);
  return normalized.split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Build a term frequency (TF) vector from tokens.
 */
function buildTFVector(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by total tokens
  const total = tokens.length || 1;
  for (const [key, value] of tf) {
    tf.set(key, value / total);
  }
  return tf;
}

/**
 * Compute cosine similarity between two TF vectors.
 */
export function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allKeys = new Set([...vecA.keys(), ...vecB.keys()]);
  for (const key of allKeys) {
    const a = vecA.get(key) || 0;
    const b = vecB.get(key) || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Compute text similarity between two documents using TF-IDF-like cosine similarity.
 */
export function computeTextSimilarity(tokensA: string[], tokensB: string[]): number {
  const tfA = buildTFVector(tokensA);
  const tfB = buildTFVector(tokensB);
  return cosineSimilarity(tfA, tfB);
}

/**
 * In-memory document store for duplicate detection.
 */
export class DuplicateDetector {
  private documents: DocumentRecord[] = [];

  constructor(initialDocs?: DocumentRecord[]) {
    if (initialDocs) {
      this.documents = [...initialDocs];
    }
  }

  /**
   * Add a document to the store.
   */
  addDocument(doc: DocumentRecord): void {
    this.documents.push(doc);
  }

  /**
   * Get all stored documents.
   */
  getDocuments(): DocumentRecord[] {
    return [...this.documents];
  }

  /**
   * Check for exact and near duplicates using blocking strategy
   * (only compare within same event type and academic year).
   */
  checkDuplicate(
    hash: string,
    textTokens: string[],
    eventType: string,
    academicYear: string,
    excludeId?: string
  ): DuplicateCheckResult {
    // 1. Exact duplicate check: hash match
    for (const doc of this.documents) {
      if (doc.id === excludeId) continue;
      if (doc.hash === hash) {
        return {
          isDuplicate: true,
          duplicateType: "exact",
          matchedDocumentId: doc.id,
          similarity: 1.0,
          details: `Exact duplicate of "${doc.fileName}" (SHA-256 hash match)`,
        };
      }
    }

    // 2. Near-duplicate check with blocking strategy (same type + year)
    const candidates = this.documents.filter(
      (doc) =>
        doc.id !== excludeId &&
        doc.eventType === eventType &&
        doc.academicYear === academicYear
    );

    let bestSimilarity = 0;
    let bestMatch: DocumentRecord | null = null;

    for (const doc of candidates) {
      const similarity = computeTextSimilarity(textTokens, doc.textTokens);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = doc;
      }
    }

    const NEAR_DUPLICATE_THRESHOLD = 0.75;
    if (bestSimilarity >= NEAR_DUPLICATE_THRESHOLD && bestMatch) {
      return {
        isDuplicate: true,
        duplicateType: "near",
        matchedDocumentId: bestMatch.id,
        similarity: bestSimilarity,
        details: `Near-duplicate of "${bestMatch.fileName}" (${(bestSimilarity * 100).toFixed(0)}% text similarity)`,
      };
    }

    return {
      isDuplicate: false,
      duplicateType: "none",
      similarity: bestSimilarity,
      details: bestSimilarity > 0.3
        ? `Closest match: ${(bestSimilarity * 100).toFixed(0)}% similarity (below threshold)`
        : "No similar documents found",
    };
  }
}
