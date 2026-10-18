import express from "express";
import cors from "cors";
import { pipeline } from "@huggingface/transformers";

const app = express();
const port = 3001;

// Allow your local Live Server page to contact this local server.
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ]
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "CraveCraft server is running" });
});

let modelPromise;

function getModel() {
  // Load the model once, then reuse it for later questions.
  if (!modelPromise) {
    modelPromise = pipeline(
      "text-generation",
      "HuggingFaceTB/SmolLM2-135M-Instruct"
    );
  }

  return modelPromise;
}

app.post("/api/chat", async (req, res) => {
  const message = req.body?.message;

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Please provide a message." });
  }

  try {
    const model = await getModel();

    const result = await model(
      [
        {
          role: "system",
          content:
            "You are CraveCraft, a friendly cooking assistant. Give clear, practical, detailed cooking instructions and recipe quantities."
        },
        {
          role: "user",
          content: message.trim()
        }
      ],
      { max_new_tokens: 180 }
    );

    const answer = result[0].generated_text.at(-1).content;
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "The model could not answer. Check the server terminal for details."
    });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`CraveCraft server running at http://127.0.0.1:${port}`);
});
