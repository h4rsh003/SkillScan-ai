"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    Home,
    Target,
    Award,
    MessageSquare,
    CheckCircle2,
    Download,
} from "lucide-react";

interface QnaItem {
    _id?: string;
    question: string;
    userAnswer?: string;
    feedback?: string;
}

interface InterviewData {
    overallScore: number;
    overallFeedback?: string;
    qnaList: QnaItem[];
}

export default function Dashboard() {
    const params = useParams();
    const router = useRouter();
    const interviewId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!interviewId) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/v1/interview/${interviewId}`);
                if (response.data.success) {
                    setInterviewData(response.data.interview);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [interviewId]);

    // Native Browser Print functionality
    const handleDownloadPDF = () => {
        window.print();
    };

    if (loading || !interviewData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-11 h-11 animate-spin text-primary" />
                <p className="text-base font-medium text-muted-foreground">Compiling your results...</p>
            </div>
        );
    }

    const score = interviewData.overallScore;

    const band =
        score >= 75
            ? {
                verdict: "Strong performance",
                text: "text-success",
                stroke: "stroke-success",
                badgeBg: "bg-success/10",
            }
            : score >= 50
                ? {
                    verdict: "Room to improve",
                    text: "text-warning",
                    stroke: "stroke-warning",
                    badgeBg: "bg-warning/10",
                }
                : {
                    verdict: "Needs more practice",
                    text: "text-destructive",
                    stroke: "stroke-destructive",
                    badgeBg: "bg-destructive/10",
                };

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(score, 100) / 100) * circumference;

    return (
        <main className="min-h-screen w-full bg-background">
            <div className="container-custom py-10 sm:py-14 space-y-10">
                {/* Step indicator — Hidden during print */}
                <div className="print:hidden flex items-center gap-2 font-mono text-xs text-muted-foreground max-w-5xl mx-auto">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    SkillScan
                    <span className="text-border">/</span>
                    <span className="text-success flex items-center gap-1">
                        Resume <CheckCircle2 className="w-3 h-3" />
                    </span>
                    <span className="text-border">→</span>
                    <span className="text-success flex items-center gap-1">
                        Setup <CheckCircle2 className="w-3 h-3" />
                    </span>
                    <span className="text-border">→</span>
                    <span className="text-success flex items-center gap-1">
                        Interview <CheckCircle2 className="w-3 h-3" />
                    </span>
                    <span className="text-border">→</span>
                    <span className="text-foreground font-semibold">Report</span>
                </div>

                {/* Header row: title + download button */}
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="text-center sm:text-left space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Interview Report</h1>
                        <p className="text-muted-foreground text-base sm:text-lg print:hidden">
                            {"Here's your AI-generated performance review."}
                        </p>
                    </div>

                    {/* Button hidden during print */}
                    <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="font-semibold shrink-0 print:hidden"
                    >
                        <Download className="mr-2 h-4 w-4" /> Save as PDF
                    </Button>
                </div>

                {/* Report Content */}
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Score gauge */}
                        <Card className="md:col-span-1 border shadow-md flex flex-col items-center justify-center p-6 sm:p-8 break-inside-avoid">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                                    <Target className="w-5 h-5 text-muted-foreground" /> Overall Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <div className="relative w-36 h-36 sm:w-40 sm:h-40">
                                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="10" className="stroke-border" />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r={radius}
                                            fill="none"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={offset}
                                            className={`transition-all duration-700 ease-out ${band.stroke}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl sm:text-5xl font-black ${band.text}`}>{score}</span>
                                        <span className="text-xs text-muted-foreground font-mono">/ 100</span>
                                    </div>
                                </div>
                                <span className={`mt-4 text-sm font-semibold px-3 py-1 rounded-full ${band.badgeBg} ${band.text}`}>
                                    {band.verdict}
                                </span>
                            </CardContent>
                        </Card>

                        {/* AI Evaluation */}
                        <Card className="md:col-span-2 border shadow-md break-inside-avoid">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Award className="w-5 h-5 text-primary" /> AI Evaluation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base sm:text-lg leading-relaxed text-foreground/90">
                                    {interviewData.overallFeedback || "No feedback generated."}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Q&A Review */}
                    <div className="max-w-5xl mx-auto space-y-5">
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" /> Detailed Q&A Review
                        </h2>

                        {interviewData.qnaList.map((item, index) => (
                            <Card key={item._id || index} className="border shadow-sm break-inside-avoid">
                                <CardHeader className="bg-secondary/50 pb-4">
                                    <CardTitle className="text-base sm:text-lg leading-relaxed">
                                        <span className="font-mono text-primary mr-2">Q{index + 1}</span>
                                        {item.question}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="bg-background rounded-md border p-4 break-inside-avoid">
                                        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                                            Your Answer
                                        </span>
                                        <p className="text-foreground leading-relaxed text-sm sm:text-base">
                                            {item.userAnswer || (
                                                <span className="italic text-muted-foreground">No answer provided.</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="bg-success/10 rounded-md border border-success/20 p-4 break-inside-avoid">
                                        <span className="font-semibold text-xs text-success uppercase tracking-wider block mb-2">
                                            Correct Approach / AI Feedback
                                        </span>
                                        <p className="text-foreground leading-relaxed text-sm sm:text-base">
                                            {item.feedback || (
                                                <span className="italic text-muted-foreground">
                                                    Feedback not available for this question.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Back to Home Button - Hidden in Print */}
                <div className="print:hidden flex justify-center pt-4 pb-8">
                    <Button
                        onClick={() => router.push("/")}
                        className="px-8 py-5 sm:py-6 text-base sm:text-lg font-bold"
                    >
                        <Home className="mr-2 h-5 w-5" /> Start New Interview
                    </Button>
                </div>
            </div>
        </main>
    );
}