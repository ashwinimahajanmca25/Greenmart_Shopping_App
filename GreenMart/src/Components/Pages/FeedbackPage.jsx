import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaImage } from "react-icons/fa";
import axios from "axios";

const FeedbackPage = () => {
  const [userInfo, setUserInfo] = useState({
    user_id: null,
    username: "",
    email: "",
  });
  const [feedback, setFeedback] = useState("");
  const [image, setImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxCharacters = 250;
  const isValid = feedback.trim() !== "";

  // ✅ Fetch `user_id` from `localStorage` and set it correctly
  useEffect(() => {
    const storedUser = localStorage.getItem("userData"); // ✅ Correct key
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser); // ✅ Parse JSON
        console.log("User from localStorage:", parsedUser);

        if (parsedUser.idusers) {
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            user_id: parsedUser.idusers, // ✅ Correctly set user_id
          }));
        } else {
          console.error("Error: idusers not found in storedUser");
        }
      } catch (error) {
        console.error("Error parsing localStorage user:", error);
      }
    } else {
      console.error("Error: No 'userData' object found in localStorage.");
    }
  }, []);

  // ✅ Fetch `username` and `email` using email from `localStorage`
  useEffect(() => {
    const storedEmail = localStorage.getItem("email"); // ✅ Get email
    if (storedEmail) {
      axios
        .get("http://localhost:3002/getUserByEmail", {
          params: { email: storedEmail },
        })
        .then((response) => {
          console.log("User Data from API:", response.data);
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo, // ✅ Keep existing `user_id`
            username: `${response.data.firstname} ${response.data.lastname}`,
            email: response.data.email,
          }));
        })
        .catch((error) => console.error("Error fetching user:", error));
    } else {
      console.error("Error: No email found in localStorage.");
    }
  }, []);

  // ✅ Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // ✅ Handle Submit Feedback
  // ✅ Handle Submit Feedback
  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert("Feedback cannot be empty!");
      return;
    }
  
    const formData = new FormData();
    formData.append("user_id", userInfo.user_id || ""); // Store null if no user
    formData.append("username", userInfo.username);
    formData.append("email", userInfo.email);
    formData.append("message", feedback);
    if (image) formData.append("image", image);
  
    try {
      const response = await fetch("http://localhost:3002/api/feedback/feedbackp", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        alert("Feedback submitted successfully!");
        setFeedback("");
        setImage(null);
        setSubmitted(true);
      } else {
        alert("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Something went wrong.");
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-500 to-lime-200 p-28">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6"
      >
        <h2 className="text-3xl font-bold text-green-700 text-center mb-4">We Value Your Feedback</h2>
        <p className="text-gray-600 text-center mb-4">Let us know how we can assist you with your gardening needs.</p>
        <div className="space-y-4">
          {/* ✅ Display User Details */}
        {/* Username Field */}
<input
  className="w-full p-3 border border-gray-300 rounded-lg"
  type="text"
  placeholder="Your Name"
  value={userInfo.username}
  onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
  readOnly={!!userInfo.user_id} // Make it editable only if not logged in
/>

{/* Email Field */}
<input
  className="w-full p-3 border border-gray-300 rounded-lg"
  type="email"
  placeholder="Your Email"
  value={userInfo.email}
  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
  readOnly={!!userInfo.user_id}
/>

          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows={4}
            maxLength={maxCharacters}
            placeholder="Write your question or feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="text-right text-sm text-gray-500">{feedback.length}/{maxCharacters}</div>
          <div className="border border-dashed border-gray-400 p-4 rounded-lg text-center cursor-pointer">
            <label htmlFor="image-upload" className="flex items-center justify-center cursor-pointer">
              <FaImage className="text-green-500 text-2xl mr-2" /> Upload an Image (Optional)
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {image && <img src={URL.createObjectURL(image)} alt="Uploaded" className="mt-4 max-h-40 mx-auto rounded-lg shadow-md" />}
          </div>
        </div>
        <button
          className={`w-full mt-4 py-3 text-white rounded-lg transition-all ${isValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-green-700 text-center mt-4 flex items-center justify-center"
          >
            <FaCheckCircle className="mr-2 text-green-500" /> Your feedback has been submitted. We will assist you shortly!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FeedbackPage;
