"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  Loader2,
  FileCheck,
  Play,
  Sparkles,
  MessagesSquare,
  BarChart3,
} from "lucide-react";

const MAX_SIZE_MB = 5;

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError("Please select a PDF resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/parse-resume",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        const userId = response.data.user._id;
        router.push(`/setup?userId=${userId}`);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? "Failed to analyze resume. Try again."
        : "Failed to analyze resume. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  const steps = [
    {
      n: "01",
      title: "Upload your résumé",
      desc: "AI reads your skills, role, and projects — no forms to fill.",
      icon: Sparkles,
    },
    {
      n: "02",
      title: "Live AI interview",
      desc: "Questions build on your last answer, just like a real interviewer.",
      icon: MessagesSquare,
    },
    {
      n: "03",
      title: "Scored report",
      desc: "Get a score out of 100 with a breakdown of every answer.",
      icon: BarChart3,
    },
  ];

  return (
    <main className="min-h-screen w-full">
      {/* Hero */}
      <section className="container-custom pt-10 sm:pt-16 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="max-w-xl">
            <p className="font-mono text-xs sm:text-sm text-primary mb-4 tracking-wide">
              {"// AI MOCK INTERVIEWS"}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
              Interview practice that adapts to your résumé,{" "}
              <span className="text-primary">not the other way around.</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-7">
              Upload your résumé and the AI builds a live technical interview
              around your actual skills and projects — then follows up on
              every answer, the way a real interviewer would.
            </p>

            <div className="flex flex-wrap gap-2">
              {["Role-aware questions", "Live feedback loop", "Scored report card"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full bg-accent text-accent-foreground border border-border"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right: terminal-style upload card */}
          <div className="w-full">
            <form
              onSubmit={handleUploadAndAnalyze}
              className="rounded-xl border border-border bg-card shadow-lg overflow-hidden"
            >
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  resume_analyzer.sh
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-4 sm:p-5 space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload résumé PDF"
                  className={`flex flex-col items-center justify-center w-full min-h-45 rounded-lg border-2 border-dashed cursor-pointer transition-colors font-mono
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    ${isDragging
                      ? "border-primary bg-accent"
                      : resumeFile
                        ? "border-primary bg-accent/60"
                        : "border-border hover:border-primary/50 hover:bg-secondary/60"
                    }`}
                >
                  {resumeFile ? (
                    <div className="flex flex-col items-center text-center px-4">
                      <FileCheck className="w-9 h-9 text-primary mb-3" />
                      <p className="text-sm text-foreground">
                        <span className="text-success">✓</span> {resumeFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatSize(resumeFile.size)} · click to replace
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center px-4">
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-foreground">
                        <span className="text-primary">$</span> drag résumé.pdf here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to browse · PDF, max {MAX_SIZE_MB}MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>

                {error && (
                  <p role="alert" className="font-mono text-xs sm:text-sm text-destructive">
                    ✗ error: {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full py-5 sm:py-6 text-base font-semibold"
                  disabled={loading || !resumeFile}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      analyzing resume...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/40">
        <div className="container-custom py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {steps.map(({ n, title, desc, icon: Icon }) => (
              <div key={n} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{n}</span>
                  <div className="h-px flex-1 bg-border" />
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}