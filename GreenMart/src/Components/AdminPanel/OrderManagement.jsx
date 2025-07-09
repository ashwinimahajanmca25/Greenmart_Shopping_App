// in delivery boy popup i want a cancel option which delete delivery boy idfrom orders table
import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Eye, Trash2, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import moment from "moment";
import Swal from 'sweetalert2';



const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(1); // Track assigned orders page
  const assignedOrdersPerPage = 5; // Limit per page

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys(); // Fetch delivery boys
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/allorders");

      // ✅ Do NOT group by user anymore, show separate rows for same user
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/all-delivery-boys"
      );
      setDeliveryBoys(response.data);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  };

  const handleAssignDeliveryBoyUser = async (orderId, deliveryBoyId) => {
    if (!orderId || !deliveryBoyId) {
      alert("Error: Order ID or Delivery Boy ID is missing!");
      return;
    }

    // ✅ Ensure orderId is an array
    const orderIds = orderId.toString().split(",");

    try {
      console.log(
        "📢 Assigning Delivery Boy",
        deliveryBoyId,
        "to Orders:",
        orderIds
      );

      for (let id of orderIds) {
        const response = await axios.put(
          `http://localhost:3002/api/assign-delivery-boy/${id.trim()}`, // ✅ Assign one by one
          { delivery_boy_id: deliveryBoyId }
        );

        console.log(`✅ Order ${id} Assigned Successfully!`, response.data);
      }

      alert("Delivery Boy Assigned to Orders Successfully!");
      fetchOrders(); // ✅ Refresh order list
    } catch (error) {
      console.error("❌ Error assigning delivery boy:", error);
      alert("Failed to assign delivery boy.");
    }
  };

  const fetchDeliveryBoyDetails = async (boyId) => {
    if (!boyId) {
      alert("No delivery boy assigned.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3002/api/delivery-boy/${boyId}`
      );

      if (!response.data.length) {
        alert("No recent orders found.");
        return;
      }

      setSelectedDeliveryBoy(response.data[0]); // ✅ Store delivery boy details
      setAssignedOrders(response.data); // ✅ Store all assigned orders
    } catch (error) {
      console.error("❌ Error fetching delivery boy details:", error);
      alert("Failed to fetch delivery boy details.");
    }
  };

 
