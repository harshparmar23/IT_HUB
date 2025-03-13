import express from "express";
import User from "../models/User.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";

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

// Google Sign-In Route
router.post("/google-signin", requireAuth, async (req, res) => {
    try {
        const clerkUser = await clerkClient.users.getUser(req.userId);
        const email = clerkUser.emailAddresses[0].emailAddress;

        // Check if user exists in the database
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(403).json({
                message: "Your email is not registered. Please contact the admin.",
            });
        }

        // If user exists but fields are not updated, update them
        if (!user.clerkId || !user.name || !user.profileImage) {
            user.clerkId = clerkUser.id;
            user.name = `${clerkUser.firstName} ${clerkUser.lastName}`;
            user.profileImage = clerkUser.imageUrl;
            await user.save();
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
        const user = await User.findOne({ clerkId: req.userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
