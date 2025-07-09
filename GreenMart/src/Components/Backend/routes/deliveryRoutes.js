const express = require("express");
const router = express.Router();
const db = require("../db"); // Import database connection
const bcrypt = require("bcryptjs");
require('dotenv').config({ path: '../.env' });
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default_access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";
const refreshTokens = []; // ✅ Temporary storage for refresh tokens (Use database in production)


// Password validation function
const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// 🔹 1️⃣ Delivery Boy Registration
router.post('/register-deliveryboy', async (req, res) => {
    const { name, phone, email, password, state, city, vehicleDetails } = req.body;

    if (!validatePassword(password)) {
        return res.status(400).json({ error: "Password must be at least 8 characters, include an uppercase letter, a number, and a special character." });
    }

    if (phone.length > 15) {
        return res.status(400).json({ error: "Phone number is too long! Max 15 digits." });
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
        return res.status(500).json({ error: "Error hashing password" });
    }

    const sql = "INSERT INTO delivery_boys (name, phone, email, password, state, city, vehicle_details) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [name, phone, email, hashedPassword, state, city, vehicleDetails], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Delivery Boy Registered Successfully!" });
    });
});

// 🔹 2️⃣ Delivery Boy Login
router.post('/login-deliveryboy', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM delivery_boys WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("❌ Database Query Error:", err.sqlMessage);
            return res.status(500).json({ error: "Database Query Error", details: err.sqlMessage });
        }

        if (results.length === 0) {
            console.warn("⚠️ Invalid Login Attempt: Email not found", email);
            return res.status(401).json({ error: "Invalid Credentials - Email not found" });
        }

        const user = results[0];

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                console.warn("⚠️ Invalid Password Attempt for:", email);
                return res.status(401).json({ error: "Invalid username or password!" });
            }

            // ✅ Generate Access Token (Valid for 24h)
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, role: "delivery_boy" },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '24h' }
            );

            // ✅ Generate Refresh Token (Valid for 7 days)
            const refreshToken = jwt.sign(
                { id: user.id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            console.log("🟢 Tokens Generated Successfully");

            return res.json({
                success: true,
                accessToken,
                refreshToken,
                id: user.id,
                email: user.email,
                role: "delivery_boy",
            });

        } catch (err) {
            console.error("❌ Internal Server Error:", err.message);
            return res.status(500).json({ error: "Internal Server Error", details: err.message });
        }
    });
});



router.post("/refresh-token", (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No refresh token provided" });
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ Refresh token verification failed:", err.message);
            return res.status(403).json({ error: "Unauthorized: Invalid refresh token" });
        }

        // ✅ Generate new access token
        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
        );

        console.log("🟢 New Access Token Issued");
        res.json({ accessToken: newAccessToken });
    });
});

router.delete("/logout", (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    // ✅ Remove refresh token from storage
    const index = refreshTokens.indexOf(token);
    if (index > -1) {
        refreshTokens.splice(index, 1);
    }

    res.json({ message: "Logged out successfully" });
});

// 🔹 3️⃣ Assign Order to Delivery Boy (Admin)
router.put("/assign-delivery-boy/:orderId", (req, res) => {
    const { orderId } = req.params;
    const { delivery_boy_id } = req.body;

    if (!delivery_boy_id) {
        return res.status(400).json({ error: "Delivery boy ID is required!" });
    }

    const sql = "UPDATE orders SET delivery_boy_id = ?, assigned_date = NOW() WHERE order_id = ?";
    
    db.query(sql, [delivery_boy_id, orderId], (err, result) => {
        if (err) {
            console.error("❌ Error assigning delivery boy:", err);
            return res.status(500).json({ error: "Database error" });
        }

        console.log("🟢 Delivery Boy Assigned to Order ID:", orderId, "at", new Date());
        res.json({ success: true, message: "Delivery Boy Assigned Successfully!" });
    });
});


