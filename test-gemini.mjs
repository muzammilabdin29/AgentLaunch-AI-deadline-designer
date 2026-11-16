import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY?.trim();

console.log("API key detected:", Boolean(key));

if (!key) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}

try {
    const ai = new GoogleGenAI({ apiKey: key });

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: "Reply with only OK"
    });

    console.log("Gemini connection: SUCCESS");
    console.log("Response:", response.text);
} catch (error) {
    const status = error.status ?? "unknown";
    console.log("Gemini connection: FAILED");
    console.log("Error details:", error.message);
    console.log("HTTP status:", status);
    console.log(
        "Likely cause:",
        status === 401 ? "Authentication rejected (check API key)" :
            status === 403 ? "Permission or project access" :
                status === 429 ? "Rate limit or quota exceeded" :
                    status === 404 ? "Model not found on your tier" :
                        "Check backend error details"
    );
}
