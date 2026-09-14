const MentorApplication = require("../models/MentorApplication");
const User = require("../models/user");
const mongoose = require("mongoose");

// Initial sample candidates matching the Admin Portal verification queue design
const DEFAULT_ADMIN_CANDIDATES = [
    {
        _id: "cand_david_sterling",
        name: "Coach David Sterling",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
        badgeTag: "Expedited Candidate",
        badgeClass: "blue-tag",
        dossierScore: 98,
        statusLabel: "Ready For Approval",
        statusType: "green-text",
        track: "Public Speaking & Parliamentary Oratory",
        trackCategory: "Public Speaking",
        appliedTime: "Applied 14 hours ago",
        targetCohort: "Target Cohort: Spring '25 Urban League",
        credentialsText: "Former Harvard Speech & Debate Captain • 8 years collegiate coaching • Published author in rhetorical reasoning.",
        quoteText: "\"Expert in coach Title I public school cohorts in extemporaneous debate.\"",
        verificationBadges: [
          { label: "Background Check Cleared", icon: "✓", type: "mint" },
          { label: "Degree Verified (Harvard '16)", icon: "✓", type: "mint" },
          { label: "SafeSport Clearance Valid", icon: "✓", type: "mint" },
          { label: "LiveScan Linked", icon: "🔒", type: "grey" }
        ],
        status: "pending"
    },
    {
        _id: "cand_alexandra_romanova",
        name: "Alexandra Romanova",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
        badgeTag: "FIDE Master",
        badgeClass: "purple-tag",
        dossierScore: 96,
        statusLabel: "Ready For Approval",
        statusType: "green-text",
        track: "Strategic Chess & Analytical Reasoning",
        trackCategory: "Strategic Chess",
        appliedTime: "Applied 1 day ago",
        targetCohort: "Recommended by Oakwood HS Principal",
        credentialsText: "International Master (IM) • 2,410 FIDE Rating • Former National Youth Coach with 14 national youth podium placements.",
        quoteText: null,
        verificationBadges: [
          { label: "FIDE ID Verified (#41209134)", icon: "✓", type: "mint" },
          { label: "Background Check Cleared", icon: "✓", type: "mint" },
          { label: "Coaching License A-Tier", icon: "✓", type: "mint" }
        ],
        status: "pending"
    },
    {
        _id: "cand_marcus_vance",
        name: "Marcus Vance",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
        badgeTag: "High School Director",
        badgeClass: "grey-tag",
        dossierScore: 89,
        statusLabel: "Verification in Review",
        statusType: "orange-text",
        subtextNote: "Pending State Bureau File",
        track: "Public Speaking",
        trackCategory: "Public Speaking",
        appliedTime: "Applied 2 days ago",
        targetCohort: "State Forensics Association nominee",
        credentialsText: "State Forensics Champion Coach • High School Forensics Director for 11 years • Coached 3 National Speech Champions.",
        quoteText: null,
        verificationBadges: [
          { label: "State Educator Licensure Valid", icon: "✓", type: "mint" },
          { label: "Fingerprint Check Processing", icon: "⏳", type: "orange" },
          { label: "District References Checked (3/3)", icon: "✓", type: "mint" }
        ],
        status: "pending"
    }
];

let candidateStore = [...DEFAULT_ADMIN_CANDIDATES];
let auditLogsStore = [
    { id: 1, type: "approved", title: "Approved: Coach Maya Lin", time: "28m ago", desc: "Credentials granted for Strategic Chess Track by Admin Alex Chen." },
    { id: 2, type: "updated", title: "District License Updated", time: "3h ago", desc: "Oakwood High School added 50 student seats to Oratory Suite." },
    { id: 3, type: "revoked", title: "Access Revoked: J. Miller", time: "1d ago", desc: "Safeguard flagged lapsed SafeSport certificate. Candidate notified." },
    { id: 4, type: "clearance", title: "LiveScan Batch Clearance", time: "2d ago", desc: "8 background files confirmed without incident." }
];

