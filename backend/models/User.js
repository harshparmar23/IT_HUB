import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        clerkId: { type: String, unique: true }, // Clerk ID (nullable initially)
        email: { type: String, required: true, unique: true }, // Must be pre-registered
        name: { type: String }, // Updated after first sign-in
        profileImage: { type: String }, // Profile picture URL (updated after first sign-in)
        role: {
            type: String,
            required: true,
            enum: ["student", "faculty", "admin"], // Restrict roles
            default: "student",
        },
        joinDate: {
            type: Date,
            default: Date.now, // Default to current date
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: function () {
                return this.role === "faculty"; // Make courseId required only if user is faculty
            },
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
