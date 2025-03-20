import express from "express";
import User from "../models/User.js";// Import User model
import Course from "../models/Course.js";
import Material from "../models/Material.js";
import PreviousYearPaper from "../models/PreviousYearPaper.js";

const router = express.Router();

// GET all students
router.get("/", async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("-__v"); // Exclude MongoDB version key
        res.status(200).json({ students });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


router.post("/", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if student already exists
        const existingStudent = await User.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }

        // Create new student
        const newStudent = new User({ email, role: "student" });
        await newStudent.save();

        res.status(201).json({ message: "Student added successfully", student: newStudent });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

/**
 * @route PUT /api/students/:id
 * @desc Update student details
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, joinDate } = req.body;

        // Find student by ID
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Ensure the user is a student
        if (student.role !== "student") {
            return res.status(400).json({ message: "User is not a student" });
        }

        // Update fields if provided
        if (name) student.name = name;
        if (email) {
            // Check if email is already in use by another user
            const existingUser = await User.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            student.email = email;
        }
        if (joinDate) {
            // Validate date format
            const dateObj = new Date(joinDate);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }
            student.joinDate = dateObj;
        }

        // Save the updated student
        await student.save();

        res.json({
            student,
            message: "Student updated successfully"
        });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Error updating student" });
    }
});

/**
 * @route DELETE /api/students/:id
 * @desc Delete a student
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find student by ID
        const student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Ensure the user is a student
        if (student.role !== "student") {
            return res.status(400).json({ message: "User is not a student" });
        }

        // Delete the student
        await User.findByIdAndDelete(id);

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: "Error deleting student" });
    }
});

/**
 * @route GET /api/students/dashboard/:userId
 * @desc Get student dashboard data
 */
router.get("/dashboard/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Get student profile with enrolled courses
        const student = await User.findOne({ clerkId: userId, role: "student" })
            .populate("courseIds", "name description");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Get materials for enrolled courses
        const materials = await Material.find({
            courseId: { $in: student.courseIds }
        })
            .populate("facultyId", "name")
            .populate("courseId", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get papers for enrolled courses
        const papers = await PreviousYearPaper.find({
            courseId: { $in: student.courseIds }
        })
            .populate("facultyId", "name")
            .populate("courseId", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get course progress (materials and papers count per course)
        const courseProgress = await Promise.all(
            student.courseIds.map(async (course) => {
                const [materialsCount, papersCount] = await Promise.all([
                    Material.countDocuments({ courseId: course._id }),
                    PreviousYearPaper.countDocuments({ courseId: course._id })
                ]);

                return {
                    courseId: course._id,
                    courseName: course.name,
                    materialsCount,
                    papersCount
                };
            })
        );

        // Format the response
        const response = {
            student: {
                name: student.name,
                email: student.email,
                enrolledCourses: student.courseIds.map(course => ({
                    id: course._id,
                    name: course.name,
                    description: course.description
                }))
            },
            recentMaterials: materials.map(material => ({
                ...material.toObject(),
                facultyName: material.facultyId ? material.facultyId.name : "Unknown",
                courseName: material.courseId ? material.courseId.name : "Not Assigned"
            })),
            recentPapers: papers.map(paper => ({
                ...paper.toObject(),
                facultyName: paper.facultyId ? paper.facultyId.name : "Unknown",
                courseName: paper.courseId ? paper.courseId.name : "Not Assigned"
            })),
            courseProgress
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching student dashboard data:", error);
        res.status(500).json({ message: "Error fetching student dashboard data" });
    }
});

export default router;
