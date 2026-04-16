const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;
const OpenAI = require("openai");
const db = require("./database");


dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ---------- GENERATE QUIZ ---------- */
async function generateQuiz(text) {
  const prompt = `
Generate 10 MCQ questions from the following text.
Format:
Q1. ...
A) ...
B) ...
C) ...
D) ...
Answer: <option letter>

Text:
${text}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

/* ---------- PARSE QUIZ TEXT ---------- */
function parseQuiz(quizText) {
  const blocks = quizText.split("Q").filter(x => x.trim());
  const questions = [];

  blocks.forEach((block) => {
    const lines = block.split("\n").filter(x => x.trim());
    if (lines.length < 6) return;

    const question = lines[0].replace(/^\d+\./, "").trim();
    const A = lines[1].replace(/^A\)/, "").trim();
    const B = lines[2].replace(/^B\)/, "").trim();
    const C = lines[3].replace(/^C\)/, "").trim();
    const D = lines[4].replace(/^D\)/, "").trim();
    const answer = lines[5].replace(/^Answer:/, "").trim();

    questions.push({ question, A, B, C, D, answer });
  });

  return questions;
}

/* ---------- SAVE QUIZ TO DB ---------- */
function saveQuiz(questions) {
  db.serialize(() => {
    db.run("DELETE FROM quiz_questions"); // clear old quiz

    const stmt = db.prepare(`
      INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    questions.forEach((q) => {
      stmt.run(q.question, q.A, q.B, q.C, q.D, q.answer);
    });

    stmt.finalize();
  });
}

/* ---------- API ROUTES ---------- */

// Uploaded PDF + Generate Quiz
app.post("/generate-quiz", async (req, res) => {
  try {
    const { selectedDoc } = req.body;

    let text = "";

    // If PDF
    if (selectedDoc.type === "application/pdf") {
      const pdfBuffer = Buffer.from(selectedDoc.rawFile, "base64");
      const pdfData = await pdfParse(pdfBuffer);
      text = pdfData.text;
    }

    // If text file (or other)
    else {
      text = selectedDoc.content || "";
    }

    if (!text) {
      return res.status(400).json({ error: "No text found in document" });
    }

    const quizText = await generateQuiz(text);
    const questions = parseQuiz(quizText);

    saveQuiz(questions);

    res.json({ status: "Quiz generated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get Quiz
app.get("/get-quiz", (req, res) => {
  db.all("SELECT * FROM quiz_questions", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const questions = rows.map(r => ({
      question: r.question,
      options: [r.option_a, r.option_b, r.option_c, r.option_d],
      correct_answer: r.correct_answer
    }));

    res.json({ questions });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
