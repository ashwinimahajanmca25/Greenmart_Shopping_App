import React, { useState,useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons for password toggle
import Swal from "sweetalert2"; // ✅ Move this import to the top
import AdminSidebar from "./AdminSidebar";
import axios from "axios"
const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  // Fetch user email and details
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/getUserByEmail?email=${localStorage.getItem("email")}`
        );
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email);
        } else {
          setErrorMessage("Failed to load user email. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        setErrorMessage("Failed to load user email. Please try again.");
      }
    };

    fetchUserEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure current password is entered
    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }
  
    // Validate new password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorMessage(
        "New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }
  
    // Ensure new passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3002/changePassword", {
        email,
        currentPassword, // Ensure backend verifies the old password
        newPassword,
      });
  
      if (response.status === 200) {
        setIsModalOpen(true);
        setErrorMessage("");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password changed successfully!",
          confirmButtonColor: "green",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const message =
        error.response?.data?.message ||
        "An error occurred while changing the password.";
      setErrorMessage(message);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  };
  return (
    <div className="flex space-x-16">
      <AdminSidebar />
      <div className="min-w-[500px] mx-auto my-36 p-6 border rounded-lg shadow-md bg-white mt-44">
        <h2 className="text-xl font-bold mb-4 ">Change Password</h2>
        <form  onSubmit={handleSubmit}>
        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

          {/* Current Password */}
          <div className="relative mb-2">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current Password"
              className="w-full p-2 border rounded pr-10"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* New Password */}
          <div className="relative mb-2">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full p-2 border rounded pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm New Password */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="w-full p-2 border rounded pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="w-full bg-green-800 text-white py-2 rounded">
            Change Password
          </button>
        </form>
      </div>
       {/* Success Modal
       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-lg text-center">
            <div className="text-4xl mb-4">😊</div>
            <p className="text-lg font-medium">
              Your password for the account{" "}
              <span className="font-bold text-gray-700">{email}</span> has been
              successfully updated.
            </p>
            <button
              className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white text-lg font-medium rounded-md transition"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ChangePassword;
