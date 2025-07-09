import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext"; // Import User Context
import LoginPopup from "../Registration/LoginPopup"; // Import Login Popup
import { IoMdArrowRoundBack } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { user } = useContext(UserContext);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loginPopup, setLoginPopup] = useState(false);
  const navigate = useNavigate();
  // near top
  const [items, setItems] = useState([]); // or use your actual state variable name
  const [paidOrders, setPaidOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const groupByDateTime = (items) => {
    return items.reduce((groups, item) => {
      const date = new Date(item.order_date);
      const key = date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  };

  const groupedPaidOrders = groupByDateTime(paidOrders);
  const groupedUnpaidOrders = groupByDateTime(unpaidOrders);

  const groupKeysPaid = Object.keys(groupedPaidOrders).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const groupKeysUnpaid = Object.keys(groupedUnpaidOrders).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  useEffect(() => {
    console.log("User state changed:", user);
    if (!user) {
      setTimeout(() => setLoginPopup(true), 100);
    } else {
      setLoginPopup(false);
      fetchCart();
    }
  }, [user]);
  useEffect(() => {
    if (groupKeysUnpaid.length > 0) {
      const latestKey = groupKeysUnpaid[0];
      const latestUnpaidGroup = groupedUnpaidOrders[latestKey];

      const total = latestUnpaidGroup.reduce(
        (sum, item) => sum + (item.base_price || item.price) * item.quantity,
        0
      );

      setTotalPrice(total);
    }
  }, [groupedUnpaidOrders, groupKeysUnpaid]);

  const fetchCart = async () => {
    if (!user || !user.idusers) return;

    try {
      const response = await axios.get(`http://localhost:3002/userorders`, {
        params: { userId: user.idusers },
      });

      // Store the fetched product details directly in state
      setCart(response.data);
      // Separate products into paid and unpaid groups
      const paid = response.data.filter(
        (order) => order.payment_status === "Paid"
      );
      const unpaid = response.data.filter(
        (order) => order.payment_status === "Unpaid"
      );

      setPaidOrders(paid);
      setUnpaidOrders(unpaid);

      console.log("Fetched Cart Data:", response.data); // Debugging
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };
  const handleBuyNow = async () => {
    // Ensure only the latest unpaid session group is purchased
    const latestKey = groupKeysUnpaid[0]; // latest group is at index 0 after sorting
    const latestUnpaidGroup = groupedUnpaidOrders[latestKey];

    console.log("Sending latest unpaid group:", latestUnpaidGroup);

    try {
      await axios.post("http://localhost:3002/buy-now", {
        cart: latestUnpaidGroup.map((item) => ({
          idproducts: item.idproducts,
          quantity: item.quantity || 1,
        })),
        userId: user.idusers,
      });

      localStorage.setItem("orderData", JSON.stringify(latestUnpaidGroup));
      navigate("/bill");
    } catch (error) {
      console.error("Error completing purchase:", error);
    }
  };

  const incrementQuantity = async (idproducts) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.idproducts === idproducts) {
          const updatedQuantity = item.quantity + 1;

          // Update backend immediately inside the callback
          axios.post("http://localhost:3002/orders/update-quantity", {
            idproducts,
            quantity: updatedQuantity,
            userId: user.idusers, // ✅ include this
            action: "increment",
          });

          return {
            ...item,
            quantity: updatedQuantity,
            total_price: updatedQuantity * item.base_price,
          };
        }
        return item;
      });
    });
    fetchCart();
  };
  const decrementQuantity = async (idproducts) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.idproducts === idproducts) {
          const updatedQuantity = Math.max(1, item.quantity - 1);

          // Update backend immediately inside the callback
          axios.post("http://localhost:3002/orders/update-quantity", {
            idproducts,
            quantity: updatedQuantity,
            userId: user.idusers, // ✅ include this
            action: "decrement",
          });

          return {
            ...item,
            quantity: updatedQuantity,
            total_price: updatedQuantity * item.base_price,
          };
        }
        return item;
      });
    });
    fetchCart();
  };
  const removeFromCart = async (idproducts) => {
    await axios.post("http://localhost:3002/orders/remove", { idproducts });
    setCart(cart.filter((item) => item.idproducts !== idproducts));
    setCart(paidOrders.filter((item) => item.idproducts !== idproducts));
    fetchCart();
  };
  const clearUnpaidOrders = async () => {
  
       
    try {
      const res =  await axios.post("http://localhost:3002/clear-unpaid-orders", {
        idusers: user.idusers,
      });
      
      alert(res.data.message); // show alert
      // window.location.reload();
      fetchCart();
    } catch (err) {
      console.error('Error clearing unpaid orders:', err);
    }
  };
  const renderEmptyCartMessage = () => (
    <div className="flex flex-col justify-center items-center py-28">
      <h2 className="text-3xl font-semibold dark:text-white text-gray-700 mb-6">
        Your cart is empty.
      </h2>
      <button
        onClick={() => navigate("/")}
        className="bg-primary dark:text-white text-black py-3 px-8 rounded-full"
      >
        Go to Products
      </button>
    </div>
  );

 
 

  return (
    <div className="relative mx-auto w-full md:px-9 pt-20 dark:bg-gray-800">
      {loginPopup && <LoginPopup loginPopup={loginPopup} onClose={fetchCart} />}

      {cart.length === 0 ? (
        renderEmptyCartMessage()
      ) : (
        <div>
          <h2 className="text-xl  md:text-2xl lg:text-3xl md:pt-10 font-extrabold text-center  text-gray-800 dark:text-white">
            Your Cart
          </h2>
          <div className="text-center">
            <button onClick={() => navigate(-1)}>
              <IoMdArrowRoundBack className="text-3xl absolute left-4 top-20 hover:text-gray-700 hover:scale-x-110 dark:text-white " />
            </button>
          </div>

          {/* Unpaid Orders */}
          <div>
            <h3 className="text-2xl text-red-500">Unpaid Orders</h3>
            {groupKeysUnpaid.map((key, index) => (
              <div key={key} className={`border p-4 rounded my-2 ${index === 0 ?"bg-yellow-100 dark:bg-yellow-700" : ""}`}>
                <h3>
                  🟠 Session: {key} {index === 0 && "(Latest)"}
                </h3>

                <AnimatePresence>
                  {groupedUnpaidOrders[key].map((item, index) => (
                    <motion.div
                      layout
                      key={`cart-item-${item.idproducts}-${index}`}
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                      className="flex w-full items-center justify-between md:justify-around p-2 rounded-lg mb-4 shadow-lg border border-gray-300 dark:bg-gray-600"
                    >
                      {/* Render each product item */}
                      <img
                        src={`http://localhost:3002/ProductImg/${item.image_name}`}
                        alt={item.product_name}
                        className="w-10 h-10 md:w-24 md:h-14 lg:w-28 lg:h-20 rounded-lg object-cover"
                      />
                      <div className="text-xs md:text-base lg:text-lg  w-16 md:w-32 lg:w-40  mr-9 md: lg: font-semibold dark:text-white">
                        {item.product_name}
                      </div>
                      <div className="text-sm font-semibold w-16 md:w-28  md:text-xl lg:text-2xl dark:text-white">
                        ₹{(item.base_price * item.quantity).toFixed(2)}
                      </div>
                      <div className="flex justify-center items-center">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          className="flex justify-center items-center hover:scale-105 md:text-xl lg:text-2xl rounded-full w-5 h-5 bg-slate-300 pb-2 "
                          onClick={() => decrementQuantity(item.idproducts)}
                        >
                          -
                        </motion.button>
                        <motion.span
                          layout
                          className="mx-1 text-sm md:text-lg md:font-semibold lg:text-2xl lg:font-bold dark:text-white"
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          className=" flex justify-center items-center md:text-xl lg:text-2xl rounded-full w-5 h-5 hover:scale-105 bg-slate-300 pb-1"
                          onClick={() => incrementQuantity(item.idproducts)}
                        >
                          +
                        </motion.button>
                      </div>

                      <motion.div className="text-sm font-semibold w-16 md:w-28  md:text-xl lg:text-2xl dark:text-white">
                        ₹{(item.base_price * item.quantity).toFixed(2)}
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-[10px]  md:text-sm lg:text-lg "
                        onClick={() => removeFromCart(item.idproducts)}
                      >
                        ✖
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
             {groupKeysUnpaid.length === 0 ? (
                  <p className="text-lg text-gray-500 dark:text-white">
                    No unpaid items available for purchase.
                  </p>
                ) :  (
            <div className="mt-3  flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-sm  md:text-xl lg:text-2xl font-bold text-white bg-green-800 mb-3 rounded-full p-2">
                Total Price: ₹{totalPrice}
              </h2>

              <div className="flex space-x-4  md:text-xl lg:text-2xl ">
                <button
                  className="bg-green-800 text-white px-2 py-1  rounded-full"
                  onClick={clearUnpaidOrders}
                >
                  Clear Cart
                </button>

              
                  <button
                    className="bg-green-800 text-white px-2 rounded-full"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                  </div>
            </div>
          
                )}
             </div>

          {/* Paid Orders */}
          <div>
            <h3 className="text-2xl text-green-500">Paid Orders</h3>
            {groupKeysPaid.map((key) => (
              <div key={key} className="border p-4 rounded my-2">
                <h3>🟢 Session: {key}</h3>
                <AnimatePresence>
                  {groupedPaidOrders[key].map((item, index) => (
                    <motion.div
                      layout
                      key={`paid-item-${item.idproducts}-${index}`}
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.5 }} // 👈 Smooth remove effect
                      transition={{ duration: 0.3 }}
                      className="flex w-full items-center justify-between md:justify-around p-2 rounded-lg mb-4 shadow-lg border border-gray-300 dark:bg-gray-600"
                    >
                      {/* Render each product item */}
                      <img
                        src={`http://localhost:3002/ProductImg/${item.image_name}`}
                        alt={item.product_name}
                        className="w-10 h-10 md:w-24 md:h-14 lg:w-28 lg:h-20 rounded-lg object-cover"
                      />
                      <div className="text-xs md:text-base lg:text-lg  w-16 md:w-32 lg:w-40  mr-9 md: lg: font-semibold dark:text-white">
                        {item.product_name}
                      </div>
                      <div className="text-sm font-semibold w-16 md:w-28  md:text-xl lg:text-2xl dark:text-white">
                        ₹{(item.base_price * item.quantity).toFixed(2)}
                      </div>
                      <div className="flex justify-center items-center">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          className="flex justify-center items-center hover:scale-105 md:text-xl lg:text-2xl rounded-full w-5 h-5 bg-slate-300 pb-2 "
                         
                        >
                          -
                        </motion.button>
                        <motion.span
                          layout
                          className="mx-1 text-sm md:text-lg md:font-semibold lg:text-2xl lg:font-bold dark:text-white"
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          className=" flex justify-center items-center md:text-xl lg:text-2xl rounded-full w-5 h-5 hover:scale-105 bg-slate-300 pb-1"
                        
                        >
                          +
                        </motion.button>
                      </div>

                      <motion.div className="text-sm font-semibold w-16 md:w-28  md:text-xl lg:text-2xl dark:text-white">
                        ₹{(item.base_price * item.quantity).toFixed(2)}
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-[10px]  md:text-sm lg:text-lg "
                        onClick={() => removeFromCart(item.idproducts)}
                      >
                        ✖
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
