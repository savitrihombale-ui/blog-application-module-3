const express = require("express");
const Blog = require("../models/blog");
const auth = require("../middleware/auth");

const router = express.Router();

// CREATE BLOG
router.post("/", auth, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const blog = new Blog({
            title,
            content,
            category: category || "General",
            author: req.user.id
        });

        await blog.save();

        res.status(201).json({
            message: "Blog created successfully!",
            blog
        });

    } catch (error) {
        console.log("Create blog error:", error);

        res.status(500).json({
            message: "Blog creation failed",
            error: error.message
        });
    }
});

// GET MY BLOGS
router.get("/my", auth, async (req, res) => {
    try {
        const blogs = await Blog.find({
            author: req.user.id
        }).sort({ createdAt: -1 });

        res.json(blogs);

    } catch (error) {
        console.log("Get blogs error:", error);

        res.status(500).json({
            message: "Failed to get blogs",
            error: error.message
        });
    }
});

// GET ONE BLOG
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("author", "name email");

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get blog",
            error: error.message
        });
    }
});

// UPDATE BLOG
router.put("/:id", auth, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const blog = await Blog.findOne({
            _id: req.params.id,
            author: req.user.id
        });

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found or permission denied"
            });
        }

        blog.title = title;
        blog.content = content;
        blog.category = category || "General";

        await blog.save();

        res.json({
            message: "Blog updated successfully!",
            blog
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog update failed",
            error: error.message
        });
    }
});

// DELETE BLOG
router.delete("/:id", auth, async (req, res) => {
    try {
        const blog = await Blog.findOneAndDelete({
            _id: req.params.id,
            author: req.user.id
        });

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found or permission denied"
            });
        }

        res.json({
            message: "Blog deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog deletion failed",
            error: error.message
        });
    }
});

module.exports = router;