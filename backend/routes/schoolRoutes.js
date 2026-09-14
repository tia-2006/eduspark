const express = require("express");
const {
    getSchoolDashboard,
    getSchoolStudents,
    batchEndorseStudents,
    promptStudent,
    scheduleScrimmage,
    exportSchoolTelemetry
} = require("../controllers/schoolController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Strict Access Control: Only school_admin and admin can access school dashboard endpoints
const requireSchoolAdmin = [protect, authorize("school_admin", "admin")];

router.get("/dashboard", requireSchoolAdmin, getSchoolDashboard);
router.get("/students", requireSchoolAdmin, getSchoolStudents);
router.post("/batch-endorse", requireSchoolAdmin, batchEndorseStudents);
router.post("/students/:id/prompt", requireSchoolAdmin, promptStudent);
router.post("/scrimmage", requireSchoolAdmin, scheduleScrimmage);
router.get("/export", requireSchoolAdmin, exportSchoolTelemetry);

module.exports = router;
