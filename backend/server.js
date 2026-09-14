const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const classRoutes = require("./routes/classRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questRoutes = require("./routes/questRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const schoolRoutes = require("./routes/schoolRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Classes routes
app.use("/api/classes", classRoutes);

// Quizzes routes
app.use("/api/quizzes", quizRoutes);

// Quests routes
app.use("/api/quests", questRoutes);

// Submissions routes
app.use("/api/submissions", submissionRoutes);

// Mentor Applications routes
app.use("/api/mentors", mentorRoutes);

// School Dashboard routes
app.use("/api/school", schoolRoutes);

app.get("/", (req, res) => {
    res.send("EduSpark Backend is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});