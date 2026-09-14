const express = require("express");
const {
    applyForMentor,
    getMentorApplications,
    approveMentorApplication,
    rejectMentorApplication
} = require("../controllers/mentorController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply to become a mentor (Authenticated User)
router.post("/apply", protect, applyForMentor);

// Get all mentor applications (Admin only)
router.get("/applications", protect, authorize("admin"), getMentorApplications);

// Approve a mentor application (Admin only)
router.put("/:id/approve", protect, authorize("admin"), approveMentorApplication);

// Reject a mentor application (Admin only)
router.put("/:id/reject", protect, authorize("admin"), rejectMentorApplication);

module.exports = router;
