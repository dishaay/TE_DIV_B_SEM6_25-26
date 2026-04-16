const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { HfInference } = require("@huggingface/inference");
const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Hugging Face client
//const hf = new HfInference(process.env.HF_TOKEN);

const hf = new HfInference(process.env.HF_TOKEN, {
  baseUrl: "https://router.huggingface.co"
});

/* ------------------------ UTIL FUNCTIONS ------------------------ */

// Split text into overlapping chunks
function chunkText(text, chunkSize = 800, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;

  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
    i += chunkSize - overlap;
  }
  return chunks;
}

// Pick most relevant chunks based on question keywords
function getRelevantChunks(chunks, question, maxChunks = 3) {
  const qWords = question.toLowerCase().split(/\s+/);

  return chunks
    .map(chunk => {
      let score = 0;
      for (const word of qWords) {
        if (chunk.toLowerCase().includes(word)) score++;
      }
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .map(item => item.chunk);
}

/* ------------------------ ROUTES ------------------------ */

// Health check
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, selectedDoc } = req.body;

    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN missing in .env");
    }

    const userQuestion = messages?.[0]?.content || "";
    if (!userQuestion) {
      return res.json({ content: "Please ask a valid question." });
    }

    let documentText = "";

    /* ---------- PDF HANDLING ---------- */
   if (selectedDoc?.type === "application/pdf") {
  if (!selectedDoc.rawFile) {
    return res.json({ content: "PDF file not found." });
  }

  // 🔹 BASE64 → BUFFER
  const pdfBuffer = Buffer.from(selectedDoc.rawFile, "base64");

  // 🔹 THIS IS THE LINE YOU ASKED ABOUT
  const pdfData = await pdfParse(pdfBuffer);

  // 🔹 EXTRACT TEXT
  documentText = pdfData.text;

  if (!documentText || documentText.trim().length === 0) {
    return res.json({
      content:
        "This PDF has no selectable text (likely scanned). Please upload a text-based PDF."
    });
  }
}

    /* ---------- OTHER TEXT DOCS ---------- */
    else {
      documentText = selectedDoc?.content || "";
    }

    if (!documentText.trim()) {
      return res.json({ content: "Uploaded document is empty." });
    }

    /* ---------- CHUNKING & SELECTION ---------- */
    const chunks = chunkText(documentText);
    const relevantChunks = getRelevantChunks(chunks, userQuestion);

    if (relevantChunks.length === 0) {
      return res.json({
        content: "No relevant information found in the document."
      });
    }

    /* ---------- PROMPT ---------- */
    const prompt = `
You are a helpful assistant.
Answer the question strictly using the document excerpts below.

Document Excerpts:
${relevantChunks.join("\n\n---\n\n")}

Question: ${userQuestion}

Answer clearly and concisely:
`;

    /* ---------- HUGGING FACE CALL ---------- */
    const result = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    });

    const answer =
      result?.choices?.[0]?.message?.content ||
      "I couldn't generate an answer.";

    res.json({ content: answer.trim() });

  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
});

/* ------------------------ SERVER ------------------------ */

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ HF Token Loaded: ${process.env.HF_TOKEN ? "YES" : "NO"}`);
});

//quiz
//quiz
const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Replace your /generate-quiz endpoint with this:
app.post('/generate-quiz', async (req, res) => {
  try {
    const { content, documentName } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'No document content provided' });
    }

    console.log('Generating quiz for:', documentName);
    console.log('Document content length:', content.length);
    console.log('First 300 chars of content:', content.substring(0, 300));

    const completion = await groq.chat.completions.create({
      messages: [{
        role: "user",
        content: `You are a quiz generator. Your task is to carefully read the document below and create 5 multiple-choice questions that test understanding of the SPECIFIC INFORMATION AND CONCEPTS in this document.

Document Title: ${documentName || 'Untitled'}

Document Content:
"""
${content}
"""

CRITICAL INSTRUCTIONS:
1. Read the document content above VERY carefully
2. Create questions that can ONLY be answered by someone who has read THIS specific document
3. DO NOT ask about file types, document formats, or generic knowledge
4. Questions MUST be about the actual facts, ideas, dates, names, concepts, or information presented in the document
5. Base all questions and answers on what is explicitly stated or clearly implied in the document
6. Make questions specific and detailed

Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{
  "questions": [
    {
      "question": "According to the document, [specific question about the content]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A"
    }
  ]
}

Generate exactly 5 questions now based on the document content above.`
      }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0].message.content;
    console.log('Groq response:', responseText);
    
    // Clean response
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const quizData = JSON.parse(cleanedText);

    console.log('Generated questions:');
    quizData.questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.question}`);
    });

    res.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message });
  }
});