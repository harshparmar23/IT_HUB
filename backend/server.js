import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import { upload } from "./config/cloudinary.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes); // Use course routes
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Return the Cloudinary URL
        return res.status(200).json({
            fileUrl: req.file.path,
            message: "File uploaded successfully"
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({ message: "Error uploading file" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

