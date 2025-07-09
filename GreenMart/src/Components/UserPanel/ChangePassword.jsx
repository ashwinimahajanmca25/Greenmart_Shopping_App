import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user email
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

  // **Validation Function**
  const validatePassword = () => {
    if (!currentPassword) {
      setErrorMessage("Current password is required.");
      return false;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage("New password must contain at least one uppercase letter.");
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      setErrorMessage("New password must contain at least one lowercase letter.");
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      setErrorMessage("New password must contain at least one number.");
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setErrorMessage("New password must contain at least one special character.");
      return false;
    }
    if (newPassword === currentPassword) {
      setErrorMessage("New password must be different from the current password.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  // **Handle Form Submission**
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      const response = await axios.post("http://localhost:3002/changePassword", {
        email,
        currentPassword,
        newPassword,
      });
    
      if (response.status === 200) {
        setIsModalOpen(true);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage(error.response?.data?.message || "Failed to change password.");
    }
    
  };

  // **Close Modal**
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col md:flex-row mb-16">
      <Sidebar />

      <div className="flex-1 flex items-center dark:bg-gray-900 justify-center pt-28">
        <form
          className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold text-center mb-4">Change Password</h2>

          {errorMessage && (
            <div className="text-red-600 text-center mb-4">{errorMessage}</div>
          )}

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
              placeholder="Enter New Password"
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

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white text-lg font-medium py-2 rounded-md transition"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Success Modal */}
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
      )}
    </div>
  );
};

export default ChangePassword;
