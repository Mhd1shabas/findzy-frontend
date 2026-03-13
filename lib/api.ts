const defaultUrl = "http://localhost:5000";
const envUrl = process.env.NEXT_PUBLIC_API_URL;

let derivedUrl = envUrl || defaultUrl;

if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Only apply local IP logic if we are actually in a local environment
    const isLocalHostname = hostname === "localhost" || hostname === "127.0.0.1";
    
    if (isLocalHostname && (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.'))) {
        derivedUrl = `http://${hostname}:5000`;
    }
    
    console.log("📍 API_URL Resolution:", {
        envValue: envUrl,
        finalUrl: derivedUrl,
        hostname
    });
}

export const API_URL = derivedUrl;
