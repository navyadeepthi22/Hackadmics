import { describe, it, expect } from "vitest";
import {
  classifyFile,
  getDocumentTypeLabel,
  validateFile,
} from "@/lib/fileClassifier";

describe("fileClassifier", () => {
  describe("classifyFile", () => {
    it("classifies certificate files by filename", () => {
      const result = classifyFile("FDP_Certificate_2026.pdf", "application/pdf");
      // Both "certificate" and "fdp_report" match; certificate gets MIME boost so wins
      expect(["certificate", "fdp_report"]).toContain(result.documentType);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.signals.length).toBeGreaterThan(0);
    });

    it("classifies workshop files by filename", () => {
      const result = classifyFile("Workshop_Report_IoT.pdf", "application/pdf");
      expect(result.documentType).toBe("workshop_report");
    });

    it("classifies conference papers by filename", () => {
      const result = classifyFile("Conference_Paper_AI.pdf", "application/pdf");
      expect(result.documentType).toBe("conference_paper");
    });

    it("classifies seminar files by filename", () => {
      const result = classifyFile("seminar_attendance.jpg", "image/jpeg");
      expect(result.documentType).toBe("seminar_report");
    });

    it("classifies hackathon files by filename", () => {
      const result = classifyFile("hackathon_report.pdf", "application/pdf");
      expect(result.documentType).toBe("hackathon_report");
    });

    it("returns certificate for generic PDF files with no specific keywords", () => {
      const result = classifyFile("random_file.pdf", "application/pdf");
      // PDF MIME type boosts certificate, so it's classified as certificate not unknown
      expect(result.documentType).toBe("certificate");
      expect(result.confidence).toBeGreaterThan(0);
    });

    it("boosts research_paper for large files", () => {
      const result = classifyFile("paper1_analysis.pdf", "application/pdf", 5 * 1024 * 1024);
      expect(result.signals).toContain("large file size suggests research paper");
    });
  });

  describe("getDocumentTypeLabel", () => {
    it("returns correct labels", () => {
      expect(getDocumentTypeLabel("certificate")).toBe("Certificate");
      expect(getDocumentTypeLabel("fdp_report")).toBe("FDP Report");
      expect(getDocumentTypeLabel("unknown")).toBe("Unknown Document");
    });
  });

  describe("validateFile", () => {
    it("accepts valid PDF files", () => {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      expect(validateFile(file)).toEqual({ valid: true });
    });

    it("rejects unsupported file types", () => {
      const file = new File(["content"], "test.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("not supported");
    });

    it("rejects oversized files", () => {
      const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], "large.pdf", { type: "application/pdf" });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("exceeds");
    });
  });
});
