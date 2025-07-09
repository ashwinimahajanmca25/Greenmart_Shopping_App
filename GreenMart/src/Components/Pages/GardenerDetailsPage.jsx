import React, { useState, useContext, useEffect } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";

const GardenerDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Get user from context
  const gardener = location.state?.gardener;
  const userId = user?.idusers; // Ensure consistency
  const [calculatedFee, setCalculatedFee] = useState(0);

  console.log("Received gardener details:", gardener);
  console.log("User ID:", userId); // Debugging log

  const [formData, setFormData] = useState({
    durationValue: "1",
    durationUnit: "months",
    startTime: "9",
    startPeriod: "AM",
    endTime: "5",
    endPeriod: "PM",
  });

  if (!gardener) {
    return <div className="mt-40 p-6">No gardener data found</div>;
  }


  const formatTime = () => {
    let startHour = parseInt(formData.startTime, 10);
    let endHour = parseInt(formData.endTime, 10);

    if (formData.startPeriod === "PM" && startHour !== 12) startHour += 12;
    if (formData.startPeriod === "AM" && startHour === 12) startHour = 0;
    if (formData.endPeriod === "PM" && endHour !== 12) endHour += 12;
    if (formData.endPeriod === "AM" && endHour === 12) endHour = 0;

    return `${startHour}:00 - ${endHour}:00`;
  };
  useEffect(() => {
    console.log("Form data changed:", formData); // Debugging log
    calculateFee();
  }, [formData]); // Listen to the entire formData object
  


  
  // Set the joining date to 2 days after the current date
  const getJoiningDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Add 2 days to current date
    return today.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
  };

