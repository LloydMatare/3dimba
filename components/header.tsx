"use client";

import { HousePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const Navbar = () => {
    const { isSignedIn, userName, signIn, signOut } = useAuth();

    const handleAuthClick = async () => {
        if (isSignedIn) {
            try {
                await signOut();
            } catch (e) {
                console.error(`Puter sign out failed: ${e}`);
            }

            return;
        }

        try {
            await signIn();
        } catch (e) {
            console.error(`Puter sign in failed: ${e}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
            <nav className="flex w-full items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <HousePlus className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold tracking-tight">ImbaAI</span>
                    </div>

                    <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                        <a className="hover:text-foreground transition-colors" href="#product">Product</a>
                        <a className="hover:text-foreground transition-colors" href="#workflow">Workflow</a>
                        <a className="hover:text-foreground transition-colors" href="#projects">Projects</a>
                        <a className="hover:text-foreground transition-colors" href="#pricing">Pricing</a>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {isSignedIn ? (
                        <>
                            <span className="hidden text-xs font-medium text-muted-foreground md:inline">
                                {userName ? `Hi, ${userName}` : "Signed in"}
                            </span>
                            <Button size="sm" onClick={handleAuthClick}>
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleAuthClick} size="sm" variant="ghost">
                                Log In
                            </Button>
                            <Button asChild size="sm">
                                <a href="#upload">Get Started</a>
                            </Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
