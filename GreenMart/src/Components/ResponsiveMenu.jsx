import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCaretDown } from "react-icons/fa";

const ResponsiveMenu = ({ open, setOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories (same as Navbar)
  useEffect(() => {
    setCategories([
      { id: 1, name: "Plants", category: "plant" },
      { id: 2, name: "Soil and Fertilizers", category: "soil" },
      { id: 3, name: "Tools", category: "tool" },
    ]);
  }, []);

  // Function to close menu when a link is clicked
  const handleClose = () => {
    setOpen(false);
    setShowDropdown(false);
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="absolute top-11 left-8 w-4/5 bg-primary z-20 overflow-hidden py-4 rounded-3xl"
        >
          <div className="text-base font-semibold bg-primary text-white">
            <ul className="flex flex-col justify-center items-center gap-1">
              <li>
                <Link to="/" className="text-white" onClick={handleClose}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white" onClick={handleClose}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white" onClick={handleClose}>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white" onClick={handleClose}>
                  Contact
                </Link>
              </li>

              {/* Products Dropdown */}
              <li className="relative w-full text-center">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-center text-white text-base ml-3 gap-1"
                >
                  Products
                  <FaCaretDown className={`transition-all ${showDropdown ? "rotate-180" : ""}`} />
                </button>
                {showDropdown && (
                  <ul className="bg-white text-black rounded-lg mt-2 w-full">
                    {categories.map((data) => (
                      <li key={data.id} className="p-2 hover:bg-gray-300">
                        <Link to={`/products/${data.category}`} onClick={handleClose}>
                          {data.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveMenu;
