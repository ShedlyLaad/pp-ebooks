import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { name, lastname, email, password, role, photo } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
    }
    
    // Vérifier que le rôle est valide
    const finalRole = role || "user";
    if (!["user", "author", "admin"].includes(finalRole)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      lastname, 
      email, 
      password: hashedPassword, 
      role: finalRole, 
      photo: photo || "",
      isActive: true
    });
    
    const savedUser = await newUser.save();
    const token = jwt.sign(
      { 
        id: savedUser._id, 
        role: savedUser.role,
        name: savedUser.name,
        lastname: savedUser.lastname
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json({ 
      message: "Utilisateur créé avec succès!", 
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Un utilisateur avec cet email existe déjà" 
      });
    }
    res.status(500).json({ 
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Email ou mot de passe invalide" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Ce compte est désactivé" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        lastname: user.lastname
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ 
      message: "Connexion réussie", 
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    ).select('-password');
    
    if (!updatedUser) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json({ message: "User Deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString("hex");
        
        // Hash and save to database
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
            
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
        
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50; text-align: center;">Password Reset Request</h2>
                <p>Dear ${user.name},</p>
                <p>You have requested to reset your password. Click the link below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>This link will expire in 15 minutes.</p>
                <div style="margin-top: 20px; text-align: center; color: #666;">
                    <p>BiblioF - Your Digital Library</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "BiblioF Password Recovery",
                html: emailHtml
            });

            res.status(200).json({
                success: true,
                message: "Email sent successfully"
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: "Email could not be sent"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset token is invalid or has expired"
            });
        }

        // Set new password
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role,
                name: user.name,
                lastname: user.lastname
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: "24h" }
        );

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const updates = {
            name: req.body.name,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            linkedIn: req.body.linkedIn
        };

        // Filter out undefined values
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

export const updateUserProfile = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user.id;
    const { name, lastname, email, phone, timezone } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Update fields
    user.name = name || user.name;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.timezone = timezone || user.timezone;

    // Save user
    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil",
      error: error.message
    });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user.id;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucune image n'a été fournie"
      });
    }

    // Get file path
    const profileImage = req.file.path;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Update profile image
    user.photo = profileImage;
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Photo de profil mise à jour avec succès",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la photo de profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la photo de profil",
      error: error.message
    });
  }
};
