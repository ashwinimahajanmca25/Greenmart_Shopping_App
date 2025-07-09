import React, { useState } from "react";
import { FaLeaf, FaChevronDown, FaChevronUp,  FaEnvelope } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";

const faqs = [
  {
    question: "How can I place an order?",
    answer: "Simply browse our plants and gardening tools, add to your cart, and checkout securely. You’ll receive a confirmation email after placing your order.",
  },
  {
    question: "What are the shipping charges?",
    answer: "We offer free shipping on orders above ₹500. For orders below ₹500, a minimal shipping fee of ₹50 applies.",
  },
  {
    question: "Can I return a plant or product?",
    answer: "Yes! You can return a product within 7 days of delivery if it meets our return conditions. Live plants cannot be returned once delivered.",
  },
  {
    question: "How long does it take to get a refund?",
    answer: "Refunds are processed within 3-5 business days after we receive the returned item in its original condition.",
  },
  {
    question: "How can I contact customer support?",
    answer: "You can email us at greenmart@example.com or call our helpline at +91 98765 43210.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen  dark:bg-gray-900 dark:text-white py-12 pt-24 px-6">
     
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-700 dark:text-green-400 flex justify-center items-center gap-3">
          <FaLeaf /> Frequently Asked Questions
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Find answers to common questions about our plants, gardening tools, and orders.
        </p>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4">
            <button
              className="w-full flex justify-between items-center bg-white dark:bg-gray-800 px-5 py-4 rounded-lg shadow-md text-left text-lg font-semibold transition-all duration-300 hover:bg-green-100 dark:hover:bg-gray-700"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="text-green-600">{openIndex === index ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            {openIndex === index && (
              <div className="p-5 bg-green-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg mt-2 shadow-md transition-all duration-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Us Section */}
      <div className="text-center mt-12">
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          Still have questions? Reach out to our support team.
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="tel:+919876543210" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full text-lg shadow-lg transition duration-300 flex items-center gap-2">
            <FaPhone /> Call Us
          </a>
          <a href="mailto:greenmart@example.com" className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg shadow-lg transition duration-300 flex items-center gap-2">
            <FaEnvelope /> Email Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
