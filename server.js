const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Blog API is working"
    });
});

console.log("Starting server...");
console.log("MONGO_URI exists:", !!MONGO_URI);

if (!MONGO_URI) {
    console.log("MONGO_URI is missing");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {

        console.log(
            "MongoDB connected successfully!"
        );

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });

    })
    .catch((error) => {

        console.log(
            "MongoDB connection failed:"
        );

        console.log(error.message);

    });