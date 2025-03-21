import express from "express";
import Course from "../models/Course.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

const router = express.Router();

// Middleware to verify Clerk authentication
const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const { sub: userId } = await clerkClient.verifyToken(token);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Token verification failed" });
    }
};

// Get all courses
router.get("/", requireAuth, async (req, res) => {
    try {
        const courses = await Course.find().select('-__v');
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Error fetching courses" });
    }
});

// Create a new course
router.post("/", requireAuth, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        // Check if course with same name already exists
        const existingCourse = await Course.findOne({ name });
        if (existingCourse) {
            return res.status(400).json({ message: "Course with this name already exists" });
        }

        const course = new Course({
            name,
            description
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: "Error creating course" });
    }
});

// Update a course
router.put("/:id", requireAuth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const courseId = req.params.id;

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        // Check if another course with the same name exists
        const existingCourse = await Course.findOne({
            name,
            _id: { $ne: courseId }
        });
        if (existingCourse) {
            return res.status(400).json({ message: "Course with this name already exists" });
        }

        const course = await Course.findByIdAndUpdate(
            courseId,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Error updating course" });
    }
});

// Delete a course
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Error deleting course" });
    }
});

export default router;
