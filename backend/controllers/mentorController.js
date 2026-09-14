const MentorApplication = require("../models/MentorApplication");
const User = require("../models/user");
const mongoose = require("mongoose");

// Helper to seed initial sample mentor application if none exist
const seedInitialMentorApplicationsIfEmpty = async () => {
    try {
        const count = await MentorApplication.countDocuments();
        if (count > 0) return;

        const applicantUser = await User.findOne({ role: "student" });
        if (applicantUser) {
            await MentorApplication.create({
                user: applicantUser._id,
                skill: "Public Speaking & Debating",
                experience: "3+ years coaching high school speech & debate teams",
                bio: "Passionate educator specializing in public speaking, body language, and confidence building.",
                demoLessonUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                status: "pending"
            });
        }
    } catch (err) {
        console.error("Error seeding initial mentor application:", err.message);
    }
};

// @desc    Apply to become a mentor
// @route   POST /api/mentors/apply
// @access  Private (Authenticated User)
const applyForMentor = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.body.user;
        const { skill, experience, bio, demoLessonUrl } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required to apply"
            });
        }

        if (!skill || !experience || !bio) {
            return res.status(400).json({
                message: "Skill, experience, and bio are required"
            });
        }

        // Prevent duplicate pending applications
        const existingPendingApp = await MentorApplication.findOne({
            user: userId,
            status: "pending"
        });

        if (existingPendingApp) {
            return res.status(400).json({
                message: "You already have a pending mentor application"
            });
        }

        const application = await MentorApplication.create({
            user: userId,
            skill: skill.trim(),
            experience: experience.trim(),
            bio: bio.trim(),
            demoLessonUrl: demoLessonUrl ? demoLessonUrl.trim() : "",
            status: "pending"
        });

        // Also update user model fields
        await User.findByIdAndUpdate(userId, {
            skill: skill.trim(),
            experience: experience.trim(),
            bio: bio.trim(),
            demoLessonUrl: demoLessonUrl ? demoLessonUrl.trim() : ""
        });

        const populatedApp = await MentorApplication.findById(application._id)
            .populate("user", "name email role school isVerified");

        res.status(201).json({
            success: true,
            message: "Mentor application submitted successfully",
            application: populatedApp
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to submit mentor application",
            error: error.message
        });
    }
};

// @desc    Get all mentor applications (Admin only)
// @route   GET /api/mentors/applications
// @access  Private (Admin only)
const getMentorApplications = async (req, res) => {
    try {
        await seedInitialMentorApplicationsIfEmpty();

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const applications = await MentorApplication.find(filter)
            .populate("user", "name email role school isVerified skill experience bio demoLessonUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch mentor applications",
            error: error.message
        });
    }
};

// @desc    Approve mentor application (Admin only)
// @route   PUT /api/mentors/:id/approve
// @access  Private (Admin only)
const approveMentorApplication = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Application or User ID format"
            });
        }

        let application = await MentorApplication.findById(id);
        if (!application) {
            application = await MentorApplication.findOne({ user: id, status: "pending" });
        }

        if (!application) {
            return res.status(404).json({
                message: "Mentor application not found"
            });
        }

        application.status = "approved";
        await application.save();

        // Update user's role to "mentor" and set isVerified to true
        const updatedUser = await User.findByIdAndUpdate(
            application.user,
            {
                role: "mentor",
                isVerified: true,
                skill: application.skill,
                experience: application.experience,
                bio: application.bio,
                demoLessonUrl: application.demoLessonUrl
            },
            { new: true }
        ).select("-password");

        const populatedApp = await MentorApplication.findById(application._id)
            .populate("user", "name email role school isVerified");

        res.status(200).json({
            success: true,
            message: "Mentor application approved successfully. User role updated to mentor.",
            application: populatedApp,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to approve mentor application",
            error: error.message
        });
    }
};

// @desc    Reject mentor application (Admin only)
// @route   PUT /api/mentors/:id/reject
// @access  Private (Admin only)
const rejectMentorApplication = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Application or User ID format"
            });
        }

        let application = await MentorApplication.findById(id);
        if (!application) {
            application = await MentorApplication.findOne({ user: id, status: "pending" });
        }

        if (!application) {
            return res.status(404).json({
                message: "Mentor application not found"
            });
        }

        application.status = "rejected";
        await application.save();

        const populatedApp = await MentorApplication.findById(application._id)
            .populate("user", "name email role school isVerified");

        res.status(200).json({
            success: true,
            message: "Mentor application rejected",
            application: populatedApp
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reject mentor application",
            error: error.message
        });
    }
};

module.exports = {
    applyForMentor,
    getMentorApplications,
    approveMentorApplication,
    rejectMentorApplication
};
