import React, { useState, useEffect } from "react";
import { FaUser} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Userpopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "Loading...",
    email: "Loading...",
    contact: "Loading...",
  });
  const navigate = useNavigate();

  // Fetch user data from localStorage or backend
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    console.log("Stored Email:", storedEmail);

    if (storedEmail) {
      axios
        .get("http://localhost:3002/getUserByEmail", {
          params: { email: storedEmail },
        })
        .then((response) => {
          console.log("API Response:", response.data);
          setUserInfo({
            username: `${response.data.firstname} ${response.data.lastname}`,
            email: response.data.email,
            contact: response.data.contact,
          });
        })
        .catch((error) => {
          console.error("API Error:", error);
        });
    } else {
      console.warn("No email found in localStorage.");
    }
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload(); // Reload to update the state
    
  };

  // Navigate to user panel
  const handleNavigateToUserPanel = () => {
    navigate("/userpanel");
  };

  return (
    <div className="relative">
      {/* Username Circle (Navigate to User Panel) */}
      {/* <button
        className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-primary"
        onClick={handleNavigateToUserPanel}
      >
        {userInfo.username && userInfo.username[0]?.toUpperCase()}
      </button> */}

      {/* Button to toggle popup */}
      <button
        className="flex items-center gap-2 p-2 ml-4 text-green-800 rounded-lg"
        onClick={() => setShowPopup(!showPopup)}
      >
        <FaUser className="text-xl dark:text-white" />
        
      </button>

      {/* Popup */}
      {showPopup && (
        <div className="absolute flex flex-col items-center -right-24 z-50 bg-gray-50 w-56 p-4 rounded-3xl border-2 border-gray-200 shadow-2xl dark:bg-gray-800">
          
          <CgProfile  className="text-2xl font-semibold dark:text-white text-green-800"/>
         
          <div className="mt-2">
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-300">
                Name:{" "}
              </span>
              {userInfo.username || "Not available"}
            </p>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-300">
                Email:{" "}
              </span>
              {userInfo.email || "Not available"}
            </p>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-300">
                Contact:{" "}
              </span>
              {userInfo.contact || "Not available"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-auto px-3 py-1 mt-3 text-white bg-red-600 rounded-2xl hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Userpopup;
