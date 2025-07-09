import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdArrowRoundBack } from "react-icons/io";
import { UserContext } from "../UserContext"; // Assuming you're using UserContext

const BillPage = () => {
  const { user } = useContext(UserContext);

  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [billingDetails, setBillingDetails] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default payment method
  const [paidOrders, setPaidOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const latestGroupItems = location.state?.cartItems || [];
  const [cart, setCart] = useState(latestGroupItems);

  // Fetch user info by email
  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem("email");
      if (!email) return;

      try {
        const response = await axios.get(
          "http://localhost:3002/getUserByEmail",
          {
            params: { email },
          }
        );

        setBillingDetails(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData(); // Always fetch user data when component mounts
  }, []);
  const currentSessionId = localStorage.getItem("cartSessionId");

  const currentOrders = cart.filter(
    (order) => order.cart_session_id === currentSessionId
  );

  // Fetch user orders
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!user?.idusers) return;

      try {
        const response = await axios.get("http://localhost:3002/userorders", {
          params: { userId: user.idusers },
        });

        console.log("Fetched Order Items:", response.data);

        // Ensure order_id is assigned correctly
        const updatedCart = response.data.map((item) => ({
          ...item,
          order_id: item.order_id || null, // Ensure order_id exists
        }));

          // Filter out the paid orders
      const unpaidOrders = response.data.filter(order => order.payment_status === "Unpaid");

      // Set the unpaid orders to cart
      setCart(unpaidOrders);

      // Separate paid and unpaid orders
      setPaidOrders(response.data.filter(order => order.payment_status === "Paid"));
      setUnpaidOrders(unpaidOrders);
      } catch (error) {
        console.error("Error fetching order items:", error);
      }
    };

    fetchOrderItems();
  }, [user]);

  // Calculate total amount based on selected items
  useEffect(() => {
    const total = selectedItems.reduce(
      (sum, item) => sum + (item.total_price || 0),
      0
    );
    setTotalAmount(total);
  }, [selectedItems]);

  // Handle payment method selection
  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle billing details input change
  const handleBillingChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  // Handle "Proceed to Billing"
  const handleOpenBilling = () => {
    const selected = cart.filter((item) => item.selected);

    if (selected.length > 0) {
      setSelectedItems(selected); // Allow mixed orders
      setIsBillingOpen(true);
    } else {
      alert("Please select at least one item for billing.");
    }
  };
  // Handle purchase process
  const handleBuyNow = async () => {
    if (selectedItems.length === 0) {
      alert("No items selected for purchase.");
      return;
    }

    try {
      // Ensure orders are stored using `order_id`
      const orderDetails = selectedItems.map((item) => ({
        order_id: item.order_id || null, // ✅ Ensure order_id is set
        product_id: item.idproducts, // Reference product_id separately
        quantity: item.quantity,
        total_price: item.total_price * item.quantity,
      }));

      let paymentStatus = paymentMethod === "cod,upi" ? "completed" : "pending";

      // ✅ Send Payment Data to Backend
      const paymentResponse = await axios.post(
        "http://localhost:3002/payments",
        {
          orderDetails, // Ensure order_id is stored properly
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
        }
      );

      if (paymentResponse.data.success) {
        localStorage.setItem(
          "orderIds",
          JSON.stringify(selectedItems.map((item) => item.order_id))
        );

        // ✅ Update Order Status
        const orderIds = selectedItems.map((item) => item.order_id);
        await axios.post("http://localhost:3002/updateOrderStatus", {
          orderIds,
          order_status: "shipped",
        });

        navigate("/print");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred while processing the payment.");
    }
  };
  // Toggle selection of all products
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const updatedCart = cart.map((item) => ({
      ...item,
      selected: newSelectAll,
    }));

    setCart(updatedCart);
    setSelectedItems(newSelectAll ? updatedCart : []);

    // **Update total price immediately**
    const total = newSelectAll
      ? updatedCart.reduce(
          (sum, item) => sum + (item.total_price || 0) * (item.quantity || 1),
          0
        )
      : 0;

    setTotalAmount(total);
  };

  function formatDateTime(dtString) {
    return new Date(dtString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return (
    <div>
      {/* Cart Section */}
      <div className="pt-28 px-6 dark:bg-gray-800 dark:text-white">
        <div>
          <button onClick={() => navigate(-1)}>
            <IoMdArrowRoundBack className="text-3xl hover:text-gray-700 hover:scale-x-110 dark:text-white" />
          </button>
        </div>

        <h2 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
          Select your products
        </h2>
        {/* Table Headings (Visible only on larger screens) */}
        {currentOrders.length > 0 && (
          <div className="hidden sm:grid grid-cols-5 items-center bg-green-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-md mb-2">
            <span className="text-center flex justify-center items-center">
              <span>Select All</span>
              {/* "Select All" Checkbox */}
              {cart.length > 0 && (
                <span className="ml-2 mt-1 ">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-green-600 focus:ring-green-500 "
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </span>
              )}
            </span>
            <span className="text-center">Image</span>
            <span className="text-center">Name</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Price</span>
          </div>
        )}

        <AnimatePresence>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <motion.div
                key={`${item.order_id}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-5 items-center bg-white dark:bg-gray-600 shadow-lg rounded-lg p-4 mb-4"
              >
                {/* Select Checkbox */}
                <input
                  type="checkbox"
                  className="w-5 h-5 mx-auto cursor-pointer accent-green-600 focus:ring-green-500"
                  checked={item.selected || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;

                    // 1. Update the 'selected' status of the item in the cart
                    const updatedCart = cart.map((prod) =>
                      prod.order_id === item.order_id
                        ? { ...prod, selected: isChecked }
                        : prod
                    );

                    setCart(updatedCart);

                    // 2. Get all selected items directly from updatedCart
                    const selectedItemsNow = updatedCart.filter(
                      (prod) => prod.selected
                    );
                    setSelectedItems(selectedItemsNow);

                    // 3. Calculate total without any quantity multiplication
                    const total = selectedItemsNow.reduce(
                      (sum, prod) => sum + (prod.total_price || 0),
                      0
                    );
                    setTotalAmount(total);
                  }}
                />

                {/* Product Image */}
                <div className="flex justify-center">
                  <img
                    src={`http://localhost:3002/ProductImg/${item.image_name}`}
                    alt={item.product_name}
                    className="w-20 h-20 rounded-lg object-cover shadow-md"
                  />
                </div>

                {/* Product Name */}
                <div className="text-lg font-semibold text-center">
                  {item.product_name}
                </div>

                {/* Quantity */}
                <div className="text-lg font-bold text-center">
                  {item.quantity}
                </div>

                {/* Price */}
                <div className="text-lg font-bold text-center">
                  ₹{item.total_price}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mt-10 text-lg"
            >
              <p>Your cart is empty! 😔</p>
              <button className="text-indigo-600 underline"  onClick={() => navigate("/")}>Go Shopping</button>
            </motion.div>
          )}
        </AnimatePresence>

        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-y-3 sm:flex-row justify-between items-center mt-6 text-white py-3 px-6 rounded-lg shadow-lg"
          >
            {/* Total Price */}
            <h2 className=" text-base sm:text-lg font-bold bg-green-800 py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-center ">
              Total Price: ₹
              {totalAmount && !isNaN(totalAmount)
                ? totalAmount.toFixed(2)
                : "0.00"}
            </h2>

            {/* Proceed to Billing Button */}
            <button
              className="bg-gradient-to-r from-green-600 to-green-800 text-white px-3 py-2 sm:px-6 sm:py-3 
          font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 
          hover:from-green-700 hover:to-green-900 hover:scale-105 
          active:scale-95 active:shadow-md rounded-es-3xl rounded-se-3xl"
              onClick={handleOpenBilling}
            >
              Proceed to Billing
            </button>
          </motion.div>
        )}
      </div>

      {/* ------------------------------Billing Sidebar-----------------------------*/}
      <AnimatePresence>
        {isBillingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  dark:bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 p-4 sm:p-6 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl  bg-white dark:bg-gray-600  p-6 rounded-lg shadow-xl overflow-y-auto max-h-[90vh] relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsBillingOpen(false)}
                className="absolute top-3 right-3 text-gray-500 dark:text-white hover:text-gray-800 text-3xl md:text-5xl"
              >
                &times;
              </button>

              <h2 className="text-2xl md:text-3xl font-bold mb-6  text-center dark:text-white text-gray-800 ">
                Billing Details
              </h2>

              {/* Billing Form */}
              <div className="space-y-4 mb-6">
                {[
                  "firstname",
                  "lastname",
                  "email",
                  "shipping_address",
                  "city",
                  "state",
                  "country",
                  "contact",
                ].map((field, index) => (
                  <input
                    key={index}
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={billingDetails[field] || ""}
                    onChange={handleBillingChange}
                    placeholder={`Your ${
                      field.charAt(0).toUpperCase() + field.slice(1)
                    }`}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm dark:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Order Summary
                </h3>
                <ul className="divide-y divide-gray-300">
                  {selectedItems.map((item, index) => (
                    <li
                      key={`${item.order_id}-${index}`}
                      className="flex justify-between py-2 dark:text-white text-gray-700"
                    >
                      <span className="truncate">
                        {item.product_name} (x{item.quantity})
                      </span>
                      <span className="font-semibold">
                        ₹{(item.total_price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between text-lg font-bold dark:text-white text-gray-900">
                  <span>Total:</span>
                  <span>
                    ₹
                    {totalAmount && !isNaN(totalAmount)
                      ? totalAmount.toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
              {/* Payment Method Selection */}
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  Select Payment Method:
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {/* UPI Payment */}
                  <label className="flex items-center space-x-2 cursor-pointer border p-3 rounded-md shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={handlePaymentChange}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-900 dark:text-white">UPI</span>
                  </label>

                  {/* Net Banking */}
                  <label className="flex items-center space-x-2 cursor-pointer border p-3 rounded-md shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="radio"
                      name="payment_method"
                      value="net_banking"
                      checked={paymentMethod === "net_banking"}
                      onChange={handlePaymentChange}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Net Banking
                    </span>
                  </label>

                  {/* Debit/Credit Card */}
                  <label className="flex items-center space-x-2 cursor-pointer border p-3 rounded-md shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={handlePaymentChange}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Debit/Credit Card
                    </span>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label className="flex items-center space-x-2 cursor-pointer border p-3 rounded-md shadow-sm bg-white dark:bg-gray-700">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={handlePaymentChange}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Cash on Delivery
                    </span>
                  </label>
                </div>
              </div>

              {/* Buy Now Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!paymentMethod) {
                    alert("Please select a payment method before proceeding.");
                    return;
                  }
                  handleBuyNow();
                }}
                className="mt-6 w-full bg-green-800 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-md hover:bg-green-700 transition duration-300"
              >
                Print
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillPage;
