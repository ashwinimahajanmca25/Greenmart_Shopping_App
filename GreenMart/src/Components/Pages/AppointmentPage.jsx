import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext"; // Import UserContext
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const AppointmentPage = () => {
  const { user } = useContext(UserContext); // Access current user from context
  const [formData, setFormData] = useState({
    state: "", // Default value for state is empty
    city: "", // Default value for city is empty
    education: "", // Default value for education is empty
    gender: "", // Default value for gender is empty
  });
  const [gardeners, setGardeners] = useState([]);
  const [appointedGardenerId, setAppointedGardenerId] = useState(null); // Track appointed gardener
  const navigate = useNavigate();

  // Fetch the appointed gardener for the user
  useEffect(() => {
    if (user && user.idusers) {
      axios.get(`http://localhost:3002/user-appointed-gardener?userId=${user.idusers}`)
        .then((response) => {
          setAppointedGardenerId(response.data.gardenerId);
        })
        .catch((error) => {
          console.error("Error fetching appointed gardener:", error);
        });
    }
  }, [user]);

  // Define stateCityMap here
  const stateCityMap = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
    TamilNadu: ["Chennai", "Coimbatore", "Madurai"],
    UttarPradesh: ["Lucknow", "Kanpur", "Agra"],
    Delhi: ["New Delhi"],
    Rajasthan: ["Jaipur", "Udaipur"],
    WestBengal: ["Kolkata", "Darjeeling", "Howrah"],
    MadhyaPradesh: ["Bhopal", "Indore"],
    Karnataka: ["Bangalore", "Mysore"],
    Bihar: ["Patna"],
    Gujarat: ["Ahmedabad"],
    Haryana: ["Gurgaon"],
    Uttarakhand: ["Dehradun"],
    HimachalPradesh: ["Shimla"],
    Punjab: ["Amritsar"],
  };

  // Fetch gardeners based on selected filters
  const fetchGardeners = async () => {
    if (
      !formData.state &&
      !formData.city &&
      !formData.education &&
      !formData.gender
    ) {
      return; // Avoid API call if no filter is selected
    }

    try {
      const response = await axios.get("http://localhost:3002/gardeners", {
        params: formData,
      });
      setGardeners(response.data);
    } catch (error) {
      console.error("Error fetching gardeners:", error);
    }
  };

  // Handle appoint button click
  const handleAppoint = (gardener) => {
    if (gardener.book === 1) {
      alert("This gardener is already booked.");
      return;
    }
    if (!user || !user.idusers) {
      alert("Please log in to appoint a gardener.");
      return;
    }

    console.log("Navigating with gardener:", gardener); // Debugging log

    // Navigate with full gardener details
    navigate("/gardener-details", { state: { gardener, userId: user.idusers } });
  };

  return (
    <div className="mt-20 max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md flex">
      {/* Left side: Form Section */}
      <div className="w-1/3 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Appointment Page</h2>

        {/* Filter Section */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {/* State Selection */}
          <select
            className="border rounded p-2 w-full"
            value={formData.state}
            onChange={(e) => {
              setFormData({ ...formData, state: e.target.value, city: "" }); // Reset city on state change
            }}
          >
            <option value="">Select State</option>
            {Object.keys(stateCityMap).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* City Selection (Filtered Based on State) */}
          <select
            className="border rounded p-2 w-full"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!formData.state} // Disable city if no state is selected
          >
            <option value="">Select City</option>
            {formData.state &&
              stateCityMap[formData.state].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>

          {/* Education Selection */}
          <select
            className="border rounded p-2 w-full"
            value={formData.education}
            onChange={(e) =>
              setFormData({ ...formData, education: e.target.value })
            }
          >
            <option value="All">All</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="hsc">HSC</option>
            <option value="ssc">SSC</option>
            <option value="below_ssc">Below SSC</option>
          </select>

          {/* Gender Selection */}
          <select
            className="border rounded p-2 w-full"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          >
            <option value="All">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button
            className="bg-green-500 text-white p-2 rounded w-full hover:bg-green-600"
            onClick={() => {
              if (
                !formData.state &&
                !formData.city &&
                !formData.education &&
                !formData.gender
              ) {
                alert("Please select a filter!");
                return;
              }
              fetchGardeners();
            }}
          >
            Search Gardeners
          </button>
        </div>
      </div>

      {/* Right side: Gardener List Section */}
      <div className="w-2/3 p-6">
        <h3 className="text-lg font-semibold mb-4">Gardeners List</h3>
        {gardeners.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {gardeners.map((gardener) => (
              <div key={gardener.idgardeners} className="p-4 border rounded shadow-md">
                <p><strong>Gardener:</strong> {gardener.name}</p>
                <p><strong>State:</strong> {gardener.state}</p>
                <p><strong>City:</strong> {gardener.city}</p>
                <p><strong>Education:</strong> {gardener.education}</p>
                <p><strong>Gender:</strong> {gardener.gender}</p>
                <p><strong>Fees:</strong> ₹{gardener.fees}/day</p>

                <button
                  className={`py-2 px-4 rounded ${appointedGardenerId === gardener.idgardeners ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'}`}
                  onClick={() => handleAppoint(gardener)}
                  disabled={appointedGardenerId === gardener.idgardeners || gardener.book === 1}
                >
                  {appointedGardenerId === gardener.idgardeners || gardener.book === 1 ? "Already Booked" : "Appoint"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No gardeners found</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentPage;
