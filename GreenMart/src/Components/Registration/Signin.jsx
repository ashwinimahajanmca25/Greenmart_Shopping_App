import React, { useState } from "react"; 
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Signin = ({ handleSignIn, handleLoginPopup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [flashMessage, setFlashMessage] = useState(""); 
  const [flashMessageType, setFlashMessageType] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Frontend validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setFlashMessage("All fields are required!");
      setFlashMessageType("error");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFlashMessage("Please enter a valid email address!");
      setFlashMessageType("error");
      return;
    }
  
    // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setFlashMessage(
        "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special character!"
      );
      setFlashMessageType("error");
      return;
    }
  
    const userData = {
      username: username.trim(),
      email: email.trim(),
      password: password,
      role: "customer",
    };
  
    fetch("http://localhost:3002/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Registration failed");
        }
        return response.json();
      })
      .then((data) => {
        setFlashMessage(data.message || "Registration successful!");
        setFlashMessageType("success");
        navigate("/userpanel");
        if (handleLoginPopup) handleLoginPopup(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error.message);
        setFlashMessage(error.message || "Something went wrong. Please try again!");
        setFlashMessageType("error");
      });
  };
  

  return (
    <div className="p-4">
      <h1 className="text-2xl font-medium text-white text-center mb-6">
        Create Your Account
      </h1>

      {/* Flash message */}
      {flashMessage && (
        <div
          className={`p-3 text-center mb-4 rounded-lg ${
            flashMessageType === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {flashMessage}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="block text-base font-medium text-white"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-base font-medium text-white"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-base font-medium text-white"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 pr-10"
            />
            {showPassword ? (
              <FaEye
                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              />
            ) : (
              <FaEyeSlash
                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded-lg mt-6 hover:bg-blue-400 transition duration-200 text-base font-medium"
        >
          Create Account
        </button>
      </form>
      <p className="text-center text-base font-medium text-white my-3">
        or login with
      </p>
      <div className="flex gap-4 justify-center">
        <FcGoogle className="text-2xl cursor-pointer hover:scale-110 transition-all duration-200" />
        <FaLinkedinIn className="text-2xl cursor-pointer text-white hover:text-blue-600 transition-all duration-200" />
      </div>
      <p
        className="text-center text-base font-medium text-white my-3 hover:text-blue-800 cursor-pointer hover:scale-90 duration-200"
        onClick={() => {
          if (handleSignIn) handleSignIn();
        }}
      >
        Already have an Account? Log in
      </p>
    </div>
  );
};

export default Signin;
