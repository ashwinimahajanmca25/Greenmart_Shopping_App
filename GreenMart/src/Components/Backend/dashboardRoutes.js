const express = require("express");
const router = express.Router();
const db = require("./db"); // Database connection

/** ✅ 1. Fetch Dashboard Summary */
router.get("/dashboard/summary", (req, res) => {
  const summaryQuery = `
    SELECT 
      (SELECT COUNT(*) FROM orders) AS orders, 
      (SELECT SUM(total_price) FROM orders WHERE order_status = 'delivered') AS revenue, 
      (SELECT COUNT(*) FROM products) AS products, 
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers
  `;

  db.query(summaryQuery, (error, results) => {
    if (error) {
      console.error("❌ Error fetching dashboard summary:", error);
      return res.status(500).json({ message: "Error fetching summary" });
    }
    res.status(200).json(results[0]);
  });
});

/** ✅ 2. Fetch Monthly Sales Data */
router.get("/dashboard/sales", (req, res) => {
    const salesQuery = `
      SELECT 
          DATE_FORMAT(order_date, '%b') AS month, 
          SUM(total_price) AS sales 
      FROM orders 
      WHERE order_status = 'delivered'
      GROUP BY DATE_FORMAT(order_date, '%b')
      ORDER BY MIN(order_date);
    `;
  
    db.query(salesQuery, (error, results) => {
      if (error) {
        console.error("❌ Error fetching sales data:", error);
        return res.status(500).json({ message: "Error fetching sales data" });
      }
      res.status(200).json(results);
    });
  });
  

module.exports = router;
