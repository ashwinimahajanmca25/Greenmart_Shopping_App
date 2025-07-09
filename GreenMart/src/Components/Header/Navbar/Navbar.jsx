import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import { IoLogIn } from "react-icons/io5";
import { FaCaretDown, FaShoppingCart } from "react-icons/fa";
import DarkMode from "./DarkMode";
import LoginPopup from "../../Registration/LoginPopup";
import { IoMenu } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Userpopup from "../../UserPanel/Userpopup";
import ResponsiveMenu from "../../ResponsiveMenu";
import GoogleTranslator from "./GoogleTranslator"; //

const NavbarMenu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "About", link: "/about" },
  { id: 3, name: "Services", link: "/services" },
  { id: 4, name: "Contact", link: "/contact" },
];

const DropdownLinks = [
  { id: 1, name: "Plants", category: "plant" },
  { id: 2, name: "Soil and Fertilizers", category: "soil" },
  { id: 3, name: "Tools", category: "tool" },
];

const Navbar = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [loginPopup, setLoginPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]); // All products
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products based on search
  const [showSearchHistory, setShowSearchHistory] = useState(false); // Control dropdown visibility
  const { idproducts } = useParams();
  const product = products.find((p) => p.name === searchQuery);
  // Fetch all products when component mounts
  useEffect(() => {
    fetch("http://localhost:3002/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          // console.log("Fetched products:", data); // Log fetched products
        } else {
          console.error("Invalid API response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Load search history from localStorage on mount
  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(storedHistory);
  }, []);

  // Store search query in localStorage and update state
  const storeSearchHistory = (query) => {
    // Prevent duplicate entries
    const updatedHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ];
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setFilteredProducts([]);
      return;
    }

    storeSearchHistory(trimmedQuery);
    setShowSearchHistory(true);
    // Filter products locally
    if (matchingProduct) {
      navigate(
        `/product/${matchingProduct.idproducts}/${encodeURIComponent(
          matchingProduct.name
        )}`
      );
    } else {
      navigate(`/search/${encodeURIComponent(trimmedQuery)}`);
    }

    if (matchingProduct) {
      fetch(
        `http://localhost:3002/api/products/${
          matchingProduct.idproducts
        }/${encodeURIComponent(trimmedQuery)}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFilteredProducts(data);
            console.log("Filtered products:", data); // Log filtered products
          } else {
            setFilteredProducts([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching product details:", error);
        });
    }
    setFilteredProducts(filtered);
  }; // Make sure this closing bracket is present

  // Handle product click and navigate to product details page
  const handleProductClick = (product) => {
    console.log("Selected product:", product); // Debugging

    if (!product.idproducts) {
      console.error("Product ID is missing:", product);
      return;
    }

    navigate(
      `/product/${product.idproducts}/${encodeURIComponent(product.name)}`
    );

    // Close dropdown after selecting a product
    setShowSearchHistory(false);
    setFilteredProducts([]);
    setSearchQuery(""); // Optionally clear search input
  };

  // Show search history dropdown when clicking inside the search container
  const handleSearchBarClick = (event) => {
    event.stopPropagation();
    if (searchHistory.length > 0) {
      setShowSearchHistory(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".search-container") &&
        !event.target.closest(".search-dropdown")
      ) {
        setShowSearchHistory(false);
        setFilteredProducts([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full shadow-md bg-green-50 dark:bg-gray-900 dark:text-white duration-500 z-50">
      {/* Login Popup */}
      <LoginPopup loginPopup={loginPopup} handleLoginPopup={setLoginPopup} />

      <nav>
        <div className="flex justify-between pl-3 items-center py-2">
          {/* Logo Section */}
          <div>
            <Link to="/">
              <img
                src="/mainlogo.png"
                alt="Logo"
                className="w-7 h-7 md:h-16 md:w-20 object-cover inline-block"
              />
            </Link>
          </div>
          {/* Menu Section */}
          <div className="hidden md:block">
            <ul className="flex items-center gap-4 text-slate-700 dark:text-white">
              {NavbarMenu.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.link}
                    className="inline-block px-3 py-1 hover:text-primary font-semibold"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              {/* Products Dropdown */}
              <li className="group relative cursor-pointer">
                <a
                  href="#"
                  className="flex items-center z-10 px-3 py-1 hover:text-primary font-semibold"
                >
                  Products
                  <FaCaretDown className="group-hover:rotate-180 transition-all duration-200" />
                </a>
                <div className="absolute hidden group-hover:block w-[200px] bg-white z-50 text-black rounded-md shadow-md">
                  <ul>
                    {DropdownLinks.map((data) => (
                      <li key={data.id}>
                        <Link
                          to={`/products/${data.category}`}
                          className="block p-2 hover:bg-primary/20"
                        >
                          {data.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          {/* Icons Section */}
          <div className="flex justify-between gap-2 items-center text-slate-700 dark:text-white md:space-x-2 md:mr-5">
            <div className="relative search-container">
              <form
                onSubmit={handleSearch}
                className="relative flex items-center w-full"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const filtered = products.filter((p) =>
                      p.name
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase())
                    );
                    setFilteredProducts(filtered);
                  }}
                  onClick={handleSearchBarClick}
                  placeholder="Search"
                  className="w-28 sm:w-60 md:w-80 py-1 rounded-full border border-gray-300 pl-10 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                {/* Search Icon */}
                <IoMdSearch className="absolute left-3 text-gray-500 text-xl md:text-2xl lg:text-3xl dark:text-white" />
                {/* Clear Icon */}
                {searchQuery && (
                  <IoMdClose
                    onClick={() => {
                      setSearchQuery("");
                      setFilteredProducts([]);
                    }}
                    className="absolute right text-gray-500 hover:text-red-500 cursor-pointer text-xl transition dark:text-white"
                  />
                )}
              </form>

              {/* Filtered Products Dropdown */}
              {filteredProducts.length > 0 && searchQuery && (
                <div className="absolute bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-lg w-[300px] z-10 search-dropdown">
                  <ul>
                    {filteredProducts.map((product) => (
                      <li
                        key={product.idproducts}
                        onClick={() => handleProductClick(product)}
                        className="cursor-pointer hover:bg-primary/20 p-2 rounded"
                      >
                        {product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute bg-white dark:bg-gray-800 text-black dark:text-white mt-2 p-4 rounded-lg shadow-lg w-[300px] z-10 search-dropdown">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Recent Searches:</h3>
                    <button
                      onClick={() => {
                        setSearchHistory([]);
                        localStorage.removeItem("searchHistory");
                      }}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                  <ul>
                    {searchHistory
                      .filter(
                        (query, index, self) => self.indexOf(query) === index
                      )
                      .map((query, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setSearchQuery(query);
                            setShowSearchHistory(false);
                            handleSearch({ preventDefault: () => {} });
                          }}
                          className="cursor-pointer hover:bg-primary/20 p-2 rounded"
                        >
                          {query}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Google Translate Widget */}
            <GoogleTranslator />
            <button
              onClick={() => navigate("/cart")}
              className="text-lg sm:text-2xl ml-2"
            >
              <FaShoppingCart />
            </button>

            <Userpopup Userpopup={Userpopup} />
            {isLoggedIn ? (
              <button
                onClick={() => {
                  const userData = localStorage.getItem("userData"); // Get stored user data
                  const { role } = JSON.parse(userData); // Extract role from userData
                  if (role === "admin") {
                    navigate("/dash");
                  } else {
                    navigate("/userpanel");
                  }
                }}
              >
                <IoLogIn className="text-xl sm:text-2xl md:text-3xl text-green-800 dark:text-white" />
              </button>
            ) : (
              <button onClick={() => setLoginPopup(true)}>
                <IoLogIn className="text-xl sm:text-2xl md:text-3xl text-green-800 dark:text-white" />
              </button>
            )}

            <DarkMode />
            <div className="md:hidden" onClick={() => setOpen(!open)}>
              <IoMenu className="text-xl sm:text-2xl md:text-3xl" />
            </div>
          </div>
        </div>
      </nav>
      <ResponsiveMenu open={open} />
    </div>
  );
};

export default Navbar;
