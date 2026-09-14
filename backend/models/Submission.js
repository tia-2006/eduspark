const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quest",
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resubmitted"],
            default: "pending"
        },
        mentorFeedback: {
            type: String,
            default: "",
            trim: true
        },
        score: {
            type: Number,
            default: 0
        },
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Submission", submissionSchema);
