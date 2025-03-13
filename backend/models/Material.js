import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
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

const Material = mongoose.model("Material", MaterialSchema);
export default Material; 