import React, { useEffect, useRef } from 'react';

// Mock data for feedbacks (10 entries)
const feedbacks = [
  { id: 1, name: "John Doe", message: "Great experience shopping here! The plants are healthy and the service is excellent.", rating: 5, email: "johndoe@example.com", date: "2025-02-10", image: "https://randomuser.me/api/portraits/men/10.jpg" },
  { id: 2, name: "Jane Smith", message: "Loved the variety of pots available. Will definitely recommend to others!", rating: 4, email: "janesmith@example.com", date: "2025-02-08", image: "https://randomuser.me/api/portraits/women/20.jpg" },
  { id: 3, name: "Alice Johnson", message: "The quality of the soil is amazing, and the customer service was very helpful. Keep it up!", rating: 5, email: "alicej@example.com", date: "2025-02-06", image: "https://randomuser.me/api/portraits/women/30.jpg" },
  { id: 4, name: "Bob Lee", message: "Amazing plants! They are growing well in my garden.", rating: 5, email: "boblee@example.com", date: "2025-02-05", image: "https://randomuser.me/api/portraits/men/11.jpg" },
  { id: 5, name: "Emily Davis", message: "I am happy with my purchase, will shop again.", rating: 4, email: "emilydavis@example.com", date: "2025-02-04", image: "https://randomuser.me/api/portraits/women/40.jpg" },
  { id: 6, name: "John Doe", message: "Great experience shopping here! The plants are healthy and the service is excellent.", rating: 5, email: "johndoe@example.com", date: "2025-02-10", image: "https://randomuser.me/api/portraits/men/10.jpg" },
  { id: 7, name: "Jane Smith", message: "Loved the variety of pots available. Will definitely recommend to others!", rating: 4, email: "janesmith@example.com", date: "2025-02-08", image: "https://randomuser.me/api/portraits/women/20.jpg" },
  { id: 8, name: "Alice Johnson", message: "The quality of the soil is amazing, and the customer service was very helpful. Keep it up!", rating: 5, email: "alicej@example.com", date: "2025-02-06", image: "https://randomuser.me/api/portraits/women/30.jpg" },
  { id: 9, name: "Bob Lee", message: "Amazing plants! They are growing well in my garden.", rating: 5, email: "boblee@example.com", date: "2025-02-05", image: "https://randomuser.me/api/portraits/men/11.jpg" },
  { id: 10, name: "Emily Davis", message: "I am happy with my purchase, will shop again.", rating: 4, email: "emilydavis@example.com", date: "2025-02-04", image: "https://randomuser.me/api/portraits/women/40.jpg" },



];

const FeedbackPage = () => {
  const feedbackContainerRef = useRef(null);

  // Function to handle infinite circular sliding
  useEffect(() => {
    const interval = setInterval(() => {
      const container = feedbackContainerRef.current;

      // Slide the container to the right by 1px (adjust speed here)
      if (container) {
        container.scrollBy({
          left: 1, // Scroll speed (adjust this value)
          behavior: "smooth",
        });

        // When the container scrolls to the end, reset to the beginning
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
    }, 20); // Adjust the interval time to control the speed

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gray-200 mx-auto rounded-lg shadow-lg  py-44 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-green-700 dark:text-green-300 mb-6">Customer Feedback</h2>

      {/* Scrollable feedback container */}
      <div
        ref={feedbackContainerRef}
        className="overflow-x-auto flex gap-6 py-6 scroll-smooth"
      >
        {/* Feedback cards */}
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="p-4 min-w-[320px] w-[300px] bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-700 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center">
              {/* Profile Image */}
              <img
                src={feedback.image}
                alt={feedback.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold dark:text-white text-gray-800">{feedback.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-200">{feedback.date}</div>
              </div>
            </div>
            <p className="text-gray-700 mt-2 dark:text-gray-200">{feedback.message}</p>
            <div className="flex items-center mt-3">
              <span className="text-yellow-500">{"★".repeat(feedback.rating)}</span>
              <span className="text-gray-500 ml-2 dark:text-gray-100">({feedback.rating} out of 5)</span>
            </div>
            <div className="mt-3 text-sm  text-gray-500 dark:text-gray-200">Email: {feedback.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;
