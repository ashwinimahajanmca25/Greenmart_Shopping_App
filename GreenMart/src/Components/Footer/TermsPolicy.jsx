import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TermsPrivacy = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // Small delay ensures smooth scrolling
      }
    }
  }, [location]);

  return (
    <div className="w-full px-6 py-10 pt-28 dark:bg-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Terms & Policies</h1>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className="px-4 py-2 bg-green-800 text-white rounded-3xl hover:bg-green-700"
          onClick={() => navigate("#terms")}
        >
          Terms & Conditions
        </button>
        <button
          className="px-4 py-2 bg-green-800 text-white rounded-3xl hover:bg-green-700"
          onClick={() => navigate("#privacy")}
        >
          Privacy Policy
        </button>
      </div>

      {/* Terms & Conditions Section */}
      <div id="terms" className="bg-white w-4/6 mx-auto shadow-md p-6 rounded-md mb-10 dark:bg-gray-700 dark:text-gray-100">
        <h2 className="text-2xl font-semibold mb-4">Terms & Conditions</h2>
        <p className="text-gray-700 mb-4 dark:text-gray-100">
          Welcome to GreenMart! By using our website, you agree to the
          following terms and conditions...
        </p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 ">
          <li>You must be at least 18 years old to use our services.</li>
          <li>Do not misuse our website for illegal activities.</li>
          <li>We hold the right to terminate accounts if terms are violated.</li>
          
          
        </ul>
      </div>

      {/* Privacy Policy Section */}
      <div id="privacy" className=" w-4/6 mx-auto bg-white shadow-md p-6 rounded-md dark:bg-gray-700">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Privacy Policy</h2>
        <p className="text-gray-700 mb-4 dark:text-gray-100">
          At GreenMart, we value your privacy. This policy explains how we
          collect and use your personal data.
        </p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-100">
          <li>We collect personal information like name, email, and address.</li>
          <li>Your data is securely stored and not shared with third parties.</li>
          <li>Cookies are used to enhance your browsing experience.</li>
        </ul>
      </div>
    </div>
  );
};

export default TermsPrivacy;