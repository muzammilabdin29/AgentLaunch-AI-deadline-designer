
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY?.trim();

console.log("API key detected:", Boolean(key));

if (!key) {
    process.exit(1);
}

try {
    const ai = new GoogleGenAI({ apiKey: key });

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: "Reply with only OK"
    });

    console.log("Gemini connection: SUCCESS");
    console.log("Response:", response.text);
} catch (error) {
    const status = error.status ?? "unknown";
    console.log("Gemini connection: FAILED");
    console.log("HTTP status:", status);
    console.log(
        "Likely cause:",
        status === 401 ? "Authentication rejected" :
            status === 403 ? "Permission or project access" :
                status === 429 ? "Rate limit or quota" :
                    status === 404 ? "Model or endpoint not found" :
                        "Check backend error details"
    );
}
