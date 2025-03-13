import express from "express";
import Course from "../models/Course.js";

const router = express.Router();

// ✅ POST request - Add a new course
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Course name is required" });
        }

        // Check if course already exists
        const existingCourse = await Course.findOne({ name });
        if (existingCourse) {
            return res.status(400).json({ message: "Course already exists" });
        }

        const newCourse = new Course({ name });
        await newCourse.save();

        res.status(201).json({ message: "Course created successfully", course: newCourse });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ GET request - Fetch all courses
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find(); // Fetch all courses
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: "Error fetching courses", error });
    }
});

export default router;
