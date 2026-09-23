import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", system: "GEBOL Order Processing System" });
});

// Process PO Document via Gemini AI
app.post("/api/process-po", async (req, res) => {
  try {
    const { documentText, imageBase64, mimeType } = req.body;

    if (!documentText && !imageBase64) {
      return res.status(400).json({ error: "Missing document text or image payload." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in server environment."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `
You are the GEBOL Order Processing AI Engine. Your task is to extract structured Purchase Order (PO) data from raw customer order documents (PDF text, emails, scan documents).
Group extracted data strictly into core enterprise business objects:
1. Buyer (Company, Customer ID if present, VAT ID, Contact, Billing Address)
2. Order (PO Number, PO Date, Currency [EUR/USD], Payment Terms, Incoterms)
3. Delivery (Delivery Address, Requested Delivery Date, Shipping Method)
4. Line Items (Item No, Customer Article No, GEBOL Article No [infer if possible or map, e.g. GEB-XXXXX], Description, Quantity, Unit [PCC/PAIR/BOX/CTN], Unit Price, Line Total)

Perform initial validation checks and list any discrepancies or missing fields in 'validationWarnings' (e.g. Missing VAT ID, Unrecognized Item No, Delivery date in the past, Currency mismatch).
`;

    const contentsParts: any[] = [];
    if (imageBase64) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "image/png",
          data: imageBase64,
        },
      });
    }
    if (documentText) {
      contentsParts.push({
        text: `Extract purchase order data from the following document content:\n\n${documentText}`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: imageBase64 ? { parts: contentsParts } : contentsParts[0].text,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            buyer: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                customerNumber: { type: Type.STRING },
                vatId: { type: Type.STRING },
                contactPerson: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                street: { type: Type.STRING },
                city: { type: Type.STRING },
                postalCode: { type: Type.STRING },
                country: { type: Type.STRING },
              },
            },
            order: {
              type: Type.OBJECT,
              properties: {
                poNumber: { type: Type.STRING },
                poDate: { type: Type.STRING },
                currency: { type: Type.STRING },
                paymentTerms: { type: Type.STRING },
                incoterms: { type: Type.STRING },
                customerNotes: { type: Type.STRING },
              },
            },
            delivery: {
              type: Type.OBJECT,
              properties: {
                recipientName: { type: Type.STRING },
                street: { type: Type.STRING },
                city: { type: Type.STRING },
                postalCode: { type: Type.STRING },
                country: { type: Type.STRING },
                requestedDeliveryDate: { type: Type.STRING },
                shippingMethod: { type: Type.STRING },
              },
            },
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemPos: { type: Type.INTEGER },
                  customerArticleNo: { type: Type.STRING },
                  gebolArticleNo: { type: Type.STRING },
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  taxRatePercentage: { type: Type.NUMBER },
                  lineTotal: { type: Type.NUMBER },
                },
              },
            },
            extractionConfidence: { type: Type.NUMBER },
            validationWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const rawText = response.text || "{}";
    const extractedData = JSON.parse(rawText);

    res.json({
      success: true,
      data: extractedData,
    });
  } catch (err: any) {
    console.error("Error processing PO:", err);
    res.status(500).json({
      error: "Extraction failed",
      details: err.message || "An unexpected error occurred during PO extraction.",
    });
  }
});

// Start express server with Vite integration
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GEBOL System] Running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
