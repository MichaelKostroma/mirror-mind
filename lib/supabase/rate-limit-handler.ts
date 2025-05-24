// Cache for storing data to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute cache TTL

// Function to get data with caching and retry logic
export async function fetchWithRateLimitHandling<T>(
  key: string,
  fetchFn: () => Promise<{ data: T; error: any }>,
  options: {
    cacheTtl?: number
    maxRetries?: number
    retryDelay?: number
  } = {},
): Promise<{ data: T | null; error: any }> {
  const { cacheTtl = CACHE_TTL, maxRetries = 3, retryDelay = 1000 } = options

  // Check cache first
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cacheTtl) {
    return { data: cached.data, error: null }
  }

  // Retry logic with exponential backoff
  let lastError = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fetchFn()

      // If successful, cache the result and return
      if (!result.error) {
        cache.set(key, { data: result.data, timestamp: Date.now() })
        return result
      }

      // If it's a rate limit error, wait and retry
      if (result.error.message?.includes("Too Many Requests") || result.error.message?.includes("429")) {
        lastError = result.error
        // Exponential backoff: wait longer with each retry
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        continue
      }

      // For other errors, return immediately
      return result
    } catch (error: any) {
      // If it's a rate limit error or JSON parsing error from rate limiting
      if (
        error.message?.includes("Too Many Requests") ||
        error.message?.includes("429") ||
        (error.message?.includes("JSON") && error.message?.includes("Too Many"))
      ) {
        lastError = error
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        continue
      }

      return { data: null, error }
    }
  }

  // If we've exhausted all retries
  return { data: null, error: lastError }
}

// Helper function to clear cache
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
