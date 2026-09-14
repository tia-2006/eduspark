import React, { useEffect, useState } from 'react';
import { apiGetClasses, apiGetQuests } from '../../api/api';
import QuizDetailPage from './QuizDetailPage';
import QuestDetailPage from './QuestDetailPage';
import './QuizzesPage.css';

export default function QuizzesPage({ user, initialClassId }) {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [classes, setClasses] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clsRes, questRes] = await Promise.all([
          apiGetClasses(),
          apiGetQuests(),
        ]);
        setClasses(clsRes.classes || []);
        setQuests(questRes.quests || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // If a quiz is active, show quiz detail view
  if (selectedClassId) {
    return (
      <QuizDetailPage
        classId={selectedClassId}
        user={user}
        onBack={() => setSelectedClassId(null)}
      />
    );
  }

  // If a quest is selected, show quest detail view
  if (selectedQuestId) {
    return (
      <QuestDetailPage
        questId={selectedQuestId}
        user={user}
        onBack={() => setSelectedQuestId(null)}
      />
    );
  }

  return (
    <div className="quizzes-page fade-in">
      <div className="quizzes-header">
        <div>
          <h1 className="quizzes-title">Quizzes & Quests</h1>
          <p className="quizzes-sub">Test your knowledge and complete skill challenges</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="quizzes-tabs">
        <button
          className={`quiz-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          📝 Quizzes
          {classes.length > 0 && <span className="tab-count">{classes.length}</span>}
        </button>
        <button
          className={`quiz-tab ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => setActiveTab('quests')}
        >
          🗡️ Quests
          {quests.length > 0 && <span className="tab-count">{quests.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="quiz-loading">
          <div className="spinner spinner-green" />
          <p>Loading content...</p>
        </div>
      ) : activeTab === 'quizzes' ? (
        <div className="quiz-list">
          {classes.length === 0 ? (
            <div className="quiz-empty">No quizzes available yet.</div>
          ) : (
            classes.map(cls => (
              <div key={cls._id} className="quiz-item-card">
                <div className="quiz-item-left">
                  <div className="quiz-item-icon">
                    {cls.category?.toLowerCase() === 'communication' ? '🎤' : '♟️'}
                  </div>
                  <div className="quiz-item-info">
                    <div className="quiz-item-tags">
                      <span className={`tag tag-${cls.category?.toLowerCase() || 'gray'}`}>{cls.category}</span>
                    </div>
                    <h3 className="quiz-item-title">{cls.title} Quiz</h3>
                    <p className="quiz-item-desc">{cls.description?.slice(0, 100)}...</p>
                    <div className="quiz-item-meta">
                      <span>👤 {cls.mentor}</span>
                      <span>⏱️ {cls.duration}</span>
                      <span>📊 5 Questions</span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setSelectedClassId(cls._id)}
                >
                  Take Quiz →
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="quest-list">
          {quests.length === 0 ? (
            <div className="quiz-empty">No quests available yet.</div>
          ) : (
            quests.map(quest => (
              <div key={quest._id} className="quest-item-card">
                <div className="quest-item-left">
                  <div className="quest-item-icon">🗡️</div>
                  <div className="quest-item-info">
                    <div className="quest-item-tags">
                      <span className="tag tag-gray">{quest.skill}</span>
                      {quest.classId?.category && (
                        <span className={`tag tag-${quest.classId.category?.toLowerCase() || 'gray'}`}>
                          {quest.classId.category}
                        </span>
                      )}
                    </div>
                    <h3 className="quest-item-title">{quest.title}</h3>
                    <p className="quest-item-desc">{quest.description}</p>
                    <div className="quest-item-meta">
                      <span>🏆 Max Score: {quest.maxScore}</span>
                      {quest.classId?.mentor && <span>👤 {quest.classId.mentor}</span>}
                    </div>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setSelectedQuestId(quest._id)}
                >
                  Start Quest →
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
