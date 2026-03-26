"use client";

import { useEffect } from "react";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>Oops!</h1>
            <p>An unexpected error occurred.</p>
            <p className="text-gray-600">{error.message}</p>
            {process.env.NODE_ENV === "development" && (
                <pre className="w-full p-4 overflow-x-auto bg-gray-100 rounded mt-4">
          <code>{error.stack}</code>
        </pre>
            )}
            <button
                onClick={reset}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Try again
            </button>
        </main>
    );
}