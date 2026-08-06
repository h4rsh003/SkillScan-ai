"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Bot, Mic, MicOff, AlertCircle } from "lucide-react";

const MAX_WORDS = 300;

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const truncateToWordLimit = (text: string, limit: number) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + " ";
};

// --- Minimal Web Speech API types (not in default TS lib) ---
interface SpeechRecognitionResultItem {
    transcript: string;
}
interface SpeechRecognitionResultLike {
    [index: number]: SpeechRecognitionResultItem;
    isFinal: boolean;
}
interface SpeechRecognitionEventLike extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultLike[];
}
interface SpeechRecognitionErrorEventLike extends Event {
    error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
}
interface SpeechRecognitionConstructor {
    new(): SpeechRecognitionInstance;
}
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

export default function InterviewRoom() {
    const params = useParams();
    const router = useRouter();
    const interviewId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const [isListening, setIsListening] = useState(false);
    const [micSupported, setMicSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const [speechError, setSpeechError] = useState("");

    // 1. Initialize Web Speech API
    useEffect(() => {
        const SpeechRecognitionCtor =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
            // Feature detection of a browser API — this is a legitimate
            // "synchronize with an external system" case for useEffect.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMicSupported(false);
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    currentTranscript += transcript + " ";
                }
            }
            if (currentTranscript) {
                setAnswer((prev) => {
                    const combined = prev + currentTranscript;
                    return countWords(combined) > MAX_WORDS
                        ? truncateToWordLimit(combined, MAX_WORDS)
                        : combined;
                });
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setSpeechError("Microphone error or permission denied.");
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
    }, []);

    // 2. Fetch Interview Data
    useEffect(() => {
        const fetchInterview = async () => {
            if (!interviewId) return;

            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interview/${interviewId}`);
                if (response.data.success) {
                    const interview = response.data.interview;

                    if (interview.status === "COMPLETED") {
                        router.push(`/dashboard/${interviewId}`);
                        return;
                    }

                    const qnaList = interview.qnaList;
                    const currentQ = qnaList[qnaList.length - 1];

                    setQuestion(currentQ.question);
                    setProgress({ current: qnaList.length, total: interview.totalQuestions });
                }
            } catch (error) {
                console.error("Failed to load interview", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();
    }, [interviewId, router]);

    // 3. Toggle Mic
    const toggleListening = () => {
        setSpeechError("");
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
            }
        }
    };

    // Manual typing — enforce word limit
    const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (countWords(value) > MAX_WORDS) {
            setAnswer(truncateToWordLimit(value, MAX_WORDS));
            return;
        }
        setAnswer(value);
    };

    // Block paste — answer must be typed or spoken, not pasted
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        setSpeechError("Pasting isn't allowed — please type or use the mic.");
    };

    // 4. Submit Answer
    const handleSubmit = async () => {
        if (!answer.trim() || !interviewId) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        setSubmitting(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interview/answer`, {
                interviewId,
                answer,
            });

            if (response.data.success) {
                if (response.data.isCompleted) {
                    router.push(`/dashboard/${interviewId}`);
                } else {
                    setQuestion(response.data.question);
                    setAnswer("");
                    setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
                }
            }
        } catch (error) {
            console.error("Failed to submit answer", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-9 h-9 animate-spin text-primary" />
            </div>
        );
    }

    const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
    const wordCount = countWords(answer);
    const nearLimit = wordCount >= MAX_WORDS * 0.9;
    const atLimit = wordCount >= MAX_WORDS;

    return (
        <main className="min-h-screen w-full">
            <div className="container-custom py-8 sm:py-10">
                <div className="w-full max-w-3xl mx-auto space-y-5">
                    {/* Header + progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Live Interview
                            </span>
                            <span>
                                Question {progress.current} <span className="text-border">/</span> {progress.total}
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    {/* AI Question */}
                    <Card className="border border-primary/20 bg-accent shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base text-primary">
                                <Bot className="w-4.5 h-4.5" /> AI Interviewer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base sm:text-lg leading-relaxed text-foreground">{question}</p>
                        </CardContent>
                    </Card>

                    {/* Answer card */}
                    <Card className="border shadow-lg">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Your Answer</CardTitle>

                            {micSupported && (
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    disabled={submitting}
                                    title={isListening ? "Stop recording" : "Speak your answer"}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all
                    ${isListening
                                            ? "bg-destructive text-destructive-foreground border-destructive"
                                            : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                                        }`}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="w-3.5 h-3.5" />
                                            <span className="flex gap-0.5 items-end h-3">
                                                <span className="w-0.5 h-1.5 bg-current animate-pulse" />
                                                <span className="w-0.5 h-3 bg-current animate-pulse [animation-delay:150ms]" />
                                                <span className="w-0.5 h-2 bg-current animate-pulse [animation-delay:300ms]" />
                                            </span>
                                            Listening
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-3.5 h-3.5" /> Speak instead
                                        </>
                                    )}
                                </button>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <textarea
                                className={`w-full h-40 p-4 rounded-md border bg-background text-foreground resize-none transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary
                  ${isListening ? "border-destructive ring-2 ring-destructive/20" : "border-input"}`}
                                placeholder={
                                    isListening
                                        ? "Listening... speak naturally, then review before submitting."
                                        : "Type your answer here..."
                                }
                                value={answer}
                                onChange={handleAnswerChange}
                                onPaste={handlePaste}
                                disabled={submitting}
                            />

                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-xs font-mono ${atLimit ? "text-destructive font-semibold" : nearLimit ? "text-warning" : "text-muted-foreground"
                                        }`}
                                >
                                    {wordCount} / {MAX_WORDS} words
                                </span>
                                {speechError && (
                                    <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                                        <AlertCircle className="w-3.5 h-3.5" /> {speechError}
                                    </span>
                                )}
                            </div>

                            {!micSupported && (
                                <p className="text-xs text-muted-foreground">
                                    {"Voice input isn't supported in this browser — Chrome or Edge works best."}
                                </p>
                            )}

                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || !answer.trim()}
                                className="w-full py-5 sm:py-6 text-base font-semibold"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Evaluating your answer...
                                    </>
                                ) : (
                                    <>
                                        Submit Answer <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}