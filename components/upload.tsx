"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PROGRESS_INCREMENT, REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dragDepthRef = useRef(0);

    const { isSignedIn } = useAuth();

    const clearTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    useEffect(() => {
        if (isSignedIn) return;

        // Hard block upload behavior when signed out.
        clearTimers();
        dragDepthRef.current = 0;
        setIsDragging(false);
        setFile(null);
        setProgress(0);
    }, [clearTimers, isSignedIn]);

    const processFile = useCallback((files: FileList | null | undefined) => {
        if (!isSignedIn) return;
        if (!files || files.length === 0) return;

        clearTimers();

        const nextFile = files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(nextFile.type)) return;

        setFile(nextFile);
        setProgress(0);

        const reader = new FileReader();
        reader.onerror = () => {
            setFile(null);
            setProgress(0);
        };
        reader.onloadend = () => {
            const base64Data = typeof reader.result === 'string' ? reader.result : '';
            if (!base64Data) {
                setFile(null);
                setProgress(0);
                return;
            }

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = Math.min(100, prev + PROGRESS_INCREMENT);
                    if (next === 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        timeoutRef.current = setTimeout(() => {
                            onComplete?.(base64Data);
                            timeoutRef.current = null;
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(nextFile);
    }, [clearTimers, isSignedIn, onComplete]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        if (!e.dataTransfer.types?.includes('Files')) return;

        dragDepthRef.current += 1;
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        if (!e.dataTransfer.types?.includes('Files')) return;
        e.dataTransfer.dropEffect = 'copy';

        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;

        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        dragDepthRef.current = 0;
        setIsDragging(false);

        if (!isSignedIn) return;
        processFile(e.dataTransfer.files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        processFile(e.target.files);
        // Allow selecting the same file again to retrigger onChange.
        e.currentTarget.value = '';
    };

    return (
        <div className="w-full">
            {!file ? (
                <Card
                    className={`relative border-dashed bg-card/60 backdrop-blur ${
                        isDragging ? "ring-2 ring-primary/40" : "ring-1 ring-border/50"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UploadIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {isSignedIn
                                    ? "Click to upload or drag and drop"
                                    : "Sign in with Puter to upload"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG, or WEBP up to 50MB.
                            </p>
                        </div>
                        <Button type="button" variant="secondary" size="sm" disabled={!isSignedIn}>
                            Choose file
                        </Button>
                        <input
                            type="file"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            accept=".jpg,.jpeg,.png,.webp"
                            disabled={!isSignedIn}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-card/70 backdrop-blur ring-1 ring-border/50">
                    <CardContent className="flex flex-col gap-4 px-6 py-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                                {progress === 100 ? (
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : (
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {progress < 100 ? "Analyzing floor plan..." : "Redirecting..."}
                                </p>
                            </div>
                        </div>
                        <Progress value={progress} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Upload;
