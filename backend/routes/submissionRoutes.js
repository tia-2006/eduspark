const express = require("express");
const {
    createSubmission,
    getMentorSubmissions,
    getSubmissionById,
    updateSubmissionFeedback,
    getReviewDetails
} = require("../controllers/submissionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET submission evaluation review details
router.get("/review-details", getReviewDetails);

// Create submission (Student - Student ID taken from JWT auth)
router.post("/", protect, createSubmission);

// Get submissions for mentor review
router.get("/mentor", protect, getMentorSubmissions);

// Get submission by ID
router.get("/:id", protect, getSubmissionById);

// Submit feedback and score for a submission (Mentor)
router.put("/:id/feedback", protect, updateSubmissionFeedback);

module.exports = router;

