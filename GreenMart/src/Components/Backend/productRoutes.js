const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import file system module
const db = require("./db"); // Import your MySQL connection
const router = express.Router();

// ✅ Set up image upload directory with duplicate check
const storage = multer.diskStorage({
  destination: "./public/ProductImg/",
  filename: (req, file, cb) => {
    const filePath = path.join(__dirname, "public/ProductImg", file.originalname);

    // // ✅ Check if file already exists
    // if (fs.existsSync(filePath)) {
    //   return cb(new Error("Image with the same name already exists. Please rename the image."));
    // }
    cb(null, file.originalname); // ✅ Save with the original name
  },
});

const upload = multer({ storage });

router.post("/addproduct", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err.message);
      return res.status(400).json({ message: err.message }); // Send error to frontend
    }

    let { name,description, category, subcategory, price, stock } = req.body;
    const image = req.file ? req.file.filename : null;

    // ✅ Convert "N/A" to NULL before inserting into MySQL
    if (subcategory.toLowerCase() === "n/a") {
      subcategory = null;
    }

    // ✅ Fix Validation: Allow subcategory to be NULL
    if (!name ||!description || !category || !price || !image || isNaN(stock)) {
      return res.status(400).json({ message: "All fields except subcategory are required, and stock must be a number." });
    }

    // ✅ Check if image already exists in database
    const checkImageQuery = `SELECT image FROM products WHERE image = ?`;
    db.query(checkImageQuery, [image], (err, result) => {
      if (err) {
        console.error("Error checking image:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Image with the same name already exists. Please rename the image." });
      }

      // ✅ Insert product if image does not exist
      const query = `
        INSERT INTO products (name, description,category, subcategory, base_price, image, stock) 
        VALUES (?, ?, ?, ?, ?, ?,?)
      `;

      db.query(query, [name, description,category, subcategory, price, image, parseInt(stock, 10)], (error, result) => {
        if (error) {
          console.error("Error adding product:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
        res.status(201).json({ message: "Product added successfully!" });
      });
    });
  });
});



// ✅ Fetch Products with Filters & Sorting
router.get("/products", (req, res) => {
  const { category, subcategory, sortColumn = "idproducts", sortOrder = "asc" } = req.query;

  let query = `
    SELECT 
      idproducts, 
      name, 
      description, 
      base_price,  
   image AS image_name,

      category,
      stock,
      COALESCE(subcategory, 'N/A') AS subcategory,

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

  // ✅ Sorting
  query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(results);
  });
});




// ✅ Delete Product by ID
router.delete("/products/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM products WHERE idproducts = ?", [id], (error, result) => {
    if (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json({ message: "Product deleted successfully!" });
  });
});
router.put("/products/:idproducts", upload.single("image"), (req, res) => {
  const { idproducts } = req.params;
  console.log("🔹 Received Update Request for ID:", idproducts); // ✅ Log ID before query
  let { name, category, subcategory, price, stock } = req.body;
  const image = req.file ? req.file.filename : req.body.existingImage;



  // Convert "N/A" to NULL before inserting into MySQL
  if (subcategory && subcategory.toLowerCase() === "N/A") {
    subcategory = null;
  }

  // ✅ Check if product exists
  db.query(`
    SELECT 

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
   WHERE idproducts = ?`, [idproducts], (err, result) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldImage = result[0].image;
    const newImage = image !== undefined ? image : oldImage;


    // ✅ Update product
    const updateQuery = `
      UPDATE products 
      SET name = ?, category = ?, subcategory = ?, base_price = ?, image = ?, stock = ? 
      WHERE idproducts = ?
    `;

    db.query(updateQuery, [name, category, subcategory, price, newImage, stock, idproducts], (error, result) => {
      if (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.status(200).json({ message: "Product updated successfully!" });
    });
  });
});


module.exports = router;
