let derivedUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If we're on a local network IP, point to the same IP on port 5000
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
        derivedUrl = `http://${hostname}:5000`;
    }
    console.log("🚀 Findzy API URL:", derivedUrl);
}

export const API_URL = derivedUrl;
