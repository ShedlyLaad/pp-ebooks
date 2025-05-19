import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Your name cannot exceed 30 characters"],
        minLength: [4, "Your name should have more than 4 characters"],
    },
    lastname: {
        type: String,
        required: [true, "Please enter your lastname"],
        maxLength: [30, "Your lastname cannot exceed 30 characters"],
        minLength: [4, "Your lastname should have more than 4 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Your password should be greater than 8 characters"],
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "author", "admin"],
    },
    photo: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    timezone: {
        type: String,
        default: "+1 GMT",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
