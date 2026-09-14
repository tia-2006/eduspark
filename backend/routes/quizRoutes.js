const express = require("express");
const {
    getQuizById,
    submitQuiz
} = require("../controllers/quizController");

const router = express.Router();

// GET quiz by ID (or class ID) without exposing correct answers
router.get("/:id", getQuizById);

// POST submit quiz answers and receive score/results
router.post("/:id/submit", submitQuiz);

module.exports = router;
