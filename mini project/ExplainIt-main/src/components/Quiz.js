import React, { useState, useEffect } from 'react';

export default function Quiz({ quizData }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showScoreScreen, setShowScoreScreen] = useState(false);

  const questions = quizData?.questions || [];

  function handleOptionClick(option) {
    setSelected(option);
  }

  function nextQuestion() {
    if (!selected) {
      alert("Select an option!");
      return;
    }

    if (selected === questions[current].correct_answer) {
      setScore(score + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setShowScoreScreen(true);
    }
  }

  const progressWidth = questions.length > 0 
    ? showScoreScreen 
      ? 100 
      : (current / questions.length) * 100 
    : 0;

  if (!quizData || questions.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Pixelify+Sans:wght@400..700&family=Playfair+Display:ital,wght@0,800;1,800&display=swap');
          
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: url("curs.png") 0 0, auto;
            font-family: 'Pixelify Sans';
            background-image: url("download.gif");
            background-position: center;
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
          }

          body::before {
            content: "";
            position: fixed;
            inset: 0;
            backdrop-filter: blur(4px);
            z-index: 0;
          }

          .error-message {
            position: relative;
            z-index: 1;
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            font-size: 1.2rem;
          }
        `}</style>
        <div className="error-message">
          <h3>No quiz found. Please generate quiz first.</h3>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Pixelify+Sans:wght@400..700&family=Playfair+Display:ital,wght@0,800;1,800&display=swap');
        
        /* ---------------- BODY ---------------- */
        
        
        body {
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: url("curs.png") 0 0, auto;
          font-family: 'Pixelify Sans';
          background-image: url("download.gif");
          background-color: #0f172a;
          background-size: 105% 105%;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        body::before {
          content: "";
          position: fixed;
          inset: 0 px;
          backdrop-filter: blur(4px);
          z-index: 0;
        }

        /* ---------------- QUIZ CARD ---------------- */
        .quiz-frame {
          position: relative;
          width: 750px;
          
          max-width: 90vw;
          z-index: 1;
          animation: float 6s ease-in-out infinite;
          
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .frame-img {
          width: 100%;
          display: block;
          padding-top:150px;
          border-radius: 30px;
        }

        /* ---------------- CONTENT INSIDE CARD ---------------- */
        .frame-content {
          position: absolute;
          top: 235px;
          left: 30px;
          right: 30px;
          bottom: 42px;
          background: white;
          border-radius: 2px;
          padding: 1px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        /* ---------------- PROGRESS BAR ---------------- */
        .progress {
          height: 8px;
          background: #eee;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #ff9a9e, #fad0c4);
          transition: width 0.4s;
        }

        /* ---------------- QUESTION ---------------- */
        .frame-content h2 {
          font-size: 1.6rem;
          margin-bottom: 20px;
        }

        .question {
          font-size: 1.4 rem;
          margin-bottom: 15px;
          font-weight: 600;
        }

        /* ---------------- OPTIONS ---------------- */
        .options {
          display: flex;
          flex-direction: column;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8 rem;
          background: #f4f6ff;
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 10px;
          cursor: url("curs.png") 0 0, auto;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .option input[type="radio"] {
          accent-color: #6c5ce7;
          width: 18px;
          height: 18px;
          cursor: url("curs.png") 0 0, auto;
        }

        .option.selected {
          background: #e0dcff;
          border: 2px solid #6c5ce7;
        }

        /* ---------------- NEXT BUTTON ---------------- */
        .btn {
          width: 100%;
          padding: 10px;
          border-radius: 16px;
          font-size: 1.1rem;
          background: #6c5ce7;
          color: white;
          border: none;
          font-family: 'Pixelify Sans';
          margin-top: 15px;
          cursor: url("curs.png") 0 0, auto;
          transition: background 0.3s;
        }

        .btn:hover {
          background: #5946c1;
        }

        /* ---------------- SCORE ---------------- */
        .score {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          font-family:Comic Sans;
          color: #333;
          padding: 40px 20px;
        }
      `}</style>

      <div className="quiz-frame">
        <img src="card.jpg" className="frame-img" alt="Quiz frame" />

        <div className="frame-content">
          <div className="progress">
            <div 
              className="progress-bar" 
              id="progressBar"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>

          <div id="quiz">
            {!showScoreScreen && questions.length > 0 && (
              <>
                <div className="question">{questions[current].question}</div>
                <div className="options">
                  {questions[current].options.map((opt, idx) => (
                    <label 
                      key={idx}
                      className={`option ${selected === opt ? 'selected' : ''}`}
                      onClick={() => handleOptionClick(opt)}
                    >
                      <input 
                        type="radio" 
                        name="answer" 
                        value={opt}
                        checked={selected === opt}
                        onChange={() => {}}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </>
            )}

            {showScoreScreen && (
              <div className="score">
                Your Score<br /><br />
                {score} / {questions.length}
              </div>
            )}
          </div>

          {!showScoreScreen && (
            <button className="btn" onClick={nextQuestion}>
              Next
            </button>
          )}
        </div>
      </div>
    </>
  );
}