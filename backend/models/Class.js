const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        skill: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        mentor: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            default: "Beginner",
            trim: true
        },
        duration: {
            type: String,
            default: "",
            trim: true
        },
        sampleLessonUrl: {
            type: String,
            default: "",
            trim: true
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Class", classSchema);
