const User = require("../models/user");
const Class = require("../models/Class");
const Quiz = require("../models/Quiz");
const Submission = require("../models/Submission");

// In-memory state for sample student telemetry records
const INITIAL_STUDENTS = [
    {
        id: "OHS-8821",
        name: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
        grade: "Grade 11",
        numericGrade: 11,
        counselor: "Counselor: Miller",
        trackKey: "public-speaking",
        trackName: "Public Speaking",
        section: "Section: Advanced Oratorical Delivery",
        questsDone: 14,
        questsTotal: 16,
        weeklyLog: 4.8,
        logDelta: "+1.2 hrs vs target",
        status: "Thriving",
        badgeType: "mint",
        action: "View Passport",
        passportData: {
            masteryLevel: "Advanced Competency",
            verifiedHours: 46.5,
            endorsedBadges: ["Public Speaking Honors", "Oratory Logic V2"],
            counselorNotes: "Top candidate for state debate championship representing Oakwood High."
        }
    },
    {
        id: "OHS-7419",
        name: "Maya Lin",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
        grade: "Grade 10",
        numericGrade: 10,
        counselor: "Counselor: Davis",
        trackKey: "strategic-chess",
        trackName: "Strategic Chess",
        section: "Section: Sicilian Defense & Time Press",
        questsDone: 11,
        questsTotal: 16,
        weeklyLog: 3.5,
        logDelta: "Target met",
        status: "On Track",
        badgeType: "blue",
        action: "View Passport",
        passportData: {
            masteryLevel: "Intermediate Master",
            verifiedHours: 38.0,
            endorsedBadges: ["Chess Tactics Laureate"],
            counselorNotes: "Consistent attendance in tactical defense modules."
        }
    },
    {
        id: "OHS-9102",
        name: "Jordan Morales",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
        grade: "Grade 12",
        numericGrade: 12,
        counselor: "Counselor: Miller",
        trackKey: "public-speaking",
        trackName: "Public Speaking",
        section: "Section: Impromptu Rebuttal Clinic",
        questsDone: 4,
        questsTotal: 16,
        weeklyLog: 0.8,
        logDelta: "-2.2 hrs below min",
        status: "Needs Prompt",
        badgeType: "pink",
        action: "Prompt Student",
        passportData: {
            masteryLevel: "At-Risk Telemetry",
            verifiedHours: 12.0,
            endorsedBadges: [],
            counselorNotes: "Pace drop flagged by telemetry. Recommending 1-on-1 peer mentor assignment."
        }
    },
    {
        id: "OHS-6302",
        name: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
        grade: "Grade 9",
        numericGrade: 9,
        counselor: "Counselor: Thompson",
        trackKey: "strategic-chess",
        trackName: "Strategic Chess",
        section: "Section: Pawn Structures & King Safety",
        questsDone: 15,
        questsTotal: 16,
        weeklyLog: 5.2,
        logDelta: "+2.2 hrs vs target",
        status: "Thriving",
        badgeType: "mint",
        action: "View Passport",
        passportData: {
            masteryLevel: "High Performance",
            verifiedHours: 52.4,
            endorsedBadges: ["Chess Tactics Laureate", "Pawn Structure Specialist"],
            counselorNotes: "Exceeding weekly milestones consistently."
        }
    },
    {
        id: "OHS-8894",
        name: "Sofia Patel",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
        grade: "Grade 11",
        numericGrade: 11,
        counselor: "Counselor: Miller",
        trackKey: "strategic-chess",
        trackName: "Strategic Chess",
        section: "Section: Rook Endgames Precision",
        questsDone: 10,
        questsTotal: 16,
        weeklyLog: 3.0,
        logDelta: "Target met",
        status: "On Track",
        badgeType: "blue",
        action: "View Passport",
        passportData: {
            masteryLevel: "Proficient",
            verifiedHours: 33.1,
            endorsedBadges: ["Endgame Foundations"],
            counselorNotes: "On schedule for Spring Board Certification."
        }
    },
    {
        id: "OHS-7721",
        name: "Devontae Reed",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120",
        grade: "Grade 10",
        numericGrade: 10,
        counselor: "Counselor: Davis",
        trackKey: "public-speaking",
        trackName: "Public Speaking",
        section: "Section: Persuasive Argument Structure",
        questsDone: 5,
        questsTotal: 16,
        weeklyLog: 1.1,
        logDelta: "-1.9 hrs below target",
        status: "Needs Prompt",
        badgeType: "pink",
        action: "Prompt Student",
        passportData: {
            masteryLevel: "Intervention Advisory",
            verifiedHours: 16.2,
            endorsedBadges: [],
            counselorNotes: "Needs encouragement for upcoming debate scrimmage."
        }
    }
];

