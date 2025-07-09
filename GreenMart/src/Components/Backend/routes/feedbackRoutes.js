const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db"); // Import MySQL connection
const router = express.Router();

// ✅ Set up image upload directory
const storage = multer.diskStorage({
  destination: "./public/ProductImg/", // Save images in public/ProductImg folder
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
  },
});

const upload = multer({ storage });

// ✅ API to Fetch Feedback with User Details
router.get("/feedbackp", (req, res) => {
  const sql = `
    SELECT f.id, f.message, f.image_url, f.created_at, f.status,f.username,f.email
    FROM feedbacks f

    ORDER BY f.created_at DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.put("/update-status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "processing", "resolved"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value!" });
  }

  const sql = "UPDATE feedbacks SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Status updated successfully!" });
  });
});


// ✅ API to Submit Feedback (Insert Message & Image into Database)
router.post("/feedbackp", upload.single("image"), (req, res) => {
  const { user_id, username, email, message } = req.body; // Get user details

  if (!message) {
    return res.status(400).json({ error: "Message is required!" });
  }

  const image_url = req.file ? `/ProductImg/${req.file.filename}` : null;

  // ✅ Insert feedback into the database
  db.query(
    "INSERT INTO feedbacks (user_id, username, email, message, image_url) VALUES (?, ?, ?, ?, ?)",
    [user_id || null, username, email, message, image_url],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Feedback submitted successfully!" });
    }
  );
});


module.exports = router;
