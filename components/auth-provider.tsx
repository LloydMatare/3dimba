"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser,
    signIn as puterSignIn,
    signOut as puterSignOut,
} from "@/lib/puter.action";

interface AuthState {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
}

interface AuthContextType extends AuthState {
    refreshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
}

const DEFAULT_AUTH_STATE: AuthState = {
    isSignedIn: false,
    userName: null,
    userId: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);

    const refreshAuth = async () => {
        try {
            const user = await getCurrentUser();

            setAuthState({
                isSignedIn: !!user,
                userName: user?.username || null,
                userId: user?.uuid || null,
            });

            return !!user;
        } catch {
            setAuthState(DEFAULT_AUTH_STATE);
            return false;
        }
    };

    useEffect(() => {
        refreshAuth();
    }, []);

    const signIn = async () => {
        await puterSignIn();
        return await refreshAuth();
    };

    const signOut = async () => {
        await puterSignOut();
        return await refreshAuth();
    };

    const value: AuthContextType = {
        ...authState,
        refreshAuth,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}