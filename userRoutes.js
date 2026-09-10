const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();


// =====================================
// REGISTER
// =====================================

router.post("/register", async (req, res) => {

    try {

        console.log("Register request received");

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = new User({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword
        });

        await newUser.save();

        console.log("User saved successfully");

        res.status(201).json({
            message: "Registration successful!"
        });

    } catch (error) {

        console.log("Registration error:");
        console.log(error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });

    }

});


// =====================================
// LOGIN
// =====================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful!",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });

    }

});


// =====================================
// PROFILE
// =====================================

router.get("/profile", auth, async (req, res) => {

    try {

        const user = await User.findById(
            req.user.id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        console.log("Profile error:", error);

        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });

    }

});


module.exports = router;