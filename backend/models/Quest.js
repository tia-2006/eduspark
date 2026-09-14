const mongoose = require("mongoose");

const questSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        instructions: {
            type: String,
            default: "",
            trim: true
        },
        skill: {
            type: String,
            required: true,
            trim: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
        maxScore: {
            type: Number,
            default: 100
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quest", questSchema);
