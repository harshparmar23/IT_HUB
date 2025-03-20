import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("MongoDB connected successfully"))
            .catch((err) => console.error("MongoDB connection error:", err));

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;
