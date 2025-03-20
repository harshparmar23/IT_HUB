import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Material from "../models/Material.js";
import PreviousYearPaper from "../models/PreviousYearPaper.js";

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get admin dashboard data
 */
router.get("/dashboard", async (req, res) => {
    try {
        // Get total counts
        const [totalStudents, totalFaculty, totalCourses, totalMaterials, totalPapers] = await Promise.all([
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "faculty" }),
            Course.countDocuments(),
            Material.countDocuments(),
            PreviousYearPaper.countDocuments()
        ]);

        // Get recent faculty members
        const recentFaculty = await User.find({ role: "faculty" })
            .populate("courseIds", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email courseIds createdAt");

        // Get recent materials
        const recentMaterials = await Material.find()
            .populate("facultyId", "name")
            .populate("courseId", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent papers
        const recentPapers = await PreviousYearPaper.find()
            .populate("facultyId", "name")
            .populate("courseId", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get course distribution
        const courseDistribution = await Course.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "courseIds",
                    as: "faculty"
                }
            },
            {
                $project: {
                    name: 1,
                    facultyCount: { $size: "$faculty" }
                }
            }
        ]);

        // Format the response
        const response = {
            stats: {
                totalStudents,
                totalFaculty,
                totalCourses,
                totalMaterials,
                totalPapers
            },
            recentFaculty: recentFaculty.map(faculty => ({
                ...faculty.toObject(),
                courses: faculty.courseIds.map(course => course.name).join(", ") || "Not Assigned"
            })),
            recentMaterials: recentMaterials.map(material => ({
                ...material.toObject(),
                facultyName: material.facultyId ? material.facultyId.name : "Unknown",
                courseName: material.courseId ? material.courseId.name : "Not Assigned"
            })),
            recentPapers: recentPapers.map(paper => ({
                ...paper.toObject(),
                facultyName: paper.facultyId ? paper.facultyId.name : "Unknown",
                courseName: paper.courseId ? paper.courseId.name : "Not Assigned"
            })),
            courseDistribution
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({ message: "Error fetching admin dashboard data" });
    }
});

export default router; 