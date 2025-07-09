import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";

const FeedbackTable = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/feedback/feedbackp");
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Open the status popup
  const openStatusPopup = (feedback) => {
    setSelectedFeedback(feedback);
    setNewStatus(feedback.status);
  };

  // Close popup
  const closePopup = () => {
    setSelectedFeedback(null);
    setNewStatus("");
  };

  // Update status in database
  const updateStatus = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch(
        `http://localhost:3002/api/feedback/update-status/${selectedFeedback.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        alert("Status updated successfully!");
        fetchFeedbacks(); // Refresh data
        closePopup();
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex ">
      <AdminSidebar />
      <div className="p-3 mt-32 w-full">
      <h2 className="text-2xl font-semibold mb-4">User Feedback</h2>
      <div className="overflow-x-auto pr-6">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-green-800 text-white">
            <tr>
              <th className="py-3 px-6 text-left">User</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Message</th>
              <th className="py-3 px-6 text-left">Image</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <tr
                  key={feedback.id}
                  className="border-b hover:bg-green-50 transition duration-300"
                >
                  <td className="py-3 px-6">{feedback.username}</td>
                  <td className="py-3 px-6">{feedback.email}</td>
                  <td className="py-3 px-6 max-w-xs truncate">{feedback.message}</td>
                  
                  {/* Show Image if Available */}
                  <td className="py-3 px-6">
                    {feedback.image_url ? (
                      <img
                        src={`http://localhost:3002${feedback.image_url}`}
                        alt="Feedback"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  {/* Clickable Status for Popup */}
                  <td className="py-3 px-6">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      onClick={() => openStatusPopup(feedback)}
                    >
                      {feedback.status}
                    </button>
                  </td>

                  {/* Format Date */}
                  <td className="py-3 px-6">
                    {feedback.created_at
                      ? new Date(feedback.created_at).toLocaleDateString()
                      : "No Date"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No feedback available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Change Popup */}
      {selectedFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Change Status</h3>
            <p className="mb-4">
              Are you sure you want to change the status of this feedback?
            </p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border p-2 rounded-md w-full mb-4"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="resolved">Resolved</option>
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={closePopup}
                className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FeedbackTable;