// @desc    Get all mentor applications for Admin Portal Queue
// @route   GET /api/mentors/applications
// @access  Private (Admin only)
const getMentorApplications = async (req, res) => {
    try {
        const stats = {
            pendingCount: candidateStore.filter(c => c.status === "pending").length || 6,
            avgTurnaround: "1.8d",
            activeMentors: 28,
            certifiedCoaches: 28,
            cohortAddition: "+4 this cohort",
            highSchoolsCovered: 42,
            districtsLinked: 42,
            fillingRate: "98.2%",
            accreditationSla: "99.4%",
            complianceText: "FERPA & SafeSport certified"
        };

        const slaTracker = {
            targetDays: "1.8d",
            slaLimit: "<3.0d",
            backgroundClearanceDays: "1.2 days",
            credentialVerificationDays: "0.6 days",
            boardSignOffPending: 6,
            cohortTarget: 35,
            cohortReachedPercent: 80
        };

        const complianceProtocols = [
            { title: "FERPA & Student Privacy", status: "Compliant", desc: "Student transcripts, debate audio-recordings, and match logs end-to-end encrypted." },
            { title: "COPPA Parental Consents", status: "Active", desc: "Automated parental e-signatures received across 100% of participating under-18 debaters." },
            { title: "LiveScan DOJ / FBI Integration", status: "Live API", desc: "Automated background webhooks linked with state clearings." }
        ];

        res.status(200).json({
            success: true,
            protocolVersion: "DISTRICT PROTOCOL V4.2 ACTIVE",
            title: "EduSpark District & Platform Administration • Mentor Applications & Verification Queue",
            stats,
            slaTracker,
            complianceProtocols,
            auditLogs: auditLogsStore,
            count: candidateStore.length,
            applications: candidateStore
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch mentor applications",
            error: error.message
        });
    }
};

// @desc    Approve candidate application
// @route   PUT /api/mentors/:id/approve
// @access  Private (Admin only)
const approveMentorApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = candidateStore.find(c => c._id === id || c.id === id);

        if (candidate) {
            candidate.status = "approved";
            candidate.statusLabel = "Approved & Certified";
            candidate.statusType = "green-text";
        }

        auditLogsStore.unshift({
            id: Date.now(),
            type: "approved",
            title: `Approved: ${candidate ? candidate.name : 'Mentor Candidate'}`,
            time: "Just now",
            desc: `Credentials granted for track by Admin.`
        });

        res.status(200).json({
            success: true,
            message: `Mentor credentials approved and granted!`,
            candidate
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to approve mentor application",
            error: error.message
        });
    }
};

// @desc    Reject candidate application
// @route   PUT /api/mentors/:id/reject
// @access  Private (Admin only)
const rejectMentorApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = candidateStore.find(c => c._id === id || c.id === id);

        if (candidate) {
            candidate.status = "rejected";
            candidate.statusLabel = "Application Rejected";
            candidate.statusType = "red-text";
        }

        auditLogsStore.unshift({
            id: Date.now(),
            type: "revoked",
            title: `Rejected: ${candidate ? candidate.name : 'Candidate'}`,
            time: "Just now",
            desc: `Application rejected by Admin during verification.`
        });

        res.status(200).json({
            success: true,
            message: "Application rejected.",
            candidate
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reject mentor application",
            error: error.message
        });
    }
};

// @desc    Apply to become a mentor (for users)
// @route   POST /api/mentors/apply
// @access  Private
const applyForMentor = async (req, res) => {
    try {
        const { skill, experience, bio } = req.body;
        const newApp = {
            _id: `cand_${Date.now()}`,
            name: req.user ? req.user.name : "New Candidate",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
            badgeTag: "New Applicant",
            badgeClass: "blue-tag",
            dossierScore: 85,
            statusLabel: "Ready For Approval",
            statusType: "green-text",
            track: skill || "Public Speaking",
            trackCategory: "Public Speaking",
            appliedTime: "Applied just now",
            targetCohort: "Standard Review Queue",
            credentialsText: `${experience || 'Coaching background'} • ${bio || 'Applicant bio'}`,
            quoteText: null,
            verificationBadges: [
                { label: "Background Check Pending", icon: "⏳", type: "orange" },
                { label: "SafeSport Clearance Valid", icon: "✓", type: "mint" }
            ],
            status: "pending"
        };
        candidateStore.unshift(newApp);

        res.status(201).json({
            success: true,
            message: "Mentor application submitted successfully",
            application: newApp
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to submit mentor application",
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
