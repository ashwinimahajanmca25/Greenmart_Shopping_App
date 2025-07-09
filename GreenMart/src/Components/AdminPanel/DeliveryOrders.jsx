import { useEffect, useState, useContext } from "react";
import axios from "axios";
import moment from "moment";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
// import DeliveryOTPVerification from "./DeliveryConfirm"; // Ensure correct path

export default function DeliveryOrders() {
  const { user, setUser } = useContext(UserContext); // ✅ Get logged-in delivery boy details
  const [orders, setOrders] = useState([]);
  const { id, token } = useContext(UserContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryBoyName, setDeliveryBoyName] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const [updatingOrders, setUpdatingOrders] = useState(new Set()); // ✅ Track clicked buttons

  const navigate = useNavigate();
  if (!setUser) {
    console.error(
      "❌ setUser is undefined! Ensure UserContext is correctly wrapped."
    );
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user || !user.id) {
          console.error("❌ User ID not found, cannot fetch orders.");
          return;
        }

        console.log("🟢 Fetching orders for delivery boy ID:", user.id);

        const res = await axios.get(
          `http://localhost:3002/api/delivery/delivery-orders/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        console.log("🟢 Orders Fetched Successfully:", res.data);
        if (res.data.length > 0) {
          setCustomerDetails({
            name: res.data[0].customer_name,
            address: res.data[0].shipping_address,
            total_price: res.data.reduce(
              (acc, order) => acc + order.total_price,
              0
            ),
          });
        }
        if (res.data.length > 0) {
          setDeliveryBoyName(res.data[0].delivery_boy_name); // ✅ Store the name
        }

        setOrders(res.data);
      } catch (error) {
        console.error(
          "❌ Error fetching orders:",
          error.response?.data || error
        );
      }
    };

    if (user) fetchOrders();
  }, [user]);
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("❌ No refresh token found. Logging out...");
        handleLogout();
        return;
      }

      const response = await fetch(
        "http://localhost:3002/api/delivery/refresh-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: refreshToken }),
        }
      );

      const data = await response.json();

      if (response.ok && data.accessToken) {
        console.log("🟢 Access Token Refreshed:", data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      } else {
        console.error("❌ Failed to refresh token:", data);
        handleLogout(); // ✅ If refresh token is invalid, log out
      }
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      handleLogout();
    }
  };

  const updateStatus = async (orderIds, status) => {
    // Accept an array
    if (!Array.isArray(orderIds)) {
      console.error("orderIds is not an array:", orderIds);
      orderIds = Array.isArray(orderIds) ? orderIds : [orderIds]; // Convert to array
    }

    setUpdatingOrders((prev) => new Set([...prev, ...orderIds])); // Disable buttons

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Session expired. Please log in again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3002/api/delivery/update-status",
        { order_ids: orderIds, status }, // Send all order IDs
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Status Updated!");
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Error updating status:", error.response?.data || error);
      alert("Failed to update status. Please try again.");
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        orderIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await fetch("http://localhost:3002/logout", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: refreshToken }),
        });
      }

      // Clear localStorage and navigate to login page
      localStorage.clear();
      navigate("/");
      window.location.reload(); // Reload to update the state
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // ✅ Group Orders by Assigned Date
  const groupedOrders = orders.reduce((acc, order) => {
    const assignedDate = moment(order.assigned_date).format("YYYY-MM-DD");

    if (!acc[assignedDate]) {
      acc[assignedDate] = {};
    }

    if (!acc[assignedDate][order.customer_name]) {
      acc[assignedDate][order.customer_name] = {
        details: order, // Store customer details once
        items: [],
      };
    }

    acc[assignedDate][order.customer_name].items.push(order);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4 mt-20 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-center font-semibold">
          {deliveryBoyName ? `${deliveryBoyName}'s Orders` : "My Orders"}
        </h2>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white font-bold px-4 py-2 rounded w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {Object.keys(groupedOrders).length === 0 ? (
        <p>No orders assigned.</p>
      ) : (
        Object.entries(groupedOrders).map(([assignedDate, customers]) => (
          <div key={assignedDate} className="mb-6">
            <h3 className="text-lg font-semibold mb-6">
              Assigned Date: {moment(assignedDate).format("DD MMM YYYY")}
            </h3>

            {Object.entries(customers).map(([customer, { details, items }]) => (
              <div
                key={customer}
                className="border p-4 my-4 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold">
                  Customer: {items[0].customer_name}'s Orders
                </h2>
                <p>
                  <strong>Mobile:</strong> {details.contact}
                </p>
                <p>
                  <strong>Address:</strong> {items[0].address}
                </p>
                <p>
                  <strong>Total Price:</strong> ₹{details.amount}
                </p>

                <table className="w-full bg-white border border-green-100 text-sm sm:text-base">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-2 border">Order ID</th>
                      <th className="p-2 border">Product Name</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Price (₹)</th>
                      <th className="p-2 border">
                        Out for Delivery Date & Time
                      </th>
                      <th className="p-2 border">Delivered Date & Time</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((order, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{order.order_id}</td>
                        <td className="p-2 border">{order.product_name}</td>
                        <td className="p-2 border">{order.quantity}</td>
                        <td className="p-2 border">₹{order.base_price}</td>
                        <td className="p-2 border flex flex-col gap-1 items-center">
                          {order.out_for_delivery_date
                            ? moment(order.out_for_delivery_date).format(
                                "DD MMM YYYY HH:mm"
                              )
                            : "Not Out for Delivery"}
                        </td>
                        <td className="p-2 border">
                          {order.delivered_date
                            ? moment(order.delivered_date).format(
                                "DD MMM YYYY HH:mm"
                              )
                            : "Not Delivered"}
                        </td>
                        <td className="p-2 border">{order.order_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Common Action Buttons */}
                <div className="mt-4 flex justify-end space-x-4">
                  {/* Out for Delivery Button */}
                  <button
                    onClick={() => {
                      const orderIds = items.map((order) => order.order_id);
                      updateStatus(orderIds, "out_for_delivery");
                    }}
                    className={`px-4 py-2 rounded text-white transition-all duration-300 ${
                      details.order_status === "out_for_delivery" ||
                      details.order_status === "delivered"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                    disabled={
                      details.order_status === "out_for_delivery" ||
                      details.order_status === "delivered"
                    }
                  >
                    Out for Delivery
                  </button>

                  {/* Delivered Button */}
                  <button
                    onClick={() => {
                      const orderIds = items.map((order) => order.order_id);
                      updateStatus(orderIds, "delivered");
                    }}
                    className={`px-4 py-2 rounded text-white transition-all duration-300 ${
                      details.order_status === "delivered"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                    disabled={details.order_status === "delivered"}
                  >
                    {details.order_status === "delivered"
                      ? "Delivered"
                      : "Mark as Delivered"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
