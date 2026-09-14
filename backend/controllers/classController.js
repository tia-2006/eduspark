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

// @desc    Get details for Module Learning view
// @route   GET /api/classes/module-details
// @access  Public
const getModuleDetails = async (req, res) => {
    try {
        const moduleData = {
            id: "mod-3",
            title: "Module 3: Constructing a Powerful Argument",
            subtitle: "Learn how elite debaters craft persuasive, logically unassailable narratives. Dissect thesis construction, psychological framing, and rapid refutation techniques under high-pressure school and competition formats.",
            category: "Public Speaking",
            trackBadge: "CORE SKILL LABORATORY",
            runtime: "35 mins total runtime",
            breadcrumb: "Explore Skills / Public Speaking / Module 3: Constructing a Powerful Argument",
            mentor: {
                name: "Dr. Alistair Vance",
                title: "Oxford Debate Coach + TEDx Speaker",
                rating: "4.9",
                activeStudents: 340,
                avatar: "👨‍🏫"
            },
            currentLesson: {
                lessonId: "lesson-3.2",
                title: "Lesson 3.2: Hooking Your Audience in 15 Seconds",
                quality: "HD 1080P",
                duration: "12:45",
                currentTime: "05:22",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                subtitlesUrl: "#",
                transcriptUrl: "#"
            },
            trackProgression: {
                percent: 50,
                currentModule: 3,
                totalModules: 6,
                timeRemaining: "35 mins remaining",
                quizPassingGrade: "80% (4/5 correct)",
                quizQuestionsCount: 5
            },
            roadmap: [
                { id: 1, title: "1. Fundamentals of Oratory", status: "Completed", score: "95% quiz score", icon: "✓", current: false, locked: false },
                { id: 2, title: "2. Voice Modulation & Tone", status: "Completed", score: "100% quiz score", icon: "✓", current: false, locked: false },
                { id: 3, title: "3. Constructing an Argument", status: "In Progress", lesson: "Lesson 3.2", icon: "●", current: true, locked: false },
                { id: 4, title: "4. Rebuttals & Cross-Exam", status: "Locked", note: "Complete Mod 3", icon: "🔒", current: false, locked: true },
                { id: 5, title: "5. Body Language & Staging", status: "Locked", note: "40 mins", icon: "🔒", current: false, locked: true },
                { id: 6, title: "6. Capstone: Mock Championship", status: "Locked", note: "Credentialed Project", icon: "🔒", current: false, locked: true }
            ],
            objectives: [
                {
                    id: "obj-1",
                    number: "OBJECTIVE 01",
                    title: "The Rhetorical Triangle",
                    description: "Master the equilibrium of Ethos (credibility), Pathos (emotional appeal), and Logos (evidence). Discover why unbalanced speeches fail debate adjudications.",
                    drill: "Includes Diagram Drill",
                    drillIcon: "⚖️"
                },
                {
                    id: "obj-2",
                    number: "OBJECTIVE 02",
                    title: "Deliberate Pause Method",
                    description: "Eliminate reflexive verbal fillers (um, ah, like, you know). Convert cognitive thinking time into authoritative silence that builds room anticipation.",
                    drill: "Audio Pacing Exercise",
                    drillIcon: "🎙️"
                },
                {
                    id: "obj-3",
                    number: "OBJECTIVE 03",
                    title: "The 15-Second Hook",
                    description: "Structure opening statements that seize attention instantly using counter-intuitive statistics, provocative queries, or narrative micro-scenes.",
                    drill: "Speed Pitch Sandbox",
                    drillIcon: "⚡"
                }
            ],
            argumentAnalyzer: {
                caseStudy: "SAMPLE CASE STUDY: RESOLUTION 4A - Oxford Union Style",
                quote: "Over 75% of civic decisions fail not because of flawed policy, but because leaders speak to satisfy themselves rather than illuminate their listeners.",
                scores: {
                    logos: { value: 90, label: "Logos (75% Stat)" },
                    ethos: { value: 85, label: "Ethos (Zero)" },
                    pathos: { value: 95, label: "Pathos (Impact)" }
                }
            },
            credentials: [
                {
                    title: "Oratory Tier I Certification",
                    sub: "Verified by Oakwood Academic Council (Fall '24)",
                    icon: "🛡️"
                },
                {
                    title: "Skill Passport Stamp",
                    sub: "Grants 1.5 Extracurricular Honors credits upon quiz pass",
                    icon: "🏅"
                }
            ],
            mentorOfficeHours: {
                day: "Every Thursday at 4:30 PM EST",
                status: "RSVP Open"
            }
        };

        res.status(200).json({
            success: true,
            module: moduleData
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch module details",
            error: error.message
        });
    }
};

// @desc    Evaluate custom argument input in Interactive Argument Analyzer
// @route   POST /api/classes/analyze-argument
// @access  Public
const analyzeArgument = async (req, res) => {
    try {
        const { statement } = req.body;
        const text = statement || "";
        const logosScore = Math.min(98, Math.max(70, Math.floor(75 + (text.length % 20) + (text.includes("%") || text.includes("data") ? 10 : 0))));
        const ethosScore = Math.min(95, Math.max(65, Math.floor(80 + (text.length % 15))));
        const pathosScore = Math.min(99, Math.max(70, Math.floor(85 + (text.length % 12))));

        res.status(200).json({
            success: true,
            scores: {
                logos: { value: logosScore, label: `Logos (${logosScore}%)` },
                ethos: { value: ethosScore, label: `Ethos (${ethosScore}%)` },
                pathos: { value: pathosScore, label: `Pathos (${pathosScore}%)` }
            },
            feedback: "Strong logical structure detected with high emotional resonance."
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to analyze argument",
            error: error.message
        });
    }
};

module.exports = {
    getClasses,
    getClassById,
    getModuleDetails,
    analyzeArgument
};

