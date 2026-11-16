import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY?.trim();

console.log("API key detected:", Boolean(key));

if (!key) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

console.log("\n--- Step 1: Listing Available Models for Your Key ---");
let candidateModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

try {
    const pager = await ai.models.list({ config: { pageSize: 50 } });
    const models = [];
    for await (const m of pager) {
        if (m.name && (!m.supportedActions || m.supportedActions.includes("generateContent"))) {
            models.push(m.name);
        }
    }
    console.log(`Found ${models.length} model(s) that support generateContent:`);
    models.slice(0, 10).forEach(m => console.log(`  - ${m}`));
    if (models.length > 10) console.log(`  ... and ${models.length - 10} more`);

    if (models.length > 0) {
        candidateModel = models.find(m => m.includes("flash")) || models[0];
    }
} catch (listErr) {
    console.warn("Could not list models:", listErr.message);
}

console.log(`\n--- Step 2: Testing Generation with Model: ${candidateModel} ---`);
try {
    const response = await ai.models.generateContent({
        model: candidateModel,
        contents: "Reply with only OK"
    });

    console.log("Gemini connection: SUCCESS 🎉");
    console.log("Response:", response.text);
} catch (error) {
    console.error("Gemini connection: FAILED ❌");
    console.error("Error details:", error.message);
}
