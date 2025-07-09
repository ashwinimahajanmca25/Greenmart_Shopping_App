import React from "react";
import { FaTruck, FaBuilding, FaUserAlt, FaHome } from "react-icons/fa";
import { motion } from "framer-motion";

const OrderProcessAnimation = ({ order_status }) => {
  // Define steps with icons
  const steps = [
    { label: "Company", icon: FaBuilding, status: "pending" },
    { label: "Shipped", icon: FaTruck, status: "shipped" },
    { label: "Out for Delivery", icon: FaUserAlt, status: "out_for_delivery" },
    { label: "Delivered", icon: FaHome, status: "delivered" }
  ];

  // Determine active step index
  const activeIndex = steps.findIndex(step => step.status === order_status);

  return (
    <div className="relative w-full md:w-3/4 mx-auto mt-6">
      {/* Progress Line with Animation */}
      <div className="absolute top-6 left-0 w-full h-1 bg-gray-300">
        <motion.div
          className="h-1 bg-green-500"
          initial={{ width: "0%" }}
          animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </div>

      {/* Steps with Icons */}
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg ${
                  index <= activeIndex ? "bg-green-500" : "bg-gray-400"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index <= activeIndex ? 1.2 : 1 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <p className={`mt-2 text-sm ${index <= activeIndex ? "text-green-500" : "text-gray-500"}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProcessAnimation;
