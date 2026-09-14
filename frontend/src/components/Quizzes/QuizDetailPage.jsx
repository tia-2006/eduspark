import React, { useEffect, useState } from 'react';
import { apiGetQuiz, apiSubmitQuiz } from '../../api/api';
import './QuizDetailPage.css';

export default function QuizDetailPage({ classId, user, onBack }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quiz-taking state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiGetQuiz(classId);
        setQuiz(res.quiz);
        setAnswers(new Array(res.quiz.questions?.length || 0).fill(null));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [classId]);

  const handleSelectOption = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < (quiz?.questions?.length || 1) - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiSubmitQuiz(classId, answers);
      setResult(res);
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="quiz-detail-loading">
      <div className="spinner spinner-green" />
      <p>Loading quiz...</p>
    </div>
  );

  if (error) return (
    <div className="quiz-detail-error">
      <p>⚠️ {error}</p>
      <button className="btn-secondary" onClick={onBack}>← Back</button>
    </div>
  );

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const totalQ = questions.length;
  const progress = totalQ > 0 ? ((currentQ + 1) / totalQ) * 100 : 0;
  const answeredCount = answers.filter(a => a !== null).length;

  // Results view
  if (submitted && result) {
    return (
      <div className="quiz-results fade-in">
        <button className="quiz-back-btn" onClick={onBack}>← Back to Quizzes</button>

        <div className={`quiz-result-card ${result.passed ? 'passed' : 'failed'}`}>
          <div className="quiz-result-icon">{result.passed ? '🏆' : '📚'}</div>
          <h2 className="quiz-result-title">
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="quiz-result-sub">
            {result.passed
              ? `You passed with ${result.percentage}% — well done!`
              : `You scored ${result.percentage}% — passing requires ${result.passingPercentage}%.`}
          </p>
          <div className="quiz-result-stats">
            <div className="result-stat">
              <span className="result-stat-num">{result.score}</span>
              <span className="result-stat-label">Correct</span>
            </div>
            <div className="result-stat">
              <span className="result-stat-num">{result.totalQuestions - result.score}</span>
              <span className="result-stat-label">Wrong</span>
            </div>
            <div className="result-stat">
              <span className="result-stat-num">{result.percentage}%</span>
              <span className="result-stat-label">Score</span>
            </div>
          </div>
          <div className="progress-bar-wrap" style={{ width: '100%', maxWidth: 300, margin: '0 auto 20px' }}>
            <div
              className={`progress-bar-fill ${result.passed ? 'progress-green' : 'progress-blue'}`}
              style={{ width: `${result.percentage}%` }}
            />
          </div>
        </div>

        {/* Per-question review */}
        <h3 className="quiz-review-title">Question Review</h3>
        <div className="quiz-review-list">
          {result.results?.map((r, i) => (
            <div key={i} className={`quiz-review-item ${r.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="review-q-header">
                <span className="review-q-num">Q{i + 1}</span>
                <span className={`review-q-status ${r.isCorrect ? 'correct' : 'wrong'}`}>
                  {r.isCorrect ? '✓ Correct' : '✗ Wrong'}
                </span>
              </div>
              <p className="review-q-text">{r.questionText}</p>
              <div className="review-q-answers">
                <p className="review-answer">
                  <span className="review-answer-label">Your answer:</span>{' '}
                  {questions[i]?.options?.[r.userSelected] ?? (r.userSelected !== null ? `Option ${r.userSelected}` : 'Not answered')}
                </p>
                {!r.isCorrect && (
                  <p className="review-answer correct-answer">
                    <span className="review-answer-label">Correct:</span>{' '}
                    {questions[i]?.options?.[r.correctAnswer] ?? `Option ${r.correctAnswer}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-review-actions">
          <button className="btn-primary" onClick={onBack}>Back to Quizzes</button>
          <button className="btn-secondary" onClick={() => {
            setSubmitted(false);
            setResult(null);
            setCurrentQ(0);
            setAnswers(new Array(totalQ).fill(null));
          }}>
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz-taking view
  const question = questions[currentQ];

  return (
    <div className="quiz-detail fade-in">
      {/* Header */}
      <div className="quiz-detail-header">
        <button className="quiz-back-btn" onClick={onBack}>← Back</button>
        <div className="quiz-detail-info">
          <h1 className="quiz-detail-title">{quiz.title}</h1>
          <p className="quiz-detail-desc">{quiz.description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="quiz-progress-area">
        <div className="quiz-progress-text">
          <span className="quiz-q-counter">Question {currentQ + 1} of {totalQ}</span>
          <span className="quiz-answered-count">{answeredCount}/{totalQ} answered</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill progress-green" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question dot navigator */}
      <div className="quiz-dots">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`quiz-dot ${i === currentQ ? 'current' : ''} ${answers[i] !== null ? 'answered' : ''}`}
            onClick={() => setCurrentQ(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="quiz-question-card">
        <div className="quiz-q-number">Question {currentQ + 1}</div>
        <h2 className="quiz-q-text">{question?.questionText}</h2>
        <div className="quiz-options">
          {question?.options?.map((option, i) => (
            <button
              key={i}
              className={`quiz-option ${answers[currentQ] === i ? 'selected' : ''}`}
              onClick={() => handleSelectOption(i)}
            >
              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="quiz-option-text">{option}</span>
              {answers[currentQ] === i && <span className="quiz-option-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        <button
          className="btn-secondary"
          onClick={handlePrev}
          disabled={currentQ === 0}
        >
          ← Previous
        </button>

        {currentQ < totalQ - 1 ? (
          <button className="btn-primary" onClick={handleNext}>
            Next →
          </button>
        ) : (
          <button
            className="btn-primary quiz-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || answeredCount < totalQ}
          >
            {submitting ? <span className="spinner" /> : '🏆 Submit Quiz'}
          </button>
        )}
      </div>

      {answeredCount < totalQ && currentQ === totalQ - 1 && (
        <p className="quiz-warning">Please answer all {totalQ} questions before submitting.</p>
      )}
    </div>
  );
}
