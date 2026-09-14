const User = require("../models/user");
const Class = require("../models/Class");
const Quiz = require("../models/Quiz");
const Submission = require("../models/Submission");

// @desc    Get School Dashboard Statistics
// @route   GET /api/school/dashboard
// @access  Private (school_admin or admin)
const getSchoolDashboard = async (req, res) => {
    try {
        const schoolName = req.user && req.user.school ? req.user.school : "";

        const studentFilter = { role: "student" };
        if (schoolName) {
            studentFilter.school = new RegExp(`^${schoolName}$`, "i");
        }

        const totalStudents = await User.countDocuments(studentFilter);
        const totalClasses = await Class.countDocuments();
        const publishedClasses = await Class.countDocuments({ isPublished: true });
        const totalQuizzes = await Quiz.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const reviewedSubmissions = await Submission.countDocuments({ status: "reviewed" });
        const pendingSubmissions = await Submission.countDocuments({ status: "pending" });

        res.status(200).json({
            success: true,
            school: schoolName || "All Schools",
            stats: {
                totalStudents,
                totalClasses,
                publishedClasses,
                totalQuizzes,
                totalSubmissions,
                reviewedSubmissions,
                pendingSubmissions
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch school dashboard statistics",
            error: error.message
        });
    }
};

module.exports = {
    getSchoolDashboard
};
