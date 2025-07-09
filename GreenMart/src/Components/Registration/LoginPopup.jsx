import React, { useRef, useState } from "react";
import Signin from "./Signin";
import Login from './Login';

const LoginPopup = ({ loginPopup, handleLoginPopup, onLoginSuccess }) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const loginPopupRef = useRef();

  // Close the popup if clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === loginPopupRef.current) {
      handleLoginPopup(false);
    }
  });

  return (
    <>
      {loginPopup && (
        <div
          ref={loginPopupRef}
          className="fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-75 flex items-center justify-center"
        >
          <div className="relative rounded-lg shadow-xl w-[90%] sm:w-[400px] bg-emerald-500 bg-opacity-60 p-8">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white text-xl font-bold"
              onClick={() => handleLoginPopup(false)} // Close the login popup
            >
              &times;
            </button>
            <div className="flex flex-col gap-6">
              {showSignIn ? (
                <Signin handleSignIn={() => setShowSignIn(!showSignIn)} handleLoginPopup={handleLoginPopup} />
              ) : (
                <Login handleSignIn={() => setShowSignIn(!showSignIn)} handleLoginPopup={handleLoginPopup} onLoginSuccess={onLoginSuccess} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPopup;
