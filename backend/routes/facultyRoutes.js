import express from "express"
import User from "../models/User.js" // Import the User model
import Material from "../models/Material.js" // Import the Material model
import Course from "../models/Course.js" // Import the Course model
import PreviousYearPaper from "../models/PreviousYearPaper.js" // Import the PreviousYearPaper model

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const faculty = await User.find({ role: "faculty" })
            .populate("courseIds", "name") // Populate course names
            .select("-__v")

        const facultyWithExperience = faculty.map((fac) => {
            const joinDate = fac.joinDate || fac.createdAt // Use joinDate if available, fallback to createdAt
            const yearsOfExperience = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))

            // Format course names as a comma-separated string
            const courseNames =
                fac.courseIds && fac.courseIds.length > 0
                    ? fac.courseIds.map((course) => course.name).join(", ")
                    : "Not Assigned"

            return {
                ...fac.toObject(),
                experience: yearsOfExperience,
                courseNames: courseNames,
                courses: fac.courseIds || [],
            }
        })

        res.json({ faculty: facultyWithExperience })
    } catch (error) {
        res.status(500).json({ message: "Error fetching faculty members" })
    }
})

/**
 * @route GET /api/faculty/profile/:userId
 * @desc Get faculty profile by clerkId
 */
router.get("/profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Get faculty profile with populated courses
        const faculty = await User.findOne({ clerkId: userId, role: "faculty" })
            .populate("courseIds", "name description")
            .select("-__v");

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Calculate experience based on joinDate
        const joinDate = faculty.joinDate || faculty.createdAt;
        const yearsOfExperience = Math.floor(
            (Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
        );

        // Get faculty's materials count
        const materialsCount = await Material.countDocuments({ facultyId: faculty._id });

        // Get faculty's papers count
        const papersCount = await PreviousYearPaper.countDocuments({ facultyId: faculty._id });

        // Format the response
        const response = {
            faculty: {
                ...faculty.toObject(),
                experience: yearsOfExperience,
                materialsCount,
                papersCount,
                courses: faculty.courseIds || [],
                joinDate: joinDate
            }
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching faculty profile:", error);
        res.status(500).json({ message: "Error fetching faculty profile" });
    }
});

/**
 * @route PUT /api/faculty/:id
 * @desc Update faculty courses and/or joinDate
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { courseIds, joinDate } = req.body

        // Validate inputs
        if (!courseIds && !joinDate) {
            return res.status(400).json({ message: "Either courseIds or joinDate must be provided" })
        }

        // Validate course count if provided
        if (courseIds && (courseIds.length < 1 || courseIds.length > 4)) {
            return res.status(400).json({ message: "Faculty must be assigned between 1 and 4 courses" })
        }

        // Find faculty by ID
        const faculty = await User.findById(id)
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" })
        }

        // Update fields if provided
        if (courseIds) {
            faculty.courseIds = courseIds
        }

        if (joinDate) {
            // Validate date format
            const dateObj = new Date(joinDate)
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({ message: "Invalid date format" })
            }

            // Update the joinDate field
            faculty.joinDate = dateObj
        }

        // Save the updated faculty
        await faculty.save()

        // Fetch the updated faculty with populated courses
        const updatedFaculty = await User.findById(id).populate("courseIds", "name")

        // Calculate experience based on the (potentially) new joinDate
        const joinDateToUse = updatedFaculty.joinDate || updatedFaculty.createdAt
        const yearsOfExperience = Math.floor((Date.now() - new Date(joinDateToUse).getTime()) / (1000 * 60 * 60 * 24 * 365))

        // Format course names
        const courseNames =
            updatedFaculty.courseIds && updatedFaculty.courseIds.length > 0
                ? updatedFaculty.courseIds.map((course) => course.name).join(", ")
                : "Not Assigned"

        // Return the updated faculty with calculated fields
        const facultyResponse = {
            ...updatedFaculty.toObject(),
            experience: yearsOfExperience,
            courseNames: courseNames,
            courses: updatedFaculty.courseIds || [],
        }

        res.json({ faculty: facultyResponse, message: "Faculty updated successfully" })
    } catch (error) {
        console.error("Error updating faculty:", error)
        res.status(500).json({ message: "Error updating faculty" })
    }
})

/**
 * @route POST /api/faculty
 * @desc Add a new faculty member
 */
