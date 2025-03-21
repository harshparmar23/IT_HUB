import express from "express";
import User from "../models/User.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import Material from "../models/Material.js";
import PreviousYearPaper from "../models/PreviousYearPaper.js";

dotenv.config();

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

// Function to determine role based on email
const determineRole = (email) => {
    if (email.endsWith('.it@ddu.ac.in')) {
        return 'faculty';
    } else if (email.endsWith('@ddu.ac.in')) {
        return 'student';
    }
    return null;
};

// Google Sign-In Route
router.post("/google-signin", requireAuth, async (req, res) => {
    try {
        const clerkUser = await clerkClient.users.getUser(req.userId);
        const email = clerkUser.emailAddresses[0].emailAddress;

        // First check if it's a DDU email
        if (!email.endsWith('@ddu.ac.in')) {
            return res.status(403).json({
                message: "Invalid email domain. Only @ddu.ac.in emails are allowed.",
            });
        }

        // Determine role based on email
        const role = determineRole(email);
        if (!role) {
            return res.status(403).json({
                message: "Invalid email format. Please use a valid DDU email address.",
            });
        }

        // Check if user exists in the database
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user with determined role
            user = new User({
                email,
                role,
                clerkId: clerkUser.id,
                name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                profileImage: clerkUser.imageUrl,
                joinDate: new Date(),
            });
            await user.save();
        } else {
            // If user exists but fields are not updated, update them
            if (!user.clerkId || !user.name || !user.profileImage) {
                user.clerkId = clerkUser.id;
                user.name = `${clerkUser.firstName} ${clerkUser.lastName}`;
                user.profileImage = clerkUser.imageUrl;
                await user.save();
            }
        }

        res.status(200).json({ message: "User authenticated", user });
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

// Get user details
router.get("/get-user", requireAuth, async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.userId })
            .populate('courseIds', 'name description')
            .select('-__v');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If user is faculty, fetch their materials and papers
        let materials = [];
        let papers = [];
        if (user.role === 'faculty') {
            materials = await Material.find({ facultyId: user._id })
                .populate('courseId', 'name')
                .select('-__v');

            papers = await PreviousYearPaper.find({ facultyId: user._id })
                .populate('courseId', 'name')
                .select('-__v');
        }

        // Transform the response to match the frontend expectations
        const userData = {
            ...user.toObject(),
            courses: user.courseIds.map(course => ({
                id: course._id,
                name: course.name,
                description: course.description
            })),
            materials: materials.map(material => ({
                id: material._id,
                name: material.name,
                description: material.description,
                courseName: material.courseId.name,
                uploadDate: material.uploadDate,
                fileUrl: material.fileUrl
            })),
            papers: papers.map(paper => ({
                id: paper._id,
                name: paper.name,
                description: paper.description,
                courseName: paper.courseId.name,
                year: paper.year,
                uploadDate: paper.uploadDate,
                fileUrl: paper.fileUrl
            }))
        };

        res.json(userData);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user data" });
    }
});

export default router;