// Calculate the fee based on the work time
// Calculate the fee based on the work time
// Calculate the fee based on the work time
const calculateFee = () => {
  const formattedTime = formatTime();

  // Convert durationValue to number
  const durationValue = parseInt(formData.durationValue, 10);

  // Create new variables for the modified hours
  let startHour = parseInt(formData.startTime, 10);
  let endHour = parseInt(formData.endTime, 10);

  let workDurationInHours = endHour - startHour;

  // Adjust the start and end times based on AM/PM
  if (formData.startPeriod === "PM" && startHour !== 12) startHour += 12;
  if (formData.endPeriod === "PM" && endHour !== 12) endHour += 12;

  workDurationInHours = endHour - startHour; // Update workDurationInHours with the modified start and end hours

  // Calculate the hourly fee increase only if the gardener works more than the base hours
  const hourlyFeeIncrease = workDurationInHours > 8 ? (workDurationInHours - 8) * 100 : 0;

  // Store duration in variable and calculate fee accordingly
  let totalFee = 0;
  const duration = formData.durationValue; // Store duration here

  if (formData.durationUnit === "months") {
    // For months, multiply by 30 days (standard month duration)
    totalFee = gardener.fees * 30 * duration + hourlyFeeIncrease;
  } else if (formData.durationUnit === "years") {
    // For years, multiply by 12 months, then by 30 days in each month
    totalFee = gardener.fees * 30 * 12 * duration + hourlyFeeIncrease;
  } else if (formData.durationUnit === "days") {
    // For days, calculate based on daily fee (gardener.fees)
    totalFee = gardener.fees * duration + hourlyFeeIncrease;
  }

  // If it's a full day (8 hours), do not apply extra hourly fees
  if (workDurationInHours === 8) {
    totalFee = gardener.fees * duration; // Only base fee for full day
  }

  setCalculatedFee(totalFee); // Update the calculated fee state
};
  // UseEffect to recalculate fee when formData changes
  useEffect(() => {
    console.log("Form data changed:", formData); // Debugging log
    calculateFee();
  }, [formData.durationValue, formData.durationUnit, formData.startTime, formData.endTime, formData.startPeriod, formData.endPeriod]); 
  // Make sure the effect listens to all relevant fields
  





  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedFormData);

    // Recalculate fee when durationUnit changes
    if (e.target.name === "durationUnit") {
      calculateFee(); 
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formattedTime = formatTime();
    const duration = `${formData.durationValue} ${formData.durationUnit}`;
    const joiningDate = getJoiningDate();
  
    if (!userId || !gardener.idgardeners || !duration || !formattedTime) {
      alert("All fields are required!");
      return;
    }
  
    try {
      await axios.post("http://localhost:3002/appoint", {
        userId,
        gardenerId: gardener.idgardeners,
        duration,
        work_time: formattedTime,
        joining_date: joiningDate,
        total_fees: calculatedFee, // Send the calculated fee
      });
  
      alert("Gardener appointed successfully!");
      navigate("/userservices"); // Navigate to another page after success
    } catch (error) {
      console.error("Error appointing gardener:", error.response?.data || error.message);
      alert(`Failed to appoint gardener: ${error.response?.data?.message || error.message}`);
    }
  };
  

  useEffect(() => {
    calculateFee(); // Calculate the fee whenever the work time changes
  }, [formData]);
  let totalFeeDisplay = null;

  if (formData.durationUnit === "months") {
    totalFeeDisplay = <p><strong>Total Fee:</strong> ₹{calculatedFee} / month</p>;
  } else if (formData.durationUnit === "years") {
    totalFeeDisplay = <p><strong>Total Fee:</strong> ₹{calculatedFee} / year</p>;
  } else if (formData.durationUnit === "days") {
    totalFeeDisplay = <p><strong>Total Fee:</strong> ₹{calculatedFee} / day</p>;
  }
  return (
    <div className="mt-40 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gardener Details</h2>
      <p><strong>Name:</strong> {gardener.name}</p>
      <p><strong>State:</strong> {gardener.state}</p>
      <p><strong>City:</strong> {gardener.city}</p>
      <p><strong>Education:</strong> {gardener.education}</p>
      <p><strong>Gender:</strong> {gardener.gender}</p>
      <p><strong>Contact No:</strong> {gardener.contact_no}</p>

      <p><strong>Base Fee:</strong> ₹{gardener.fees}/day</p>
      {totalFeeDisplay}



      <form onSubmit={handleSubmit} className="mt-6">
  <label className="block mb-2">Duration of Work:</label>
  <div className="flex gap-4">
    <select
      name="durationValue"
      value={formData.durationValue}
      onChange={handleChange}
      required
      className="border rounded p-2"
    >
      {[...Array(12).keys()].map((n) => (
        <option key={n + 1} value={n + 1}>
          {n + 1}
        </option>
      ))}
    </select>

    <select
      name="durationUnit"
      value={formData.durationUnit}
      onChange={handleChange}
      className="border rounded p-2"
    >
      <option value="days">Days</option>
      <option value="months">Months</option>
      <option value="years">Years</option>
    </select>
  </div>

  <label className="block mt-4 mb-2">Work Time:</label>
  <div className="flex gap-4">
    <select name="startTime" value={formData.startTime} onChange={handleChange} className="border rounded p-2">
      {[...Array(12).keys()].map((n) => (
        <option key={n + 1} value={n + 1}>
          {n + 1}
        </option>
      ))}
    </select>

    <select name="startPeriod" value={formData.startPeriod} onChange={handleChange} className="border rounded p-2">
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>

    <span className="p-2">to</span>

    <select name="endTime" value={formData.endTime} onChange={handleChange} className="border rounded p-2">
      {[...Array(12).keys()].map((n) => (
        <option key={n + 1} value={n + 1}>
          {n + 1}
        </option>
      ))}
    </select>

    <select name="endPeriod" value={formData.endPeriod} onChange={handleChange} className="border rounded p-2">
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>

  <button type="submit" className="mt-6 bg-green-500 text-white p-2 rounded w-full hover:bg-green-600">
    Confirm Appointment
  </button>
</form>

    </div>
  );
};

export default GardenerDetailsPage;
