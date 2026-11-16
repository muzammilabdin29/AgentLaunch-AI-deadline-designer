import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY?.trim();

console.log("API key detected:", Boolean(key));

if (!key) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

console.log("\n--- Testing Interactions API with gemini-3.8-flash ---");
try {
    const interaction = await ai.interactions.create({
        model: "gemini-3.8-flash",
        input: "Reply with only OK"
    });

    console.log("Gemini connection: SUCCESS 🎉");
    console.log("Response:", interaction.output_text);
} catch (error) {
    console.error("Interactions call failed:", error.message);
}
