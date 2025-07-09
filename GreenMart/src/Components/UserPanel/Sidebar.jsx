import React, { useEffect, useState } from "react";
import { FaUser, FaBars, FaTimes ,FaBoxOpen, FaEye ,FaUserLock } from "react-icons/fa";import { IoLogOut } from "react-icons/io5";
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ fetchUserData }) => {  // ✅ Accept fetchUserData as a prop
 
  const [username, setUsername] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch username
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

    fetchUsername();
  }, [fetchUserData]); // ✅ Re-fetch username when fetchUserData updates

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString();
      setCurrentTime(formattedTime);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
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

      localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile Menu Icon */}
      <div className="relative w-min  p-2 text-white bg-green-800 md:hidden  top-12 left-0 z-50 rounded-md">
        <button onClick={() => setIsSidebarOpen(true)}>
          {" "}
          {/*Button click zala ki sidebar open hoto*/}
          <FaBars size={19} />
        </button>
      </div>
      {/* Background Overlay for Mobile */}{" "}
      {/* Click kartach sidebar band hoel.*/}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40 "
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      {/* aani window var kuthe hi click kel tar false onar*/}
      {/* Sidebar */}
      <aside
        className={`bg-green-800 text-white  p-6 rounded-lg shadow-lg transition-transform duration-300 md:relative md:translate-x-0 md:block md:w-64 lg:w-72 xl:w-80 md:h-min md:mt-28  absolute top-12 md:top-8 md:left-10 left-0 h-min w-72 z-50 md:z-0
             ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Close Button (Only for Mobile) */}
        <div className="flex justify-between items-center mb-8 md:hidden">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)}>
            <FaTimes size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center mb-8">
          <div
            className="bg-green-700 rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold 
          tracking-wide hover:bg-lime-600 hover:text-white transition duration-300 ease-in-out px-4 py-2"
          >
            {username[0]?.toUpperCase()}
          </div>
          <div className="ml-4">
            <h2 className="font-semibold text-xl">{username}</h2>
            <p className="text-sm">{currentTime}</p>{" "}
            {/* Display current time */}
          </div>
        </div>

        {/* Menu */}
        <nav>
          <ul className="space-y-2 text-lg font-semibold text-white">
            <li
              className="flex items-center px-4 py-2 tracking-wide hover:bg-lime-600 transition duration-300 ease-in-out rounded hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Link to="/userpanel" className="flex items-center w-full">
                <FaUser className="mr-3 h-5 w-5 " /> My Profile
              </Link>
            </li>
            <li
              className="flex items-center px-4 py-2 tracking-wide hover:bg-lime-600 transition duration-300 ease-in-out rounded"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Link to="/orderspage">
                <FaBoxOpen className="h-6 w-6 mr-3 inline-block"/>
                My Orders
              </Link>
            </li>
            <li
              className="flex items-center px-4 py-2 tracking-wide hover:bg-lime-600 transition duration-300 ease-in-out rounded"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Link to="/userservices">
                <MdOutlineMiscellaneousServices className="h-8 w-8  inline-block"/>  User Services
              </Link>
            </li>
            <li
              className="flex items-center px-4 py-2 tracking-wide hover:bg-lime-600 transition duration-300 ease-in-out rounded"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Link to="/recentlyview">
              <FaEye  className=" inline-block h-6 w-6 mr-2"/> Recently Viewed
              
              </Link>
            </li>
            <li
              className="flex items-center px-4 py-2 tracking-wide hover:bg-lime-600 transition duration-300 ease-in-out rounded"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Link to="/ChangePassword">
              <FaUserLock className=" inline-block h-6 w-6 mr-2" />Change Password
              </Link>
            </li>
            <li
              className="flex items-center px-4 py-2 tracking-wide hover:bg-lime-600 transition duration-300 ease-in-out cursor-pointer rounded"
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
            >
              {/*Logout click kela ki logout vhaych, sidebar pan close vhaycha!*/}
              <IoLogOut className=" inline-block h-7 w-7 mr-2"/> Log Out
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
