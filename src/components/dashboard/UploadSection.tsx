import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type UploadStatus = "idle" | "uploading" | "extracting" | "verified" | "failed";

interface UploadedFile {
  name: string;
  status: UploadStatus;
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

const UploadSection = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [role, setRole] = useState("");
  const [eventType, setEventType] = useState("");
  const [department, setDepartment] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const simulateUpload = useCallback((fileName: string) => {
    setFile({ name: fileName, status: "uploading" });

    setTimeout(() => {
      setFile((f) => f ? { ...f, status: "extracting" } : null);
      setTimeout(() => {
        setFile((f) => f ? {
          ...f,
          status: "verified",
          metadata: {
            facultyName: "Dr. Priya Sharma",
            eventDate: "March 10, 2026",
            venue: "VIT Chennai, Auditorium Hall",
            eventType: "FDP",
          }
        } : null);
      }, 2000);
    }, 1500);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) simulateUpload(droppedFile.name);
  }, [simulateUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) simulateUpload(selectedFile.name);
  };

  const handleSubmit = () => {
    if (!file || file.status !== "verified" || !role || !eventType || !department) {
      toast({ title: "Incomplete form", description: "Please fill all fields and wait for verification", variant: "destructive" });
      return;
    }
    toast({ title: "Document submitted!", description: "Your document has been submitted for review. +40 points earned!" });
    setFile(null);
    setRole("");
    setEventType("");
    setDepartment("");
  };

  const statusConfig = {
    uploading: { icon: Loader2, text: "Uploading...", color: "text-primary", animate: true },
    extracting: { icon: Loader2, text: "AI Extracting Metadata...", color: "text-gamification", animate: true },
    verified: { icon: CheckCircle2, text: "Verified ✓", color: "text-success", animate: false },
    failed: { icon: AlertCircle, text: "Verification Failed", color: "text-destructive", animate: false },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Upload Documents</h1>
        <p className="text-muted-foreground mt-1">Upload your certificates and event documents for NAAC verification</p>
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
          <p className="text-sm text-muted-foreground mt-1">or click to browse • PDF, JPG, PNG up to 10MB</p>
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
                    {file.status !== "idle" && (
                      <div className={`flex items-center gap-1.5 mt-0.5 ${statusConfig[file.status]?.color}`}>
                        {(() => {
                          const config = statusConfig[file.status];
                          if (!config) return null;
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

              {/* Extracted Metadata */}
              {file.metadata && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-success/5 rounded-lg border border-success/20">
                  <p className="text-xs font-display font-semibold text-success mb-2">AI Extracted Metadata</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{file.metadata.facultyName}</span></div>
                    <div><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{file.metadata.eventDate}</span></div>
                    <div><span className="text-muted-foreground">Venue:</span> <span className="font-medium text-foreground">{file.metadata.venue}</span></div>
                    <div><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground">{file.metadata.eventType}</span></div>
                  </div>
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
