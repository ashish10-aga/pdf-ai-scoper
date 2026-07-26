/**
 * High-performance Client-side Cache Service
 * Provides instant 0ms responses for previously analyzed PDF documents and queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PdfCacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number = 50;

  private generateKey(pdfBase64: string, prefix: string, extraKey: string = ''): string {
    // Quick hash of PDF content + key params
    let hash = 0;
    const str = pdfBase64.slice(0, 1000) + pdfBase64.slice(-1000) + extraKey;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return `${prefix}_${hash}`;
  }

  public get<T>(pdfBase64: string, prefix: string, extraKey: string = ''): T | null {
    const key = this.generateKey(pdfBase64, prefix, extraKey);

    // 1. Check memory cache first
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      return entry.data as T;
    }

    // 2. Check localStorage fallback
    try {
      const stored = localStorage.getItem(`PDF_CACHE_${key}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        this.memoryCache.set(key, parsed); // populate memory
        return parsed.data;
      }
    } catch {
      // Ignore storage read errors
    }

    return null;
  }

  public set<T>(pdfBase64: string, prefix: string, extraKey: string, data: T): void {
    const key = this.generateKey(pdfBase64, prefix, extraKey);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    // Maintain max memory limit
    if (this.memoryCache.size >= this.maxEntries) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(key, entry);

    try {
      localStorage.setItem(`PDF_CACHE_${key}`, JSON.stringify(entry));
    } catch {
      // Ignore storage write limit errors
    }
  }

  public clear(): void {
    this.memoryCache.clear();
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('PDF_CACHE_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
}

export const pdfCache = new PdfCacheService();
