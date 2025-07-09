import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import "./my.css"; // Import after slick styles




import grassbg from "../../assets/ProductImg/plants.jpg";
import image1 from "../../assets/ProductImg/p1.jpg";
import image2 from "../../assets/ProductImg/p2.jpg";
import image3 from "../../assets/ProductImg/nature.jpg";
import image4 from "../../assets/ProductImg/greenery.jpg";
import image5 from "../../assets/ProductImg/123.jpg";
import image6 from "../../assets/ProductImg/me1.jpg";
import image7 from "../../assets/ProductImg/night.jpg";
import image8 from "../../assets/ProductImg/purple.jpg";

const products = [
  {
    id: 1,
    name: "Organic Soil",
    price: "$15",
    image: image1,
    description: "Rich organic soil for healthier plants.",
  },
  {
    id: 2,
    name: "Potting Mix",
    price: "$12",
    image: image2,
    description: "Perfect blend for indoor and outdoor plants.",
  },
  {
    id: 3,
    name: "Compost",
    price: "$10",
    image: image3,
    description: "Natural compost to enrich your garden.",
  },
  {
    id: 4,
    name: "Mulch",
    price: "$8",
    image: image4,
    description: "Retain moisture and suppress weeds with mulch.",
  },
  {
    id: 5,
    name: "Organic Soil",
    price: "$15",
    image: image5,
    description: "Rich organic soil for healthier plants.",
  },
  {
    name: "Potting Mix",
    price: "$12",
    image: image6,
    description: "Perfect blend for indoor and outdoor plants.",
  },
  {
    id: 7,
    name: "Compost",
    price: "$10",
    image: image7,
    description: "Natural compost to enrich your garden.",
  },
  {
    id: 8,
    name: "Mulch",
    price: "$8",
    image: image8,
    description: "Retain moisture and suppress weeds with mulch.",
  },
  {
    id: 9,
    name: "Organic Soil",
    price: "$15",
    image: image1,
    description: "Rich organic soil for healthier plants.",
  },
  {
    id: 10,
    name: "Potting Mix",
    price: "$12",
    image: image2,
    description: "Perfect blend for indoor and outdoor plants.",
  },
  {
    id: 11,
    name: "Compost",
    price: "$10",
    image: image3,
    description: "Natural compost to enrich your garden.",
  },
  {
    id: 12,
    name: "Mulch",
    price: "$8",
    image: image4,
    description: "Retain moisture and suppress weeds with mulch.",
  },
];
let settings = {
  dots: false,
  infinite: false,
  speed: 1000,
  slidesToShow: 4,
  slidesToScroll: 4,
  
};

const ProductPage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-10">
      {/* Hero Section */}
      <div
        className="heroimage bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white py-[10rem]"
        style={{
          backgroundImage: `url(${grassbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mt-[8rem] text-white drop-shadow-lg">
            Plant Products
          </h1>
          <p className="mt-4 text-2xl font-light">
            Grow with Us: Premium Plant Products.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto py-10 px-6 gap-10 mt-5">
        <div className=" ">
          <Slider {...settings}>
            {products.map((product) => (
              <div
              key={product.id}
              className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl "
            >
            
                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                {/* Product Info */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-2xl font-bold text-green-600">
                      {product.price}
                    </span>
                    <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-110">
                      Buy Now
                    </button>
                  </div>
                </div>
                {/* Product Badge */}
                <span className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full shadow-lg">
                  New
                </span>
              </div>
            ))}
          </Slider>
        </div>
      </div>
      {/* _______________________2rd row____________________________________________ */}
      <div className="container   px-6 ">
        <div className="">
          <Slider {...settings}>
            {products.map((product) => (
              <div
              key={product.id}
              className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl ">
            
                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                {/* Product Info */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-2xl font-bold text-green-600">
                      {product.price}
                    </span>
                    <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-110">
                      Buy Now
                    </button>
                  </div>
                </div>
                {/* Product Badge */}
                <span className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full shadow-lg">
                  New
                </span>
              </div>
            ))}
          </Slider>
        </div>
      </div>
      {/* _______________________3rd row____________________________________________ */}
      <div className="container mx-auto py-10 px-6 gap-10 ">
        <div className="">
          <Slider {...settings}>
            {products.map((product) => (
              <div
              key={product.id}
              className="relative bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {/* Product Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              {/* Product Info */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {product.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-2xl font-bold text-green-600">
                    {product.price}
                  </span>
                  <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-110">
                    Buy Now
                  </button>
                </div>
              </div>
              {/* Product Badge */}
              <span className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full shadow-lg">
                New
              </span>
            </div>
            
            ))}
          </Slider>
        </div>
      </div>
      
    </div>
  );
};

export default ProductPage;
