const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ashwini@12",
  database: "greenmart",
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to database:", err);
  } else {
    console.log("Connected to database!");
  }
});

let refreshTokens = [];  // Initialize an empty array to store refresh tokens

// Access environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generate Access and Refresh Tokens
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return refreshToken;
};

// Refresh Token Route
app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);  // Check if the token exists

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// Logout Route
app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token);  // Remove the token from the array
  res.sendStatus(204);
});


// User Registration Route
// User Registration Route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({ message: "All fields are required!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const sqlInsertUser = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sqlInsertUser, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err);
        return res.status(500).send({ message: "Error occurred", error: err });
      }

      // Fetch the idusers from the users table
      const sqlFetchUser = "SELECT idusers FROM users WHERE email = ?";
      db.query(sqlFetchUser, [email], (err, userResult) => {
        if (err) {
          console.error("Error fetching user ID:", err);
          return res.status(500).send({ message: "Error fetching user ID", error: err });
        }

        const idusers = userResult[0].idusers;

        // Insert the idusers into the userpanel table
        const sqlInsertUserPanel = `
          INSERT INTO userpanel (firstname, lastname, address, city, state, country, contact, email, birthdate, gender, idusers)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(sqlInsertUserPanel, [
          "", "", "", "", "", "", "", email, "", "", idusers
        ], (err, result) => {
          if (err) {
            console.error("Error inserting into userpanel:", err);
            return res.status(500).send({ message: "Error saving user panel data", error: err });
          }

          res.status(200).send({ message: "User registered successfully!", idusers });
        });
      });
    });
  } catch (err) {
    console.error("Error hashing password:", err);
    res.status(500).send({ message: "Internal server error", error: err });
  }
});



// User Login Route
// User Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required!" });
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
        return res.status(401).json({ message: "Invalid username or password!" });
      }

      // After successful password comparison, create the tokens and respond
      const accessToken = generateAccessToken({ idusers: user.idusers, email: user.email });
      const refreshToken = generateRefreshToken({ idusers: user.idusers, email: user.email });

      refreshTokens.push(refreshToken);

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        idusers: user.idusers,
        email: user.email,
        name: user.name
      });

    } catch (err) {
      console.error("Error during password comparison:", err);
      return res.status(500).json({ message: "Internal server error", error: err });
    }
  });
 
});





// API to add product to cart
// API to add product to cart
app.post("/add-to-cart", (req, res) => {
  const { id, name, price, image_path, quantity, idusers, product_type, category } = req.body;

  // Ensure price and quantity are numbers
  const parsedPrice = parseFloat(price);
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
    return res.status(400).send("Invalid price or quantity");
  }

  // Calculate total price
  const total_price = parsedPrice * parsedQuantity;

  // Ensure the query uses 'usersid' instead of 'user_id'
  const sql = "INSERT INTO cart (product_id, name, price, image_path, total_price, quantity, idusers, product_type,category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [id, name, parsedPrice, image_path, total_price, parsedQuantity, idusers, product_type ,category], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error adding product to cart");
    }
    res.send("Product added to cart!");
  });
  
});

// API to fetch cart items
app.get("/cart", (req, res) => {
  const idusers = req.query.idusers; // User ID passed in the query parameter

  if (!idusers) {
    return res.status(400).send("User ID is required");
  }

  const sql = "SELECT * FROM cart WHERE idusers = ?";
  db.query(sql, [idusers], (err, results) => {
    if (err) {
      console.error("Error fetching cart:", err);
      return res.status(500).send("Error fetching cart");
    }
    res.json(results);
  });
});


// API to finalize the cart and store updated information
app.post("/buy-now", (req, res) => {
  const cartItems = req.body.cart; // The cart items from frontend

  // Create an array of promises for each cart item update
  const updatePromises = cartItems.map((item) => {
    const { id, quantity } = item;
    const sql = "UPDATE cart SET quantity = ?, total_price = price * ? WHERE product_id = ?";

    // Return the promise from db.query
    return new Promise((resolve, reject) => {
      db.query(sql, [quantity, quantity, id], (err, result) => {
        if (err) {
          console.error("Error processing purchase:", err);
          reject({ message: "Error processing purchase", error: err });
        }
        resolve(result); // Resolve the promise if successful
      });
    });
  });

  // Use Promise.all to wait for all updates to finish
  Promise.all(updatePromises)
    .then(() => {
      res.send("Purchase completed successfully!"); // Send response once all updates are done
    })
    .catch((err) => {
      res.status(500).send(err); // Send error if any of the updates fail
    });
});


app.post("/cart/increment", (req, res) => {
  const { id, quantity } = req.body; // Ensure both id and quantity are passed in the request
  if (typeof quantity === 'undefined') {
    return res.status(400).send({ message: "Quantity is required" }); // Validate that quantity is provided
  }

  console.log("Incrementing quantity for productId:", id, "with quantity:", quantity);

  const sql = "UPDATE cart SET quantity = ?, total_price = price * ? WHERE id = ?";
  db.query(sql, [quantity, quantity, id], (err, result) => {
    if (err) {
      console.error("Error processing increment:", err);
      return res.status(500).send({ message: "Error processing increment", error: err });
    }
    console.log("Query result:", result);  // Log the query result
    res.send("Quantity incremented successfully!");
  });
});



// Decrement the quantity in the cart
// Decrement the quantity in the cart
app.post("/cart/decrement", (req, res) => {
  const { id, quantity } = req.body; // Get the id and quantity from the request body

  if (typeof quantity === 'undefined') {
    return res.status(400).send({ message: "Quantity is required" }); // Ensure quantity is passed
  }

  console.log("Decrementing quantity for productId:", id, "with quantity:", quantity);

  // SQL query to decrement the quantity, ensuring it doesn't go below 1
  const sql = "UPDATE cart SET quantity = ?, total_price = price * ? WHERE id = ?";

  // Execute the query
  db.query(sql, [quantity, quantity, id], (err, result) => {
    if (err) {
      console.error("Error processing decrement:", err);
      return res.status(500).send({ message: "Error processing decrement", error: err });
    }

    // Log the query result after it has been executed
    console.log("Query result:", result); // This will now log the result correctly

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Product not found in cart" });
    }

    res.send("Quantity decremented successfully!");
  });
});



app.get("/order-items", (req, res) => {
  const { bill_id } = req.query;
  
  if (!bill_id) {
    return res.status(400).json({ error: "Bill ID is required" });
  }

  const sql = `
    SELECT oi.*, b.customer_name, b.customer_email, b.customer_mobile, 
           b.customer_state, b.customer_city, b.customer_address, 
           b.total_amount, b.created_at
    FROM order_items oi
    JOIN bills b ON oi.bill_id = b.id
    WHERE oi.bill_id = ?;
  `;

  db.query(sql, [bill_id], (err, results) => {
    if (err) {
      console.error("Error fetching order items:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});



// Handle "Buy Now" functionality
// Backend route to handle checkout
app.post("/checkout", (req, res) => {
  const { total_amount } = req.body;

  // Insert billing information into the `bills` table
  const sqlInsertBill = `
    INSERT INTO bills 
    (total_amount) 
    VALUES (?,)`;

  const values = [
     total_amount
  ];

  db.query(sqlInsertBill, values, (err, result) => {
    if (err) {
      console.error("Error inserting bill:", err);
      return res.status(500).json({ message: "Failed to create bill" });
    }

    const billId = result.insertId; // Get the bill ID
    console.log("Bill created with ID:", billId);

    // Insert order items into `order_items` table, including `idcart`
    const orderItems = cart.map(item => [
       billId, item.idcart, item.name,total_amount]);

    const sqlInsertItems = `
      INSERT INTO order_items 
      ( bill_id, idcart, product_name,total_amount) VALUES ?`;

    db.query(sqlInsertItems, [orderItems], (err) => {
      if (err) {
        console.error("Error inserting order items:", err);
        return res.status(500).json({ message: "Failed to create order items" });
      }

      // Send back the bill ID after successful purchase
      res.json({ billid: billId });
    });
  });
});


// Backend API route to fetch purchase details
app.get("/purchase-details/:billid", (req, res) => {
  const { billid } = req.params;

  const sql = `
    SELECT 
      b.id AS bill_id,  b.total_amount, b.created_at,
      oi.product_name, oi.price, oi.quantity, 
      c.image_path, c.description
    FROM 
      bills b
    JOIN 
      order_items oi ON b.id = oi.bill_id
    JOIN 
      cart c ON oi.idcart = c.idcart  -- ✅ Fetch product details from cart
    WHERE 
      b.id = ?;`;

  db.query(sql, [billid], (err, results) => {
    if (err) {
      console.error("Error fetching purchase details:", err);
      return res.status(500).json({ message: "Failed to fetch purchase details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Organize the data
    const billData = {
      bill_id: results[0].bill_id,
      total_amount: results[0].total_amount,
      created_at: results[0].created_at,
      items: results.map(row => ({
        product_name: row.product_name,
        price: row.price,
        quantity: row.quantity,
        image_path: row.image_path,  // ✅ Fetch image for UI
        description: row.description  // ✅ Fetch product description
      }))
    };

    res.json(billData);
  });
});

// API to remove an item from the cart
// Backend API to remove an item from the cart
app.post("/cart/remove", (req, res) => {
  const { id } = req.body;  // Assuming frontend is sending 'id'

  const sql = "DELETE FROM cart WHERE id = ?";  // Updated field name to match database
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error removing item from cart:", err);
      return res.status(500).send({ message: "Error removing item from cart", error: err });
    }
    res.send("Item removed successfully!");
  });
});

app.post("/cart/clear", (req, res) => {
  const { idusers } = req.body;  // Ensure you pass the user id to clear the cart for a specific user.

  const sql = "DELETE FROM cart WHERE idusers = ?";
  db.query(sql, [idusers], (err, result) => {
    if (err) {
      console.error("Error clearing cart:", err);
      return res.status(500).send({ message: "Error clearing cart", error: err });
    }
    res.send("Cart cleared successfully!");
  });
});

// Authenticate Token Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Unauthorized! Token missing" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden! Token is invalid" });

    req.user = user; // Attach user data to request object
    next();
  });
}

// User Panel Route (Update or Insert)
app.post("/userpanel", (req, res) => {
  const { firstname, lastname, address, city, state, country, contact, email, birthdate, gender } = req.body;

  if (!firstname || !lastname || !address || !city || !state || !country || !contact || !email || !birthdate || !gender) {
    return res.status(400).send({ message: "All fields are required!" });
  }

  // First, check if the user exists
  const sqlSelect = "SELECT * FROM userpanel WHERE email = ?";
  db.query(sqlSelect, [email], (err, result) => {
    if (err) {
      console.error("Database Select Error:", err);
      return res.status(500).send({ message: "Error occurred", error: err });
    }

    const sqlFetchUserId = "SELECT idusers FROM users WHERE email = ?";
    db.query(sqlFetchUserId, [email], (err, userResult) => {
      if (err) {
        console.error("Error fetching user ID:", err);
        return res.status(500).send({ message: "Error fetching user ID", error: err });
      }

      const idusers = userResult[0].idusers;

      if (result.length > 0) {
        // If the user exists, update their data
        const sqlUpdate = `
          UPDATE userpanel 
          SET firstname = ?, lastname = ?, address=?, city=?, state=?, country=?, contact = ?, birthdate = ?, gender = ?, idusers = ?
          WHERE email = ?
        `;
        db.query(sqlUpdate, [firstname, lastname, address, city, state, country, contact, birthdate, gender, idusers, email], (err, result) => {
          if (err) {
            console.error("Database Update Error:", err);
            return res.status(500).send({ message: "Error occurred", error: err });
          } else {
            res.status(200).send({ message: "User data updated successfully!" });
          }
        });
      } else {
        // If the user doesn't exist, insert new data
        const sqlInsert = `
          INSERT INTO userpanel (firstname, lastname, address, city, state, country, contact, email, birthdate, gender, idusers)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlInsert, [firstname, lastname, address, city, state, country, contact, email, birthdate, gender, idusers], (err, result) => {
          if (err) {
            console.error("Database Insert Error:", err);
            return res.status(500).send({ message: "Error occurred", error: err });
          } else {
            res.status(200).send({ message: "User data saved successfully!" });
          }
        });
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

  const sqlSelect = "SELECT firstname, lastname, address, city, state, country, birthdate, gender,email, contact FROM users WHERE email = ?";
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
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    console.log("Request missing email or newPassword");
    return res.status(400).send({ message: "Email and new password are required!" });
  }

  try {
    const Password = await bcrypt.hash(newPassword, 10);
    console.log("Updating password for:", email);

    const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?";
    db.query(sqlUpdate, [Password, email], (err, result) => {
      if (err) {
        console.error("Database Update Error:", err);
        return res.status(500).send({ message: "Error updating password", error: err });
      }

      if (result.affectedRows === 0) {
        console.log("No user found for email:", email);
        return res.status(404).send({ message: "User not found!" });
      }

      console.log("Password updated successfully for:", email);
      res.status(200).send({ message: "Password updated successfully!" });
    });
  } catch (err) {
    console.error("Error hashing password:", err);
    res.status(500).send({ message: "Internal server error", error: err });
  }
});

