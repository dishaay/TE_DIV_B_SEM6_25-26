const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./quiz.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_answer TEXT
    )
  `);
});

module.exports = db;
