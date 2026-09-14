const mongoose = require("mongoose");

const mentorApplicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        skill: {
            type: String,
            required: true,
            trim: true
        },
        experience: {
            type: String,
            required: true,
            trim: true
        },
        bio: {
            type: String,
            required: true,
            trim: true
        },
        demoLessonUrl: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("MentorApplication", mentorApplicationSchema);
