import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react"; // Import Star icon
import Img1 from "../../assets/MiddleProducts/can.jpg";
import Img2 from "../../assets/MiddleProducts/common.jpg";
import Img3 from "../../assets/MiddleProducts/roses.jpg";
import Img4 from "../../assets/MiddleProducts/soil1.jpg";
import Img5 from "../../assets/MiddleProducts/seeds.jpg";
import Img6 from "../../assets/MiddleProducts/machine.jpg";
import Img7 from "../../assets/MiddleProducts/main.jpg";
import Img8 from "../../assets/MiddleProducts/pot1.jpeg";

// Product Data with Ratings
const Data = [
    {
        id: 1, img: Img1, title: "Oraganic Plant Products", subcategory: "organicPlants",
        description: "Plant trees and protect the environment.", price: 299, rating: 4
    },
    {
        id: 2, img: Img2, title: "Common Plants Products", subcategory: "commonPlants",
        description: "Plant trees and protect the environment.", price: 499, rating: 5
    },
    {
        id: 3, img: Img3, title: "Flowers Products", subcategory: "roses",
        description: "Plant trees and protect the environment.", price: 209, rating: 3
    },
    {
        id: 4, img: Img4, title: "Soil Products", subcategory: "soil",
        description: "Plant trees and protect the environment.", price: 399, rating: 4
    },
    {
        id: 5, img: Img5, title: "Seeds Products", subcategory: "seeds",
        description: "Plant trees and protect the environment.", price: 250, rating: 5
    },
    {
        id: 6, img: Img6, title: "Agriculture Tools", subcategory: "agricultureTools",
        description: "Plant trees and protect the environment.", price: 699, rating: 3
    },
    {
      id: 7, img: Img7, title: "Gardening Tools", subcategory: "gardeningTools",
      description: "Plant trees and protect the environment.", price: 699, rating: 4
    },
    {
      id: 8, img: Img8, title: "Pots Products", subcategory: "pots",
      description: "Plant trees and protect the environment.", price: 699, rating: 5
    },
];

const TopProducts = () => {
  const navigate = useNavigate();

  // Handle Order Button Click
  const handleOrderClick = (subcategory) => {
    navigate(`/productlist/${subcategory}`); // Navigate with category
  };

  return (
    <div className="dark:bg-gray-950 dark:text-white px-10 py-8">
      <div className="flex items-center justify-center mt-12 mb-12 text-left">
        <p className="text-xl md:text-3xl font-bold">Our Top Rated Products</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4   gap-x-11 gap-y-10 place-items-center">
        {Data.map((product) => (
          <div
            key={product.id}
            className=" flex justify-between items-center  md:flex-col rounded-2xl bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 relative shadow-xl duration-300 group min-w-72"
          >
            {/* Product Image */}
            <div className="h-[140px] w-[140px] flex items-center justify-center mx-auto overflow-hidden rounded-lg  md:rounded-full">
              <img
                src={product.img}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 duration-300 drop-shadow-md"
              />
            </div>

            {/* Product Details */}
            <div className="p-4 text-center">
              
                
            <h1 className="text-xl font-bold">{product.title}</h1>
              {/* ⭐ Rating Section */}
              <div className="w-full flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              {/* Product  Description */}
              <p className="text-gray-500 dark:text-white duration-300 text-sm line-clamp-2 font-semibold">
                {product.description}
              </p>

              {/* See More Button */}
              <button
                className="bg-primary hover:scale-105 duration-300 text-white py-1 px-4 rounded-full mt-4 hover:bg-green-800 hover:text-white "
                onClick={() => handleOrderClick(product.subcategory)}
              >
               See More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;