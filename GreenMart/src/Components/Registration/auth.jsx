import { useState } from "react";
import DeliveryAuth from "../AdminPanel/DeliveryLogin";  // ✅ Adjust the path if needed

export default function ParentComponent() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);  // ✅ Correct authentication state

    return (
        <div>
            <h1>Welcome to Delivery System</h1>
            <DeliveryAuth setAuth={setIsAuthenticated} />  {/* ✅ Pass setAuth correctly */}
        </div>
    );
}
