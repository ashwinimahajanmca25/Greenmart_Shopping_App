import React from "react";
import { FaTruck, FaShippingFast, FaBoxOpen} from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { AiOutlineGlobal } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Shipping = () => {
  const navigate=useNavigate();
  const handleOrderClick = () => {
   
    navigate("/topproducts");

  }
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white py-10 mt-20 px-5">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className=" text-xl md:text-3xl font-bold text-green-700 dark:text-green-400">
           Fast & Reliable Shipping
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          We ensure quick and safe delivery of your products right to your doorstep!
        </p>
      </div>

      {/* Shipping Info Section */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Free Shipping */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <FaTruck className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center">Free Shipping</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2">
            Enjoy free shipping on all orders above $50. No hidden charges!
          </p>
        </div>

        {/* Fast Delivery */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <FaShippingFast className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center">Fast Delivery</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2">
            We process and ship orders within 24 hours to ensure quick delivery.
          </p>
        </div>

        {/* Secure Packaging */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <FaBoxOpen className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center">Secure Packaging</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2">
            Your products are packed securely to avoid any damage during transit.
          </p>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-4">
          Shipping Policy
        </h2>
        <ul className="text-gray-700 dark:text-gray-300 list-disc pl-6 space-y-3">
          <li><FaShippingFast className="inline-block mr-1 text-xl text-green-800 dark:text-green-400"/> Standard shipping time is 3-7 business days.</li>
          <li><AiOutlineGlobal className="inline-block mr-1 text-xl text-green-800 dark:text-green-400"/> International shipping available with varying timeframes.</li>
          <li><MdEmail className="inline-block mr-1 text-xl text-green-800 dark:text-green-400"/> Tracking details will be shared via email upon dispatch.</li>
          <li><FaPhone className="inline-block mr-2 text-xl text-green-800 dark:text-green-400"/>
           Contact our support for urgent delivery requests.</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-10 flex justify-center ">
        <button onClick={handleOrderClick} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full text-lg shadow-lg transition duration-300">
        <FaCartShopping className="inline-block mr-2" />
        Shop Now
        </button>
      </div>
    </div>
  );
};

export default Shipping;
