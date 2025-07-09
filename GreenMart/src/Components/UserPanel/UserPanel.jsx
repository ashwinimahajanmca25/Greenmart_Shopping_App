import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";


const UserPanel = () => {
  
  const [formData, setFormData] = useState({
   
    firstname: "",
    lastname: "",
    shipping_address: "",
    city: "",
    state: "",
    country: "",
    email: "",
    contact: "",
    birthdate: "",
    gender: "Select Gender",
  });

  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      const email = localStorage.getItem("email");

      if (!email) {
        console.error("User email not found in localStorage");
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
          const errorMessage = `Error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const userData = await response.json();

        setFormData({
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          shipping_address: userData.shipping_address || "",
          city: userData.city || "",
          state: userData.state || "",
          country: userData.country || "",
          email: userData.email || "",
          contact: userData.contact || "",
          birthdate: userData.birthdate ? userData.birthdate.split("T")[0] : "", // ✅ Fix birthdate format
          gender: userData.gender || "",
        });

        setUsername(userData.firstname || "");
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchUserData();
    const handleLogoutEvent = () => {
      setFormData({
        firstname: "",
        lastname: "",
        shipping_address: "",
        city: "",
        state: "",
        country: "",
        email: "",
        contact: "",
        birthdate: "",
        gender: "Select Gender",
      });
      setUsername("");
    };

    window.addEventListener("storage", handleLogoutEvent);

    return () => {
      window.removeEventListener("storage", handleLogoutEvent);
    };
  }, []);

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Save form data
 const handleSubmit = async () => {
  const phoneNumber = formData.contact.replace(/\D/g, "").slice(-10); // Extract last 10 digits

  if (phoneNumber.length !== 10) {
    alert("Contact number must be exactly 10 digits.");
    return;
  }
  try {
    const response = await fetch("http://localhost:3002/userpanel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(formData),  // Make sure `formData` contains all the required fields
    });

    if (!response.ok) throw new Error("Failed to save user data");

    alert("User data updated successfully!");
    setIsEditing(false);
  } catch (error) {
    console.error("Error saving user data:", error);
    alert("Failed to update user data.");
  }
};


  return (
    <div className="flex flex-col md:flex-row w-full dark:bg-gray-900">
      <Sidebar />
      
      
        <div className=" md:w-3/5 flex flex-col  justify-center items-center px-2 md:mt-24 md:ml-24">
          <h1 className=" text-2xl md:text-4xl dark:text-white font-bold md:mb-2">
            {" "}
            Welcome, {username}!{" "}
          </h1>
          
          <form className="w-full grid grid-cols-2 gap-3 md:gap-x-7 md:gap-y-1 bg-white p-6 rounded-lg shadow-md dark:bg-gray-500 ">
          <div className="">
            <label className="block text-white font-medium mt-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstname}
              placeholder=" First Name"
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mt-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastname}
              placeholder=" lastname"
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mt-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
                placeholder=" email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mt-2">
              Address
            </label>
            <input
              type="text"
              value={formData.shipping_address}
                 placeholder=" Address"
              onChange={(e) =>
                setFormData({ ...formData, shipping_address: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">City</label>
            <input
              type="text"
              value={formData.city}
               placeholder=" City"
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mt-2">
              State
            </label>
            <input
              type="text"
              value={formData.state}
                placeholder=" State"
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mt-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              placeholder=" Country"
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
  <label className="block text-white font-medium mt-2">
    Contact Number
  </label>
  <PhoneInput
    country={"in"} // Default country (India)
    value={formData.contact}
    onChange={(value) => {
      const phoneNumber = value.replace(/\D/g, "").slice(-10); // Extract last 10 digits
      setFormData({ ...formData, contact: value }); // Store full number
    }}
    inputProps={{
      name: "contact",
      required: true,
      autoFocus: false,
    }}
    isValid={(value, country) => {
      const phoneNumber = value.replace(/\D/g, "").slice(-10);
      return phoneNumber.length === 10;
    }}
  />
</div>

          <div>
            <label className="block text-white font-medium mt-2">
              Birthdate
            </label>
            <input
              type="date"
              value={formData.birthdate}
                 placeholder="  Birthdate"
              onChange={(e) =>
                setFormData({ ...formData, birthdate: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="block text-white font-medium mt-2">
              Gender
            </label>
            <select
              value={formData.gender}
                 placeholder="   Gender"
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              disabled={!isEditing}
              className={`w-full p-2 rounded-md border ${
                isEditing ? "bg-white" : "bg-gray-100"
              }`}
            >
              <option value="" disabled hidden>
                Select Gender
              </option>
              <option value="Other">Other</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </form>
        <div className="flex justify-center gap-40 mt-3 mb-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleEdit}
              className="text-white bg-green-800 font-bold py-3 px-8 rounded-full hover:scale-110 hover:shadow-2xl group transition duration-300"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="text-white bg-green-800 font-bold py-3 px-8 rounded-full hover:scale-110 hover:shadow-2xl group transition duration-300"
            >
              Save
            </button>
          )}
        </div>
        </div>
        
     
    
    </div>
  );
};

export default UserPanel;
