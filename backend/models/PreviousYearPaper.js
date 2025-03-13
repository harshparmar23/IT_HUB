import mongoose from "mongoose";

const PreviousYearPaperSchema = new mongoose.Schema(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const PreviousYearPaper = mongoose.model("PreviousYearPaper", PreviousYearPaperSchema);
export default PreviousYearPaper; 