router.post("/", async (req, res) => {
    try {
        const { email, courseIds, joinDate } = req.body
        if (!email || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ message: "Email and at least one course are required" })
        }

        // Validate course count
        if (courseIds.length > 4) {
            return res.status(400).json({ message: "Faculty can be assigned maximum 4 courses" })
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ message: "Faculty already exists" })

        // Create new faculty with optional joinDate
        const newFaculty = new User({
            email,
            role: "faculty",
            courseIds,
            ...(joinDate && { joinDate: new Date(joinDate) }),
        })

        await newFaculty.save()

        // Calculate experience
        const joinDateToUse = newFaculty.joinDate || newFaculty.createdAt
        const yearsOfExperience = Math.floor((Date.now() - new Date(joinDateToUse).getTime()) / (1000 * 60 * 60 * 24 * 365))

        // Return faculty with additional fields
        const facultyResponse = {
            ...newFaculty.toObject(),
            experience: yearsOfExperience,
            courseNames: "Not Populated", // Course names not populated in this response
        }

        res.status(201).json({ faculty: facultyResponse })
    } catch (error) {
        console.error("Error adding faculty:", error)
        res.status(500).json({ message: "Error adding faculty" })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const faculty = await User.findByIdAndDelete(id)

        if (!faculty) return res.status(404).json({ message: "Faculty not found" })

        res.json({ message: "Faculty deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error deleting faculty member" })
    }
})

/**
 * @route POST /api/faculty/materials
 * @desc Upload a new material
 */
router.post("/materials", async (req, res) => {
    try {
        const { facultyId, name, description, fileUrl, courseId } = req.body;

        // Verify the faculty exists
        const faculty = await User.findById(facultyId);
        if (!faculty || faculty.role !== "faculty") {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Verify the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Create new material with specified course ID
        const material = new Material({
            facultyId: faculty._id,
            courseId,
            name,
            description,
            fileUrl,
        });

        await material.save();

        res.status(201).json({
            message: "Material uploaded successfully",
            material: {
                ...material.toObject(),
                facultyName: faculty.name,
                courseName: course.name,
            },
        });
    } catch (error) {
        console.error("Error uploading material:", error);
        res.status(500).json({ message: "Error uploading material" });
    }
})

// The rest of the routes remain the same...

// export default router



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
        const { facultyId, name, description, year, fileUrl, courseId } = req.body;

        // Verify the faculty exists
        const faculty = await User.findById(facultyId);
        if (!faculty || faculty.role !== "faculty") {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Verify the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Create new previous year paper
        const paper = new PreviousYearPaper({
            facultyId: faculty._id,
            courseId,
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
                courseName: course.name
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

/**
 * @route GET /api/faculty/dashboard/:userId
 * @desc Get faculty dashboard data
 */
router.get("/dashboard/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Get faculty profile with courses
        const faculty = await User.findOne({ clerkId: userId, role: "faculty" })
            .populate("courseIds", "name description")
            .select("-__v");

        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Get faculty's materials (both total count and recent)
        const [totalMaterials, recentMaterials] = await Promise.all([
            Material.countDocuments({ facultyId: faculty._id }),
            Material.find({ facultyId: faculty._id })
                .populate("courseId", "name")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Get faculty's papers (both total count and recent)
        const [totalPapers, recentPapers] = await Promise.all([
            PreviousYearPaper.countDocuments({ facultyId: faculty._id }),
            PreviousYearPaper.find({ facultyId: faculty._id })
                .populate("courseId", "name")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Calculate experience
        const joinDate = faculty.joinDate || faculty.createdAt;
        const yearsOfExperience = Math.floor(
            (Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
        );

        // Format the response
        const response = {
            faculty: {
                ...faculty.toObject(),
                courses: faculty.courseIds || [],
                joinDate: joinDate,
                experience: yearsOfExperience
            },
            stats: {
                totalMaterials,
                totalPapers,
                totalCourses: faculty.courseIds?.length || 0
            },
            materials: recentMaterials.map(material => ({
                ...material.toObject(),
                courseName: material.courseId ? material.courseId.name : "Not Assigned"
            })),
            papers: recentPapers.map(paper => ({
                ...paper.toObject(),
                courseName: paper.courseId ? paper.courseId.name : "Not Assigned"
            }))
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
});

export default router;
