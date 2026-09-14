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

// @desc    Get detailed evaluation submission data for review view
// @route   GET /api/submissions/review-details
// @access  Public / Private
const getReviewDetails = async (req, res) => {
    try {
        const reviewDetails = {
            id: "sub-john-14",
            student: {
                name: "John Doe",
                grade: "Grade 11",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                school: "Oakwood High School",
                club: "Advanced Rhetoric & Debate Club",
                attempt: "Attempt 1 of 2",
                submittedAt: "Oct 26, 2:45 PM"
            },
            quest: {
                number: "Quest #14",
                badge: "Capstone Project Core",
                title: "60-Second Impromptu Persuasion Pitch",
                timeCap: "60s Time Cap",
                prompt: "Persuade the School Board to reallocate underutilized athletic storage toward an open STEM innovation lab."
            },
            audio: {
                fileName: "impromptu_Pitch_JohnDoe_Final.wav",
                quality: "Recorded via In-App High Definition Audio",
                duration: "0:58",
                currentTime: "0:32",
                audioUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                telemetry: {
                    speed: "Normal Speed (1.0x)",
                    peak: "-1.2 dB",
                    clipping: "No Clipping Detected"
                }
            },
            scriptCues: {
                wordCount: 142,
                readingPace: "147 wpm",
                cues: [
                    {
                        time: "0:00",
                        label: "HOOK",
                        color: "mint",
                        text: "Distinguished members of the board: Every great breakthrough in our school's history didn't start in a textbook—it started when a student had the space to experiment."
                    },
                    {
                        time: "0:16",
                        label: "ETHOS & EVIDENCE",
                        color: "purple",
                        text: "Last year, without dedicated workspace, our robotics club had to build their winning rover on the cafeteria floor, constantly dodging lunch carts and packing away sensitive micro-controllers between bell rings."
                    },
                    {
                        time: "0:35",
                        label: "VALUE PROPOSITION",
                        color: "lavender",
                        text: "Right now, Locker Room C holds decommissioned wrestling mats from 2012. By converting those 400 square feet into an Open Prototyping Bay, we unlock federal STEM grants and double our regional contest capacity without adding a single dollar to the capital budget."
                    },
                    {
                        time: "0:50",
                        label: "CALL TO ACTION",
                        color: "mint",
                        text: "Give our innovators a launchpad, not a cafeteria table. Vote yes on Item 4B tonight. Thank you."
                    }
                ]
            },
            inlineAnnotations: [
                { label: "Vivid Sensory Imagery (Cafeteria floor)", color: "green" },
                { label: "Zero-Budget Fiscal Logic", color: "blue" },
                { label: "Direct Request Timing", color: "gray" }
            ],
            rubric: {
                version: "Rubric v3.2",
                scale: "Standard Oratorical Mastery Scale",
                criteria: [
                    {
                        id: "c1",
                        name: "Ethos & Hook Strength",
                        score: 5.0,
                        max: 5.0,
                        subtext: "Pivots immediately from general school lore into specific impact."
                    },
                    {
                        id: "c2",
                        name: "Cadence & Vocal Clarity",
                        score: 4.0,
                        max: 5.0,
                        subtext: "Clear pronunciation; needs slightly more breathing room before closing."
                    },
                    {
                        id: "c3",
                        name: "Logical Persuasion",
                        score: 5.0,
                        max: 5.0,
                        subtext: "Flawless cost-neutral proposal framing that anticipates objections."
                    }
                ],
                calculatedRating: 4.7,
                masteryBadge: "Mastery Distinction",
                feedback: "Exceptional emotional hook in the opening sentence, John. Grounding the budget plea in the tangible image of the cafeteria floor made the request immediately urgent to the board members. To elevate this further, ensure...",
                constructiveBalance: "92% Positive / 83% Form Improvement",
                characterCount: 342,
                honorsApproved: true,
                honorsUnits: "1.5 Oakwood Honors Extracurricular Units"
            }
        };

        res.status(200).json({
            success: true,
            reviewDetails
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch review details",
            error: error.message
        });
    }
};


module.exports = {
    createSubmission,
    getMentorSubmissions,
    getSubmissionById,
    updateSubmissionFeedback,
    getReviewDetails
};

