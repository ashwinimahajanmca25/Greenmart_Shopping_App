import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";

const ProductList = () => {
  const { subcategory } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(20000); // Default max price

  useEffect(() => {
    fetchProducts(subcategory);
  }, [subcategory]); // Fetch new products when subcategory changes

  const fetchProducts = async (subcategory) => {
    try {
      const response = await axios.get("http://localhost:3002/api/products", {
        params: { subcategory },
      });
      setProducts(response.data); // Set the fetched products here
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products.filter(
    (product) => product.base_price <= priceRange
  );

  const handleViewProduct = (product) => {
    let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  
    // Ensure unique products (Check by `idproducts`)
    const existingIndex = recentlyViewed.findIndex((item) => item.idproducts === product.idproducts);
  
    if (existingIndex !== -1) {
      // If the product already exists, just update timestamp
      recentlyViewed[existingIndex] = {
        ...recentlyViewed[existingIndex],
        action: "Viewed",
        timestamp: new Date().toLocaleString(),
      };
    } else {
      // Add new product with all details
      recentlyViewed.push({
        idproducts: product.idproducts,
        name: product.name,
        base_price: product.base_price, // ✅ Ensure price is stored
        image_name: product.image_name,
        category: product.category || "Uncategorized", // ✅ Ensure category is stored
        rating: product.rating, // ✅ Ensure rating is stored
        popularity: product.popularity, // ✅ Ensure popularity is stored
        action: "Viewed",
        timestamp: new Date().toLocaleString(),
      });
  
      // Limit to last 10 products to avoid clutter
      if (recentlyViewed.length > 10) {
        recentlyViewed.shift(); // Remove the oldest entry
      }
    }
  
    // Update `localStorage`
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    navigate(`/details-page/${subcategory}/${product.idproducts}`);
  };

  const renderStars = (rating) => {
    rating = Number(rating) || 0; // Ensure rating is a valid number
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    // Full Stars (★)
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-500 text-xl">
          ★
        </span>
      );
    }

    // Half Star (☆)
    if (halfStar) {
      stars.push(
        <span key="half" className="text-yellow-500 text-xl">
          ☆
        </span>
      );
    }

    // Fill empty stars to make total 5
    while (stars.length < 5) {
      stars.push(
        <span key={`empty-${stars.length}`} className="text-gray-300 text-xl">
          ★
        </span>
      );
    }

    return stars;
  };
 
  
  if (filteredProducts.length === 0) {
    return (
      <h2 className="text-center text-2xl font-bold mt-10">
        No products found!
      </h2>
    );
  }

  return (
    <div className="mx-auto px-10 pt-32 py-8 dark:bg-gray-800">
      <div className="flex">
        <div className="mt-6 text-center">
          <button onClick={() => navigate(-1)}>
            <IoMdArrowRoundBack className="text-3xl hover:text-gray-700 hover:scale-x-110 dark:text-white" />
          </button>
        </div>
        <h2 className="text-3xl font-bold text-center mb-8 ml-24 md:ml-96 dark:text-white">
          {subcategory.replace("-", " ").toUpperCase()} Collection
        </h2>
      </div>

      {/* Price Filter */}
      <div className="flex justify-center items-center mb-6">
        <label className="mr-3 text-lg font-semibold dark:text-white ">
          Max Price: ₹{priceRange}
        </label>
        <input
          type="range"
          min="0"
          max="20000"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="w-40 cursor-pointer bg-green-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
        {filteredProducts.map((product,index) => (
          <div
            key={`${product.id}-${index}`}
            className="flex flex-row md:flex-col p-4 w-auto md:w-64 bg-gray-100 border rounded-xl shadow-2xl text-center dark:bg-gray-600"
          >
            {/* left side */}
            <div className="left flex md:flex-col">
              <img
                           src={`http://localhost:3002/ProductImg/${product.image_name}`}

                className="w-56 md:w-full h-40 mx-auto object-cover rounded-xl"
              />
            </div>
            <div className="Right ml-3 md:ml-0">
              <h3 className="text-lg md:text-xl font-semibold mt-3 dark:text-white">
                {product.name}
              </h3>
              <p className="text-m md:text-lg font-bold text-green-700 dark:text-white">
                ₹{product.base_price}
              </p>

              {/* Stars Rating */}
              <div className="flex justify-center items-center mt-2">
                {renderStars(Number(product.rating) || 0)}
                <span className="ml-2 text-gray-600">
                  ({product.rating ? product.rating : "No rating"})
                </span>
              </div>

              {/* Popularity */}
              <p className="text-xs md:text-sm text-gray-500 mt-1 dark:text-white">
                {product.popularity} people bought this
              </p>

              <button
                onClick={() => handleViewProduct(product)}
                className="bg-green-600 text-white font-medium md:font-bold px-2 md:px-4 md:py-2 rounded-3xl mt-3 hover:bg-green-800"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
