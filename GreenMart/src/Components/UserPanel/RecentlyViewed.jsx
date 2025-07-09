import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const RecentlyViewedPage = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const savedRecentlyViewed = localStorage.getItem("recentlyViewed");
    if (savedRecentlyViewed) {
      const parsedProducts = JSON.parse(savedRecentlyViewed);
      setRecentlyViewed(parsedProducts.reverse());
    }
  }, []);

  const handleViewProduct = () => {
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    navigate("/topproducts");
  };

  const totalPages = Math.ceil(recentlyViewed.length / itemsPerPage);
  const displayedItems = recentlyViewed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col md:flex-row dark:bg-gray-900 h-min md:mb-20">
      <Sidebar />
      <div className="flex-1 md:mt-20  p-4 md:p-8 bg-white dark:bg-gray-900">
        {recentlyViewed.length === 0 ? (
          <div className="w-full md:w-3/4 bg-white  rounded-lg shadow p-6 dark:bg-gray-300 mx-auto mt-10 md:mt-28">
            <div className="flex flex-col items-center">
              <p className="text-black text-lg mb-2 font-semibold">You haven’t viewed any products yet.</p>
              <p className="text-black text-sm mb-6 font-semibold">Browse our catalog to see products.</p>
              <button
                onClick={handleViewProduct}
                className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800"
              >
                View Products
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full md:w-5/6  dark:text-white dark:bg-gray-900 rounded-lg  mx-auto mt-10 md:mt-8 ">
            <h2 className="text-2xl font-bold mb-5 text-center md:text-left dark:text-white">Recently Viewed Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto border-collapse border border-gray-300 text-sm md:text-base">
                <thead>
                  <tr className="bg-green-100 dark:bg-gray-600 text-left">
                    <th className="py-2 px-4 border">Image</th>
                    <th className="py-2 px-4 border">Title</th>
                    <th className="py-2 px-4 border">Price</th>
                    <th className="py-2 px-4 border">Category</th>
                    <th className="py-2 px-4 border">Action</th>
                    <th className="py-2 px-4 border">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.map((item) => (
                    <tr key={item.idproducts} className=" transition ">
                      <td className="py-2 px-4 border">
                        <img
                          src={`http://localhost:3002/ProductImg/${item.image_name}`}
                          alt={item.name}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                        />
                      </td>
                      <td className="py-2 px-4 border">{item.name}</td>
                      <td className="py-2 px-4 border">₹{item.base_price}</td>
                      <td className="py-2 px-4 border">{item.category || "Uncategorized"}</td>
                      <td className="py-2 px-4 border font-semibold text-gree-800">{item.action || "Viewed"}</td>
                      <td className="py-2 px-4 border text-gray-500">{item.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="mx-2 px-4 py-2 bg-green-400 text-white rounded ">
                Previous
              </button>
              <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="mx-2 px-4 py-2 bg-green-400 text-white rounded "
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewedPage;