import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, CalendarX, Shield, Copy, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import { computeFileHash, tokenize } from "@/lib/duplicateDetection";
import { validateFile, getDocumentTypeLabel } from "@/lib/fileClassifier";
import type { ClassificationResult } from "@/lib/fileClassifier";
import type { DuplicateCheckResult } from "@/lib/duplicateDetection";
import type { FraudAssessment } from "@/lib/securityUtils";

type UploadStatus = "idle" | "uploading" | "classifying" | "extracting" | "checking_duplicates" | "verified" | "rejected_year" | "rejected_duplicate" | "rejected_fraud" | "failed";

interface UploadedFile {
  name: string;
  size: number;
  status: UploadStatus;
  classification?: ClassificationResult;
  duplicateCheck?: DuplicateCheckResult;
  fraudAssessment?: FraudAssessment;
  metadata?: {
    facultyName: string;
    eventDate: string;
    venue: string;
    eventType: string;
  };
}

const EVENT_TYPES = ["Webinar", "FDP", "Seminar", "Workshop", "Conference", "Guest Lecture", "Hackathon"];
const ROLES = ["Resource Person", "Organizer", "Participant", "Attendee", "Co-organizer", "Panelist"];
const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics"];

// Current academic year: July 2025 - June 2026
const ACADEMIC_YEAR_START = new Date(2025, 6, 1);
const ACADEMIC_YEAR_END = new Date(2026, 5, 30);
const ACADEMIC_YEAR_LABEL = "July 2025 \u2013 June 2026";

function isWithinAcademicYear(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date >= ACADEMIC_YEAR_START && date <= ACADEMIC_YEAR_END;
}

// Simulated metadata extraction based on filename and classification
function extractMetadata(fileName: string, classification: ClassificationResult): {
  facultyName: string;
  eventDate: string;
  venue: string;
  eventType: string;
} {
  const userName = localStorage.getItem("userName") || "Dr. Priya Sharma";

  // Determine event type from classification or filename
  let eventType = "FDP";
  if (classification.documentType === "fdp_report") eventType = "FDP";
  else if (classification.documentType === "workshop_report") eventType = "Workshop";
  else if (classification.documentType === "seminar_report") eventType = "Seminar";
  else if (classification.documentType === "conference_paper") eventType = "Conference";
  else if (classification.documentType === "hackathon_report") eventType = "Hackathon";
  else if (classification.documentType === "guest_lecture_report") eventType = "Guest Lecture";
  else if (classification.documentType === "webinar_certificate") eventType = "Webinar";
  else if (classification.documentType === "certificate") eventType = "FDP";

  // Placeholder: simulates OCR-based date extraction.
  // In production, this would use Tesseract/deep OCR + regex date parsing
  // on the actual document text layer. The random factor mimics OCR confidence.
  const isCurrentYear = Math.random() > 0.2;
  const eventDate = isCurrentYear ? "March 10, 2026" : "April 15, 2024";

  return {
    facultyName: userName,
    eventDate,
    venue: "VIT Chennai, Auditorium Hall",
    eventType,
  };
}

const UploadSection = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [role, setRole] = useState("");
  const [eventType, setEventType] = useState("");
  const [department, setDepartment] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const {
    addActivity,
    recordUploadTimestamp,
    classifyUploadedFile,
    duplicateDetector,
    rateLimiter,
    checkFraudRisk,
    state,
  } = useAppStore();

  const processUpload = useCallback(async (selectedFile: File) => {
    // Validate file
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      toast({ title: "Invalid file", description: validation.reason, variant: "destructive" });
      return;
    }

    // Rate limiting check
    if (!rateLimiter.tryConsume()) {
      toast({ title: "Too many uploads", description: "Please wait before uploading again.", variant: "destructive" });
      return;
    }

    setFile({ name: selectedFile.name, size: selectedFile.size, status: "uploading" });
    recordUploadTimestamp();

    // Phase 1: Upload simulation
    await new Promise((r) => setTimeout(r, 800));

    // Phase 2: Classify document
    setFile((f) => f ? { ...f, status: "classifying" } : null);
    const classification = classifyUploadedFile(selectedFile);
    await new Promise((r) => setTimeout(r, 600));
    setFile((f) => f ? { ...f, classification } : null);

    // Phase 3: Extract metadata
    setFile((f) => f ? { ...f, status: "extracting" } : null);
    const metadata = extractMetadata(selectedFile.name, classification);
    await new Promise((r) => setTimeout(r, 1000));

    // Phase 4: Check duplicates
    setFile((f) => f ? { ...f, status: "checking_duplicates", metadata } : null);
    let fileHash: string;
    try {
      fileHash = await computeFileHash(selectedFile);
    } catch {
      fileHash = `fallback_${Date.now()}_${selectedFile.name}`;
    }
    const textTokens = tokenize(selectedFile.name + " " + metadata.eventType + " " + metadata.venue);
    const duplicateCheck = duplicateDetector.checkDuplicate(
      fileHash, textTokens, metadata.eventType, "2025-2026"
    );
    await new Promise((r) => setTimeout(r, 500));

    // Phase 5: Fraud assessment
    const isAcademicYearValid = isWithinAcademicYear(metadata.eventDate);
    const fraudAssessment = checkFraudRisk({
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateSimilarity: duplicateCheck.similarity,
      isAcademicYearValid,
      fileSize: selectedFile.size,
      hasMetadata: true,
    });

    // Determine final status
    if (duplicateCheck.isDuplicate) {
      setFile((f) => f ? { ...f, status: "rejected_duplicate", duplicateCheck, fraudAssessment } : null);
    } else if (!isAcademicYearValid) {
      setFile((f) => f ? { ...f, status: "rejected_year", duplicateCheck, fraudAssessment } : null);
    } else if (fraudAssessment.riskLevel === "high") {
      setFile((f) => f ? { ...f, status: "rejected_fraud", duplicateCheck, fraudAssessment } : null);
    } else {
      // Register in duplicate detector for future checks
      duplicateDetector.addDocument({
        id: `doc_${Date.now()}`,
        fileName: selectedFile.name,
        hash: fileHash,
        textTokens,
        userId: state.user.id,
        eventType: metadata.eventType,
        academicYear: "2025-2026",
        uploadDate: new Date().toISOString(),
      });

      setFile((f) => f ? { ...f, status: "verified", duplicateCheck, fraudAssessment } : null);
      // Auto-set event type from classification
      if (metadata.eventType && EVENT_TYPES.includes(metadata.eventType)) {
        setEventType(metadata.eventType);
      }
    }
  }, [classifyUploadedFile, duplicateDetector, rateLimiter, checkFraudRisk, recordUploadTimestamp, toast, state.user.id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processUpload(droppedFile);
  }, [processUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processUpload(selectedFile);
  };

  const handleSubmit = () => {
    if (!file || file.status !== "verified" || !role || !eventType || !department) {
      toast({ title: "Incomplete form", description: "Please fill all fields and wait for verification", variant: "destructive" });
      return;
    }

    const tags = file.classification
      ? [file.classification.documentType, eventType, department].filter(Boolean)
      : [eventType, department];

    addActivity({
      id: `activity_${Date.now()}`,
      name: file.metadata?.eventType
        ? `${file.metadata.eventType} - ${file.name.replace(/\.[^.]+$/, "")}`
        : file.name.replace(/\.[^.]+$/, ""),
      type: eventType,
      role,
      date: new Date().toISOString().split("T")[0],
      status: "verified",
      department,
      fileName: file.name,
      tags,
      duplicateInfo: file.duplicateCheck,
      fraudAssessment: file.fraudAssessment,
      classification: file.classification,
    });

    toast({ title: "Document submitted!", description: "Your document has been submitted for review. Points earned!" });
    setFile(null);
    setRole("");
    setEventType("");
    setDepartment("");
  };

  const statusConfig: Record<string, { icon: any; text: string; color: string; animate: boolean }> = {
    uploading: { icon: Loader2, text: "Uploading...", color: "text-primary", animate: true },
    classifying: { icon: Tag, text: "AI Classifying Document...", color: "text-primary", animate: true },
    extracting: { icon: Loader2, text: "AI Extracting Metadata...", color: "text-gamification", animate: true },
    checking_duplicates: { icon: Copy, text: "Checking for Duplicates...", color: "text-gamification", animate: true },
    verified: { icon: CheckCircle2, text: "Verified \u2713 (All Checks Passed)", color: "text-success", animate: false },
    rejected_year: { icon: CalendarX, text: `Rejected \u2014 Not in ${ACADEMIC_YEAR_LABEL}`, color: "text-destructive", animate: false },
    rejected_duplicate: { icon: Copy, text: "Rejected \u2014 Duplicate Detected", color: "text-destructive", animate: false },
    rejected_fraud: { icon: Shield, text: "Rejected \u2014 Flagged by Fraud Detection", color: "text-destructive", animate: false },
    failed: { icon: AlertCircle, text: "Verification Failed", color: "text-destructive", animate: false },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Upload Documents</h1>
        <p className="text-muted-foreground mt-1">Upload your certificates and event documents for NAAC verification</p>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            Academic Year: {ACADEMIC_YEAR_LABEL}
          </Badge>
          <Badge variant="outline" className="text-xs border-gamification/30 text-gamification">
            Rate: {rateLimiter.getRemaining()} uploads remaining
          </Badge>
        </div>
      </div>

      {/* Drop Zone */}
      <Card
        className={`relative border-2 border-dashed transition-all cursor-pointer ${
          isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <p className="font-display font-semibold text-foreground">Drop your certificate here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse &bull; PDF, JPG, PNG up to 10MB</p>
          <p className="text-xs text-muted-foreground mt-1">AI-powered: auto-classification, metadata extraction, duplicate detection</p>
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
        </label>
      </Card>

      {/* File Status */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    {file.status !== "idle" && statusConfig[file.status] && (
                      <div className={`flex items-center gap-1.5 mt-0.5 ${statusConfig[file.status].color}`}>
                        {(() => {
                          const config = statusConfig[file.status];
                          const Icon = config.icon;
                          return (
                            <>
                              <Icon className={`w-3.5 h-3.5 ${config.animate ? "animate-spin" : ""}`} />
                              <span className="text-xs font-medium">{config.text}</span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Document Classification Result */}
              {file.classification && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-display font-semibold text-primary mb-1">Document Classification</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getDocumentTypeLabel(file.classification.documentType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({(file.classification.confidence * 100).toFixed(0)}% confidence)
                    </span>
                  </div>
                  {file.classification.signals.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Signals: {file.classification.signals.slice(0, 3).join(", ")}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Duplicate Detection Result */}
              {file.status === "rejected_duplicate" && file.duplicateCheck && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="text-xs font-display font-semibold text-destructive mb-1">Duplicate Detected</p>
                  <p className="text-xs text-muted-foreground">
                    {file.duplicateCheck.details}
                    {file.duplicateCheck.duplicateType === "exact" && " (exact file hash match)"}
                    {file.duplicateCheck.duplicateType === "near" && ` (${(file.duplicateCheck.similarity * 100).toFixed(0)}% text similarity)`}
                  </p>
                </motion.div>
              )}

              {/* Rejected Year Warning */}
              {file.status === "rejected_year" && file.metadata && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="text-xs font-display font-semibold text-destructive mb-1">Academic Year Mismatch</p>
                  <p className="text-xs text-muted-foreground">
                    The event date <strong>{file.metadata.eventDate}</strong> does not fall within the current academic year ({ACADEMIC_YEAR_LABEL}).
                  </p>
                </motion.div>
              )}

              {/* Fraud Assessment Warning */}
              {file.status === "rejected_fraud" && file.fraudAssessment && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="text-xs font-display font-semibold text-destructive mb-1">Fraud Risk Detected</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {file.fraudAssessment.signals.map((s, i) => (
                      <li key={i}>&bull; {s.signal} (severity: {s.severity})</li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Verified Metadata */}
              {file.metadata && file.status === "verified" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-success/5 rounded-lg border border-success/20">
                  <p className="text-xs font-display font-semibold text-success mb-2">AI Extracted Metadata</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{file.metadata.facultyName}</span></div>
                    <div><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{file.metadata.eventDate}</span></div>
                    <div><span className="text-muted-foreground">Venue:</span> <span className="font-medium text-foreground">{file.metadata.venue}</span></div>
                    <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground">{file.metadata.eventType}</span></div>
                  </div>
                  {file.duplicateCheck && !file.duplicateCheck.isDuplicate && (
                    <p className="text-xs text-success mt-2">No duplicates found &bull; {file.duplicateCheck.details}</p>
                  )}
                  {file.fraudAssessment && (
                    <p className="text-xs text-success mt-1">
                      Fraud risk: {file.fraudAssessment.riskLevel} ({(file.fraudAssessment.riskScore * 100).toFixed(0)}%)
                    </p>
                  )}
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Fields */}
      <Card className="p-5 space-y-4">
        <h2 className="font-display font-semibold text-foreground">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="font-body text-sm">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Your Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSubmit} className="w-full md:w-auto font-display font-semibold" disabled={!file || file.status !== "verified"}>
          Submit Document
        </Button>
      </Card>
    </div>
  );
};

export default UploadSection;
