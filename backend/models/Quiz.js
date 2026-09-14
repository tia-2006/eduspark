const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    explanation: {
        type: String,
        default: ""
    }
});

const quizSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },
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
        passingPercentage: {
            type: Number,
            default: 60
        },
        questions: [questionSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