// Helper to generate full roster dataset (342 entries total)
const generateFullRoster = () => {
    const list = [...INITIAL_STUDENTS];
    const counselors = ["Counselor: Miller", "Counselor: Davis", "Counselor: Thompson", "Counselor: Rivera"];
    const tracks = [
        { key: "public-speaking", name: "Public Speaking", section: "Section: Persuasive Argument Structure" },
        { key: "strategic-chess", name: "Strategic Chess", section: "Section: Endgame Calculations" }
    ];
    const names = [
        "Avery Smith", "Ethan Wright", "Chloe Bennett", "Liam Foster", "Emma Watson", 
        "Noah Martinez", "Olivia Taylor", "Lucas Brooks", "Sophia King", "Mason Gray",
        "Isabella White", "Logan Harris", "Harper Martin", "James Jackson", "Amelia Nelson"
    ];

    for (let i = 7; i <= 342; i++) {
        const nameIndex = (i - 7) % names.length;
        const name = `${names[nameIndex]} (${i})`;
        const gradeNum = 9 + ((i % 4));
        const trackObj = tracks[i % 2];
        const statusChoice = (i % 5 === 0) ? "Needs Prompt" : (i % 3 === 0 ? "Thriving" : "On Track");
        const badgeType = statusChoice === "Needs Prompt" ? "pink" : (statusChoice === "Thriving" ? "mint" : "blue");
        const logHrs = statusChoice === "Needs Prompt" ? (0.5 + (i % 10) / 10) : (2.8 + (i % 30) / 10);
        
        list.push({
            id: `OHS-${1000 + i}`,
            name,
            avatar: `https://images.unsplash.com/photo-${1500000000000 + (i * 12345) % 1000000}?auto=format&fit=crop&q=80&w=120`,
            grade: `Grade ${gradeNum}`,
            numericGrade: gradeNum,
            counselor: counselors[i % counselors.length],
            trackKey: trackObj.key,
            trackName: trackObj.name,
            section: trackObj.section,
            questsDone: Math.min(16, Math.max(2, (i * 3) % 17)),
            questsTotal: 16,
            weeklyLog: parseFloat(logHrs.toFixed(1)),
            logDelta: statusChoice === "Needs Prompt" ? "-1.5 hrs below min" : "+0.8 hrs vs target",
            status: statusChoice,
            badgeType,
            action: statusChoice === "Needs Prompt" ? "Prompt Student" : "View Passport",
            passportData: {
                masteryLevel: statusChoice === "Thriving" ? "Exemplary" : "Active Learner",
                verifiedHours: parseFloat((logHrs * 8).toFixed(1)),
                endorsedBadges: statusChoice === "Thriving" ? ["Honor Roll Seal"] : [],
                counselorNotes: "Active participation in extracurricular telemetry."
            }
        });
    }
    return list;
};

let studentRosterCache = generateFullRoster();
let batchEndorsedCount = 142;
let scheduledScrimmages = [
    { id: 1, title: "Tri-County Debate Invitational", date: "April 18, 2026", location: "Gymnasium B" },
    { id: 2, title: "Oakwood Spring Swiss Blitz", date: "April 18, 2026", location: "Gymnasium B" }
];

