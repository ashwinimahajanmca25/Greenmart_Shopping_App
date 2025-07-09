import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion"; // Animation Library
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Password validation function
  const isLengthValid = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isPasswordValid = isLengthValid && hasUppercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setMessage("Password does not meet all requirements!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3002/api/reset-password", { token, password });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-green-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white backdrop-blur-lg p-8 rounded-2xl shadow-lg w-[400px] text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaLock className="absolute left-3 top-4 text-gray-600" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="outline-none bg-gray-200 p-3 pl-10 w-full rounded-lg focus:ring-2 focus:ring-green-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Password Requirements List */}
          <div className="text-sm text-left">
            <p className={isLengthValid ? "text-green-600" : "text-red-500"}>✔ At least 8 characters</p>
            <p className={hasUppercase ? "text-green-600" : "text-red-500"}>✔ At least 1 uppercase letter</p>
            <p className={hasNumber ? "text-green-600" : "text-red-500"}>✔ At least 1 number</p>
            <p className={hasSpecialChar ? "text-green-600" : "text-red-500"}>✔ At least 1 special character</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`font-bold py-2 px-6 rounded-lg w-full shadow-md ${
              isPasswordValid
                ? "bg-green-800 text-white hover:bg-green-900"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!isPasswordValid}
          >
            Reset Password
          </motion.button>
        </form>

        {message && <p className="mt-4 text-green-800">{message}</p>}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
