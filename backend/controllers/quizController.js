const Quiz = require("../models/Quiz");
const Class = require("../models/Class");
const mongoose = require("mongoose");

// Initial sample quizzes linked to default classes
const seedInitialQuizzesIfEmpty = async () => {
    try {
        const quizCount = await Quiz.countDocuments();
        if (quizCount > 0) return;

        // Find classes to link quizzes
        const publicSpeakingClass = await Class.findOne({ skill: new RegExp("Public Speaking", "i") });
        const chessClass = await Class.findOne({ skill: new RegExp("Strategic Chess", "i") });

        const sampleQuizzes = [];

        if (publicSpeakingClass) {
            sampleQuizzes.push({
                classId: publicSpeakingClass._id,
                title: "Public Speaking & Communication Quiz",
                description: "Test your understanding of speech structure, non-verbal cues, and audience engagement.",
                passingPercentage: 60,
                questions: [
                    {
                        questionText: "What is the primary goal of an opening hook in a speech?",
                        options: [
                            "To state your full name and credentials",
                            "To capture the audience's attention immediately",
                            "To thank the organizers at length",
                            "To read out the agenda"
                        ],
                        correctAnswer: 1,
                        explanation: "An opening hook engages the audience right away."
                    },
                    {
                        questionText: "Which non-verbal cue builds trust with an audience?",
                        options: [
                            "Avoiding eye contact",
                            "Sustained, natural eye contact",
                            "Pacing quickly across the stage",
                            "Keeping hands in pockets"
                        ],
                        correctAnswer: 1,
                        explanation: "Eye contact creates connection and demonstrates confidence."
                    },
                    {
                        questionText: "What does the 'Rule of Three' recommend in presentation design?",
                        options: [
                            "Speaking for only 3 minutes",
                            "Grouping ideas or points in triads for memorability",
                            "Using 3 different presentation slides",
                            "Repeating every sentence 3 times"
                        ],
                        correctAnswer: 1,
                        explanation: "Information structured in threes is easier for audiences to process and remember."
                    }
                ]
            });
        }

        if (chessClass) {
            sampleQuizzes.push({
                classId: chessClass._id,
                title: "Strategic Chess Principles Quiz",
                description: "Evaluate your knowledge of opening rules, tactical forks, and endgame strategies.",
                passingPercentage: 60,
                questions: [
                    {
                        questionText: "What is a primary objective during the opening phase of chess?",
                        options: [
                            "Control the center, develop pieces, and castle for king safety",
                            "Checkmate the opponent in under 4 moves",
                            "Move your queen out early to attack",
                            "Push all edge pawns forward"
                        ],
                        correctAnswer: 0,
                        explanation: "Center control and piece development set up a strong mid-game."
                    },
                    {
                        questionText: "What is a 'fork' in chess tactic terminology?",
                        options: [
                            "Sacrificing a pawn for position",
                            "A single piece attacking two or more opponent pieces simultaneously",
                            "Trapping the opponent's king in the corner",
                            "Exchanging queens early"
                        ],
                        correctAnswer: 1,
                        explanation: "A fork forces the opponent to prioritize protecting one piece while losing another."
                    },
                    {
                        questionText: "Which piece is famous for creating unpredictable forks due to L-shaped jumps?",
                        options: [
                            "Bishop",
                            "Rook",
                            "Knight",
                            "Queen"
                        ],
                        correctAnswer: 2,
                        explanation: "Knights can jump over pieces to fork high-value targets."
                    }
                ]
            });
        }

        if (sampleQuizzes.length > 0) {
            await Quiz.insertMany(sampleQuizzes);
        }
    } catch (error) {
        console.error("Error seeding initial quizzes:", error.message);
    }
};

// Helper to find a quiz by quiz ID or class ID
const findQuizByIdOrClassId = async (identifier) => {
    if (!mongoose.Types.ObjectId.isValid(identifier)) {
        return null;
    }
    let quiz = await Quiz.findById(identifier);
    if (!quiz) {
        quiz = await Quiz.findOne({ classId: identifier });
    }
    return quiz;
};

// @desc    Get quiz by Quiz ID or Class ID (EXCLUDES correct answers)
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
    try {
        await seedInitialQuizzesIfEmpty();

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Quiz or Class ID format"
            });
        }

        let quiz = await Quiz.findById(id).select("-questions.correctAnswer");
        if (!quiz) {
            quiz = await Quiz.findOne({ classId: id }).select("-questions.correctAnswer");
        }

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        res.status(200).json({
            success: true,
            quiz
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quiz",
            error: error.message
        });
    }
};

// @desc    Submit quiz answers and return score & results
// @route   POST /api/quizzes/:id/submit
// @access  Public
const submitQuiz = async (req, res) => {
    try {
        await seedInitialQuizzesIfEmpty();

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Quiz or Class ID format"
            });
        }

        const quiz = await findQuizByIdOrClassId(id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const submittedAnswers = req.body.answers || req.body;

        let score = 0;
        const totalQuestions = quiz.questions.length;
        const results = [];

        quiz.questions.forEach((question, index) => {
            let userSelected = null;

            if (Array.isArray(submittedAnswers)) {
                const item = submittedAnswers[index];
                if (item !== undefined && item !== null) {
                    if (typeof item === "object") {
                        userSelected = item.answer !== undefined ? item.answer : (item.selectedOption !== undefined ? item.selectedOption : item.selectedAnswer);
                    } else {
                        userSelected = item;
                    }
                }
            } else if (typeof submittedAnswers === "object" && submittedAnswers !== null) {
                const qId = question._id.toString();
                if (submittedAnswers[qId] !== undefined) {
                    userSelected = submittedAnswers[qId];
                } else if (submittedAnswers[index] !== undefined) {
                    userSelected = submittedAnswers[index];
                } else if (submittedAnswers[index.toString()] !== undefined) {
                    userSelected = submittedAnswers[index.toString()];
                }
            }

            let isCorrect = false;
            const correct = question.correctAnswer;

            if (userSelected !== null && userSelected !== undefined) {
                if (Number(userSelected) === Number(correct)) {
                    isCorrect = true;
                } else if (String(userSelected).trim().toLowerCase() === String(correct).trim().toLowerCase()) {
                    isCorrect = true;
                } else if (typeof userSelected === "string" && question.options[correct]) {
                    if (userSelected.trim().toLowerCase() === question.options[correct].trim().toLowerCase()) {
                        isCorrect = true;
                    }
                }
            }

            if (isCorrect) {
                score++;
            }

            results.push({
                questionId: question._id,
                questionText: question.questionText,
                isCorrect,
                userSelected,
                correctAnswer: correct
            });
        });

        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        const passingPercentage = quiz.passingPercentage || 60;
        const passed = percentage >= passingPercentage;
        const status = passed ? "pass" : "fail";

        res.status(200).json({
            success: true,
            message: "Quiz submitted successfully",
            quizId: quiz._id,
            score,
            totalQuestions,
            percentage,
            passingPercentage,
            passed,
            status,
            results
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to process quiz submission",
            error: error.message
        });
    }
};

module.exports = {
    getQuizById,
    submitQuiz
};