// @desc    Get School Dashboard Telemetry & Metrics
// @route   GET /api/school/dashboard
// @access  Private
const getSchoolDashboard = async (req, res) => {
    try {
        const schoolName = req.user && req.user.school ? req.user.school : "Oakwood High School";

        const stats = {
            totalParticipating: 342,
            studentBodyPercentage: 64,
            momChange: "+18 MoM",
            extracurricularHours: 4820,
            avgHoursPerStudent: 14.1,
            auditedPercentage: 94,
            confidenceGrowth: "+38%",
            selfEfficacyText: "Pre vs. Post Self-Efficacy",
            rubricVersion: "Rubric V3",
            verifiedQuestsPassed: 1180,
            masteryStandard: ">80%",
            readyForCertification: batchEndorsedCount
        };

        const institutionalTracks = [
            {
                id: "public-speaking",
                name: "Public Speaking",
                dotColor: "#059669",
                progressMilestone: "Team 194 / 235 Target",
                progressPercent: Math.round((194 / 235) * 100),
                enrolled: 194,
                questsDone: 692,
                attendance: "91%",
                leadMentor: {
                    name: "Dr. Julian Vance",
                    role: "Lead Oratory Mentor",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
                    isVerified: true
                }
            },
            {
                id: "strategic-chess",
                name: "Strategic Chess",
                dotColor: "#4f46e5",
                progressMilestone: "Team 148 / 170 Target",
                progressPercent: Math.round((148 / 170) * 100),
                enrolled: 148,
                questsDone: 498,
                attendance: "88%",
                leadMentor: {
                    name: "WGM Elena Rostova",
                    role: "Lead Chess Master",
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
                    isVerified: true
                }
            }
        ];

        const accreditation = {
            qualifiedStudents: batchEndorsedCount,
            statusLabel: "Ready for Board Certification",
            eligibilityText: "71% of eligible 11th & 12th graders reached badge criteria",
            honorsList: [
                { name: "Public Speaking Honors", approvedCount: 86, icon: "✓" },
                { name: "Chess Tactics Laureate", approvedCount: 56, icon: "♛" }
            ]
        };

        const bottomIntegrations = {
            cleverBridge: {
                title: "Clever & PowerSchool Bridge",
                icon: "document-check",
                description: "Automatic sync every weekday at 04:00 EST. Extracurricular hours append directly to student cumulative records.",
                lastSynced: "28 mins ago",
                status: "Healthy"
            },
            springScrimmage: {
                title: "Spring Scrimmage Schedule",
                icon: "calendar",
                description: `Tri-County Debate Invitational and Oakwood Spring Swiss Blitz scheduled for April 18th in Gymnasium B. (${scheduledScrimmages.length} active events)`,
                actionText: "Manage Event logistics ->"
            },
            counselorGuide: {
                title: "Counselor Intervention Guide",
                icon: "info-circle",
                description: "Guidance counselors can trigger 1-on-1 peer mentor pairing directly from student risk monitoring roster.",
                assignedInquiriesCount: 12
            }
        };

        res.status(200).json({
            success: true,
            school: schoolName,
            suite: "Administration & Guidance Suite",
            title: "Extracurricular Engagement & Competency Center",
            subtitle: "Real-time student participation telemetry, mentor milestones, and state honor roll compliance.",
            term: "2024–2025 Spring Term",
            stats,
            institutionalTracks,
            cohortSynergyNote: "42 students are cross-enrolled in both Public Speaking and Chess, demonstrating 2.1x faster advancement through logic defense modules.",
            accreditation,
            bottomIntegrations,
            scrimmages: scheduledScrimmages
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch school dashboard statistics",
            error: error.message
        });
    }
};

