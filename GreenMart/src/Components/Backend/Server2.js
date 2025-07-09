const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const productRoutes = require("./productRoutes"); // Import product routes
const orderRoutes = require("./orderRoutes"); // Import the file
const dashboardRoutes = require("./dashboardRoutes"); // Import user routes
// Import Routes
const deliveryRoutes = require("./routes/deliveryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const forgetRoutes = require("./routes/forgetRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/ProductImg",
  express.static(path.join(__dirname, "public/ProductImg"))
);
app.use("/api", require("./productRoutes"));
// ✅ Use the Order Routes
app.use("/api", dashboardRoutes);
// ✅ Use the Order Routes
app.use("/api", orderRoutes);
// ✅ Routes
app.use("/api", productRoutes);
app.use("/api/delivery", deliveryRoutes); // Base route for delivery system
app.use("/api/feedback", feedbackRoutes); // Base route for delivery system
app.use("/api", forgetRoutes); // Base route for delivery system

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ashwini@12",
  database: "greenmart1",
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to database:", err);
  } else {
    console.log("Connected to database!");
  }
});

let refreshTokens = []; // Initialize an empty array to store refresh tokens

// Access environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generate Access and Refresh Tokens
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
};

// Refresh Token Route
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403); // Check if the token exists

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// Logout Route
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token); // Remove the token from the array
  res.sendStatus(204);
});

