import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            unique: true,
            sparse: true, // This makes uniqueness apply only when clerkId is not null
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: { type: String },
        profileImage: { type: String },
        role: {
            type: String,
            required: true,
            enum: ["student", "faculty", "admin"],
            default: "student",
        },
        joinDate: {
            type: Date,
            default: Date.now,
        },
        courseIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],
    },
    { timestamps: true },
)

const User = mongoose.model("User", UserSchema)
export default User
