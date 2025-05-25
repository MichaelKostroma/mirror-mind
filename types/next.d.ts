// Type definitions for Next.js extended functionality
// This file extends the built-in Next.js types with additional properties

import { NextRequest } from 'next/server';

declare global {
  interface AbortSignal {
    /**
     * Vercel-specific extension to AbortSignal that allows background tasks to continue
     * after a response has been sent.
     * 
     * @param promise - The promise representing the background task
     */
    waitUntil?(promise: Promise<any>): void;
  }
}

// Ensure this file is treated as a module
export {};