// @desc    Get Filtered Student Risk Monitoring Roster
// @route   GET /api/school/students
// @access  Private
const getSchoolStudents = async (req, res) => {
    try {
        const { grade, program, search, page = 1, limit = 6 } = req.query;

        let filtered = [...studentRosterCache];

        if (grade && grade !== "All" && grade !== "All Grades") {
            filtered = filtered.filter(s => s.grade.toLowerCase() === grade.toLowerCase());
        }

        if (program && program !== "All" && program !== "All Programs") {
            const progLower = program.toLowerCase();
            filtered = filtered.filter(s => 
                s.trackName.toLowerCase().includes(progLower) || 
                s.trackKey.toLowerCase().includes(progLower)
            );
        }

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(q) || 
                s.id.toLowerCase().includes(q) ||
                s.counselor.toLowerCase().includes(q) ||
                s.section.toLowerCase().includes(q)
            );
        }

        const totalRecords = filtered.length;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedStudents = filtered.slice(startIndex, startIndex + limitNum);

        res.status(200).json({
            success: true,
            totalParticipating: studentRosterCache.length,
            filteredRecordsCount: totalRecords,
            page: pageNum,
            totalPages: Math.ceil(totalRecords / limitNum),
            students: paginatedStudents
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch student roster telemetry",
            error: error.message
        });
    }
};

// @desc    Batch Endorse Qualified Students
// @route   POST /api/school/batch-endorse
// @access  Private
const batchEndorseStudents = async (req, res) => {
    try {
        batchEndorsedCount = 142;
        studentRosterCache.forEach(s => {
            if (s.status === "Thriving" || s.status === "On Track") {
                if (!s.passportData.endorsedBadges.includes("State Honor Roll Endorsed")) {
                    s.passportData.endorsedBadges.push("State Honor Roll Endorsed");
                }
            }
        });

        res.status(200).json({
            success: true,
            message: `Successfully batch-endorsed ${batchEndorsedCount} student records for State Honor Roll Certification.`,
            endorsedCount: batchEndorsedCount
        });
    } catch (error) {
        res.status(500).json({
            message: "Batch endorsement failed",
            error: error.message
        });
    }
};

// @desc    Prompt Student / Trigger Counselor Check-in
// @route   POST /api/school/students/:id/prompt
// @access  Private
const promptStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = studentRosterCache.find(s => s.id === id);

        if (!student) {
            return res.status(404).json({ message: "Student record not found" });
        }

        student.status = "Prompted";
        student.badgeType = "blue";
        student.action = "View Passport";
        student.passportData.counselorNotes = `Automated guidance check-in triggered on ${new Date().toLocaleDateString()}. Counselor assigned for 1-on-1 review.`;

        res.status(200).json({
            success: true,
            message: `Guidance prompt sent to ${student.name} (${student.id}). Counselor notified.`,
            student
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to prompt student",
            error: error.message
        });
    }
};

// @desc    Schedule In-School Scrimmage Event
// @route   POST /api/school/scrimmage
// @access  Private
const scheduleScrimmage = async (req, res) => {
    try {
        const { title, date, location, track } = req.body;
        const newEvent = {
            id: scheduledScrimmages.length + 1,
            title: title || "Oakwood In-School Scrimmage",
            date: date || "April 25, 2026",
            location: location || "Gymnasium A & B",
            track: track || "All Programs"
        };
        scheduledScrimmages.push(newEvent);

        res.status(201).json({
            success: true,
            message: "In-School Scrimmage scheduled successfully!",
            event: newEvent
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to schedule scrimmage",
            error: error.message
        });
    }
};

// @desc    Export Student Telemetry Data to CSV
// @route   GET /api/school/export
// @access  Private
const exportSchoolTelemetry = async (req, res) => {
    try {
        let csvContent = "ID,Name,Grade,Counselor,Track,Section,QuestsCompleted,WeeklyLogHours,Status\n";
        studentRosterCache.forEach(s => {
            csvContent += `"${s.id}","${s.name}","${s.grade}","${s.counselor}","${s.trackName}","${s.section}",${s.questsDone}/${s.questsTotal},${s.weeklyLog},"${s.status}"\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=oakwood_extracurricular_telemetry.csv");
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({
            message: "Failed to export telemetry CSV",
            error: error.message
        });
    }
};

module.exports = {
    getSchoolDashboard,
    getSchoolStudents,
    batchEndorseStudents,
    promptStudent,
    scheduleScrimmage,
    exportSchoolTelemetry
};
