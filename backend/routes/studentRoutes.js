import express from "express";
import User from "../models/User.js";// Import User model

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

export default router;
