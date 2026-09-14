const express = require("express");
const { getSchoolDashboard } = require("../controllers/schoolController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/school/dashboard - Get school dashboard statistics (school_admin and admin)
router.get("/dashboard", protect, authorize("school_admin", "admin"), getSchoolDashboard);

module.exports = router;
