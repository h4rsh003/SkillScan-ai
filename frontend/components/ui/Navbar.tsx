"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Plus } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        const prefersDark =
            stored === "dark" ||
            (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);

        document.documentElement.classList.toggle("dark", prefersDark);
        setIsDark(prefersDark);
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
        setIsDark(next);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
            <div className="container-custom flex h-14 sm:h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-mono text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="font-semibold text-foreground">SkillScan</span>
                    <span className="hidden sm:inline text-border">/</span>
                    <span className="hidden sm:inline text-muted-foreground">AI Interviewer</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {pathname !== "/" && (
                        <Link
                            href="/"
                            className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md border border-border text-foreground hover:border-primary/40 hover:bg-accent/40 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Interview
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                        {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                    </button>
                </div>
            </div>
        </header>
    );
}