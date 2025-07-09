const express = require("express");
const router = express.Router();
const db = require("./db"); // Ensure this is your database connection

/** ✅ 1. Fetch All Orders */
router.get("/allorders", (req, res) => {
  const query = `
    SELECT 
      DATE(o.order_date) AS order_date, 
      u.username AS customer_name, 
      u.idusers AS user_id, 
      GROUP_CONCAT(o.order_id) AS order_ids, 
      SUM(o.total_price) AS total_price, 
      MAX(o.order_status) AS order_status, 
      MAX(d.name) AS delivery_boy_name,
      MAX(o.delivery_boy_id) AS delivery_boy_id,
       (
    SELECT p.amount 
    FROM payments p 
    WHERE p.order_id = MIN(o.order_id) -- 🟡 Take the first order in the group
    LIMIT 1
  ) AS payment_amount
    FROM orders o
    JOIN users u ON o.user_id = u.idusers
    LEFT JOIN delivery_boys d ON o.delivery_boy_id = d.id
    LEFT JOIN payments p ON o.order_id = p.order_id -- ✅ Join payments table
    GROUP BY DATE(o.order_date), u.idusers
    ORDER BY DATE(o.order_date) DESC;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("❌ Error fetching orders:", error);
      return res.status(500).json({ message: "Error fetching orders" });
    }
    res.status(200).json(results);
  });
});



/** ✅ 2. Fetch All Orders for a Specific User */
router.get("/userorders", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const userQuery = `
    SELECT username, email, contact, shipping_address, city, state, country 
    FROM users 
    WHERE idusers = ?
  `;

  const ordersQuery = `
    SELECT 
      o.order_id, o.total_price, o.quantity, o.order_status, 
      p.name AS product_name, p.base_price, p.category, 
      image AS image_name
    FROM orders o
    JOIN products p ON o.idproducts = p.idproducts
    WHERE o.user_id = ?
  `;

  const paymentsQuery = `
    SELECT payment_id, amount, payment_status, payment_method, payment_date
    FROM payments 
    WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = ?)
  `;

  db.query(userQuery, [userId], (error, userResults) => {
    if (error) {
      console.error("❌ Error fetching user details:", error);
      return res.status(500).json({ message: "Error fetching user details" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    db.query(ordersQuery, [userId], (error, orderResults) => {
      if (error) {
        console.error("❌ Error fetching orders:", error);
        return res.status(500).json({ message: "Error fetching orders" });
      }

      db.query(paymentsQuery, [userId], (error, paymentResults) => {
        if (error) {
          console.error("❌ Error fetching payments:", error);
          return res.status(500).json({ message: "Error fetching payments" });
        }

        res.status(200).json({
          user: userResults[0] || {},
          orders: orderResults || [],
          payments: paymentResults || [],
        });
      });
    });
  });
});



/** ✅ 3. Delete an Order */
router.delete("/deleteorder/:orderId", (req, res) => {
  let { orderId } = req.params;

  // Convert "200,199,198" → [200, 199, 198]
  let orderIds = orderId
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id)); // Remove invalid numbers

  if (orderIds.length === 0) {
    return res.status(400).json({ message: "Invalid order ID(s)!" });
  }

  console.log("📢 Deleting Orders:", orderIds);

  const deleteQuery = "DELETE FROM orders WHERE order_id IN (?)";
  db.query(deleteQuery, [orderIds], (error, result) => {
    if (error) {
      console.error("❌ Error deleting order:", error);
      return res.status(500).json({ message: "Error deleting order" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order(s) not found" });
    }
    res.status(200).json({ message: "✅ Order(s) deleted successfully!" });
  });
});




/** ✅ 4. Update Order Status */
router.put("/updateorderstatus/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: "Order ID and status are required" });
  }

  const updateQuery = "UPDATE orders SET order_status = ? WHERE order_id = ?";
  db.query(updateQuery, [status, orderId], (error, result) => {
    if (error) {
      console.error("❌ Error updating order status:", error);
      return res.status(500).json({ message: "Error updating order status" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "✅ Order status updated successfully!" });
  });
});

/** ✅ 5. Fetch Order Details */
router.get("/orderdetails/:orderId", (req, res) => {
  const { orderId } = req.params;

  // ✅ Step 1: Get exact timestamp from payments table
  const timeQuery = `
    SELECT p.payment_date, o.user_id 
    FROM payments p 
    JOIN orders o ON p.order_id = o.order_id 
    WHERE p.order_id = ?
  `;

  db.query(timeQuery, [orderId], (error, timeResults) => {
    if (error || timeResults.length === 0) {
      console.error("❌ Error fetching payment timestamp:", error);
      return res.status(500).json({ message: "Error fetching payment timestamp" });
    }

    const paymentTimestamp = timeResults[0].payment_date;
    const userId = timeResults[0].user_id;

    console.log("✅ Payment Timestamp:", paymentTimestamp);

    // ✅ Step 2: Fetch all products bought in the same second
    const ordersQuery = `
      SELECT 
        o.order_id, o.total_price, o.quantity, o.order_status, 
        p.name AS product_name, p.base_price, p.category, p.image AS image_name
      FROM orders o
      JOIN products p ON o.idproducts = p.idproducts
      JOIN payments pay ON o.order_id = pay.order_id
      WHERE o.user_id = ? AND 
            DATE_FORMAT(pay.payment_date, '%Y-%m-%d %H:%i:%s') = DATE_FORMAT(?, '%Y-%m-%d %H:%i:%s')
    `;

    db.query(ordersQuery, [userId, paymentTimestamp], (error, orderResults) => {
      if (error) {
        console.error("❌ Error fetching orders:", error);
        return res.status(500).json({ message: "Error fetching orders" });
      }

      console.log("✅ Orders Found:", orderResults.length);

      // ✅ Step 3: Fetch User Details
      const userQuery = `
        SELECT idusers AS user_id, username, email, contact, shipping_address, city, state, country 
        FROM users WHERE idusers = ?
      `;

      db.query(userQuery, [userId], (error, userResults) => {
        if (error) {
          console.error("❌ Error fetching user details:", error);
          return res.status(500).json({ message: "Error fetching user details" });
        }

        // ✅ Step 4: Fetch a Single Payment Record
        const paymentsQuery = `
          SELECT payment_id, amount, payment_status, payment_method, payment_date
          FROM payments 
          WHERE DATE_FORMAT(payment_date, '%Y-%m-%d %H:%i:%s') = DATE_FORMAT(?, '%Y-%m-%d %H:%i:%s')
          LIMIT 1
        `;

        db.query(paymentsQuery, [paymentTimestamp], (error, paymentResults) => {
          if (error) {
            console.error("❌ Error fetching payment details:", error);
            return res.status(500).json({ message: "Error fetching payment details" });
          }

          res.status(200).json({
            user: userResults[0] || {}, 
            orders: orderResults || [], 
            payments: paymentResults.length > 0 ? paymentResults[0] : null,
          });
        });
      });
    });
  });
});









// Updated Route
// ✅ Updated Assign Delivery Boy API to ensure only the selected order is updated
router.put("/assign-delivery-boy/:orderId", (req, res) => {
  let { orderId } = req.params;
  const { delivery_boy_id } = req.body;

  if (!delivery_boy_id) {
    return res.status(400).json({ error: "Delivery boy ID is required!" });
  }

  // ✅ Ensure orderId is an array
  let orderIds = orderId.toString().split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));

  if (orderIds.length === 0) {
    return res.status(400).json({ error: "Invalid order ID(s)!" });
  }

  console.log("📢 Assigning Delivery Boy:", delivery_boy_id, "to Orders:", orderIds);

  const sql = `UPDATE orders SET delivery_boy_id = ?, assigned_date = NOW() WHERE order_id IN (?)`;

  db.query(sql, [delivery_boy_id, orderIds], (err, result) => {
    if (err) {
      console.error("❌ Database Error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    console.log("✅ Rows Affected:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order(s) not found or already assigned." });
    }

    res.json({ success: true, message: "Delivery Boy Assigned Successfully!" });
  });
});






/** ✅ Fetch All Delivery Boys */
router.get("/all-delivery-boys", (req, res) => {
  const query = "SELECT id, name FROM delivery_boys";
  db.query(query, (error, results) => {
      if (error) {
          console.error("❌ Error fetching delivery boys:", error);
          return res.status(500).json({ message: "Error fetching delivery boys" });
      }
      res.status(200).json(results);
  });
});
router.get('/delivery-boy/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT 
        d.id AS delivery_boy_id, d.name, d.phone, d.email,d.current_lat,d.current_lng,
        o.order_id, o.assigned_date, o.out_for_delivery_date, o.delivered_date,
        p.name AS product_name, p.base_price, 
        u.username AS customer_name
      FROM delivery_boys d
      LEFT JOIN orders o ON d.id = o.delivery_boy_id
      LEFT JOIN products p ON o.idproducts = p.idproducts
      LEFT JOIN users u ON o.user_id = u.idusers
      WHERE d.id = ?  -- ✅ Fetch all orders assigned to this delivery boy
      ORDER BY o.assigned_date DESC;  -- ✅ Show newest first`;

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("❌ Error fetching delivery boy details:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Delivery boy not found or no recent orders" });
      }

      res.json(results);
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});



