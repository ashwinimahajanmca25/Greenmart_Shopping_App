import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // ✅ Import useParams to get category
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { UserContext } from "../UserContext";
import grassbg from "../../assets/ProductImg/plants.jpg";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
const ProductPage = () => {
  const { user } = useContext(UserContext);
  const { category } = useParams(); // ✅ Get category from URL
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts(category);
  }, [category]); // ✅ Fetch new products when category changes

  const fetchProducts = async (category) => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/allproducts",
        {
          params: { category },
        }
      );

      // Filter products where sub_category is null (show only these)
      const filteredProducts = response.data.filter(
        (product) => !product.subcategory
      );

      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Divide products into rows of 6
  const chunkProducts = (arr, size) => {
    return arr.reduce((acc, _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
  };
  const PrevArrow = ({ onClick }) => (
    <button
      className="absolute -left-8 z-10 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
      style={{ top: "50%", transform: "translateY(-50%)", fontSize: "10px" }}
      onClick={onClick}
    >
      <FaChevronLeft />
    </button>
  );

  // Custom Next Arrow
  const NextArrow = ({ onClick }) => (
    <button
      className="absolute -right-9 z-10 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
      style={{ top: "50%", transform: "translateY(-50%)", fontSize: "10px" }}
      onClick={onClick}
    >
      <FaChevronRight />
    </button>
  );

  const productChunks = chunkProducts(products, 8);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: Math.min(products.length, 4),
    slidesToScroll: 4,
    prevArrow: <PrevArrow />, // ✅ Custom Previous Arrow
    nextArrow: <NextArrow />, // ✅ Custom Next Arrow
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, centerPadding: "40px" },
      },
      { breakpoint: 768, settings: { slidesToShow: 2, centerPadding: "30px" } },
      { breakpoint: 480, settings: { slidesToShow: 1, centerPadding: "20px" } },
    ],
  };

  const addToCart = async (product) => {
    if (!user) {
      setLoginPopup(true);
      return;
    }
    let cartSessionId = localStorage.getItem("cartSessionId");
    if (!cartSessionId) {
      cartSessionId = Date.now().toString(); // or use uuid if you prefer
      localStorage.setItem("cartSessionId", cartSessionId);
    }

    try {
      const response = await axios.post("http://localhost:3002/orders", {
        userId: user.idusers,
        productId: product.idproducts,
        quantity: 1,
        cartSessionId, // ⬅️ important
      });

      let recentlyViewed =
        JSON.parse(localStorage.getItem("recentlyViewed")) || [];

      const existingIndex = recentlyViewed.findIndex(
        (item) => item.idproducts === product.idproducts
      );

      if (existingIndex !== -1) {
        recentlyViewed[existingIndex] = {
          ...recentlyViewed[existingIndex],
          action: "Added to Cart",
          timestamp: new Date().toLocaleString(),
        };
      } else {
        recentlyViewed.push({
          ...product,
          action: "Added to Cart",
          timestamp: new Date().toLocaleString(),
        });
      }

      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));

      // ✅ Show success message
      Swal.fire({
        title: "Success!",
        text: "Product added to cart successfully!",
        icon: "success",
        confirmButtonColor: "green",
        confirmButtonText: "Go to Cart",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/cart");
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Swal.fire({
          icon: "info",
          title: "Already in Cart",
          text: error.response.data.message,
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Something went wrong while adding to cart.",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleViewProduct = (product) => {
    let recentlyViewed =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // Ensure unique products (Check by `idproducts`)
    const existingIndex = recentlyViewed.findIndex(
      (item) => item.idproducts === product.idproducts
    );

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
  const closeModal = () => {
    setSelectedProduct(null);
  };
  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-10">
      {/* Hero Section */}
      <div
        className="text-white py-52"
        style={{
          backgroundImage: `url(${grassbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className=" text-center">
          <h1 className="text-5xl font-extrabold mt-8 text-white drop-shadow-lg">
            {category
              .replace("-", " ") // Replace hyphens with spaces
              .toLowerCase() // Convert the entire string to lowercase
              .replace(/^\w/, (c) => c.toUpperCase())}{" "}
            {/* Capitalize first letter */}
            Collection
          </h1>

          <p className="mt-4 text-2xl font-light">
            Explore our premium{" "}
            {category
              .replace("-", " ") // Replace hyphens with spaces
              .toLowerCase() // Convert the entire string to lowercase
              .replace(/^\w/, (c) => c.toUpperCase())}{" "}
            Collection for a thriving garden.
          </p>
        </div>
      </div>

      {/* Product Sections */}
      <div className="container md:min-w-[1350px]">
        {productChunks.map((chunk, index) => (
          <div key={index} className="mb-10">
            {/* Section Title */}
            <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
              {index === 0 ? "Our Products" : "More Products..."}
            </h2>

            {/* Slider for Products */}
            <Slider {...sliderSettings}>
              {chunk.map((product) => (
                <div key={product.idproducts} className="p-2 w-full ">
                  {/* 👆 Wrap card in an extra div & add padding */}
                  <div className="w-[240px] md:w-[280px] flex flex-col dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-100 hover:shadow-2xl border border-gray-300 dark:border-gray-700 mx-auto">
                    {/* Product Image */}
                    <img
                      src={`http://localhost:3002/ProductImg/${product.image_name}`}
                      alt={product.name}
                      className="w-full h-40 object-cover cursor-pointer rounded-t-lg"
                      onClick={() => {
                        setSelectedProduct(product);
                        handleViewProduct(product);
                      }}
                    />

                    {/* Product Name & Price */}
                    <div className="flex justify-between items-center px-4 mt-2">
                      <div className="text-lg font-semibold text-gray-800 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{product.base_price}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-2 px-4">
                      {renderStars(Number(product.rating) || 0)}
                      <span className="ml-2 text-gray-600">
                        ({product.rating ? product.rating : "No rating"})
                      </span>
                    </div>

                    {/* Popularity Bar */}
                    <div className="mt-3 px-4">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Popularity
                      </label>
                      <div className="w-full bg-gray-300 rounded-full h-2.5">
                        <div
                          className="bg-green-800 h-2.5 rounded-full"
                          style={{ width: `${product.popularity}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-4 mb-4 bg-green-800 text-white py-2 px-6 rounded-full shadow-md 
          transition-transform transform hover:scale-105 mx-auto block"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 w-[80%] md:w-[40%]  relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-700 dark:text-white hover:text-red-600 transition duration-200 font-bold"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Product Details */}
            <img
              src={`http://localhost:3002/ProductImg/${selectedProduct.image_name}`}
              alt={selectedProduct.name}
              className="object-cover w-full mb-3 rounded-lg h-[300px] md:h-[250px]"
            />
            <div className="flex justify-between items-center mb-2">
              <div className=" text-2xl font-bold text-gray-800 dark:text-white">
                {selectedProduct.name}
              </div>
              <div className="text-2xl font-bold text-green-800">
                ₹{selectedProduct.base_price}
              </div>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {selectedProduct.description}
            </p>

            {/* Rating */}
            <div className="flex items-center mt-2">
              <span className="mr-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                Rating:
              </span>
              {renderStars(Number(selectedProduct.rating) || 0)}
              <span className="ml-2 text-gray-600 text-lg">
                ({selectedProduct.rating ? selectedProduct.rating : "No rating"}
                )
              </span>
            </div>

            {/* Popularity Bar */}
            <div className="mt-2">
              <label className="block text-lg font-medium text-gray-600 dark:text-gray-400">
                Popularity
              </label>
              <div className="w-64 bg-gray-300 rounded-full h-2.5">
                <div
                  className="bg-green-800 h-2.5 rounded-full "
                  style={{ width: `${selectedProduct.popularity}%` }}
                ></div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => {
                addToCart(selectedProduct);
                closeModal();
              }}
              className="px-6 py-2 mt-6 text-white transition-transform transform bg-green-800 rounded-lg shadow-md hover:bg-green-700 hover:scale-105"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
