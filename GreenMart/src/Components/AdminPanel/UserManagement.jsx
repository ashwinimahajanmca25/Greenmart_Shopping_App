import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // Default to ascending

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3002/getadminusers");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteUser = async (idusers) => {
    try {
      await axios.delete(`http://localhost:3002/deleteuser/${idusers}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleStatusChangeClick = (user) => {
    setSelectedUser(user);
    setIsConfirmPopupOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === "active" ? "inactive" : "active";

    try {
      await axios.put(
        `http://localhost:3002/updateuserstatus/${selectedUser.idusers}`,
        { status: newStatus }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.idusers === selectedUser.idusers
            ? { ...user, status: newStatus }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }

    setIsConfirmPopupOpen(false);
  };

  const openPopupForUserDetails = async (idusers) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3002/getUserDetails/${idusers}`
      );
      setSelectedUserDetails(response.data);
      console.log("Fetched User Details:", response.data); // Debugging
      setIsViewPopupOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    setIsLoading(false);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSort = (column) => {
    setSortOrder(sortColumn === column && sortOrder === "asc" ? "desc" : "asc");
    setSortColumn(column);
  };

  // 🔹 Define `filteredUsers` FIRST before using it
  const filteredUsers = users
    .filter(
      (user) =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((user) => (selectedRole ? user.role === selectedRole : true));

  // 🔹 Now define `sortedUsers` AFTER `filteredUsers`
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;

    const valueA = a[sortColumn]?.toString().toLowerCase();
    const valueB = b[sortColumn]?.toString().toLowerCase();

    return sortOrder === "asc"
      ? valueA < valueB
        ? -1
        : 1
      : valueA > valueB
      ? -1
      : 1;
  });

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="flex ">
      <AdminSidebar />
      <div className="p-6 mt-28">
        <div className="flex justify-between ">
          <h1 className="text-2xl font-bold mb-6">User Management</h1>

          <div>
            <input
              type="text"
              placeholder="Search users..."
              className="shadow-lg  hover:shadow-xl rounded-lg px-3 py-2 w-[300px] outline-none focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {isConfirmPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-3">Confirm Action</h2>
              <p>
                Are you sure you want to{" "}
                {selectedUser?.status === "active" ? "deactivate" : "activate"}{" "}
                this user?
              </p>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setIsConfirmPopupOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  {selectedUser?.status === "active"
                    ? "Deactivate"
                    : "Activate"}
                </button>
              </div>
            </div>
          </div>
        )}
        {isViewPopupOpen && selectedUserDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center mt-8">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-3">User Details</h2>

              {/* 🔹 User Personal Details */}
              <div className="mb-4 p-4 bg-green-100 rounded-lg">
                <h3 className="font-semibold">Personal Details</h3>
                <p>
                  <strong>Name:</strong> {selectedUserDetails.user.username}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUserDetails.user.email}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUserDetails.user.role}
                </p>
                <p>
                  <strong>Status:</strong> {selectedUserDetails.user.status}
                </p>
              </div>

              {/* 🔹 Gardener Details */}
              <div className="mb-4">
                <h3 className="font-semibold">Gardener Details</h3>
                {selectedUserDetails.gardener ? (
                  <table className="w-full mt-3 border-collapse border border-gray-300">
                    <thead className="bg-green-800 text-white">
                      <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Work Time</th>
                        <th className="border p-2">Fees</th>
                        <th className="border p-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border">
                        <td className="border p-2 text-center">
                          {selectedUserDetails.gardener.name}
                        </td>
                        <td className="border p-2  text-center">
                          {selectedUserDetails.gardener.work_time}
                        </td>
                        <td className="border p-2 text-center">
                          {selectedUserDetails.gardener.fees}
                        </td>
                        <td className="border p-2 text-center">
                          {selectedUserDetails.gardener.duration}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>No gardener assigned.</p>
                )}
              </div>

              {/* 🔹 Orders & Payments Combined Table */}
              <div className="mb-4">
                <h3 className="font-semibold">Order & Payment Details</h3>
                {selectedUserDetails.orders.length > 0 ? (
                  <table className="w-full mt-3 border-gray-800 border bg-green-200">
                    <thead className="bg-green-800  text-white">
                      <tr>
                        <th className="border p-2">Order ID</th>
                        <th className="border p-2">Product Name</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Total Price</th>
                        <th className="border p-2">Payment Method</th>
                        <th className="border p-2">Payment Status</th>
                        <th className="border p-2">Amount</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Image</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserDetails.orders.map((order, index) => (
                        <tr key={index} className="border">
                          <td className="border p-2 text-center">{order.order_id}</td>
                          <td className="border p-2 text-center">{order.product_name}</td>
                          <td className="border p-2 text-center">{order.category}</td>
                          <td className="border p-2 text-center">{order.quantity}</td>
                          <td className="border p-2 text-center">{order.order_status}</td>
                          <td className="border p-2 text-center">₹{order.total_price}</td>

                          {/* ✅ Payment Data (Shown Only for the First Order in Each Timestamp) */}
                          {index === 0 ||
                          order.order_date !==
                            selectedUserDetails.orders[index - 1].order_date ? (
                            <>
                              <td className="border p-2 text-center">
                                {order.payment_method || "N/A"}
                              </td>
                              <td className="border p-2 text-center">
                                {order.payment_status || "N/A"}
                              </td>
                              <td className="border p-2 text-center">
                                ₹{order.amount || "N/A"}
                              </td>
                              <td className="border p-2 text-center">
                                {order.payment_date
                                  ? new Date(
                                      order.payment_date
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="border p-2"></td>
                              <td className="border p-2"></td>
                              <td className="border p-2"></td>
                              <td className="border p-2"></td>
                            </>
                          )}

                          <td className="border p-2 text-center">
                            {order.image_name && (
                              <img
                                src={`http://localhost:3002/ProductImg/${order.image_name}`}
                                alt={order.product_name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No orders found.</p>
                )}
              </div>

              {/* 🔹 Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsViewPopupOpen(false)}
                  className="bg-green-800 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
          <thead className="bg-green-800 text-white">
              <tr>
                {[
                  { key: "idusers", label: "User ID" },
                  { key: "username", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "role", label: "Role" },
                  { key: "status", label: "Status" },
                  { key: "actions", label: "Actions", sortable: false },
                ].map(({ key, label, sortable = true }) => (
                  <th
                    key={key}
                    className="p-3 cursor-pointer px-6"
                    onClick={() => sortable && handleSort(key)}
                  >
                    {label}{" "}
                    {sortColumn === key
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.idusers} className="border-b hover:bg-green-50">
                    <td className="p-3 px-9">{user.idusers}</td>
                    <td className="p-3 px-9">{user.username}</td>
                    <td className="p-3 px-9">{user.email}</td>
                    <td className="p-3 px-9">{user.role}</td>
                    <td className="p-3 px-9">
                      <button
                        onClick={() => handleStatusChangeClick(user)}
                        className={` py-1 text-sm font-medium rounded-full ${
                          user.status === "active"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="ml-6 p-3 flex space-x-3">
                      <button
                        onClick={() => openPopupForUserDetails(user.idusers)}
                        className="text-green-800 "
                      >
                        <Eye />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.idusers)}
                        className="text-red-500"
                      >
                        <Trash2/> 
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-5 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Edit User Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-3">Edit User</h2>
            <select
              className="border px-3 py-2 w-full mb-2"
              value={currentUser.role}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, role: e.target.value })
              }
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              onClick={handleEditUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
