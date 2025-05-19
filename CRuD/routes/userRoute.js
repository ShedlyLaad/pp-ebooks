import express from "express";
import {
    register as registerUser,
    login as loginUser,
    forgotPassword,
    resetPassword,
    fetchUsers as getAllUsers,
    fetchOneUser as getSingleUser,
    updateUser as updateUserRole,
    updateUserProfile,
    updateProfileImage,
    deleteUser,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

// Protected routes
router.get("/me", isAuthenticated, getSingleUser);
router.put("/users/profile", isAuthenticated, updateUserProfile);
router.put("/users/profile/image", isAuthenticated, upload.single('profileImage'), updateProfileImage);

// Admin routes
router.get("/admin/users", isAuthenticated, isAdmin, getAllUsers);
router.get("/admin/user/:id", isAuthenticated, isAdmin, getSingleUser);
router.put("/admin/user/:id", isAuthenticated, isAdmin, updateUserRole);
router.delete("/admin/user/:id", isAuthenticated, isAdmin, deleteUser);

export default router;
