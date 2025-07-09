import React, { useEffect, useState, useContext } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";
import img2 from "../../assets/image5.jpg";
import Swal from "sweetalert2";
import OrderProcessAnimation from "./OrderProcessAnimation"; // Import the updated component
import { FaInfoCircle } from "react-icons/fa"; // ℹ️ icon (you can install with: npm install react-icons)

const OrdersPage = () => {
  const [orderData, setOrderData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [loginPopup, setLoginPopup] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null); // store order_id for tooltip toggle

  useEffect(() => {
    console.log("User state changed:", user); // Debug user data

    if (!user) {
      setTimeout(() => setLoginPopup(true), 100);
    } else {
      setLoginPopup(false);
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    let email = user?.email || localStorage.getItem("email"); // Get from user context or localStorage

    if (!email) {
      console.error("❌ User email is missing, skipping request.");
      return;
    }

    console.log("📢 Fetching orders for:", email);

    try {
      const response = await axios.get("http://localhost:3002/myorders", {
        params: { email },
      });

      console.log("✅ Orders fetched:", response.data);
      setOrderData(response.data);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsPopup(true);
  };

  const handleClosePopup = () => {
    setShowDetailsPopup(false);
  };

  const handleViewProducts = () => {
    navigate("/topproducts");
  };
  const handleGiveFeedback = () => {
    navigate("/feedbackpage");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4; // Show 4 orders per page

  // Calculate total pages
  const totalPages = Math.ceil(orderData.length / ordersPerPage);

  // Get the orders for the current page
  const startIndex = (currentPage - 1) * ordersPerPage;
  const displayedOrders = orderData.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  const handleCancelOrder = async (order_id,idproducts) => {
    console.log("🛑 Cancelling order with ID:", order_id);
    const type = "cancel";
    const { value: reason } = await Swal.fire({
      title: "Cancel Order",
      input: "text",
      inputPlaceholder: "Enter a reason for cancellation",
      showCancelButton: true,
      confirmButtonText: "Cancel Order",
      cancelButtonText: "Close",
      confirmButtonColor: "#d33",
      cancelButtonColor: "green",
      inputValidator: (value) => {
        if (!value) {
          return "You must provide a reason!";
        }
      },
    });
  
    if (!reason) return; // If user cancels input
  
    try {
      const response = await axios.post("http://localhost:3002/update-order-status", {
        orderId: order_id,
        productId: idproducts,
        type, // 👈 This must exist
        reason, // ✅ Ensure the backend knows it's a cancellation
      });
  
      console.log("✅ Cancel Order Response:", response.data);
  
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Order Cancelled",
          text: "Your order has been cancelled successfully!",
          confirmButtonColor: "#d33",
        });
        fetchOrders(); // Refresh orders list
      }
    } catch (error) {
      console.error("❌ Error cancelling order:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Cancellation Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };
  
  const handleReturnOrder = async (order_id, delivered_date, idproducts, quantityOrdered, pricePerUnit) => {
    console.log("🔄 Returning order:", order_id);
    const type="return";
    const deliveryDate = new Date(delivered_date);
    const today = new Date();
    const differenceInDays = (today - deliveryDate) / (1000 * 3600 * 24);
  
    if (differenceInDays > 7) {
      return Swal.fire({
        icon: "error",
        title: "Return Period Expired",
        text: "You can only return products within 7 days of delivery.",
        confirmButtonColor: "#d33",
      });
    }
  
    // Create custom HTML input
    const { value: formValues } = await Swal.fire({
      title: "Return Product",
      html:
        `<input id="reason" class="swal2-input" placeholder="Reason for return">` +
        `<input id="returnQty" class="swal2-input" placeholder="Quantity to return" type="number" min="1" max="${quantityOrdered}" value="1">` +
        `<div id="pricePreview" style="margin-top:10px;font-weight:bold;">Return Amount: ₹${pricePerUnit}</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit Return",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const reason = document.getElementById('reason').value;
        const returnQty = parseInt(document.getElementById('returnQty').value);
  
        if (!reason) return Swal.showValidationMessage("Please provide a return reason.");
        if (!returnQty || returnQty < 1 || returnQty > quantityOrdered) {
          return Swal.showValidationMessage(`Enter a quantity between 1 and ${quantityOrdered}.`);
        }
  
        return { reason, returnQty };
      },
      didOpen: () => {
        const qtyInput = document.getElementById('returnQty');
        const preview = document.getElementById('pricePreview');
  
        qtyInput.addEventListener('input', () => {
          const val = parseInt(qtyInput.value) || 0;
          const price = val * pricePerUnit;
          preview.innerText = `Return Amount: ₹${price}`;
        });
      }
    });
  
    if (!formValues) return;
  
    const { reason, returnQty } = formValues;
    const returnAmount = returnQty * pricePerUnit;
  
    try {
      const response = await axios.post("http://localhost:3002/update-order-status", {
        orderId: order_id,
        productId: idproducts,
        type, // 👈 This must exist
        returnQty,
        returnAmount,
        reason,
      });
      // console.log({
      //   orderId: order_id,
      //   productId: idproducts,
      //   reason,
      //   returnQty,
      //   returnAmount,
      //   type,
      // });
      
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Return Submitted",
          text: `₹${returnAmount} will be processed for return.`,
          confirmButtonColor: "#28a745",
        });
        fetchOrders(); // Refresh list
      } else {
        throw new Error(response.data.message || "Unknown error");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      Swal.fire({
        icon: "error",
        title: "Return Failed",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#d33",
      });
    }
  };
  const isReturnExpired = (delivered_date) => {
    const today = new Date();
    const delivery = new Date(delivered_date);
    const diffTime = today - delivery;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };
  
  return (
    <div className="flex flex-col   md:flex-row dark:bg-gray-900 md:mb-14">
      <Sidebar />
      <div className="justify-center flex-1 p-14 md:pl-32  md:mt-20 pr-12  dark:bg-gray-900">
        {orderData.length === 0 ? (
          <div className="w-4/6 bg-white rounded-lg mt-16 ml-20 shadow p-6 dark:bg-gray-300">
            <div className="flex flex-col items-center">
              <img src={img2} alt="Empty Orders" className="w-32 mb-4" />
              <p className="text-black text-lg mb-2 font-semibold">
                You haven’t placed any orders yet.
              </p>
              <p className="text-black text-sm mb-6 font-semibold">
                We can't wait to have you as a customer.
              </p>
              <button
                onClick={() => navigate("/topproducts")}
                className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800"
              >
                View Products
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {displayedOrders.map((order, index) => (
                <div
                  key={`${order.idproducts}-${index}`}
                  className="flex bg-white dark:bg-gray-300 rounded-lg shadow-lg overflow-hidden h-56 md:h-48  "
                >
                  {/* Left Side - Image */}
                  <div className="w-1/3  rounded-lg">
                    <img
                      src={`http://localhost:3002/ProductImg/${order.image_name}`}
                      alt={order.product_name}
                      className="w-full h-full object-cover p-2"
                    />
                  </div>

                  <div className="w-2/3 py-2 px-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold inline-block">
                          {order.product_name}
                        </h3>
                        <span
                          className={`inline-block mt-2 px-3 py-1 text-sm font-semibold text-white rounded-lg ${
                            order.order_status === "delivered"
                              ? "bg-green-800"
                              : order.order_status === "shipped"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        >
                          {order.order_status}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Price: ₹{order.base_price}
                      </p>
                      <p className="text-gray-600">
                        Quantity: {order.quantity}
                      </p>

                      {/* Order Status */}
                    </div>
                    {/*----------------cancel or return----------------------*/}
                    <div className="mt-2 flex justify-between items-center">
                    {order.order_status === "delivered" ? (
  <div className="relative flex items-center space-x-2">
    <button
      disabled={isReturnExpired(order.delivered_date)}
      onClick={() =>
        handleReturnOrder(
          order.order_id,
          order.delivered_date,
          order.idproducts,
          order.quantity,
          order.base_price
        )
      }
      className={`p-1 rounded-lg text-white ${
        isReturnExpired(order.delivered_date)
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      Return Order
    </button>

    {isReturnExpired(order.delivered_date) && (
      <span className="text-xs text-red-600">Return period expired</span>
    )}
  </div>
) :
                       order.order_status !== "cancelled" &&
                        order.order_status !== "returned" ? (
                        <div className="relative group flex items-center space-x-1">
                          <button
                            onClick={() => handleCancelOrder(order.order_id, order.idproducts,)}
                            disabled={order.order_status === "out_for_delivery"}
                            className={`p-1 rounded-lg text-white transition-all duration-300 ${
                              order.order_status === "out_for_delivery"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            Cancel Order
                          </button>

                          {/* ℹ️ Icon to trigger tooltip */}
                          {order.order_status === "out_for_delivery" && (
                            <FaInfoCircle
                              className="text-gray-600 cursor-pointer"
                              onClick={() =>
                                setShowTooltip(
                                  showTooltip === order.order_id
                                    ? null
                                    : order.order_id
                                )
                              }
                              title="Why disabled?" // fallback for desktop
                            />
                          )}

                          {/* Tooltip */}
                          {order.order_status === "out_for_delivery" &&
                            showTooltip === order.order_id && (
                              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                                Cannot cancel once out for delivery
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {order.order_status}
                        </span>
                      )}

                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-500 hover:underline"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Feedback Button */}
                    <button
                      onClick={handleGiveFeedback}
                      className="w-full mt-1 bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-green-100 text-gray-800 rounded-md hover:bg-gray-400"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-lg font-semibold dark:text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-4 py-2 bg-green-100 text-gray-800 rounded-md hover:bg-gray-400"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailsPopup && selectedOrder && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          initial={{ opacity: 0 }} // Starts invisible
          animate={{ opacity: 1 }} // Fades in
          exit={{ opacity: 0 }} // Fades out when closing
        >
          <motion.div
            className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl"
            initial={{ scale: 0.8, opacity: 0 }} // Start small & invisible
            animate={{ scale: 1, opacity: 1 }} // Grow smoothly
            exit={{ scale: 0.8, opacity: 0 }} // Shrinks when closing
            transition={{ duration: 0.3, ease: "easeOut" }} // Smooth effect
          >
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300  text-base"
            >
              ✖
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Order Details
            </h3>

            {/* Order Info Section */}
            <div className="flex items-center gap-5 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <img
                src={`http://localhost:3002/ProductImg/${selectedOrder.image_name}`}
                alt={selectedOrder.product_name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h4 className="text-lg font-semibold">
                  {selectedOrder.product_name}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Price: ₹{selectedOrder.base_price}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Quantity: {selectedOrder.quantity}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Status:
                  <span
                    className={`ml-2 px-2 py-1 rounded-lg text-white text-sm ${
                      selectedOrder.order_status === "delivered"
                        ? "bg-green-500"
                        : selectedOrder.order_status === "shipped"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {selectedOrder.order_status}
                  </span>
                </p>
              </div>
            </div>

            {/* Payment & Shipping Info */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  💳 Payment Info
                </h4>
                <p>Status: {selectedOrder.payment_status}</p>
                <p>Method: {selectedOrder.payment_method}</p>
                <p>
                  Total: ₹{selectedOrder.base_price * selectedOrder.quantity}
                </p>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  🚚 Shipping Info
                </h4>
                <p>Address: {selectedOrder.shipping_address}</p>
                <p>Expected Delivery: {selectedOrder.expected_delivery}</p>
              </div>
            </div>

            {/* Order Tracking Animation */}
            <div className="mt-6">
              <OrderProcessAnimation
                order_status={selectedOrder.order_status}
              />
            </div>

            {/* Action Buttons */}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OrdersPage;
