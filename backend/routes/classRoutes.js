const express = require("express");
const {
    getClasses,
    getClassById
} = require("../controllers/classController");

const router = express.Router();

// GET all classes
router.get("/", getClasses);

// GET single class by ID
router.get("/:id", getClassById);

module.exports = router;
