const express = require("express");
const {
    getClasses,
    getClassById,
    getModuleDetails,
    analyzeArgument
} = require("../controllers/classController");

const router = express.Router();

// GET module details for learning page
router.get("/module-details", getModuleDetails);

// POST analyze argument input
router.post("/analyze-argument", analyzeArgument);

// GET all classes
router.get("/", getClasses);

// GET single class by ID
router.get("/:id", getClassById);

module.exports = router;