// User Registration Route
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character!",
    });
  }

  try {
    const checkUserQuery =
      "SELECT * FROM users WHERE username = ? OR email = ?";
    db.query(checkUserQuery, [username, email], async (err, result) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });

      if (result.length > 0) {
        return res
          .status(409)
          .json({ message: "Username or email already exists!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const sqlInsertUser =
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";

      db.query(
        sqlInsertUser,
        [username, email, hashedPassword, role],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Error inserting user", error: err });

          res.status(201).json({
            message: "User registered successfully!",
            idusers: result.insertId,
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

// User Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required!" });
  }

  const sqlSelect = "SELECT * FROM users WHERE username = ?";
  db.query(sqlSelect, [username], async (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid username or password!" });
    }

    const user = result[0];

    try {
      // Check the password first
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password!" });
      }

      // After successful password comparison, create the tokens and respond
      const accessToken = generateAccessToken({
        idusers: user.idusers,
        email: user.email,
        role: user.role,
      });
      const refreshToken = generateRefreshToken({
        idusers: user.idusers,
        email: user.email,
        role: user.role,
      });

      refreshTokens.push(refreshToken);

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        idusers: user.idusers,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (err) {
      console.error("Error during password comparison:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err });
    }
  });
});

// User Panel Route (Update or Insert)
app.post("/userpanel", (req, res) => {
  const {
    firstname,
    lastname,
    shipping_address,
    city,
    state,
    country,
    contact,
    email,
    birthdate,
    gender,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !shipping_address ||
    !city ||
    !state ||
    !country ||
    !contact ||
    !email ||
    !birthdate ||
    !gender
  ) {
    return res.status(400).send({ message: "All fields are required!" });
  }

  // First, check if the user exists
  const sqlSelect = "SELECT idusers FROM users WHERE email = ?";
  db.query(sqlSelect, [email], (err, result) => {
    if (err) {
      console.error("Database Select Error:", err);
      return res.status(500).send({ message: "Error occurred", error: err });
    }

    if (result.length === 0) {
      return res.status(404).send({ message: "User not found!" });
    }

    const idusers = result[0].idusers; // Fetch user ID

    // Check if there's existing panel data to update
    const sqlPanelSelect = "SELECT * FROM users WHERE idusers = ?";
    db.query(sqlPanelSelect, [idusers], (err, panelResult) => {
      if (err) {
        console.error("Database Select Error:", err);
        return res
          .status(500)
          .send({ message: "Error checking userpanel data", error: err });
      }

      if (panelResult.length > 0) {
        // Update existing user panel data
        const sqlUpdate = `
          UPDATE users 
          SET firstname = ?, lastname = ?, shipping_address = ?, city = ?, state = ?, country = ?, contact = ?, birthdate = ?, gender = ?
          WHERE idusers = ?
        `;
        db.query(
          sqlUpdate,
          [
            firstname,
            lastname,
            shipping_address,
            city,
            state,
            country,
            contact,
            birthdate,
            gender,
            idusers,
          ],
          (err) => {
            if (err) {
              console.error("Database Update Error:", err);
              return res
                .status(500)
                .send({ message: "Error updating userpanel", error: err });
            } else {
              res
                .status(200)
                .send({ message: "User panel updated successfully!" });
            }
          }
        );
      } else {
        // Insert new panel data if no existing record
        const sqlInsert = `
          INSERT INTO users (firstname, lastname, shipping_address, city, state, country, contact, email, birthdate, gender, idusers)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          sqlInsert,
          [
            firstname,
            lastname,
            shipping_address,
            city,
            state,
            country,
            contact,
            email,
            birthdate,
            gender,
            idusers,
          ],
          (err) => {
            if (err) {
              console.error("Database Insert Error:", err);
              return res
                .status(500)
                .send({ message: "Error saving userpanel data", error: err });
            } else {
              res
                .status(200)
                .send({ message: "User panel data saved successfully!" });
            }
          }
        );
      }
    });
  });
});

// Get User By Email Route
app.get("/getUserByEmail", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sqlSelect =
    "SELECT firstname, lastname, shipping_address, city, state, country, birthdate, gender,email, contact FROM users WHERE email = ?";
  db.query(sqlSelect, [email], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Failed to fetch user data" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result[0]); // Return the first matched user
  });
});

// Change Password Route
app.post("/changePassword", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).send({
      message: "Email, current password, and new password are required!",
    });
  }

  // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character!",
    });
  }

  try {
    // Fetch user by email
    const sqlGetUser = "SELECT password FROM users WHERE email = ?";
    db.query(sqlGetUser, [email], async (err, results) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).send({ message: "Database error", error: err });
      }

      if (results.length === 0) {
        return res.status(404).send({ message: "User not found!" });
      }

      const storedPassword = results[0].password;

      // Compare provided current password with stored hashed password
      const isMatch = await bcrypt.compare(currentPassword, storedPassword);
      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Current password is incorrect!" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in the database
      const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?";
      db.query(sqlUpdate, [hashedPassword, email], (err, result) => {
        if (err) {
          console.error("Database Update Error:", err);
          return res
            .status(500)
            .send({ message: "Error updating password", error: err });
        }

        res.status(200).send({ message: "Password updated successfully!" });
      });
    });
  } catch (err) {
    res.status(500).send({ message: "Internal server error", error: err });
  }
});

// // ✅ Fix API endpoint with proper CORS handling
app.get("/api/allproducts", (req, res) => {
  const { category, subcategory } = req.query;
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }
  let query = `
    SELECT 
      idproducts, 
      name, 
      description, 
      base_price,  
       image AS image_name,
      category,
      stock,
      subcategory,
      rating,
      popularity
    FROM products
  `;

  let queryParams = [];
  if (category) {
    query += " WHERE category = ?";
    queryParams.push(category);
  }
  if (subcategory) {
    query += category ? " AND subcategory = ?" : " WHERE subcategory = ?";
    queryParams.push(subcategory);
  }
  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json(results);
  });
});


app.post("/orders", (req, res) => {
  const { userId, productId, quantity, cartSessionId } = req.body;


  if (!userId || !productId || !quantity) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // ✅ Ensure the product exists in the products table before inserting into orders
  db.query(
    "SELECT * FROM orders WHERE user_Id = ? AND idproducts = ? AND order_status = 'pending' AND cart_session_id = ?",
    [userId, productId, cartSessionId],
    (error, results) => {
      if (results.length > 0) {
        return res.status(409).json({
          message: "Product already added in this session.",
          success: false,
        });
      }
  
      // ✅ insert new item
      const insertQuery = `
        INSERT INTO orders (user_Id, idproducts, quantity, total_price, order_status, cart_session_id)
        VALUES (?, ?, ?, (SELECT base_price FROM products WHERE idproducts = ?) * ?, 'pending', ?)
      `;
  
      db.query(
        insertQuery,
        [userId, productId, quantity, productId, quantity, cartSessionId],
        (insertErr, insertResult) => {
          if (insertErr) {
            return res.status(500).json({ message: "Insert failed", error: insertErr });
          }
  
          res.status(200).json({ message: "Product added to cart successfully", success: true });
        }
      );
    }
  );
  
});

// // Endpoint to fetch all orders for a specific user
app.get("/userorders", (req, res) => {
  const { userId } = req.query;

  const query = `
    SELECT 
      p.name AS product_name, 
      p.idproducts,
      COALESCE(p.base_price, 0) AS base_price,
      o.quantity, 
      o.order_id,   
      o.cart_session_id,
      o.order_date,
      COALESCE(o.total_price, 0) AS total_price,
      p.image AS image_name,
      CASE 
        WHEN pay.payment_id IS NOT NULL THEN 'Paid'
        ELSE 'Unpaid'
      END AS payment_status
    FROM orders o
    JOIN products p ON o.idproducts = p.idproducts
    LEFT JOIN payments pay ON o.order_id = pay.order_id
    WHERE o.user_Id = ?
    ORDER BY o.order_date DESC;
  `;

  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching user orders:", error);
      return res.status(500).send("Error fetching user orders");
    }
    res.status(200).json(results);
  });
});


app.get("/myorders", (req, res) => {
  const { email } = req.query;
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }
  if (!email) {
    console.warn("⚠️ Email is missing in request.");
    return res.status(200).json([]); // Return an empty array instead of an error
  }

  console.log("📢 Fetching orders for:", email);

  const query = `
    SELECT 
      p.payment_id, p.payment_status, p.payment_method, p.payment_date, p.amount, 
      o.order_id, o.total_price, o.order_status, o.quantity, o.delivered_date,
      u.shipping_address, u.city, u.state, u.country, u.contact, 
      pr.idproducts, pr.name AS product_name, 
           image AS image_name, pr.base_price
    FROM orders o
    JOIN products pr ON o.idproducts = pr.idproducts -- Fetch product details
    LEFT JOIN payments p ON p.order_id = o.order_id -- Fetch payment details
   JOIN users u ON o.user_id = u.idusers -- Fetch user details
    WHERE u.email = ?`;

  console.log("🟡 Running Query:", query, "with email:", email); // Log query

  db.query(query, [email], (error, results) => {
    if (error) {
      console.error("❌ SQL Query Error:", error); // Print exact SQL error
      return res
        .status(500)
        .json({ error: "Failed to fetch user orders", details: error.message });
    }

    console.log("✅ Query executed successfully, results:", results);
    return res.status(200).json(results);
  });
});
// API to finalize the cart and store updated information
app.post("/buy-now", (req, res) => { 
  const cartItems = req.body.cart;

  const updatePromises = cartItems.map((item) => {
    const { idproducts, quantity = 1 } = item;

    let sql = `
      UPDATE orders o
      JOIN products p ON o.idproducts = p.idproducts
      SET o.quantity = ?, o.total_price = COALESCE(p.base_price * ?, 1)
      WHERE o.idproducts = ? AND o.user_id = ? 
    `;

    return new Promise((resolve, reject) => {
      db.query(sql, [quantity, quantity, idproducts, req.body.userId], (err, result) => {
        if (err) {
          console.error("Error processing purchase:", err);
          reject({ message: "Error processing purchase", error: err });
        }
        resolve(result);
      });
    });
  });

  Promise.all(updatePromises)
    .then(() => res.json({ success: true, message: "Purchase completed successfully!" }))
    .catch((err) => res.status(500).json(err));
}); 



// In Server2.js
// change from DELETE to POST
app.post('/clear-unpaid-orders', (req, res) => {
  const { idusers } = req.body;
  const sql = "DELETE FROM orders WHERE order_status = 'pending'  AND user_id = ?";

  db.query(sql, [idusers], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    return res.status(200).json({ message: 'Unpaid orders cleared successfully' });
  });
});


// API to finalize the cart and store updated information
app.post("/orders/update-quantity", async (req, res) => {
  const { idproducts, quantity, userId } = req.body;

  if (!idproducts || !quantity || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sql = `
      UPDATE orders o
      JOIN products p ON o.idproducts = p.idproducts
      SET o.quantity = ?, o.total_price = p.base_price * ?
      WHERE o.idproducts = ? AND o.user_Id = ?
    `;

    db.query(sql, [quantity, quantity, idproducts, userId]);

    res.json({ success: true, message: "Quantity and total price updated" });
  } catch (error) {
    console.error("Error updating quantity and price:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Cancel Order API (With Reason)
// Cancel / Return Order API (With Reason)
app.post("/update-order-status", (req, res) => {
  const { orderId, productId, reason, returnQty, returnAmount, type } =
    req.body;

  const order_id = orderId;
  const product_id = productId;

  console.log(
    `🔄 ${type} request received for order:`,
    order_id,
    "Reason:",
    reason
  );

  if (!order_id || !product_id || !reason || !type) {
    return res.status(400).json({
      message: "Order ID, Product ID, reason, and type are required",
    });
  }

  let newStatus;

  if (type === "cancel") {
    newStatus = "cancelled";

    db.query(
      "SELECT total_price, order_status FROM orders WHERE order_id = ?",
      [order_id],
      (err, results) => {
        if (err) {
          console.error("❌ Error fetching order:", err);
          return res
            .status(500)
            .json({ message: "Error fetching order", error: err });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Order not found" });
        }

        const refundAmount = results[0].total_price;
        const orderStatus = results[0].order_status;

        if (orderStatus === "pending") {
          // Cancel pending order only
          db.query(
            "UPDATE orders SET order_status = ?, cancellation_reason = ? WHERE order_id = ?",
            [newStatus, reason, order_id],
            (err2) => {
              if (err2) {
                console.error("❌ Error updating order:", err2);
                return res
                  .status(500)
                  .json({ message: "Database update failed", error: err2 });
              }

              console.log(
                `✅ Pending order cancelled without payment update: ${order_id}`
              );
              return res.status(200).json({
                success: true,
                message: `Pending order cancelled successfully`,
              });
            }
          );
        } else {
          // Cancel confirmed/paid order
          db.query(
            "SELECT payment_date FROM payments WHERE order_id = ?",
            [order_id],
            (err2, paymentRows) => {
              if (err2 || paymentRows.length === 0) {
                return res.status(500).json({ message: "Payment not found" });
              }

              const { payment_date } = paymentRows[0];

              db.query(
                "SELECT payment_id, amount FROM payments WHERE payment_date = ?",
                [payment_date],
                (err3, relatedPayments) => {
                  if (err3 || relatedPayments.length === 0) {
                    return res
                      .status(500)
                      .json({ message: "Error finding related payments" });
                  }

                  const totalAmount = relatedPayments.reduce(
                    (sum, row) => sum + row.amount,
                    0
                  );

                  const refundPromises = relatedPayments.map((row) => {
                    const deduct = (row.amount / totalAmount) * refundAmount;
                    return new Promise((resolve, reject) => {
                      db.query(
                        "UPDATE payments SET amount = amount - ? WHERE payment_id = ?",
                        [deduct, row.payment_id],
                        (err4) => {
                          if (err4) reject(err4);
                          else resolve();
                        }
                      );
                    });
                  });

                  Promise.all(refundPromises)
                    .then(() => {
                      db.query(
                        "UPDATE orders SET order_status = ?, cancellation_reason = ? WHERE order_id = ?",
                        [newStatus, reason, order_id],
                        (err5) => {
                          if (err5) {
                            return res
                              .status(500)
                              .json({ message: "Order update failed" });
                          }

                          console.log(
                            `✅ Cancelled order ${order_id}, all related payments adjusted`
                          );
                          res.status(200).json({
                            success: true,
                            message: `Order cancelled and payments updated`,
                          });
                        }
                      );
                    })
                    .catch((err) => {
                      return res
                        .status(500)
                        .json({
                          error: "Error updating grouped payments",
                          details: err,
                        });
                    });
                }
              );
            }
          );
        }
      }
    );
  } else if (type === "return") {
    newStatus = "returned";

    // Step 1: Check quantity
    db.query(
      "SELECT quantity FROM orders WHERE order_id = ? AND idproducts = ?",
      [order_id, product_id],
      (err, orderItemRows) => {
        if (err) {
          return res
            .status(500)
            .json({
              error: "Database error while checking quantity",
              details: err,
            });
        }

        const orderItem = orderItemRows[0];
        if (!orderItem || orderItem.quantity < returnQty) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid return quantity" });
        }
        // ✅ Calculate return expiry
        const orderDate = new Date(orderItem.delivered_date);
        const today = new Date();
        const diffInDays = (today - orderDate) / (1000 * 3600 * 24);

        if (diffInDays > 7) {
          return res.status(400).json({
            success: false,
            message:
              "Return period expired. Returns are only allowed within 7 days of delivery.",
          });
        }
        // Step 2: Subtract quantity from orders table
        db.query(
          "UPDATE orders SET quantity = quantity - ? WHERE order_id = ? AND idproducts = ?",
          [returnQty, order_id, product_id],
          (err2) => {
            if (err2) {
              return res
                .status(500)
                .json({ error: "Failed to update quantity", details: err2 });
            }

            // Step 3: Get payment_date of this order
            db.query(
              "SELECT payment_date FROM payments WHERE order_id = ?",
              [order_id],
              (err3, result3) => {
                if (err3 || result3.length === 0) {
                  return res
                    .status(500)
                    .json({ error: "Payment date not found", details: err3 });
                }

                const paymentDate = result3[0].payment_date;

                // Step 4: Get all payments with same payment_date
                db.query(
                  "SELECT payment_id, amount FROM payments WHERE payment_date = ?",
                  [paymentDate],
                  (err4, paymentRows) => {
                    if (err4 || paymentRows.length === 0) {
                      return res
                        .status(500)
                        .json({
                          error: "Grouped payments fetch failed",
                          details: err4,
                        });
                    }

                    const totalAmount = paymentRows.reduce(
                      (sum, row) => sum + row.amount,
                      0
                    );

                    if (totalAmount === 0) {
                      return res
                        .status(400)
                        .json({
                          message: "Total payment amount is 0, can't update",
                        });
                    }

                    // Step 5: Proportionally subtract returnAmount from each payment
                    const updates = paymentRows.map((row) => {
                      const cut = (row.amount / totalAmount) * returnAmount;
                      return new Promise((resolve, reject) => {
                        db.query(
                          "UPDATE payments SET amount = amount - ? WHERE payment_id = ?",
                          [cut, row.payment_id],
                          (err5) => {
                            if (err5) reject(err5);
                            else resolve();
                          }
                        );
                      });
                    });

                    // Step 6: Run all updates and then update order
                    Promise.all(updates)
                      .then(() => {
                        // Step 7: Update return details in orders table
                        db.query(
                          "UPDATE orders SET return_qty = ?, return_amount = ?, cancellation_reason = ?, order_status = ? WHERE order_id = ? AND idproducts = ?",
                          [
                            returnQty,
                            returnAmount,
                            reason,
                            newStatus,
                            order_id,
                            product_id,
                          ],
                          (err6) => {
                            if (err6) {
                              return res
                                .status(500)
                                .json({
                                  error: "Failed to update return info",
                                  details: err6,
                                });
                            }

                            res.json({
                              success: true,
                              message:
                                "Return processed and grouped payments updated successfully",
                            });
                          }
                        );
                      })
                      .catch((err) => {
                        return res
                          .status(500)
                          .json({
                            error: "Error updating grouped payments",
                            details: err,
                          });
                      });
                  }
                );
              }
            );
          }
        );
      }
    );
  } else {
    return res.status(400).json({ message: "Invalid type provided" });
  }
});

app.post("/orders/remove", (req, res) => {
  const { idproducts } = req.body;

  // Step 1: Delete associated payments first
  const deletePaymentsSQL =
    "DELETE FROM payments WHERE order_id IN (SELECT order_id FROM orders WHERE idproducts = ?)";

  db.query(deletePaymentsSQL, [idproducts], (err, paymentResult) => {
    if (err) {
      console.error("Error removing payment record:", err);
      return res
        .status(500)
        .send({ message: "Error removing payment record", error: err });
    }

    // Step 2: Now delete the order since its reference in `payments` is removed
    const deleteOrdersSQL = "DELETE FROM orders WHERE idproducts = ?";

    db.query(deleteOrdersSQL, [idproducts], (err, orderResult) => {
      if (err) {
        console.error("Error removing item from cart:", err);
        return res
          .status(500)
          .send({ message: "Error removing item from cart", error: err });
      }

      res.send({
        message: "Item removed successfully!",
        deletedOrder: orderResult,
        deletedPayment: paymentResult,
      });
    });
  });
});

app.post("/orders/clear", (req, res) => {
  const { idusers } = req.body;

  // First, delete related payments before deleting orders
  const deletePaymentsSql =
    "DELETE FROM payments WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)";
  const deleteOrdersSql = "DELETE FROM orders WHERE user_id = ?";

  db.query(deletePaymentsSql, [idusers], (err, result) => {
    if (err) {
      console.error("Error deleting payments:", err);
      return res
        .status(500)
        .send({ message: "Error deleting payments", error: err });
    }

    db.query(deleteOrdersSql, [idusers], (err, result) => {
      if (err) {
        console.error("Error clearing cart:", err);
        return res
          .status(500)
          .send({ message: "Error clearing cart", error: err });
      }
      res.send("Cart cleared successfully!");
    });
  });
});

app.get("/payments", (req, res) => {
  const { payment_ids } = req.query;

  if (!payment_ids) {
    return res.status(400).json({ error: "Payment IDs are required" });
  }
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }
  const paymentIdsArray = payment_ids
    .split(",")
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id));

  if (paymentIdsArray.length === 0) {
    return res.status(400).json({ error: "No valid payment IDs provided." });
  }

  let sql = `
    SELECT 
      p.payment_id, o.user_id, u.firstname, u.lastname, u.email, u.shipping_address, 
      u.city, u.state, u.country, u.contact, p.payment_date, p.amount, 
      p.payment_method, p.payment_status,
      prod.name AS product_name, o.quantity, o.total_price, o.order_status
    FROM payments p
    JOIN orders o ON p.order_id = o.order_id
    JOIN products prod ON o.idproducts = prod.idproducts
    JOIN users u ON o.user_id = u.idusers
    WHERE p.payment_id IN (${paymentIdsArray.map(() => "?").join(",")})
  `;

  console.log("✅ Running SQL Query:", sql, "Values:", paymentIdsArray);

  db.query(sql, paymentIdsArray, (err, results) => {
    if (err) {
      console.error("❌ Error fetching payments:", err);
      return res.status(500).json({ error: "Failed to fetch payment details" });
    }
    return res.status(200).json(results);
  });
});

app.get("/latest-payment-ids", (req, res) => {
  const { email, order_ids } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!order_ids) {
    return res.status(400).json({ error: "Order IDs are required" });
  }
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }
  const orderIdsArray = order_ids.split(",").map((id) => parseInt(id, 10)); // Convert IDs to numbers

  if (orderIdsArray.length === 0) {
    return res.status(400).json({ error: "No valid order IDs provided." });
  }

  let sql = `
    SELECT p.payment_id, p.order_id, p.payment_date
    FROM payments p
    WHERE (p.order_id, p.payment_date) IN (
      SELECT order_id, MAX(payment_date) 
      FROM payments 
      WHERE order_id IN (${orderIdsArray.map(() => "?").join(",")})
      GROUP BY order_id
    )
    ORDER BY p.payment_date DESC
  `;

  console.log("✅ Fetching latest payment IDs:", sql, "Values:", orderIdsArray); // Debugging

  db.query(sql, [...orderIdsArray], (err, results) => {
    if (err) {
      console.error("❌ Error fetching payment IDs:", err);
      return res.status(500).json({ error: "Failed to fetch payment IDs" });
    }

    console.log("✅ Latest Payment IDs:", results);
    return res.status(200).json(results); // Returns only payment_id and order_id
  });
});

// ✅ POST Payment (Record a new payment)
app.post("/payments", (req, res) => {
  const { orderDetails, total_amount, payment_method, payment_status } =
    req.body;

  if (!orderDetails || !total_amount || !payment_method || !payment_status) {
    return res.status(400).json({ error: "Missing required payment details" });
  }
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }
  // ✅ Insert payment for each order separately
  const values = orderDetails.map((order) => [
    order.order_id,
    total_amount, // Store the total bill amount once
    payment_method,
    payment_status,
  ]);

  const sql = `
    INSERT INTO payments (order_id,amount, payment_method, payment_status)
    VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error inserting payment:", err);
      return res.status(500).json({ error: "Payment processing failed" });
    }
    return res.json({
      success: true,
      message: "Payment recorded successfully",
      payment_id: result.insertId,
    });
  });
});

app.post("/updateOrderStatus", async (req, res) => {
  const { orderIds, order_status, payment_method } = req.body;

  if (!orderIds || orderIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Order IDs are required" });
  }
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }

  // ✅ If COD, mark as 'Confirmed' instead of 'Shipped'
  const updatedStatus = payment_method === "cod" ? "confirmed" : order_status;

  try {
    const updateQuery = `
      UPDATE orders 
      SET order_status = ? 
      WHERE order_id IN (${orderIds.map(() => "?").join(",")})
    `;
    await db.query(updateQuery, [updatedStatus, ...orderIds]);

    res.json({
      success: true,
      message: `Order status updated to ${updatedStatus}`,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Database update failed" });
  }
});

// API to fetch gardeners based on filters
app.get("/gardeners", (req, res) => {
  const { state, city, education, gender } = req.query;

  if (!state && !city && !education && !gender) {
    return res.json([]); // If no filters are selected, return an empty list
  }
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }

  let sql = "SELECT * FROM gardeners WHERE 1=1";
  let params = [];

  if (state) {
    sql += " AND state = ?";
    params.push(state);
  }
  if (city) {
    sql += " AND city = ?";
    params.push(city);
  }
  if (education && education !== "All") {
    sql += " AND education = ?";
    params.push(education);
  }
  if (gender && gender !== "All") {
    sql += " AND gender = ?";
    params.push(gender);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching gardeners:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// API to appoint a gardener
app.post("/appoint", (req, res) => {
  const { userId, gardenerId, duration, work_time, joining_date, total_fees } =
    req.body;

  if (
    !userId ||
    !gardenerId ||
    !duration ||
    !work_time ||
    !joining_date ||
    !total_fees
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  // if (user[0].status === "Inactive") {
  //   return res.status(403).json({ message: "Your account is inactive. You cannot place orders." });
  // }
  // Check if gardener is already booked
  const checkGardenerSql =
    "SELECT * FROM gardeners WHERE idgardeners = ? AND book = 1";
  db.query(checkGardenerSql, [gardenerId], (err, results) => {
    if (err) {
      console.error("Error checking gardener status:", err);
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Gardener is already booked!" });
    }

    // Update gardener's booking status
    const updateGardenerSql = `
      UPDATE gardeners 
      SET duration = ?, work_time = ?, joining_date = ?, fees = ?, book = 1 
      WHERE idgardeners = ?
    `;
    db.query(
      updateGardenerSql,
      [duration, work_time, joining_date, total_fees, gardenerId],
      (err, updateGardenerResult) => {
        if (err) {
          console.error("Error updating gardener:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err.message });
        }

        const updateUserSql =
          "UPDATE users SET idgardeners = ? WHERE idusers = ?";
        db.query(
          updateUserSql,
          [gardenerId, userId],
          (err, updateUserResult) => {
            if (err) {
              console.error("Error updating user:", err);
              return res
                .status(500)
                .json({ message: "Database error", error: err.message });
            }

            res
              .status(200)
              .json({ message: "Gardener appointed successfully!" });
          }
        );
      }
    );
  });
});
// API to remove a gardener
app.delete("/remove-gardener", (req, res) => {
  const { userId, gardenerId } = req.body;

  if (!userId || !gardenerId) {
    return res
      .status(400)
      .json({ message: "User ID and Gardener ID are required!" });
  }

  const deleteUserGardenerSql =
    "UPDATE users SET idgardeners = NULL WHERE idusers = ?";
  db.query(deleteUserGardenerSql, [userId], (err, deleteUserResult) => {
    if (err) {
      console.error("Error removing gardener from user:", err);
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }

    const updateGardenerStatusSql =
      "UPDATE gardeners SET book = 0 WHERE idgardeners = ?";
    db.query(
      updateGardenerStatusSql,
      [gardenerId],
      (err, updateGardenerResult) => {
        if (err) {
          console.error("Error updating gardener status:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err.message });
        }

        res.status(200).json({ message: "Gardener removed successfully!" });
      }
    );
  });
});

// API to fetch appointed gardener details for a user
app.get("/user-appointed-gardener", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const sql = `
    SELECT g.* FROM users u 
    JOIN gardeners g ON u.idgardeners = g.idgardeners 
    WHERE u.idusers = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching appointed gardener:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(200).json({ gardener: result[0] });
    } else {
      return res.status(200).json({ gardener: null }); // No gardener appointed
    }
  });
});

// // Change Password Route
// app.post("/adminchangePassword", async (req, res) => {
//   const { email, newPassword } = req.body;

//   if (!email || !newPassword) {
//     console.log("Request missing email or newPassword");
//     return res.status(400).send({ message: "Email and new password are required!" });
//   }

//   try {
//     const Password = await bcrypt.hash(newPassword, 10);
//     console.log("Updating password for:", email);

//     const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?";
//     db.query(sqlUpdate, [Password, email], (err, result) => {
//       if (err) {
//         console.error("Database Update Error:", err);
//         return res.status(500).send({ message: "Error updating password", error: err });
//       }

//       if (result.affectedRows === 0) {
//         console.log("No user found for email:", email);
//         return res.status(404).send({ message: "User not found!" });
//       }

//       console.log("Password updated successfully for:", email);
//       res.status(200).send({ message: "Password updated successfully!" });
//     });
//   } catch (err) {
//     console.error("Error hashing password:", err);
//     res.status(500).send({ message: "Internal server error", error: err });
//   }
// });

app.get("/getadminusers", (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'customer'"; // Fixed quotes

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(200).json({ users: result });
    } else {
      return res.status(200).json({ users: [] });
    }
  });
});

// 🟡 Update User
app.put("/updateuserstatus/:idusers", async (req, res) => {
  const { status } = req.body;
  const { idusers } = req.params; // Corrected parameter name

  try {
    db.query(
      "UPDATE users SET status = ? WHERE idusers = ?",
      [status, idusers],
      (err, result) => {
        if (err) {
          console.error("Error updating user status:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error updating status" });
        }
        res.json({
          success: true,
          message: "User status updated successfully",
        });
      }
    );
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Database update failed" });
  }
});
app.get("/getUserDetails/:idusers", (req, res) => {
  const { idusers } = req.params;

  const sqlUser = "SELECT * FROM users WHERE idusers = ?";
  const sqlOrdersAndPayments = `
    SELECT 
      o.order_id, o.quantity, o.total_price, o.order_status,
      p.name AS product_name, p.category, p.image AS image_name,
      pay.payment_id, pay.amount, pay.payment_method, pay.payment_status, pay.payment_date,
      o.order_date
    FROM orders o
    JOIN products p ON o.idproducts = p.idproducts
    LEFT JOIN payments pay ON o.order_id = pay.order_id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC
  `;
  const sqlGardeners = `
    SELECT g.* 
    FROM users u
    LEFT JOIN gardeners g ON u.idgardeners = g.idgardeners
    WHERE u.idusers = ?
  `;

  db.query(sqlUser, [idusers], (err, userResult) => {
    if (err) {
      console.error("❌ Error fetching user:", err);
      return res
        .status(500)
        .json({ message: "Error fetching user details", error: err });
    }
    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    db.query(sqlOrdersAndPayments, [idusers], (err, orderResults) => {
      if (err) {
        console.error("❌ Error fetching orders & payments:", err);
        return res
          .status(500)
          .json({ message: "Error fetching orders & payments", error: err });
      }

      db.query(sqlGardeners, [idusers], (err, gardenerResult) => {
        if (err) {
          console.error("❌ Error fetching gardener details:", err);
          return res
            .status(500)
            .json({ message: "Error fetching gardener details", error: err });
        }

        res.status(200).json({
          user: userResult[0],
          orders: orderResults,
          gardener: gardenerResult.length > 0 ? gardenerResult[0] : null,
        });
      });
    });
  });
});

app.delete("/deleteuser/:idusers", (req, res) => {
  const { idusers } = req.params;

  // First, delete orders related to the user
  const deleteOrdersSql = "DELETE FROM orders WHERE user_id = ?";

  db.query(deleteOrdersSql, [idusers], (err, result) => {
    if (err) {
      console.error("Error deleting user orders:", err);
      return res.status(500).json({ message: "Error deleting user orders." });
    }

    // Now, delete the user after deleting their orders
    const deleteUserSql = "DELETE FROM users WHERE idusers = ?";
    db.query(deleteUserSql, [idusers], (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Error deleting user." });
      }
      return res
        .status(200)
        .json({ message: "User and their orders deleted successfully." });
    });
  });
});

// Start Server
app.listen(3002, () => {
  console.log("Running backend server on port 3002");
});
