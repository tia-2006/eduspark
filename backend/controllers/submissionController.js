const Submission = require("../models/Submission");
const Quest = require("../models/Quest");
const User = require("../models/user");
const mongoose = require("mongoose");

// Helper to seed initial sample submission if empty
const seedInitialSubmissionsIfEmpty = async () => {
    try {
        const count = await Submission.countDocuments();
        if (count > 0) return;

        const student = await User.findOne({ role: "student" }) || await User.findOne();
        const quest = await Quest.findOne();

        if (student && quest) {
            await Submission.create({
                student: student._id,
                quest: quest._id,
                content: "Here is my recorded 3-minute pitch video submission: https://example.com/submission-video",
                status: "pending",
                submittedAt: Date.now()
            });
        }
    } catch (err) {
        console.error("Error seeding initial submission:", err.message);
    }
};

// @desc    Create a new quest submission
// @route   POST /api/submissions
// @access  Private (Student)
const createSubmission = async (req, res) => {
    try {
        const studentId = req.user ? req.user._id : req.body.student;
        const questId = req.body.questId || req.body.quest;
        const content = req.body.content || req.body.answer;

        if (!studentId) {
            return res.status(401).json({
                message: "Authentication required to submit"
            });
        }

        if (!questId || !mongoose.Types.ObjectId.isValid(questId)) {
            return res.status(400).json({
                message: "A valid quest ID is required"
            });
        }

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                message: "Submission content/answer is required"
            });
        }

        // Verify quest exists
        const quest = await Quest.findById(questId);
        if (!quest) {
            return res.status(404).json({
                message: "Target quest not found"
            });
        }

        const submission = await Submission.create({
            student: studentId,
            quest: questId,
            content: content.trim(),
            status: "pending",
            submittedAt: Date.now()
        });

        const populatedSubmission = await Submission.findById(submission._id)
            .populate("student", "name email role school")
            .populate("quest", "title skill maxScore");

        res.status(201).json({
            success: true,
            message: "Submission created successfully",
            submission: populatedSubmission
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create submission",
            error: error.message
        });
    }
};

// @desc    Get submissions for mentor review
// @route   GET /api/submissions/mentor
// @access  Private (Mentor / Admin)
const getMentorSubmissions = async (req, res) => {
    try {
        await seedInitialSubmissionsIfEmpty();

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const submissions = await Submission.find(filter)
            .populate("student", "name email role school")
            .populate("quest", "title skill maxScore classId")
            .populate("mentor", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch mentor submissions",
            error: error.message
        });
    }
};

// @desc    Get single submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
    try {
        await seedInitialSubmissionsIfEmpty();

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Submission ID format"
            });
        }

        const submission = await Submission.findById(id)
            .populate("student", "name email role school")
            .populate("quest", "title skill maxScore classId instructions")
            .populate("mentor", "name email");

        if (!submission) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        res.status(200).json({
            success: true,
            submission
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch submission details",
            error: error.message
        });
    }
};

// @desc    Mentor provides feedback and score for a submission
// @route   PUT /api/submissions/:id/feedback
// @access  Private (Mentor / Admin)
const updateSubmissionFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, mentorFeedback, feedback } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Submission ID format"
            });
        }

        const feedbackText = mentorFeedback !== undefined ? mentorFeedback : feedback;

        if (score === undefined || score === null || isNaN(Number(score))) {
            return res.status(400).json({
                message: "A valid numerical score is required"
            });
        }

        if (feedbackText === undefined || feedbackText === null) {
            return res.status(400).json({
                message: "Mentor feedback text is required"
            });
        }

        const submission = await Submission.findById(id);

        if (!submission) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        submission.score = Number(score);
        submission.mentorFeedback = String(feedbackText).trim();
        submission.mentor = req.user ? req.user._id : submission.mentor;
        submission.status = "reviewed";
        submission.reviewedAt = Date.now();

        await submission.save();

        const updatedSubmission = await Submission.findById(id)
            .populate("student", "name email role school")
            .populate("quest", "title skill maxScore")
            .populate("mentor", "name email");

        res.status(200).json({
            success: true,
            message: "Submission feedback updated successfully",
            submission: updatedSubmission
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update submission feedback",
            error: error.message
        });
    }
};

module.exports = {
    createSubmission,
    getMentorSubmissions,
    getSubmissionById,
    updateSubmissionFeedback
};
