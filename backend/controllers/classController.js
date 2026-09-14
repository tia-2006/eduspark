const Class = require("../models/Class");

// Initial sample classes for Public Speaking and Strategic Chess
const initialClasses = [
    {
        title: "Mastering Public Speaking & Presentation Skills",
        skill: "Public Speaking",
        category: "Communication",
        description: "Learn to articulate your ideas with confidence, master voice modulation, body language, and stage presence.",
        mentor: "Sarah Jenkins",
        level: "Beginner",
        duration: "4 Weeks",
        sampleLessonUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isPublished: true
    },
    {
        title: "Strategic Chess & Tactical Mastery",
        skill: "Strategic Chess",
        category: "Strategy",
        description: "Develop critical thinking, opening strategies, tactical vision, and endgame mastery with expert guidance.",
        mentor: "Alex Rivera",
        level: "Intermediate",
        duration: "6 Weeks",
        sampleLessonUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        isPublished: true
    }
];

// Helper to seed initial sample classes if collection is empty
const seedInitialClassesIfEmpty = async () => {
    try {
        const count = await Class.countDocuments();
        if (count === 0) {
            await Class.insertMany(initialClasses);
        }
    } catch (err) {
        console.error("Error seeding initial classes:", err.message);
    }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
const getClasses = async (req, res) => {
    try {
        await seedInitialClassesIfEmpty();

        const filter = {};
        if (req.query.category) {
            filter.category = new RegExp(`^${req.query.category}$`, "i");
        }
        if (req.query.skill) {
            filter.skill = new RegExp(`^${req.query.skill}$`, "i");
        }
        if (req.query.isPublished !== undefined) {
            filter.isPublished = req.query.isPublished === "true";
        } else {
            filter.isPublished = true;
        }

        const classes = await Class.find(filter);

        res.status(200).json({
            success: true,
            count: classes.length,
            classes
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch classes",
            error: error.message
        });
    }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Public
const getClassById = async (req, res) => {
    try {
        await seedInitialClassesIfEmpty();

        const { id } = req.params;
        const singleClass = await Class.findById(id);

        if (!singleClass) {
            return res.status(404).json({
                message: "Class not found"
            });
        }

        res.status(200).json({
            success: true,
            class: singleClass
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid Class ID format"
            });
        }
        res.status(500).json({
            message: "Failed to fetch class details",
            error: error.message
        });
    }
};

module.exports = {
    getClasses,
    getClassById
};
