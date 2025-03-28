import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

const Course = mongoose.model("Course", CourseSchema);
export default Course;
