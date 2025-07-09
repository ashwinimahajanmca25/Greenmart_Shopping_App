import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const UserServices = () => {
  const { user } = useContext(UserContext);
  const [gardener, setGardener] = useState(null);
  const [removalReason, setRemovalReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.idusers) {
      const fetchGardener = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3002/user-appointed-gardener`,
            {
              params: { userId: user.idusers },
            }
          );
          setGardener(response.data.gardener);
        } catch (error) {
          console.error("Error fetching gardener details:", error);
        }
      };

      fetchGardener();
    }
  }, [user?.idusers]);

  const handleRemoveGardener = async () => {
    if (!removalReason) {
      alert("Please provide a reason for removing the gardener.");
      return;
    }

    if (!gardener) {
      alert("No gardener to remove.");
      return;
    }

    try {
      await axios.delete(`http://localhost:3002/remove-gardener`, {
        data: { userId: user.idusers, gardenerId: gardener.idgardeners },
      });
      setGardener(null);
      alert("Gardener removed successfully!");
    } catch (error) {
      console.error("Error removing gardener:", error);
      alert("Failed to remove gardener.");
    }
  };

  const navigateToAppointment = () => {
    navigate("/appointment");
  };

  if (!user || !user.idusers) {
    return <div className="text-center mt-10">Please log in to view your appointed gardener.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col md:flex-row justify-start items-start mt-12 mx-auto md:mt-36 px-6 md:px-10 lg:ml-48 gap-8 w-4/6">
        {/* Left Side - Gardener Details */}
        <div className="bg-white dark:bg-gray-300 shadow-lg rounded-lg p-6 w-full md:w-3/4 lg:w-2/4 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-4">Your Appointed Gardener</h2>

          {gardener ? (
            <div className="p-4 space-y-2">
              <p><span className="font-semibold">Name:</span> {gardener.name}</p>
              <p><span className="font-semibold">State:</span> {gardener.state}</p>
              <p><span className="font-semibold">City:</span> {gardener.city}</p>
              <p><span className="font-semibold">Education:</span> {gardener.education}</p>
              <p><span className="font-semibold">Gender:</span> {gardener.gender}</p>
              <p><span className="font-semibold">Contact:</span> {gardener.contact_no}</p>
              <p><span className="font-semibold">Fees:</span> ₹{gardener.fees}/day</p>
              <p><span className="font-semibold">Work Time:</span> {gardener.work_time}</p>
              <p><span className="font-semibold">Duration:</span> {gardener.duration}</p>
              <p><span className="font-semibold">Joining Date:</span> {gardener.joining_date}</p>

              <button
                onClick={handleRemoveGardener}
                className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Remove Gardener
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p>No gardener appointed yet.</p>
              <button onClick={navigateToAppointment} className="text-blue-500 underline">
                Click here to appoint a gardener.
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Removal Reason */}
        <div className="bg-white dark:bg-gray-300 shadow-lg rounded-lg p-6 w-full md:w-1/4 lg:w-1/3 max-w-md">
          <label htmlFor="removal-reason" className="block font-semibold text-lg mb-2">
            Reason for Removal:
          </label>
          <textarea
            id="removal-reason"
            className="w-full min-h-32 p-2 border rounded dark:bg-gray-300"
            rows="4"
            value={removalReason}
            onChange={(e) => setRemovalReason(e.target.value)}
          ></textarea>
          <div className="mt-6 flex justify-center">
            <button 
              onClick={navigateToAppointment}
              className="bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Add a New Gardener
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserServices;