const handleDelete = async (orderId) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`http://localhost:3002/api/deleteorder/${orderId}`);
    Swal.fire('Deleted!', 'The order has been deleted.', 'success');
    fetchOrders();
  } catch (error) {
    console.error("Error deleting order:", error);
    Swal.fire('Error!', 'Failed to delete the order.', 'error');
  }
};

  const handleViewDetails = async (orderId) => {
    setIsLoading(true);
    try {
      console.log("📢 Fetching details for Order ID:", orderId);

      // ✅ Fetch all details (User, Orders, Payment)
      const response = await axios.get(
        `http://localhost:3002/api/orderdetails/${orderId}`
      );

      if (!response.data || response.data.orders.length === 0) {
        alert("⚠️ No details found for this order.");
        setIsLoading(false);
        return;
      }

      console.log("✅ Fetched Orders, User & Payment:", response.data);

      setSelectedOrder({
        user: response.data.user, // ✅ User Details
        orders: response.data.orders, // ✅ All orders of the same timestamp
        payments: response.data.payments, // ✅ Single payment entry
      });
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      alert("Failed to fetch order details.");
    }
    setIsLoading(false);
  };

  const handleCancelDeliveryBoy = async (orderId) => {
    if (!orderId) {
      console.error("Error: Order ID is missing!");
      alert("Error: Order ID is missing!");
      return;
    }

    console.log("Removing delivery boy from order ID:", orderId); // ✅ Debugging

    try {
      await axios.put(
        `http://localhost:3002/api/remove-delivery-boy/${orderId}`
      );

      alert("Delivery Boy removed successfully!");

      fetchOrders(); // Refresh orders
      setSelectedDeliveryBoy(null); // Close popup
    } catch (error) {
      console.error("Error removing delivery boy:", error);
      alert("Failed to remove delivery boy.");
    }
  };

  // --------------------return within 7 day-----------------
  const handleReturnRequest = async (orderId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You can only return within 7 days after delivery.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, return it!",
    });
  
    if (!result.isConfirmed) return;
  
    try {
      const response = await axios.put(
        `http://localhost:3002/api/cancelOrReturnOrder/${orderId}`,
        { type: "return" }
      );
  
      Swal.fire("Returned!", response.data.message, "success");
      fetchOrders(); // refresh orders
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to return product.", "error");
    }
  };
  


  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
      out_for_delivery: "bg-purple-100 text-purple-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // ✅ Corrected pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );
  const assignedTotalPages = Math.ceil(
    assignedOrders.length / assignedOrdersPerPage
  );
  const paginatedAssignedOrders = assignedOrders.slice(
    (assignedCurrentPage - 1) * assignedOrdersPerPage,
    assignedCurrentPage * assignedOrdersPerPage
  );
  return (
    <div className="flex ">
      <AdminSidebar />
      <div className="p-6 mt-24">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-6 py-1">Order Management</h1>

          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search orders..."
              className="shadow-lg  hover:shadow-xl rounded-lg px-3 py-2 w-[300px] outline-none focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Order Table */}
        <div className="overflow-x-auto w-[800px] bg-white shadow-lg rounded-lg border border-gray-200">
          <table className="w-full border-collapse ">
            {/* Table Header */}
            <thead className="bg-green-800 text-white sticky top-0  ">
              <tr>
                {[
                  "S.No.",
                  "Customer",
                  "Total",
                  "Date",
                  "Delivery Boy",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="p-4 text-center text-base font-bold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 text-center">
              {paginatedOrders
                .filter((order) =>
                  order.customer_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((order, index) => (
                  <tr
                    key={`${order.user_id}` - `${order.order_date}`}
                    className="hover:bg-green-50 transition duration-200 "
                  >
                    {/* Serial No. */}
                    <td className="p-4">{index + 1}</td>

                    {/* Customer Name */}
                    <td className="p-4 font-medium text-gray-700">
                      {order.customer_name}
                    </td>

                    {/* Total Price */}
                    <td className="p-4 text-green-700 font-semibold">
                      ₹{order.payment_amount}
                    </td>

                    {/* Order Date */}
                    <td className="p-4 text-gray-600">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>

                    {/* Delivery Boy Assignment */}
                    <td className="p-4 text-center">
                      {order.delivery_boy_name ? (
                        <button
                          onClick={() =>
                            fetchDeliveryBoyDetails(
                              order.delivery_boy_id,
                              order.order_ids
                            )
                          }
                          className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                        >
                          {order.delivery_boy_name}
                        </button>
                      ) : (
                        <select
                          value={order.delivery_boy_id || ""}
                          onChange={(e) =>
                            handleAssignDeliveryBoyUser(
                              order.order_ids,
                              e.target.value
                            )
                          }
                          disabled={order.order_status === "pending"}
                          className={`border p-2 rounded-md bg-white shadow-sm focus:ring focus:ring-green-300 ${
                            order.order_status === "pending"
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-white"
                          }`}
                        >
                          <option value="">Select</option>
                          {deliveryBoys.map((boy) => (
                            <option key={boy.id} value={boy.id}>
                              {boy.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Actions (View & Delete) */}
                    <td className="p-4 flex justify-center space-x-3">
                      <button
                        onClick={() =>
                          handleViewDetails(order.order_ids.split(",")[0])
                        }
                        className="text-green-700 hover:text-green-900 transition"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.order_ids)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-green-200 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft />
          </button>

          <span className="px-4 py-1 bg-green-800 text-white rounded-lg">
            {currentPage}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-green-200 rounded-lg disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      {selectedDeliveryBoy && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4">
          <div className="bg-white p-3 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Delivery Boy Details
              </h2>
              <button
                onClick={() => setSelectedDeliveryBoy(null)}
                className="text-gray-500 hover:text-gray-800 text-lg"
              >
                ✖
              </button>
            </div>

            {/* Delivery Boy Info */}
            <div className="text-gray-700 text-sm space-y-1">
              <p>
                <strong>Name:</strong> {selectedDeliveryBoy.name}
              </p>
              <p>
                <strong>Phone:</strong> {selectedDeliveryBoy.phone}
              </p>
              <p>
                <strong>Email:</strong> {selectedDeliveryBoy.email}
              </p>
            </div>

            {/* Assigned Orders */}
            <h3 className="font-semibold mt-3 text-gray-800">
              All Assigned Orders:
            </h3>
            {assignedOrders.length > 0 ? (
              <>
                <div className="overflow-auto max-h-40 border rounded">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead className="bg-green-200 text-gray-700">
                      <tr>
                        <th className="border p-1">Order ID</th>
                        <th className="border p-1">Product</th>
                        <th className="border p-1">Assigned</th>
                        <th className="border p-1">Out for Delivery</th>
                        <th className="border p-1">Delivered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssignedOrders.map((order, index) => (
                        <tr
                          key={index}
                          className="border hover:bg-gray-100 text-center"
                        >
                          <td className="border p-1">{order.order_id}</td>
                          <td className="border p-1">{order.product_name}</td>
                          <td className="border p-1">
                            {order.assigned_date
                              ? moment(order.assigned_date).format("DD MMM")
                              : "N/A"}
                          </td>
                          <td className="border p-1">
                            {order.out_for_delivery_date
                              ? moment(order.out_for_delivery_date).format(
                                  "DD MMM HH:mm"
                                )
                              : "N/A"}
                          </td>
                          <td className="border p-1">
                            {order.delivered_date
                              ? moment(order.delivered_date).format(
                                  "DD MMM HH:mm"
                                )
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center mt-2 space-x-2">
                  <button
                    disabled={assignedCurrentPage === 1}
                    onClick={() =>
                      setAssignedCurrentPage(assignedCurrentPage - 1)
                    }
                    className="px-2 py-1 bg-green-300 text-gray-800 rounded hover:bg-green-400 disabled:opacity-50 text-xs"
                  >
                    Prev
                  </button>

                  <span className="px-2 py-1 bg-gray-800 text-white rounded text-xs">
                    {assignedCurrentPage} / {assignedTotalPages}
                  </span>

                  <button
                    disabled={assignedCurrentPage === assignedTotalPages}
                    onClick={() =>
                      setAssignedCurrentPage(assignedCurrentPage + 1)
                    }
                    className="px-2 py-1 bg-green-200 text-gray-800 rounded hover:bg-green-400 disabled:opacity-50 text-xs"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-red-500 mt-2 text-sm">
                No assigned orders found.
              </p>
            )}

            {/* ✅ OpenStreetMap (OSM) with Leaflet */}
            <div className="mt-3">
              <h3 className="font-semibold text-gray-800">Current Location:</h3>
              <div className="mt-2 rounded-lg overflow-hidden border">
                <MapContainer
                  center={[
                    selectedDeliveryBoy.current_lat,
                    selectedDeliveryBoy.current_lng,
                  ]}
                  zoom={15}
                  style={{ height: "120px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      selectedDeliveryBoy.current_lat,
                      selectedDeliveryBoy.current_lng,
                    ]}
                    icon={L.icon({
                      iconUrl:
                        "https://leafletjs.com/examples/custom-icons/leaf-red.png",
                      iconSize: [30, 30],
                      iconAnchor: [15, 30],
                    })}
                  >
                    <Popup>{selectedDeliveryBoy.name}'s Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-3">
              <button
                onClick={() =>
                  handleCancelDeliveryBoy(selectedDeliveryBoy?.order_id)
                }
                className="w-1/2 bg-red-500 text-white px-2 py-2 text-sm rounded hover:bg-red-600 font-bold mx-auto"
              >
                Cancel Delivery Boy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white mt-20 p-6 rounded-lg shadow-lg w-10/12 max-h-[80vh] overflow-y-auto">
            <div className=" flex justify-between items-center sticky -top-7 bg-white z-10 p-2">
              <h2 className="text-xl font-bold ">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 🔹 User Details */}
            {selectedOrder.user && (
              <div className="p-4 bg-green-100 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
                <p>
                  <strong>Name:</strong> {selectedOrder.user.username || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.user.email || "N/A"}
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                  {selectedOrder.user.contact || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedOrder.user.shipping_address || "N/A"},{" "}
                  {selectedOrder.user.city}, {selectedOrder.user.state},{" "}
                  {selectedOrder.user.country}
                </p>
              </div>
            )}

            {/* 🔹 Combined Orders & Payment Table */}
            <div className="p-4 bg-green-50 rounded-lg mb-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-green-700">
                Order & Payment Details
              </h3>

              <table className="w-full border-collapse border border-gray-300 table-fixed shadow-lg rounded-lg">
                <thead>
                  <tr className="bg-green-200 text-gray-900">
                    <th className="border p-2 w-1/6">Order ID</th>
                    <th className="border p-2 w-1/6">Product</th>
                    <th className="border p-2 w-1/6">Quantity</th>
                    <th className="border p-2 w-1/6">Base Price</th>
                    <th className="border p-2 w-1/6">Total Price</th>
                    <th className="border p-2 w-1/6">Status</th>
                    <th className="border p-2 w-1/6">Image</th>
                  </tr>
                </thead>

                <tbody>
                  {/* 🟢 Delivered Products Section */}
                  {selectedOrder.orders.some(
                    (order) => order.order_status.toLowerCase() === "delivered"
                  ) && (
                    <>
                      <tr className="bg-green-100">
                        <td
                          colSpan="6"
                          className="p-2 text-center font-semibold text-green-700"
                        >
                          Delivered Products
                        </td>
                      </tr>
                      {selectedOrder.orders
                        .filter(
                          (order) =>
                            order.order_status.toLowerCase() === "delivered"
                        )
                        .map((order, index) => (
                          <tr
                            key={index}
                            className="border bg-white hover:bg-gray-100"
                          >
                            <td className="border p-2 text-center">
                              {order.order_id}
                            </td>
                            <td className="border p-2 text-center">
                              {order.product_name}
                            </td>
                            <td className="border p-2 text-center">
                              {order.quantity}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.base_price}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.total_price}
                            </td>
                            <td className="border p-2 text-center text-green-600 font-semibold">
                              {order.order_status}
                            </td>
                            <td className="border p-2 flex justify-center">
                              {order.image_name && (
                                <img
                                  src={`http://localhost:3002/ProductImg/${order.image_name}`}
                                  alt={order.product_name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* 🔵 Out for Delivery Section */}
                  {selectedOrder.orders.some(
                    (order) =>
                      order.order_status.toLowerCase() === "out_for_delivery"
                  ) && (
                    <>
                      <tr className="bg-purple-100">
                        <td
                          colSpan="6"
                          className="p-2 text-center font-semibold text-purple-700"
                        >
                          Out for Delivery
                        </td>
                      </tr>
                      {selectedOrder.orders
                        .filter(
                          (order) =>
                            order.order_status.toLowerCase() ===
                            "out_for_delivery"
                        )
                        .map((order, index) => (
                          <tr
                            key={index}
                            className="border bg-white hover:bg-gray-100"
                          >
                            <td className="border p-2 text-center">
                              {order.order_id}
                            </td>
                            <td className="border p-2 text-center">
                              {order.product_name}
                            </td>
                            <td className="border p-2 text-center">
                              {order.quantity}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.base_price}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.total_price}
                            </td>
                            <td className="border p-2 text-center text-purple-600 font-semibold">
                              {order.order_status}
                            </td>
                            <td className="border p-2 flex justify-center">
                              {order.image_name && (
                                <img
                                  src={`http://localhost:3002/ProductImg/${order.image_name}`}
                                  alt={order.product_name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* 🟠 Shipped Products Section */}
                  {selectedOrder.orders.some(
                    (order) => order.order_status.toLowerCase() === "shipped"
                  ) && (
                    <>
                      <tr className="bg-bule-100">
                        <td
                          colSpan="6"
                          className="p-2 text-center font-semibold text-blue-700"
                        >
                          Shipped Products
                        </td>
                      </tr>
                      {selectedOrder.orders
                        .filter(
                          (order) =>
                            order.order_status.toLowerCase() === "shipped"
                        )
                        .map((order, index) => (
                          <tr
                            key={index}
                            className="border bg-white hover:bg-gray-100"
                          >
                            <td className="border p-2 text-center">
                              {order.order_id}
                            </td>
                            <td className="border p-2 text-center">
                              {order.product_name}
                            </td>
                            <td className="border p-2 text-center">
                              {order.quantity}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.base_price}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.total_price}
                            </td>
                            <td className="border p-2 text-center text-blue-600 font-semibold">
                              {order.order_status}
                            </td>
                            <td className="border p-2 flex justify-center">
                              {order.image_name && (
                                <img
                                  src={`http://localhost:3002/ProductImg/${order.image_name}`}
                                  alt={order.product_name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* Returned / Cancelled Products Section */}
                  {selectedOrder.orders.some(
                    (order) => order.order_status.toLowerCase() === "returned"
                  ) && (
                    <>
                      {/* Returned Products Section */}
                      <tr className="bg-red-200">
                        <td
                          colSpan="6"
                          className="p-2 text-center font-semibold text-red-700"
                        >
                          Returned Products
                        </td>
                      </tr>
                      {selectedOrder.orders
                        .filter(
                          (order) =>
                            order.order_status.toLowerCase() === "returned"
                        )
                        .map((order, index) => (
                          <tr
                            key={index}
                            className="border bg-white hover:bg-gray-100"
                          >
                            <td className="border p-2 text-center">
                              {order.order_id}
                            </td>
                            <td className="border p-2 text-center">
                              {order.product_name}
                            </td>
                            <td className="border p-2 text-center">
                              {order.quantity}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.base_price}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.total_price}
                            </td>
                            <td className="border p-2 text-center text-red-600 font-semibold">
                              {order.order_status}
                            </td>
                            <td className="border p-2 flex justify-center">
                              {order.image_name && (
                                <img
                                  src={`http://localhost:3002/ProductImg/${order.image_name}`}
                                  alt={order.product_name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}
                  {selectedOrder.orders.some(
                    (order) => order.order_status.toLowerCase() === "cancelled"
                  ) && (
                    <>
                      {/* Cancelled Products Section */}
                      <tr className="bg-orange-200">
                        <td
                          colSpan="6"
                          className="p-2 text-center font-semibold text-orange-700"
                        >
                          Cancelled Products
                        </td>
                      </tr>
                      {selectedOrder.orders
                        .filter(
                          (order) =>
                            order.order_status.toLowerCase() === "cancelled"
                        )
                        .map((order, index) => (
                          <tr
                            key={index}
                            className="border bg-white hover:bg-gray-100"
                          >
                            <td className="border p-2 text-center">
                              {order.order_id}
                            </td>
                            <td className="border p-2 text-center">
                              {order.product_name}
                            </td>
                            <td className="border p-2 text-center">
                              {order.quantity}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.base_price}
                            </td>
                            <td className="border p-2 text-center">
                              ₹{order.total_price}
                            </td>
                            <td className="border p-2 text-center text-orange-600 font-semibold">
                              {order.order_status}
                            </td>
                            <td className="border p-2 flex justify-center">
                              {order.image_name && (
                                <img
                                  src={`http://localhost:3002/ProductImg/${order.image_name}`}
                                  alt={order.product_name}
                                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <table className="w-full border-collapse border border-gray-300 bg-green-100 rounded-lg">
              <thead>
                <tr>
                  <th className=" px-4 py-2 font-bold">Payment Date</th>
                  <th className=" px-4 py-2 font-bold">Payment Method</th>
                  <th className=" px-4 py-2 font-bold">Payment Amount</th>
                  <th className=" px-4 py-2 font-bold">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 text-center">
                    {new Date(
                      selectedOrder.payments.payment_date
                    ).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {selectedOrder.payments.payment_method}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ₹{selectedOrder.payments.amount}
                  </td>
                  <td className="border border-gray-300 px-4 text-center">
                    {selectedOrder.payments.payment_status}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
