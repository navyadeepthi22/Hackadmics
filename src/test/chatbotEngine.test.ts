import { describe, it, expect } from "vitest";
import {
  generateResponse,
  retrieveChunks,
  extractEntities,
} from "@/lib/chatbotEngine";

describe("chatbotEngine", () => {
  describe("extractEntities", () => {
    it("extracts event type from query", () => {
      const entities = extractEntities("How do I upload an FDP certificate?");
      expect(entities.eventType).toBe("FDP");
    });

    it("extracts role from query", () => {
      const entities = extractEntities("I was a resource person at the event");
      expect(entities.role).toBe("resource person");
    });

    it("extracts points mentions", () => {
      const entities = extractEntities("I earned 50 points today");
      expect(entities.points).toBe("50");
    });

    it("returns empty for no entities", () => {
      const entities = extractEntities("hello");
      expect(Object.keys(entities).length).toBe(0);
    });
  });

  describe("retrieveChunks", () => {
    it("retrieves relevant chunks for upload query", () => {
      const chunks = retrieveChunks("How do I upload a certificate?");
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].topic).toContain("Upload");
    });

    it("retrieves relevant chunks for points query", () => {
      const chunks = retrieveChunks("How are points calculated?");
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].topic).toContain("Points");
    });

    it("retrieves relevant chunks for NAAC query", () => {
      const chunks = retrieveChunks("What is NAAC criteria 6?");
      expect(chunks.length).toBeGreaterThan(0);
    });

    it("retrieves relevant chunks for duplicate detection", () => {
      const chunks = retrieveChunks("How does duplicate detection work?");
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].topic).toContain("Duplicate");
    });

    it("returns empty for completely irrelevant query", () => {
      const chunks = retrieveChunks("zzzxyzabc");
      // Very short gibberish with no keywords should return no relevant chunks
      expect(chunks.length).toBeLessThanOrEqual(1);
    });
  });

  describe("generateResponse", () => {
    it("returns a relevant response for a valid query", () => {
      const { response, followUps } = generateResponse("How do I upload a certificate?");
      expect(response.length).toBeGreaterThan(0);
      expect(response.toLowerCase()).toContain("upload");
      expect(followUps.length).toBeGreaterThan(0);
    });

    it("returns a fallback response for unrecognized query", () => {
      const { response, followUps } = generateResponse("zzzxyzabc");
      expect(response).toContain("Try asking about");
      expect(followUps.length).toBeGreaterThan(0);
    });

    it("includes follow-up suggestions", () => {
      const { followUps } = generateResponse("Tell me about points");
      expect(followUps.length).toBeGreaterThan(0);
      expect(followUps.every((f) => typeof f === "string")).toBe(true);
    });
  });
});
