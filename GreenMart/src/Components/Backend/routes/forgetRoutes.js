const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// ✅ Define generateToken function
const generateToken = () => crypto.randomBytes(20).toString("hex");

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ashwinimahajan1902@gmail.com",
    pass: "tyku hsek zrgw joib", // Make sure this is correct
  },
});

// Forgot Password Route
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const token = generateToken();
  const expiration = new Date(Date.now() + 3600000); // Token expires in 1 hour

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expiration, email],
      (err) => {
        if (err) {
          console.error("Token update error:", err);
          return res.status(500).json({ message: "Error updating token" });
        }

        const resetUrl = `http://localhost:5173/resetpassword/${token}`;
        const mailOptions = {
          from: '"GreenMart Support" <ashwinimahajan1902@gmail.com>',
          to: email,
          subject: "Password Reset",
          text: `Click the link to reset your password: ${resetUrl}`,
        };
        

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Email sending error:", error);
            return res.status(500).json({ message: "Email sending failed" });
          }
          console.log("Email sent:", info.response);
          res.json({ message: "Reset link sent to your email" });
        });
      }
    );
  });
});
// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  db.query("SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()", [token], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?", [hashedPassword, token], (err) => {
      if (err) return res.status(500).json({ message: "Error updating password" });
      res.json({ message: "Password reset successfully" });
    });
  });
});
module.exports = router;
