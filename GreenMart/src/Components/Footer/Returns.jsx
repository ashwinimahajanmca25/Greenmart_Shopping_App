import React from "react";
import { FaUndo, FaClock, FaMoneyBillWave } from "react-icons/fa";

const Returns = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white py-10 pt-28 px-5">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-800 dark:text-green-400">
          🔄 Hassle-Free Returns & Refunds
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          We want you to be 100% satisfied! If you're not happy with your order, we've got you covered.
        </p>
      </div>

      {/* Return Policy Sections */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Easy Returns */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <FaUndo className="text-4xl text-green-800 mx-auto mb-4 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-center"> Easy Returns</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2">
            Return any product within 7 days, no questions asked!
          </p>
        </div>

        {/* Refund Processing */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <FaClock className="text-4xl text-green-800 mx-auto mb-4 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-center"> Fast Processing</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2">
            Refunds are processed within 3-5 business days.
          </p>
        </div>

        {/* Money-Back Guarantee */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
          <FaMoneyBillWave className="text-4xl text-green-800 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-center "> 100% Money Back</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-2">
            If you're not happy, we guarantee a full refund.
          </p>
        </div>
      </div>

      {/* Detailed Return Policy */}
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-green-800 dark:text-green-400 mb-4">
           Return & Refund Policy
        </h2>
        <ul className="text-gray-700 dark:text-gray-300 list-disc pl-6 space-y-3">
          <li>🛍️ You can return products within **7 days** of delivery.</li>
          <li>📦 Items must be unused, in original packaging, and with receipt.</li>
          <li>🚚 Customers are responsible for return shipping costs (unless item is defective).</li>
          <li>💳 Refunds are processed via the original payment method within **3-5 business days**.</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-10">
        <a href="/contact" className="bg-green-800 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg shadow-lg transition duration-300">
          📩 Request a Return
        </a>
      </div>
    </div>
  );
};

export default Returns;
