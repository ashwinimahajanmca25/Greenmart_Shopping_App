import React, { useState, useEffect, useContext } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { UserContext } from "../UserContext";
import Swal from "sweetalert2";

import axios from "axios";

const ProductDetails = () => {
  const { subcategory, id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [magnified, setMagnified] = useState(false);
  const [zoomedImage, setZoomedImage] = useState({
    src: "",
    x: 0,
    y: 0,
  });
  const { user } = useContext(UserContext); // Get user data from context

  useEffect(() => {
    fetchProductDetails(subcategory);
  }, [subcategory]); // Fetch new products when subcategory changes

  const fetchProductDetails = async (subcategory) => {
    try {
      const response = await axios.get("http://localhost:3002/api/products", {
        params: { subcategory },
      });
      // Filter the specific product by subcategory and id
      const selectedProduct = response.data.find(
        (item) => item.idproducts === parseInt(id)
      );
      setProduct(selectedProduct); // Set the selected product
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleImageClick = (index) => {
    setSelectedProductIndex(index);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const handleMouseMove = (e) => {
    const imageContainer = e.target.getBoundingClientRect();
    const x = e.clientX - imageContainer.left;
    const y = e.clientY - imageContainer.top;
    const xPercent = (x / imageContainer.width) * 100;
    const yPercent = (y / imageContainer.height) * 100;

    setZoomedImage({
      src: `http://localhost:3002/ProductImg/${product.image_name}`, // ✅ Corrected image path
      x: xPercent,
      y: yPercent,
    });
  };

  const handleMouseEnter = () => {
    setMagnified(true);
  };

  const handleMouseLeave = () => {
    setMagnified(false);
  };

// 🔹 State should be at the top-level of the component
const [quantity, setQuantity] = useState(() => {
  return localStorage.getItem(`quantity_${id}`)
    ? parseInt(localStorage.getItem(`quantity_${id}`))
    : 1;
});
// ✅ Increment & Decrement Handlers
const incrementQuantity = () => setQuantity((prev) => prev + 1);
const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

// ✅ Update Local Storage When Quantity Changes
useEffect(() => {
  localStorage.setItem(`quantity_${id}`, quantity);
}, [quantity, id]);

  // Handle Add to Cart
  const addToCart = async (product, actionType = "Added to Cart") => {
    if (!user?.idusers) {
      Swal.fire({
        icon: "warning",
        title: "Login Required!",
        text: "Please log in to add products to your cart.",
        confirmButtonColor: "green",
        confirmButtonText: "OK",
      });
      return;
    }
    


  
    try {
      const response = await axios.post("http://localhost:3002/orders", {
        userId: user.idusers,
        productId: product.idproducts,
      
      quantity: quantity > 0 ? quantity : 1, // ✅ Using existing quantity state
      });
  
      console.log("API Response:", response.data); // ✅ Debugging API response
  
      let recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  
      const existingIndex = recentlyViewed.findIndex(
        (item) => item.idproducts === product.idproducts
      );
  
      if (existingIndex !== -1) {
        recentlyViewed[existingIndex] = {
          ...recentlyViewed[existingIndex],
          action: actionType,
          timestamp: new Date().toLocaleString(),
        };
      } else {
        recentlyViewed.push({
          ...product,
          action: actionType,
          timestamp: new Date().toLocaleString(),
        });
      }
  
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  
      if (response.data.success) {
        Swal.fire({
          icon: "success", // ✅ Fixed the icon
          title: `${actionType} Successfully!`,
          text: actionType === "Purchased" 
            ? "Your order has been placed." 
            : "Product added to cart successfully!",
          showCancelButton: true,
          showConfirmButton:true,
          // timer:1500,
          confirmButtonText: actionType === "Purchased" ? "Go to Bill" : "Go to Cart",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(actionType === "Purchased" ? "/bill" : "/cart");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Could not add product to cart.",
          timer: 2000, // ✅ Auto close after 2 seconds
          showConfirmButton: false,
          toast: true, // ✅ Show as a small popup
          position: "top-end", // ✅ Show in top right corner
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong!",
        text: error.response?.data?.message || "Please try again later.",
        timer: 3000, // ✅ Auto close after 3 seconds
        showConfirmButton: false,
      });
    }
  };
  
  
  
  
  

  if (!product) {
    return (
      <h2 className="text-center text-2xl font-bold mt-10">
        Product Not Found!
      </h2>
    );
  }

  return (
    <div className="flex px-6 py-10 mx-auto md:mt-10 dark:bg-gray-800">
      <div className=" mx-auto ">
        <div className="flex ">
          <div className="mt-6 text-center">
            <button onClick={() => navigate(-1)}>
              <IoMdArrowRoundBack className="text-3xl -mx-28 hover:text-gray-700 hover:scale-x-110 dark:text-white" />
            </button>
          </div>
          <div className="text-3xl font-bold text-center md:ml-72 mb-8 dark:text-white">
            {product && product.subcategory
              ? product.subcategory.replace("-", " ").toUpperCase()
              : "Product Details"}{" "}
            Collection
          </div>
        </div>

        <div className="p-4 w-[700px] mx-auto shadow-lg rounded-xl bg-gray-100 dark:bg-gray-400">
          <div className="flex flex-col items-center gap-6 md:flex-row dark:bg-gray-400 ">
            <div
              className="w-full md:w-1/2 overflow-hidden rounded-lg relative"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={`http://localhost:3002/ProductImg/${product.image_name}`}
                alt={product.name}
                className="object-cover w-full rounded-lg h-[375px] cursor-pointer hover:scale-105 transition-all ease-in-out duration-300"
              />
              {magnified && (
                <div
                  className="absolute w-32 h-32 border-2 border-gray-400 shadow-lg rounded-full overflow-hidden"
                  style={{
                    backgroundImage: `url(${zoomedImage.src})`,
                    backgroundSize: "900%", // ✅ Adjust zoom level (increase for more zoom)
                    backgroundPosition: `${zoomedImage.x}% ${zoomedImage.y}%`,
                    transform: "translate(-50%, -50%)",
                    top: `${zoomedImage.y}%`,
                    left: `${zoomedImage.x}%`,
                    pointerEvents: "none",
                  }}
                ></div>
              )}
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-3xl  font-bold text-gray-800 dark:text-white">
                {product.name}
              </h3>
              <p className="mt-3 text-lg font-semibold dark:text-white">
                {product.description}
              </p>

              <div className="mt-4">
                <p className="text-m font-semibold dark:text-white">
                  Popularity: {product.popularity}%
                </p>
                <div className="w-full h-3 mt-1 rounded-full">
                  <div
                    className="h-full rounded-full bg-green-800"
                    style={{
                      width: `${product.popularity}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center mt-3">
                <p className="mr-2 text-m font-semibold text-gray-700 dark:text-white">
                  Rating:
                </p>
                <div className="flex">{renderStars(product.rating)}</div>
              </div>

              <div className="mt-4">
                <p className="text-m font-semibold text-gray-700 dark:text-white">
                  Features:
                </p>
                <ul className="list-disc pl-5 text-gray-600">
                  {product.features?.map((feature, index) => (
                    <li key={index} className="text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center space-x-4 dark:text-white">
                <button
                  onClick={decrementQuantity}
                  className="bg-primary-dark text-white px-4 py-2 rounded-lg"
                >
                  -
                </button>
                <span className="text-xl">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="bg-primary-dark text-white px-4 py-2 rounded-lg dark:text-white"
                >
                  +
                </button>
              </div>
              <p className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
  Price: ₹{product.base_price * quantity}
</p>

              <div className="flex gap-4 mt-5">
                <button
                  onClick={() => addToCart(product, "Added to Cart")}
                  className="flex-1 px-4 py-2 text-white font-semibold bg-green-800 rounded-md hover:bg-green-700 transition duration-300 dark:text-white"
                >
                  Add to Cart
                </button>
                {/* <button
                  onClick={() => addToCart(product, "Purchased")}
                  className="flex-1 px-4 py-2 font-semibold text-white bg-green-800 rounded-md hover:bg-green-700 transition duration-300"
                >
                  Buy Now
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