router.put('/remove-delivery-boy/:orderId', async (req, res) => {
  let { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  // ✅ Convert orderId into an array
  const orderIdsArray = orderId.split(",").map(id => parseInt(id.trim(), 10));

  // ✅ Validate that all values are numbers
  if (orderIdsArray.some(isNaN)) {
    return res.status(400).json({ success: false, message: "Invalid order IDs" });
  }

  try {
    const sql = `UPDATE orders SET delivery_boy_id = NULL WHERE order_id IN (?)`; // ✅ Use `IN` clause
    db.query(sql, [orderIdsArray], (error, result) => {
      if (error) {
        console.error("❌ Error removing delivery boy:", error);
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Order(s) not found" });
      }

      res.json({ success: true, message: `✅ Delivery Boy removed from ${result.affectedRows} orders successfully` });
    });
  } catch (error) {
    console.error("❌ Error removing delivery boy:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Cancel or Return Order
router.put("/cancelOrReturnOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { type } = req.body; // 'cancel' or 'return'

  try {
    // Update order status
     db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [type === "cancel" ? "cancelled" : "returned", orderId]
    );

    // Get total_price of the order
    const [orderResult] =  db.query(
      "SELECT total_price FROM orders WHERE id = ?",
      [orderId]
    );
    const orderPrice = orderResult[0]?.total_price || 0;

    // Subtract order amount from payment
     db.query(
      "UPDATE payments SET amount = amount - ? WHERE order_id = ?",
      [orderPrice, orderId]
    );

    res.status(200).json({ message: `${type} completed`, amountDeducted: orderPrice });
  } catch (error) {
    console.error("Cancel/Return error:", error);
    res.status(500).json({ error: "Server error during cancel/return" });
  }
});




module.exports = router;
