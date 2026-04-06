const defaultUrl = "http://localhost:5000";
const envUrl = process.env.NEXT_PUBLIC_API_URL;

let derivedUrl = envUrl || defaultUrl;

if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalHostname = hostname === "localhost" || hostname === "127.0.0.1";
    
    // Only override to a local IP if we are on a local hostname and NO production URL is set
    // This allows testing on mobile while still hitting the production backend if desired.
    if (!envUrl && (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.'))) {
        derivedUrl = `http://${hostname}:5000`;
    }
    
    console.log("📍 API_URL Resolution:", {
        envValue: envUrl,
        finalUrl: derivedUrl,
        hostname
    });
}

export const API_URL = derivedUrl;

