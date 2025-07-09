import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaStar } from "react-icons/fa"; // Import star icon

import plants from "../../assets/ProductImg/plants.jpg";
import Soil from "../../assets/ProductImg/fertilizer.jpg";
import Tool from "../../assets/ProductImg/t6.jpg";
import Other from "../../assets/ProductImg/Gardener.jpg";

export default function Products() {
  const navigate = useNavigate();

  // Product list with price & rating
  const products = [
    {
      id: 1,
      img: plants,
      title: "Plants",
      description: "A beautiful plant for decoration.",
      price: "₹299",
      rating: 4.5,
      category: "plant",
    },
    {
      id: 2,
      img: Soil,
      title: "Soil And Fertilizers",
      description: "Low-maintenance plant for home or office.",
      price: "₹499",
      rating: 5,
      category: "soil",
    },
    {
      id: 3,
      img: Tool,
      title: "Gardening Tools",
      description: "A perfect companion for your workspace.",
      price: "₹799",
      rating: 4.8,
      category: "tool",
    },
    {
      id: 4,
      img: Other,
      title: "Book Gardener",
      description: "Bring freshness and nature indoors.",
      price: "₹199",
      rating: 4.2,
      link: "/appointment",
    },
  ];

  return (
    <div className="pt-16 pb-12  dark:bg-gray-950 dark:text-white">
      <h2 className="text-xl  md:text-4xl font-bold pb-8 text-center">
        Our Collections
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mg:gap-6 place-items-center">
        {products.map((product) => (
          <Card
            key={product.id}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 
           min-h-[300px] bg-white dark:bg-gray-800 hover:bg-green-50 
           dark:hover:bg-gray-700 dark:text-white shadow-xl hover:shadow-2xl 
           transition duration-300 rounded-lg"

          >
            {/* Product Image */}
            <CardHeader floated={false} className="overflow-hidden rounded-lg ">
              <img src={product.img} alt={product.title} className="w-full h-full object-cover" />
            </CardHeader>

            {/* Rating & Price Section */}
            <div className="flex flex-col items-center mt-5 mb-3"> 
              {/* Rating */}
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-yellow-500 ${i < product.rating ? "fill-current" : "opacity-50"}`} />
                ))}
              </div>
              {/* Price */}
              
            </div>

            {/* Product Title & Description */}
            <CardBody className="text-center p-0  ">
              <Typography variant="h5" color="blue-gray" className="text-lg font-bold">
                {product.title}
              </Typography>
              <Typography color="gray" className="text-gray-500 text-sm line-clamp-2 font-semibold dark:text-gray-300">
                {product.description}
              </Typography>
            </CardBody>

            {/* Button with adjusted margin */}
            <CardFooter className="flex justify-center">
              <Button
                onClick={() =>
                  product.link ? navigate(product.link) : navigate(`/products/${product.category}`)
                }
                color="green"
                className="bg-primary hover:scale-105 transition duration-300 text-white   md:px-4 rounded-full "
              >
                  View {product.category ? "Products" : "Gardener"}

              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