// // Backend code
// app.get("/api/products", (req, res) => {
//   const { category } = req.query;

//   let query = `
//     SELECT 
//       idproducts, 
//       name, 
//       description, 
//       base_price,  
//       CONCAT('/ProductImg/', image) AS image, 
//       category 
//     FROM products
//   `;

//   let queryParams = [];
//   if (category) {
//     query += " WHERE category = ?";
//     queryParams.push(category);
//   }

//   db.query(query, queryParams, (error, results) => {
//     if (error) {
//       console.error("Error fetching products:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }

    
//     res.json(results);
//   });
// });




// // Get product by ID with its category
// // Get product by ID with its category
// Serve static files from the 'public' directory
// app.use("/images", express.static(path.join(__dirname, "images/ProductImg")));

app.get("/products", (req, res) => {
  const sql = `
    SELECT id, name, description, price, CONCAT('/ProductImg/', image) AS image FROM plant_product
    UNION
    SELECT id, name, description, price, CONCAT('/ProductImg/', image) AS image FROM soil_product
    UNION
    SELECT id, name, description, price, CONCAT('/ProductImg/', image) AS image FROM tool_product;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query error", details: err.message });
    }

    res.json(results); // Return all products
  });
});

app.get("/products/:id/:name", (req, res) => {
  const { id, name } = req.params;

  const sql = `
  SELECT id, name, description, price, product_type,points,rating,popularity, CONCAT('/ProductImg/', image) AS image 
  FROM plant_product WHERE id = ? AND name = ?
  UNION
  SELECT id, name, description, price, product_type,points,rating,popularity, CONCAT('/ProductImg/', image) AS image 
  FROM soil_product WHERE id = ? AND name = ?
  UNION
  SELECT id, name, description, price, product_type,points,rating,popularity, CONCAT('/ProductImg/', image) AS image 
  FROM tool_product WHERE id = ? AND name = ?
`;


  db.query(sql, [id, name, id, name, id, name], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query error", details: err.message });
    }

    if (results.length === 0) {
      console.error("No product found");
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(results[0]); // Return the first product (since it's unique)
  });
});





// Store Search Info in Database
app.post("/search-history", (req, res) => {
  const { idusers, searchQuery } = req.body; // Use idusers instead of userId

  console.log("Received data:", { idusers, searchQuery });

  const sql = "INSERT INTO search_history (idusers, search_query) VALUES (?, ?)"; // Use idusers

  db.query(sql, [idusers, searchQuery], (err, result) => {
    if (err) {
      console.error("Error storing search history:", err);
      res.status(500).json({ error: "Error storing search history", details: err.message });
      return;
    }
    res.status(200).json({ message: "Search info stored successfully!" });
  });
});

app.get("/search-history/:idusers", (req, res) => {
  const { idusers } = req.params;

  // Replace 'search_id' with the correct column name (if available)
  const sql = "SELECT search_query FROM search_history WHERE idusers = ? ORDER BY idsearch_history DESC LIMIT 10";

  db.query(sql, [idusers], (err, results) => {
    if (err) {
      console.error("Error fetching search history:", err);
      return res.status(500).json({ error: "Error fetching search history", details: err.message });
    }

    res.json(results.map((row) => row.search_query));
  });
});


// API to fetch gardeners based on filters
app.get('/gardeners', (req, res) => { 
  const { state, city, education, gender } = req.query;

  if (!state && !city && !education && !gender) {
    return res.json([]); // If no filters are selected, return an empty list
  }

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
  if (education && education !== 'All') {
    sql += " AND education = ?";
    params.push(education);
  }
  if (gender && gender !== 'All') {
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
  const { userId, gardenerId, duration, work_time, joining_date, total_fees } = req.body;

  if (!userId || !gardenerId || !duration || !work_time || !joining_date || !total_fees) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check if gardener is already booked
  const checkGardenerSql = "SELECT * FROM gardeners WHERE idgardeners = ? AND book = 1";
  db.query(checkGardenerSql, [gardenerId], (err, results) => {
    if (err) {
      console.error("Error checking gardener status:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
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
    db.query(updateGardenerSql, [duration, work_time, joining_date, total_fees, gardenerId], (err, updateGardenerResult) => {
      if (err) {
        console.error("Error updating gardener:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      const updateUserSql = "UPDATE users SET idgardeners = ? WHERE idusers = ?";
      db.query(updateUserSql, [gardenerId, userId], (err, updateUserResult) => {
        if (err) {
          console.error("Error updating user:", err);
          return res.status(500).json({ message: "Database error", error: err.message });
        }

        res.status(200).json({ message: "Gardener appointed successfully!" });
      });
    });
  });
});
// API to remove a gardener
app.delete("/remove-gardener", (req, res) => {
  const { userId, gardenerId } = req.body;

  if (!userId || !gardenerId) {
    return res.status(400).json({ message: "User ID and Gardener ID are required!" });
  }

  const deleteUserGardenerSql = "UPDATE users SET idgardeners = NULL WHERE idusers = ?";
  db.query(deleteUserGardenerSql, [userId], (err, deleteUserResult) => {
    if (err) {
      console.error("Error removing gardener from user:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    const updateGardenerStatusSql = "UPDATE gardeners SET book = 0 WHERE idgardeners = ?";
    db.query(updateGardenerStatusSql, [gardenerId], (err, updateGardenerResult) => {
      if (err) {
        console.error("Error updating gardener status:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      res.status(200).json({ message: "Gardener removed successfully!" });
    });
  });
});


// API to fetch appointed gardener details for a user
app.get('/user-appointed-gardener', (req, res) => {
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

// Server Listener
app.listen(3001, () => {
  console.log("Running backend server on port 3001");
});

