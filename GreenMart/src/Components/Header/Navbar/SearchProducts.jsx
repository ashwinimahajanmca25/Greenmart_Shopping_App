import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const SearchProducts = () => {
  const { idproducts, name } = useParams(); // Extract id and name from URL
  const [product, setProduct] = useState(null);
  const { user } = useContext(UserContext); // Get user data from context
  const navigate = useNavigate();

  useEffect(() => {
    if (!idproducts) {
      console.error("Missing product ID");
      return;
    }
  
    // console.log(`Fetching all products to find: ID=${idproducts}, Name=${name}`);
  
    fetch(`http://localhost:3002/api/products`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // console.log("All products fetched:", data);
        // Find the product with the matching ID
        const foundProduct = data.find((p) => p.idproducts == idproducts);
        if (!foundProduct) {
          console.error("Product not found");
          return;
        }
        setProduct(foundProduct);
      })
      .catch((error) => console.error("Error fetching product details:", error));
  }, [idproducts, name]);
  

  const addToCart = async (product) => {
    if (!user) {
      setLoginPopup(true);
      return;
    }
  
    try {
     
  
      await axios.post("http://localhost:3002/orders", {
        userId: user.idusers,
        productId: product.idproducts,
        quantity: 1,
      });
      let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
      
      const existingIndex = recentlyViewed.findIndex((item) => item.idproducts === product.idproducts);
      if (existingIndex !== -1) {
        recentlyViewed[existingIndex] = {
          ...recentlyViewed[existingIndex],
          
          action: "Added to Cart",
          timestamp: new Date().toLocaleString()
        };
      } else {
        recentlyViewed.push({
          ...product,
          action: "Added to Cart",
          timestamp: new Date().toLocaleString()
        });
      }
  
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
      console.log("Product added to cart successfully!");
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (!product) {
    return <div className="text-center text-gray-500 text-lg">Loading product details...</div>;
  }

  const pointsArray = product.points
    ? product.points.split(",").map((point) => point.trim())
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-5">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-4xl mt-40 w-full">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {product.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
          <span className="font-semibold text-primary">Category:</span> {product.category}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
              src={`http://localhost:3002/ProductImg/${product.image_name}`}
            alt={product.name}
            className="w-64 h-64 object-cover rounded-lg shadow-md border border-gray-300 dark:border-gray-700"
          />

          <div className="flex flex-col gap-3">
            <p className="text-gray-700 dark:text-gray-300 text-lg">{product.description}</p>

            {/* {pointsArray.length > 0 && (
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                {pointsArray.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )} */}

            <p className="text-2xl font-semibold text-primary dark:text-secondary">
              Price: <span className="text-gray-900 dark:text-white">${product.base_price}</span>
            </p>

            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={index < product.rating ? "text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Popularity
              </label>
              <div className="w-full bg-gray-300 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: `${product.popularity}%` }}
                ></div>
              </div>
            </div>

            <button
               onClick={() => addToCart(product)} // ✅ Pass product as an argument
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-lg font-medium shadow-md hover:bg-primary-dark transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchProducts;
