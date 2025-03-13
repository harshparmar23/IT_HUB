import express from "express";
import User from "../models/User.js"; // Import the User model
import Material from "../models/Material.js"; // Import the Material model
import Course from "../models/Course.js"; // Import the Course model
import PreviousYearPaper from "../models/PreviousYearPaper.js"; // Import the PreviousYearPaper model

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const faculty = await User.find({ role: "faculty" })
            .populate("courseId", "name") // Populate course name
            .select("-__v");

        const facultyWithExperience = faculty.map((fac) => {
            const joinDate = fac.joinDate || fac.createdAt; // Use joinDate if available, fallback to createdAt
            const yearsOfExperience = Math.floor(
                (Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
            );

            return {
                ...fac.toObject(),
                experience: yearsOfExperience,
                courseName: fac.courseId ? fac.courseId.name : "Not Assigned",
            };
        });

        res.json({ faculty: facultyWithExperience });
    } catch (error) {
        res.status(500).json({ message: "Error fetching faculty members" });
    }
});

/**
 * @route GET /api/faculty/profile
 * @desc Get faculty profile by clerkId
 */
router.get("/profile/:clerkId", async (req, res) => {
    try {
        const { clerkId } = req.params;

        const faculty = await User.findOne({
            clerkId,
            role: "faculty"
        }).populate("courseId", "name");

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        const joinDate = faculty.joinDate || faculty.createdAt; // Use joinDate if available, fallback to createdAt
        const yearsOfExperience = Math.floor(
            (Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
        );

        const facultyProfile = {
            ...faculty.toObject(),
            experience: yearsOfExperience,
            courseName: faculty.courseId ? faculty.courseId.name : "Not Assigned"
        };

        res.json({ faculty: facultyProfile });
    } catch (error) {
        console.error("Error fetching faculty profile:", error);
        res.status(500).json({ message: "Error fetching faculty profile" });
    }
});

/**
 * @route PUT /api/faculty/:id
 * @desc Update faculty course and/or joinDate
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { courseId, joinDate } = req.body;

        // Validate inputs
        if (!courseId && !joinDate) {
            return res.status(400).json({ message: "Either courseId or joinDate must be provided" });
        }

        // Find faculty by ID
        const faculty = await User.findById(id);
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Update fields if provided
        if (courseId) {
            faculty.courseId = courseId;
        }

        if (joinDate) {
            // Validate date format
            const dateObj = new Date(joinDate);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ message: "Invalid date format" });
            }

            // Update the joinDate field
            faculty.joinDate = dateObj;
        }

        // Save the updated faculty
        await faculty.save();

        // Fetch the updated faculty with populated course
        const updatedFaculty = await User.findById(id).populate("courseId", "name");

        // Calculate experience based on the (potentially) new joinDate
        const joinDateToUse = updatedFaculty.joinDate || updatedFaculty.createdAt;
        const yearsOfExperience = Math.floor(
            (Date.now() - new Date(joinDateToUse).getTime()) / (1000 * 60 * 60 * 24 * 365)
        );

        // Return the updated faculty with calculated fields
        const facultyResponse = {
            ...updatedFaculty.toObject(),
            experience: yearsOfExperience,
            courseName: updatedFaculty.courseId ? updatedFaculty.courseId.name : "Not Assigned"
        };

        res.json({ faculty: facultyResponse, message: "Faculty updated successfully" });
    } catch (error) {
        console.error("Error updating faculty:", error);
        res.status(500).json({ message: "Error updating faculty" });
    }
});

/**
 * @route POST /api/faculty
 * @desc Add a new faculty member
 */
router.post("/", async (req, res) => {
    try {
        const { email, courseId, joinDate } = req.body;
        if (!email || !courseId) return res.status(400).json({ message: "Email and Course are required" });

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Faculty already exists" });

        // Create new faculty with optional joinDate
        const newFaculty = new User({
            email,
            role: "faculty",
            courseId,
            ...(joinDate && { joinDate: new Date(joinDate) })
        });

        await newFaculty.save();

        // Calculate experience
        const joinDateToUse = newFaculty.joinDate || newFaculty.createdAt;
        const yearsOfExperience = Math.floor(
            (Date.now() - new Date(joinDateToUse).getTime()) / (1000 * 60 * 60 * 24 * 365)
        );

        // Return faculty with additional fields
        const facultyResponse = {
            ...newFaculty.toObject(),
            experience: yearsOfExperience,
            courseName: "Not Populated" // Course name not populated in this response
        };

        res.status(201).json({ faculty: facultyResponse });
    } catch (error) {
        console.error("Error adding faculty:", error);
        res.status(500).json({ message: "Error adding faculty" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await User.findByIdAndDelete(id);

        if (!faculty) return res.status(404).json({ message: "Faculty not found" });

        res.json({ message: "Faculty deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting faculty member" });
    }
});

/**
 * @route POST /api/faculty/materials
 * @desc Upload a new material
 */
router.post("/materials", async (req, res) => {
    try {
        const { facultyId, name, description, fileUrl } = req.body;

        // Verify the faculty exists
        const faculty = await User.findById(facultyId).populate("courseId");
        if (!faculty || faculty.role !== "faculty") {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Create new material with faculty's course ID
        const material = new Material({
            facultyId: faculty._id,
            courseId: faculty.courseId,
            name,
            description,
            fileUrl
        });

        await material.save();

        res.status(201).json({
            message: "Material uploaded successfully",
            material: {
                ...material.toObject(),
                facultyName: faculty.name,
                courseName: faculty.courseId ? faculty.courseId.name : "Not Assigned"
            }
        });
    } catch (error) {
        console.error("Error uploading material:", error);
        res.status(500).json({ message: "Error uploading material" });
    }
});

/**
 * @route GET /api/faculty/materials
 * @desc Get all materials
 */
router.get("/materials", async (req, res) => {
    try {
        const materials = await Material.find()
            .populate("facultyId", "name")
            .populate("courseId", "name");

        const formattedMaterials = materials.map(material => ({
            ...material.toObject(),
            facultyName: material.facultyId ? material.facultyId.name : "Unknown",
            courseName: material.courseId ? material.courseId.name : "Not Assigned"
        }));

        res.json({ materials: formattedMaterials });
    } catch (error) {
        console.error("Error fetching materials:", error);
        res.status(500).json({ message: "Error fetching materials" });
    }
});

/**
 * @route GET /api/faculty/materials/:facultyId
 * @desc Get materials by faculty ID
 */
router.get("/materials/:facultyId", async (req, res) => {
    try {
        const { facultyId } = req.params;

        const materials = await Material.find({ facultyId })
            .populate("facultyId", "name")
            .populate("courseId", "name");

        const formattedMaterials = materials.map(material => ({
            ...material.toObject(),
            facultyName: material.facultyId ? material.facultyId.name : "Unknown",
            courseName: material.courseId ? material.courseId.name : "Not Assigned"
        }));

        res.json({ materials: formattedMaterials });
    } catch (error) {
        console.error("Error fetching faculty materials:", error);
        res.status(500).json({ message: "Error fetching faculty materials" });
    }
});

/**
 * @route DELETE /api/faculty/materials/:id
 * @desc Delete a material
 */
router.delete("/materials/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const material = await Material.findByIdAndDelete(id);
        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        res.json({ message: "Material deleted successfully" });
    } catch (error) {
        console.error("Error deleting material:", error);
        res.status(500).json({ message: "Error deleting material" });
    }
});

/**
 * @route PUT /api/faculty/materials/:id
 * @desc Update material details
 */
router.put("/materials/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, facultyId, courseId } = req.body;

        // Find and update the material
        const material = await Material.findById(id);

        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        // Update fields if provided
        if (name) material.name = name;
        if (description) material.description = description;
        if (facultyId) material.facultyId = facultyId;
        if (courseId) material.courseId = courseId;

        await material.save();

        // Get updated material with populated fields
        const updatedMaterial = await Material.findById(id)
            .populate("facultyId", "name")
            .populate("courseId", "name");

        const formattedMaterial = {
            ...updatedMaterial.toObject(),
            facultyName: updatedMaterial.facultyId ? updatedMaterial.facultyId.name : "Unknown",
            courseName: updatedMaterial.courseId ? updatedMaterial.courseId.name : "Not Assigned"
        };

        res.json({
            message: "Material updated successfully",
            material: formattedMaterial
        });
    } catch (error) {
        console.error("Error updating material:", error);
        res.status(500).json({ message: "Error updating material" });
    }
});

