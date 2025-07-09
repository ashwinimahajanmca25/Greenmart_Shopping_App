import React, { useState, useEffect, useContext } from "react"; // Added useContext import
import { useNavigate } from "react-router-dom";
// import { isAuthenticated } from "./auth"; // Import auth utility
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedinIn } from "react-icons/fa";
import { UserContext } from "../UserContext";

const Login = ({ handleSignIn, handleLoginPopup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [flashMessage, setFlashMessage] = useState("");
  const [flashMessageType, setFlashMessageType] = useState("");
  const { login } = useContext(UserContext);

  const navigate = useNavigate();

  // Redirect to UserPanel if already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
  
    if (token) {
      console.log("User is authenticated. Redirecting...");
      
      // Prevent unnecessary re-renders and infinite loops
      setTimeout(() => {
        navigate("/userpanel");
      }, 100); 
    }
  }, []);
  
  
  
  const handleForgotPassword = () => {
    navigate("/forgetpassword");
  };

  
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      console.log("Server Response:", data); // Log the response from the server
  
      if (response.ok && data.accessToken) {
        // Save access token and email to localStorage
        localStorage.setItem("accessToken", data.accessToken);
        if (data.idusers) {
          localStorage.setItem("idusers", data.idusers); // ✅ Store user ID
        }
  
        if (response.ok && data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("idusers", data.idusers);
          localStorage.setItem("email", data.email);
          localStorage.setItem("userData", JSON.stringify({ username: data.username, idusers: data.idusers, role: data.role })); // Store userData
        
          login({ username: data.username, idusers: data.idusers, role: data.role });
        
          if (data.role === "admin") {
            navigate("/dash");
          } else {
            navigate("/");
          }
        }
        setFlashMessage("Login successful!");
        setFlashMessageType("success");
        if (handleLoginPopup) {
          handleLoginPopup(false); // Close the popup
        }
        window.location.reload(); // Reload to update the state
      } else {
        setFlashMessage(data.message || "Login failed");
        setFlashMessageType("error");
      }
    } catch (error) {
      setFlashMessage("An error occurred. Please try again.");
      setFlashMessageType("error");
    }
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate login form
    if (username === "" || password === "") {
      setFlashMessage("Please fill in all fields.");
      setFlashMessageType("error");
    } else {
      handleLogin();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">Login</h1>

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
          <label htmlFor="username" className="block text-base font-medium text-white">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-base font-medium text-white">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 pr-10"
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
          className="w-full bg-blue-700 text-white font-medium py-2 rounded-lg mt-6 hover:bg-blue-500 transition duration-200"
        >
          Submit
        </button>
        <button onClick={handleForgotPassword} className="text-white mt-6">
        Forgot Password?
      </button>
      </form>
      <p className="text-center text-white text-base font-medium my-3">or login with</p>
      <div className="flex gap-4 justify-center">
        <FcGoogle className="text-2xl cursor-pointer hover:scale-110 transition-all duration-200" />
        <FaLinkedinIn className="text-2xl cursor-pointer text-white hover:text-blue-600 transition-all hover:scale-110 duration-200" />
      </div>
      <p
        className="text-center text-white text-base font-medium my-3 hover:scale-90 duration-200 hover:text-blue-700 cursor-pointer"
        onClick={handleSignIn}
      >
        No Account? Create Signup here
      </p>
      
    </div>
  );
};

export default Login;
