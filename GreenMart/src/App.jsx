import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Header/Navbar/Navbar";
import Hero from "./Components/Header/Hero/Hero";
import Footer from "./Components/Footer/Footer";
import Product from "./Components/Middle/Product";
import Contact from "./Components/Pages/Contact";
import About from "./Components/Pages/About";
import Products from "./Components/Pages/Products";
import UserPanel from "./Components/UserPanel/UserPanel";
import ChangePassword from "./Components/UserPanel/ChangePassword";
import Service from "./Components/Pages/Service";
import ProductPage from "./Components/Pages/ProductPage";
import OrdersPage from "./Components/UserPanel/OrdersPage";
import Userpopup from "./Components/UserPanel/Userpopup";
import Cart from "./Components/Pages/Cart";
import BillPage from "./Components/Pages/BillPage";
import PrintPage from "./Components/Pages/PrintPage";
import NotFound from "./Components/Pages/NotFound";
import { UserProvider } from "./Components/UserContext"; // Import UserProvider
import RecentlyViewed from "./Components/UserPanel/RecentlyViewed";
import DetailPage from "./Components/Middle/DetailPage";
import ProductList from "./Components/Middle/ProductList";
import Appointment from "./Components/Pages/AppointmentPage";
import GardenerDetailsPage from "./Components/Pages/GardenerDetailsPage";
import UserServices from "./Components/UserPanel/UserServices";
import Shipping from "./Components/Footer/Shipping";
import Returns from "./Components/Footer/Returns";
import FAQ from "./Components/Footer/FAQ";
import TermsPrivacy from "./Components/Footer/TermsPolicy";
import Blogs from "./Components/Footer/Blogs";
import Feedbacks from "./Components/Footer/Feedbacks";
import SearchProducts from "./Components/Header/Navbar/SearchProducts";
import AdminSidebar from "./Components/AdminPanel/AdminSidebar";
import Dashboard from "./Components/AdminPanel/Dashboard";
import OrderManagement from "./Components/AdminPanel/OrderManagement";
import ProductManagement from "./Components/AdminPanel/ProductManagement";
import UserManagement from "./Components/AdminPanel/UserManagement";
import AdminChangePassword from "./Components/AdminPanel/AdminChangePassword";
import ProtectedRoute from "./Components/ProtectedRoute"; // Import ProtectedRoute
import DeliveryLogin from "./Components/AdminPanel/DeliveryLogin";
import DeliveryOrders from "./Components/AdminPanel/DeliveryOrders";
// import DeliveryConfirm from "./Components/AdminPanel/DeliveryConfirm";
import FeedbackPage from "./Components/Pages/FeedbackPage";
import FeedbackP from "./Components/AdminPanel/FeedbackP";
import ForgotPassword from "./Components/Registration/ForgotPassword";
import ResetPassword from "./Components/Registration/resetpassword";
import Chatbot from "./Components/chatbot";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginPopup, setLoginPopup] = useState(false); // New state to control popup visibility

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token); // Convert to boolean
  }, []);

  const handleLogin = (user, token) => {
    setUsername(user);
    setIsLoggedIn(true);
    localStorage.setItem("username", user);
    localStorage.setItem("accessToken", token);
    setLoginPopup(false); // Close the popup after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("username");
    localStorage.removeItem("accessToken");
  };

  return (
    <UserProvider>
      <BrowserRouter>
      <div className="navbar">
        <Navbar 
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
          username={username}
          setLoginPopup={setLoginPopup} // Pass the setLoginPopup function to Navbar
        />
        </div>

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div>
                <Hero />
                <Product />
               
                <Products />
              </div>
            }
          />
          <Route path="/topproducts" element={
              <div>
                {/* <Hero /> */}
                <Product />
                <Products />
              </div>
            } />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/FAQ" element={<FAQ />} />
          <Route path="/terms-policy" element={<TermsPrivacy />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/productlist/:subcategory" element={<ProductList />} />
          <Route path="/details-page/:subcategory/:id" element={<DetailPage />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/gardener-details" element={<GardenerDetailsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Service />} />
          <Route path="/orderspage" element={<OrdersPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<ProductPage />} />
          <Route path="/product/:idproducts/:name" element={<SearchProducts />} />
          <Route path="/userpopup" element={<Userpopup />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/feedbackpage" element={<FeedbackPage />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />

          <Route path="/delivery-login" element={<DeliveryLogin />} />

          <Route path="/feedbackp" element={<FeedbackP />} />
          <Route element={<ProtectedRoute allowedRoles={["delivery_boy"]} />}>
            
            <Route path="/delivery-orders" element={<DeliveryOrders />} />
            {/* <Route path="/delivery-confirm" element={<DeliveryConfirm />} /> */}
          </Route>
          {/* Protected Routes for Customers */}
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/userpanel" element={<UserPanel />} />
            <Route path="/userservices" element={<UserServices />} />
            <Route path="/bill" element={<BillPage />} />
            <Route path="/print" element={<PrintPage />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />
            <Route path="/recentlyview" element={<RecentlyViewed />} />
          </Route>

          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-sidebar" element={<AdminSidebar />} />
            <Route path="/dash" element={<Dashboard />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/productsm" element={<ProductManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/admin-change-password" element={<AdminChangePassword />} />
{/* 
<Route path="feedbackp" element={<FeedbackP />} /> */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        
        <div className="footer">
        <Footer />
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