// 🔹 4️⃣ Get Assigned Orders for Delivery Boy
router.get('/delivery-orders/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
    o.order_id, o.total_price, o.order_status, o.quantity, 
    o.assigned_date, o.out_for_delivery_date, o.delivered_date, pay.amount,
    p.name AS product_name, p.base_price,
    u.firstname AS customer_name, u.contact, u.shipping_address, 
    u.lastname, u.city, u.country, u.state,
      CONCAT(u.firstname, ' ', u.lastname) AS customer_name, 
    CONCAT(u.shipping_address, ', ', u.city, ', ', u.state) AS address, 
    d.name AS delivery_boy_name
FROM orders o
JOIN products p ON o.idproducts = p.idproducts
JOIN users u ON o.user_id = u.idusers
LEFT JOIN payments pay ON o.order_id = pay.order_id
JOIN delivery_boys d ON o.delivery_boy_id = d.id  -- Fixed missing comma issue
WHERE o.delivery_boy_id = ? AND o.order_status != 'cancelled'
ORDER BY o.assigned_date DESC`; // ✅ Orders grouped by assigned date
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching orders:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        console.log("🟢 Orders Fetched:", results);
        res.json(results);
    });
});



// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];  

    if (!token) {
        console.error("❌ No token provided");
        return res.status(403).json({ error: "Unauthorized: No token provided" });
    }

    console.log("🟢 Received Token:", token);  // ✅ Debugging received token

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => { // ✅ Ensure correct secret is used
        if (err) {
            console.error("❌ Token verification failed:", err.message);
            return res.status(403).json({ error: "Unauthorized: Invalid token" });
        }
        console.log("🟢 Token Decoded Successfully:", decoded);
        req.user = decoded;
        next();
    });
};


// Middleware to check token validity
const authenticateDeliveryBoy = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        console.error("❌ No token provided");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🟢 Received Token:", token);  // ✅ Log received token

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ Token verification failed:", err.message);
            return res.status(403).json({ error: "Unauthorized: Invalid token", details: err.message });
        }

        console.log("🟢 Token Decoded:", decoded);
        req.deliveryBoyId = decoded.id;  
        next();
    });
};


// Protect update order route
router.post("/update-status", authenticateDeliveryBoy, (req, res) => {
    const { order_ids, status } = req.body;
    const deliveryBoyId = req.deliveryBoyId;

    if (!order_ids || !status) {
        return res.status(400).json({ error: "Order IDs and status are required" });
    }

    let sql;
    let params;

    if (status === "delivered") {
        // ✅ Update delivered_date when status is changed to 'delivered'
        sql = `UPDATE orders SET order_status = ?, delivered_date = NOW() WHERE order_id IN (?) AND delivery_boy_id = ?`;
        params = [status, order_ids, deliveryBoyId];
    } else if (status === "out_for_delivery") {
        // ✅ Update out_for_delivery_date when status is changed to 'out_for_delivery'
        sql = `UPDATE orders SET order_status = ?, out_for_delivery_date = NOW() WHERE order_id IN (?) AND delivery_boy_id = ?`;
        params = [status, order_ids, deliveryBoyId];
    } else {
        // ✅ Only update the order status without changing dates
        sql = `UPDATE orders SET order_status = ? WHERE order_id IN (?) AND delivery_boy_id = ?`;
        params = [status, order_ids, deliveryBoyId];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("❌ Database error:", err.sqlMessage);
            return res.status(500).json({ error: "Database error", details: err.sqlMessage });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: "Unauthorized: Cannot update these orders" });
        }

        res.json({ success: true, message: "Order status updated successfully" });
    });
});







// // 🔹 6️⃣ Generate OTP & Send SMS to Customer
router.post('/generate-otp', (req, res) => {
    const { order_id, customer_phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const sql = "UPDATE orders SET otp = ? WHERE id = ?";

    db.query(sql, [otp, order_id], async (err) => {
        if (err) return res.status(500).json({ error: err });

        try {
            // Send OTP via Firebase Cloud Messaging (FCM) as an SMS or Notification
            const message = {
                notification: {
                    title: "GreenMart Delivery OTP",
                    body: `Your OTP for delivery confirmation is: ${otp}`
                },
                token: customer_phone // Use Firebase token if applicable
            };

            await admin.messaging().send(message);
            res.json({ message: "OTP Sent Successfully via Firebase!" });

        } catch (error) {
            res.status(500).json({ error: "Error sending OTP via Firebase", details: error.message });
        }
    });
});


// // 🔹 7️⃣ Verify OTP & Mark Order Delivered
router.post('/verify-otp', (req, res) => {
    const { order_id, entered_otp } = req.body;
    const sqlSelect = "SELECT otp FROM orders WHERE id = ?";
    const sqlUpdate = "UPDATE orders SET order_status = 'delivered' WHERE id = ?";

    db.query(sqlSelect, [order_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length > 0 && results[0].otp == entered_otp) {
            db.query(sqlUpdate, [order_id], (err) => {
                if (err) return res.status(500).json({ error: err });
                res.json({ message: "Order Delivered Successfully!" });
            });
        } else {
            res.status(400).json({ error: "Invalid OTP!" });
        }
    });
});



module.exports = router;
