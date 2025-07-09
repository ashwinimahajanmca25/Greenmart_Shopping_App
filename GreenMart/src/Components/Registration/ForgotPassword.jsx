import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Animation Library
import { FaEnvelope } from "react-icons/fa"; // Email Icon

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      setMessage("Invalid email format");
      return;
    }

    setIsDisabled(true); // Disable button
    setCountdown(3); // Start countdown from 10 seconds

    try {
      const response = await axios.post(
        "http://localhost:3002/api/forgot-password",
        { email }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsDisabled(false); // Re-enable button when countdown finishes
    }
  }, [countdown]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-green-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white backdrop-blur-lg p-8 rounded-2xl shadow-lg w-[400px] text-center"
      >
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center items-center relative">
            <FaEnvelope className="absolute text-gray-400 left-2" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsValidEmail(true);
              }}
              className={`bg-gray-200 p-3 pl-10 w-full rounded-lg outline-none focus:ring-2 focus:ring-green-900 ${
                isValidEmail ? "focus:ring-green-800" : "ring-2 ring-red-500"
              }`}
              required
            />
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm ${
                isValidEmail ? "text-green-800" : "text-red-500"
              } mt-2`}
            >
              {message}
            </motion.p>
          )}

          <motion.button
            whileHover={!isDisabled ? { scale: 1.05 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            type="submit"
            className={`bg-green-800 text-white font-bold py-2 px-6 rounded-lg w-full shadow-md ${
              isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-green-900"
            }`}
            disabled={isDisabled}
          >
            {isDisabled ? `Wait ${countdown}s` : "Send Reset Link"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
