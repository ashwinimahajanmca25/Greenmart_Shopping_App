import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { IoMdArrowRoundBack } from "react-icons/io";

const PrintPage = () => {
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [paymentIds, setPaymentIds] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchLatestPaymentIds();
  }, []);

  const fetchLatestPaymentIds = async () => {
    const email = localStorage.getItem("email");
    const orderIds = JSON.parse(localStorage.getItem("orderIds"));
  
    if (!email || !orderIds || orderIds.length === 0) {
      setError("User email or order IDs not found.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.get("http://localhost:3002/latest-payment-ids", {
        params: { email, order_ids: orderIds.join(",") },
      });
  
      console.log("🔹 Latest Payment IDs:", response.data);
  
      if (response.data.length > 0) {
        const fetchedPaymentIds = response.data.map((item) => item.payment_id);
        setPaymentIds(fetchedPaymentIds);
  
        if (fetchedPaymentIds.length > 0) {
          fetchPaymentDetails(fetchedPaymentIds);
        } else {
          setError("No valid payments found.");
          setLoading(false);
        }
      } else {
        setError("No recent payments found.");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Error fetching payment IDs:", err);
      setError("Failed to fetch payment IDs.");
      setLoading(false);
    }
  };
  

  const fetchPaymentDetails = async (paymentIds) => {
    if (!paymentIds || paymentIds.length === 0) {
      setError("No valid payment IDs found.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("🔹 Fetching Payment Details for IDs:", paymentIds);
  
      const response = await axios.get("http://localhost:3002/payments", {
        params: { payment_ids: paymentIds.join(",") }, // ✅ Convert array to comma-separated string
      });
  
      console.log("✅ Fetched Payment Data:", response.data);
      setPurchaseData(response.data);
  
      const total = response.data.reduce((sum, item) => sum + (item.total_price * item.quantity || 0), 0);

      setTotalAmount(total);
    } catch (err) {
      console.error("❌ Error fetching payment details:", err);
      setError("Failed to fetch payment details.");
    } finally {
      setLoading(false);
    }
  };
  

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const input = invoiceRef.current;
    const buttonsContainer = input.querySelector(".buttons-container");

    if (buttonsContainer) buttonsContainer.style.display = "none";

    html2canvas(input, { scale: 2 }).then((canvas) => {
      if (buttonsContainer) buttonsContainer.style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice_${Date.now()}.pdf`);
    });
  };

  if (loading) return <div className="text-center mt-10 text-black dark:text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (purchaseData.length === 0) return <div className="text-center mt-10 text-black dark:text-white">No purchase data found.</div>;


  return (
    <div className="px-4 mb-16">
      <div className="relative flex justify-center pt-24 print:pt-0 ">
        <button onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack className="absolute left-16 text-3xl hover:text-gray-700 hover:scale-x-110 dark:text-white print:hidden" />
        </button>
      </div>
      {/* Invoice Container */}
      <div
        ref={invoiceRef}
        className="w-full max-w-2xl  mx-auto bg-gradient-to-r from-green-300 via-green-200 to-green-300  shadow-md rounded-lg p-6 border border-gray-200 print:shadow-none print:border-none"
      >
        {/* Header Section */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex items-center">
            <img
              src="/mainlogo.png"
              alt="Company Logo"
              className="h-14 w-auto rounded-lg mr-3"
            />
            <h1 className="text-4xl font-semibold text-gray-900">GreenMart</h1>
          </div>
          <h2 className="text-lg font-bold text-gray-700 uppercase">Invoice</h2>
        </div>

        {/* Company Info */}
        <div className="text-sm font-semibold text-gray-700 mb-3">
          <p>123 Business Street, City, Country</p>
          <p>Phone: (123) 456-7890 | Email: contact@company.com</p>
        </div>

        {/* Billing Details */}
        {purchaseData.length > 0 && (
          <div className="border border-gray-300 p-4 rounded-xl mb-3">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Bill To:
            </h2>
            <p>
              <strong>User ID: </strong>
              {purchaseData[0].user_id || "N/A"}
            </p>
            <p>
              <strong>Name: </strong>
              {purchaseData[0].firstname || "N/A"}{" "}
              {purchaseData[0].lastname || "N/A"}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {purchaseData[0].shipping_address || "N/A"}
            </p>
            <p>
              <strong>City:</strong> {purchaseData[0].city || "N/A"}
            </p>
            <p>
              <strong>State:</strong> {purchaseData[0].state || "N/A"}
            </p>
            <p>
              <strong>Mobile:</strong> {purchaseData[0].contact || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {purchaseData[0].email || "N/A"}
            </p>
            <p>
              <strong>Payment method & status:</strong> {purchaseData[0].payment_method || "N/A"}{purchaseData[0].payment_status || "N/A"}
            </p>
            <p>
              <strong>Date & Time:</strong>{" "}
              {purchaseData[0].payment_date
                ? new Date(purchaseData[0].payment_date).toLocaleString()
                : "N/A"}
            </p>
          </div>
        )}
        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg ">
          <table className="w-full border border-gray-300 text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border border-gray-300 px-4 py-2">Item</th>
                <th className="border border-gray-300 px-4 py-2">Qty</th>
                <th className="border border-gray-300 px-4 py-2">Price</th>
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchaseData.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    No items found.
                  </td>
                </tr>
              ) : (
                purchaseData.map((purchaseData, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {purchaseData.product_name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {purchaseData.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹{purchaseData.total_price.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹
                      {(
                        purchaseData.total_price * purchaseData.quantity
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Amount */}
        <div className="text-right text-lg font-bold mt-4 pr-4">
  <p>Total: ₹{(totalAmount || 0).toFixed(2)}</p>
</div>


        {/* Footer */}
        <div className="text-sm text-gray-600 border-t pt-4 mt-4 text-center">
          <p>Payment is due within 30 days of receipt.</p>
          <p>Bank Account: 123456789, Routing Number: 000111222</p>
          <p>Thank you for your business!</p>
        </div>

        {/* Buttons */}
        {/* Buttons */}
        <div className="buttons-container flex justify-center space-x-4">
          <button
            onClick={handlePrint}
            className="mt-6 px-5 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition print:hidden"
          >
            Print Invoice
          </button>
          <button
            onClick={handleDownloadPDF}
            className="mt-6 px-5 py-2  bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition print:hidden"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPage;
