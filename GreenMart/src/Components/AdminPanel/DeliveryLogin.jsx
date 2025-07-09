import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2"; // ✅ Import react-phone-input-2
import "react-phone-input-2/lib/style.css"; // ✅ Import styles
import { isValidPhoneNumber } from "libphonenumber-js"; // ✅ Import phone validation

export default function DeliveryAuth({ setAuth }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [states, setStates] = useState([]); // ✅ Store states list
  const [cities, setCities] = useState([]); // ✅ Store cities list
  const [flashMessage, setFlashMessage] = useState(""); // ✅ FIXED: Added missing state
  const [flashMessageType, setFlashMessageType] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const stateCodes = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    Assam: "AS",
    Bihar: "BR",
    Chhattisgarh: "CG",
    Goa: "GA",
    Gujarat: "GJ",
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    Jharkhand: "JH",
    Karnataka: "KA",
    Kerala: "KL",
    "Madhya Pradesh": "MP",
    Maharashtra: "MH",
    Manipur: "MN",
    Meghalaya: "ML",
    Mizoram: "MZ",
    Nagaland: "NL",
    Odisha: "OD",
    Punjab: "PB",
    Rajasthan: "RJ",
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    Telangana: "TS",
    Tripura: "TR",
    "Uttar Pradesh": "UP",
    Uttarakhand: "UK",
    "West Bengal": "WB",
  };

  // ✅ Fetch all Indian states from API
  useEffect(() => {
    axios
      .get("https://api.countrystatecity.in/v1/countries/IN/states", {
        headers: {
          "X-CSCAPI-KEY":
            "ZVZXNzV6anVBOHJ2bnJaOWZkbXFsb0lVZTVyN21qMFZEYzVqVHlRSQ==",
        }, // 🔹 Replace with your API key
      })
      .then((response) => setStates(response.data))
      .catch((error) => console.error("Error fetching states:", error));
  }, []);

  // ✅ Fetch cities for selected state
  const fetchCities = (stateCode) => {
    axios
      .get(
        `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
        {
          headers: {
            "X-CSCAPI-KEY":
              "ZVZXNzV6anVBOHJ2bnJaOWZkbXFsb0lVZTVyN21qMFZEYzVqVHlRSQ==",
          }, // 🔹 Replace with your API key
        }
      )
      .then((response) => setCities(response.data))
      .catch((error) => console.error("Error fetching cities:", error));
  };

  // ✅ Handle state selection
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setState(selectedState);
    fetchCities(selectedState);
    setVehicleDetails(`${stateCodes[selectedState] || "XX"}-XX-YYYY`);
  };
  // ✅ Mobile Validation
  const handlePhoneChange = (value) => {
    setPhone(value);
    if (!isValidPhoneNumber(value, "IN")) {
      setPhoneError("Invalid phone number.");
    } else {
      setPhoneError("");
    }
  };
 // ✅ Toggle Password Visibility
 const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
};
  // ✅ Password Validation
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!validatePassword(newPassword)) {
      setPasswordError(
        "Password must be 8+ characters, include uppercase, number & special char."
      );
    } else {
      setPasswordError("");
    }
  };
  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3002/api/delivery/register-deliveryboy",
        {
          name,
          phone,
          email,
          password,
          state,
          city,
          vehicleDetails,
        }
      );
      alert(res.data.message);
      setIsRegistering(false);
      navigate("/delivery-orders");
    } catch (error) {
      alert(error.response?.data?.error || "Registration Failed! Try again.");
    }
  };
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}"); // ✅ Prevents null errors
    const role = userData?.role || null; // ✅ Get role

    if (role === "admin") {
        navigate("/dash"); // ✅ Redirect Admin to Dashboard
    } else if (role === "customer") {
        navigate("/userpanel"); // ✅ Redirect Customer to User Panel
    } else if (role === "delivery_boy") {
        navigate("/delivery-orders"); // ✅ Redirect Delivery Boy to Delivery Orders
    }
}, []);

useEffect(() => {
  const accessToken = localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("userEmail");

  if (accessToken && userEmail) {
      console.log("🟢 User is already logged in. Redirecting...");
      navigate("/delivery-orders"); // ✅ Redirecting if user is logged in
  }
}, [navigate]);



  const handleLogin = async () => {
    try {
        const response = await fetch("http://localhost:3002/api/delivery/login-deliveryboy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.accessToken) {
          console.log("🟢 Login Successful:", data);

          // ✅ Store user details
          const userData = {
              email: data.email,
              role: data.role || "delivery_boy", // Default role
              id: data.id
          };
            // ✅ Store user details
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("userData", JSON.stringify(userData));


            // ✅ Navigate after storing tokens
            setTimeout(() => {
                navigate("/delivery-orders"); // ✅ Ensure correct navigation
            }, 500);
            window.location.reload();
        } else {
            console.warn("⚠️ Login Failed:", data.message);
            setFlashMessage(data.message || "Login failed");
            setFlashMessageType("error");
        }
    } catch (error) {
        console.error("❌ Error during login:", error);
        setFlashMessage("An error occurred. Please try again.");
        setFlashMessageType("error");
    }
};





  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "" || password === "") {
      setFlashMessage("Please fill in all fields.");
      setFlashMessageType("error");
    } else {
      handleLogin();
     
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-40 p-6 bg-gray-100 shadow-md rounded-lg max-w-sm mx-auto">
      <h2 className="text-2xl font-bold">
        {isRegistering ? "Register as Delivery Boy" : "Delivery Boy Login"}
      </h2>

      {flashMessage && (
        <div
          className={`p-3 text-center mb-4 rounded-lg ${
            flashMessageType === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {flashMessage}
        </div>
      )}

      {isRegistering ? (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded w-full"
          />
          {/* ✅ Mobile Input */}
          <PhoneInput
            country={"in"}
            value={phone}
            onChange={handlePhoneChange}
            className="p-2 border rounded w-full"
          />
          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded w-full"
          />
         
          {/* ✅ State Dropdown */}
          <select
            value={state}
            onChange={handleStateChange}
            className="p-2 border rounded w-full"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.iso2} value={state.iso2}>
                {state.name}
              </option>
            ))}
          </select>

          {/* ✅ City Dropdown */}
          <select value={city} onChange={(e) => setCity(e.target.value)} className="p-2 border rounded w-full">
    <option value="">Select City</option>
    {cities.map((city, index) => (
        <option key={`${city.name}-${index}`} value={city.name}>
            {city.name}
        </option>
    ))}
</select>


          {/* ✅ Auto-generated Vehicle Details */}
          <input
            type="text"
            placeholder="Vehicle Details"
            value={vehicleDetails}
            readOnly
            className="p-2 border rounded w-full bg-gray-200"
          />

          {/* ✅ Password Input */}
         
                    {/* ✅ Password Input with Show/Hide */}
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="p-2 border rounded w-full pr-10"
                        />
                        <span className="absolute top-3 right-3 cursor-pointer" onClick={togglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

          <button
            onClick={handleRegister}
            className="bg-green-500 px-4 py-2 text-white rounded w-full"
          >
            Register
          </button>

          
          <p className="text-sm mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setIsRegistering(false)}
              className="text-blue-500 cursor-pointer"
            >
              Login here
            </span>
          </p>
        </>
      ) : (
        <>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 pr-10"
                />
                {showPassword ? (
                  <FaEye
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <FaEyeSlash
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-medium py-2 rounded-lg mt-6 hover:bg-blue-500 transition duration-200"
            >
              Submit
            </button>
          </form>
          <p className="text-sm mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setIsRegistering(true)}
              className="text-blue-500 cursor-pointer"
            >
              Register here
            </span>
          </p>
        </>
      )}
    </div>
  );
}
