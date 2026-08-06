"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Loader2,
    Settings,
    User as UserIcon,
    Briefcase,
    Code,
    BrainCircuit,
    Zap,
    Layers,
    Clock,
    Trophy,
    AlertCircle,
    CheckCircle2,
    Check,
} from "lucide-react";

interface UserData {
    name?: string;
    role?: string;
    experienceYears?: number;
    skills?: string[];
}

const questionOptions = [
    { value: 5, label: "Quick", time: "~10 min", icon: Zap },
    { value: 10, label: "Standard", time: "~20 min", icon: Layers },
    { value: 15, label: "Extended", time: "~30 min", icon: Clock },
    { value: 20, label: "Full Length", time: "~40 min", icon: Trophy },
];

function SetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState(5);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                router.push("/");
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/v1/user/${userId}`);
                if (response.data.success) {
                    setUserData(response.data.user);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [userId, router]);

    const handleStartInterview = async () => {
        setStarting(true);
        try {
            const response = await axios.post("http://localhost:5000/api/v1/interview/start", {
                userId,
                totalQuestions: questions,
            });

            if (response.data.success) {
                router.push(`/interview/${response.data.interviewId}`);
            }
        } catch (err: unknown) {
            console.error(err);
            setError("Failed to start the interview.");
            setStarting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-9 h-9 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen w-full">
            <div className="container-custom py-10 sm:py-14">
                {/* Eyebrow + step indicator */}
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-8">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    SkillScan
                    <span className="text-border">/</span>
                    <span className="text-success flex items-center gap-1">
                        Resume <CheckCircle2 className="w-3 h-3" />
                    </span>
                    <span className="text-border">→</span>
                    <span className="text-foreground font-semibold">Setup</span>
                    <span className="text-border">→</span>
                    Interview
                    <span className="text-border">→</span>
                    Report
                </div>

                <div className="max-w-2xl mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        Profile analyzed
                    </h1>
                    <p className="text-muted-foreground text-base sm:text-lg">
                        Review what the AI picked up from your résumé, then configure your interview.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Profile Summary */}
                    <Card className="border border-l-4 border-l-primary shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <BrainCircuit className="w-5 h-5 text-primary" /> AI Profile Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-start gap-3">
                                <UserIcon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-mono text-muted-foreground mb-0.5">candidate_name</p>
                                    <p className="font-semibold text-base sm:text-lg text-foreground">
                                        {userData?.name || "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-mono text-muted-foreground mb-0.5">role_and_experience</p>
                                    <p className="font-semibold text-base sm:text-lg text-foreground">
                                        {userData?.role || "N/A"} · {userData?.experienceYears || 0} yrs
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Code className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-mono text-muted-foreground mb-2">skills_detected</p>
                                    <div className="flex flex-wrap gap-2">
                                        {userData?.skills && userData.skills.length > 0 ? (
                                            userData.skills.map((skill: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="text-xs sm:text-sm font-medium px-3 py-1 rounded-full bg-accent text-accent-foreground border border-border"
                                                >
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm italic text-muted-foreground">
                                                No skills detected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configure Interview */}
                    <Card className="border shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <Settings className="w-5 h-5" /> Configure Interview
                            </CardTitle>
                            <CardDescription>Choose how long your mock interview should run.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground">
                                    Select interview length
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {questionOptions.map(({ value, label, time, icon: Icon }) => {
                                        const isSelected = questions === value;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setQuestions(value)}
                                                aria-pressed={isSelected}
                                                className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3.5 text-left transition-all
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                          ${isSelected
                                                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                                                        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-accent/40"
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background">
                                                        <Check className="w-3 h-3" strokeWidth={3} />
                                                    </span>
                                                )}

                                                <div className="flex w-full items-center justify-between">
                                                    <Icon
                                                        className={`w-4 h-4 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                                                            }`}
                                                    />
                                                    <span className="text-xl font-bold leading-none">{value}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`text-sm font-medium ${isSelected ? "text-primary-foreground" : "text-foreground"
                                                            }`}
                                                    >
                                                        {label}
                                                    </span>
                                                    <span
                                                        className={`text-xs ${isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {time}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                                    <p className="text-destructive text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleStartInterview}
                                className="w-full py-5 sm:py-6 text-base sm:text-lg font-semibold"
                                disabled={starting}
                            >
                                {starting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing AI...
                                    </>
                                ) : (
                                    "Start Mock Interview Now"
                                )}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                                {"You can't pause once the interview starts, so pick a length you can finish in one sitting."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default function SetupPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-9 h-9 animate-spin text-primary" />
                </div>
            }
        >
            <SetupContent />
        </Suspense>
    );
}