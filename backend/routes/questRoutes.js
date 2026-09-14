const express = require("express");
const {
    getQuests,
    getQuestById
} = require("../controllers/questController");

const router = express.Router();

// GET all quests
router.get("/", getQuests);

// GET quest by Quest ID or Class ID
router.get("/:id", getQuestById);

module.exports = router;
