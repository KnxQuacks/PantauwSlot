const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes standard cache

export async function fetchWithCache(url: string, bypassCache = false) {
  if (!bypassCache) {
    const cached = apiCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type");
    
    // Deteksi jika response adalah HTML (Cloudflare Waiting Room)
    if (contentType && contentType.includes("text/html")) {
      return { 
        status: false, 
        error: "WAITING_ROOM", 
        message: "Server JKT48 sedang dalam antrean (Waiting Room). Data tidak dapat diambil." 
      };
    }

    const data = await res.json();
    apiCache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return { status: false, error: "FETCH_ERROR", message: "Gagal terhubung ke server JKT48." };
  }
}
