const Quest = require("../models/Quest");
const Class = require("../models/Class");
const mongoose = require("mongoose");

// Helper to seed initial sample Quests for Public Speaking & Strategic Chess
const seedInitialQuestsIfEmpty = async () => {
    try {
        const questCount = await Quest.countDocuments();
        if (questCount > 0) return;

        const publicSpeakingClass = await Class.findOne({ skill: new RegExp("Public Speaking", "i") });
        const chessClass = await Class.findOne({ skill: new RegExp("Strategic Chess", "i") });

        const sampleQuests = [];

        if (publicSpeakingClass) {
            sampleQuests.push({
                title: "3-Minute Pitch Challenge",
                description: "Deliver a compelling 3-minute elevator pitch demonstrating voice modulation, clarity, and confidence.",
                instructions: "1. Record a 3-minute video presentation.\n2. Include an attention-grabbing opening hook and concise conclusion.\n3. Submit your video or drive link for mentor review.",
                skill: "Public Speaking",
                classId: publicSpeakingClass._id,
                maxScore: 100,
                isActive: true
            });
        }

        if (chessClass) {
            sampleQuests.push({
                title: "Tactical Endgame Challenge",
                description: "Solve a complex tactical endgame position and annotate the winning sequence of moves.",
                instructions: "1. Analyze the given chessboard position.\n2. Write down the 5-move tactical sequence leading to checkmate.\n3. Explain key defensive threats by the opponent.",
                skill: "Strategic Chess",
                classId: chessClass._id,
                maxScore: 100,
                isActive: true
            });
        }

        if (sampleQuests.length > 0) {
            await Quest.insertMany(sampleQuests);
        }
    } catch (error) {
        console.error("Error seeding initial quests:", error.message);
    }
};

// @desc    Get all quests
// @route   GET /api/quests
// @access  Public
const getQuests = async (req, res) => {
    try {
        await seedInitialQuestsIfEmpty();

        const filter = { isActive: true };
        if (req.query.skill) {
            filter.skill = new RegExp(`^${req.query.skill}$`, "i");
        }

        const quests = await Quest.find(filter).populate("classId", "title skill category mentor");

        res.status(200).json({
            success: true,
            count: quests.length,
            quests
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quests",
            error: error.message
        });
    }
};

// @desc    Get quest by Quest ID or Class ID
// @route   GET /api/quests/:id
// @access  Public
const getQuestById = async (req, res) => {
    try {
        await seedInitialQuestsIfEmpty();

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Quest or Class ID format"
            });
        }

        let quest = await Quest.findById(id).populate("classId", "title skill category mentor");
        if (!quest) {
            quest = await Quest.findOne({ classId: id }).populate("classId", "title skill category mentor");
        }

        if (!quest) {
            return res.status(404).json({
                message: "Quest not found"
            });
        }

        res.status(200).json({
            success: true,
            quest
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch quest details",
            error: error.message
        });
    }
};

module.exports = {
    getQuests,
    getQuestById
};
