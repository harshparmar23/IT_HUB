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

// ✅ PUT request - Update a course
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Course name is required" });
        }

        // Check if course exists
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if new name already exists
        const existingCourse = await Course.findOne({ name, _id: { $ne: id } });
        if (existingCourse) {
            return res.status(400).json({ message: "Course name already exists" });
        }

        // Update course
        course.name = name;
        await course.save();

        res.json({ message: "Course updated successfully", course });
    } catch (error) {
        res.status(500).json({ message: "Error updating course", error });
    }
});

// ✅ DELETE request - Delete a course
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if course exists
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Delete course
        await Course.findByIdAndDelete(id);

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
    }
});

export default router;