/**
 * @route POST /api/faculty/papers
 * @desc Upload a new previous year paper
 */
router.post("/papers", async (req, res) => {
    try {
        const { facultyId, name, description, year, fileUrl } = req.body;

        // Verify the faculty exists
        const faculty = await User.findById(facultyId).populate("courseId");
        if (!faculty || faculty.role !== "faculty") {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Create new previous year paper with faculty's course ID
        const paper = new PreviousYearPaper({
            facultyId: faculty._id,
            courseId: faculty.courseId,
            name,
            description,
            year,
            fileUrl
        });

        await paper.save();

        res.status(201).json({
            message: "Previous year paper uploaded successfully",
            paper: {
                ...paper.toObject(),
                facultyName: faculty.name,
                courseName: faculty.courseId ? faculty.courseId.name : "Not Assigned"
            }
        });
    } catch (error) {
        console.error("Error uploading previous year paper:", error);
        res.status(500).json({ message: "Error uploading previous year paper" });
    }
});

/**
 * @route GET /api/faculty/papers
 * @desc Get all previous year papers
 */
router.get("/papers", async (req, res) => {
    try {
        const papers = await PreviousYearPaper.find()
            .populate("facultyId", "name")
            .populate("courseId", "name");

        const formattedPapers = papers.map(paper => ({
            ...paper.toObject(),
            facultyName: paper.facultyId ? paper.facultyId.name : "Unknown",
            courseName: paper.courseId ? paper.courseId.name : "Not Assigned"
        }));

        res.json({ papers: formattedPapers });
    } catch (error) {
        console.error("Error fetching previous year papers:", error);
        res.status(500).json({ message: "Error fetching previous year papers" });
    }
});

/**
 * @route GET /api/faculty/papers/:facultyId
 * @desc Get previous year papers by faculty ID
 */
router.get("/papers/:facultyId", async (req, res) => {
    try {
        const { facultyId } = req.params;

        const papers = await PreviousYearPaper.find({ facultyId })
            .populate("facultyId", "name")
            .populate("courseId", "name");

        const formattedPapers = papers.map(paper => ({
            ...paper.toObject(),
            facultyName: paper.facultyId ? paper.facultyId.name : "Unknown",
            courseName: paper.courseId ? paper.courseId.name : "Not Assigned"
        }));

        res.json({ papers: formattedPapers });
    } catch (error) {
        console.error("Error fetching faculty papers:", error);
        res.status(500).json({ message: "Error fetching faculty papers" });
    }
});

/**
 * @route PUT /api/faculty/papers/:id
 * @desc Update previous year paper details
 */
router.put("/papers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, year, facultyId, courseId } = req.body;

        // Find and update the paper
        const paper = await PreviousYearPaper.findById(id);

        if (!paper) {
            return res.status(404).json({ message: "Previous year paper not found" });
        }

        // Update fields if provided
        if (name) paper.name = name;
        if (description) paper.description = description;
        if (year) paper.year = year;
        if (facultyId) paper.facultyId = facultyId;
        if (courseId) paper.courseId = courseId;

        await paper.save();

        // Get updated paper with populated fields
        const updatedPaper = await PreviousYearPaper.findById(id)
            .populate("facultyId", "name")
            .populate("courseId", "name");

        const formattedPaper = {
            ...updatedPaper.toObject(),
            facultyName: updatedPaper.facultyId ? updatedPaper.facultyId.name : "Unknown",
            courseName: updatedPaper.courseId ? updatedPaper.courseId.name : "Not Assigned"
        };

        res.json({
            message: "Previous year paper updated successfully",
            paper: formattedPaper
        });
    } catch (error) {
        console.error("Error updating previous year paper:", error);
        res.status(500).json({ message: "Error updating previous year paper" });
    }
});

/**
 * @route DELETE /api/faculty/papers/:id
 * @desc Delete a previous year paper
 */
router.delete("/papers/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const paper = await PreviousYearPaper.findByIdAndDelete(id);
        if (!paper) {
            return res.status(404).json({ message: "Previous year paper not found" });
        }

        res.json({ message: "Previous year paper deleted successfully" });
    } catch (error) {
        console.error("Error deleting previous year paper:", error);
        res.status(500).json({ message: "Error deleting previous year paper" });
    }
});

export default router;
