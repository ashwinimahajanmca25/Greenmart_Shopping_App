import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const [username, setUsername] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  // Fetch username and current time
  useEffect(() => {
    const fetchUsername = async () => {
      const token = localStorage.getItem("accessToken");
      const email = localStorage.getItem("email");

      if (!email || !token) {
        console.error("Email or token not found in localStorage");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3002/getUserByEmail?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUsername(userData.firstname || "User");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const formattedTime = `${hours}:${minutes}:${
        seconds < 10 ? "0" + seconds : seconds
      }`;
      setCurrentTime(formattedTime);
    };

    fetchUsername();
    updateTime();
    const timeInterval = setInterval(updateTime, 1000); // Update time every second

    return () => {
      clearInterval(timeInterval); // Clean up the interval on component unmount
    };
  }, []);

  // Handle logout
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

  return (
    <div className="flex pl-12 mt-3 p-10  dark:bg-gray-900 ">
      {/* Sidebar */}
      <aside className="p-6 mt-20 text-white bg-green-800 rounded-lg shadow-lg min-w-80 h-min ">
        {/* User Info */}
        <div className="flex items-center ">
          <div className="flex items-center justify-center px-4 py-2 text-xl font-bold tracking-wide transition duration-300 ease-in-out bg-green-700 rounded-full hover:bg-lime-600 hover:text-white">
            {username[0]?.toUpperCase()}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold uppercase">{username}</h2>
            <p className="text-sm">{currentTime}</p>{" "}
            {/* Display current time */}
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-8">
          <ul className=" text-lg font-semibold text-white space-y-2">
            {/* Link to Profile */}
            <li className="flex items-center px-4 py-2 tracking-wide transition duration-300 ease-in-out rounded hover:text-white">
              <Link to="/dash" className="flex items-center w-full">
                <span className="mr-2"> 📊 </span>Dashboard
              </Link>
            </li>
            <li className="flex items-center px-4 py-2 tracking-wide transition duration-300 ease-in-out rounded">
              <Link to="/users">
                <span className="mr-2">👥</span> User Management
              </Link>
            </li>
            <li className="flex items-center font-bold tracking-wide hover:bg-lime-600 hover:text-white transition duration-300 ease-in-out px-4 py-2 rounded">
              <Link to="/productsm">
                <span className="mr-2">🌿</span> Product Management
              </Link>
            </li>
            <li className="flex items-center px-4 py-2 tracking-wide transition duration-300 ease-in-out rounded">
              <Link to="/orders">
                <span className="mr-2">📦</span> Order Management
              </Link>
            </li>
            <li className="flex items-center px-4 py-2 tracking-wide transition duration-300 ease-in-out rounded">
              <Link to="/feedbackp">
                <span className="mr-2">📄</span> User Report
              </Link>
            </li>

            <li className="flex items-center px-4 py-2 tracking-wide transition duration-300 ease-in-out rounded">
              <Link to="/admin-change-password">
                <span className="mr-2">🔒</span> Change Password
              </Link>
            </li>
            <li
              className="flex items-center px-4 py-2 tracking-wide transition duration-300 ease-in-out rounded cursor-pointer"
              onClick={handleLogout} // Attach the fixed handleLogout
            >
              <span className="mr-2">🚪</span> Log Out
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default AdminSidebar;
