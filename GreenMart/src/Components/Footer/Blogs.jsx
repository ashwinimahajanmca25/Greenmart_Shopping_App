import React from "react";

const blogs = [
  {
    id: 1,
    title: "The Best Plants for Your Home",
    description: "Discover the best indoor plants that improve air quality and add beauty to your space.",
    link: "https://unlimitedgreens.com/blogs/blog/10-best-house-plants-for-every-room-in-your-home?srsltid=AfmBOoqk0VvQbht7eTHAjsgH_v7x3iasQJn2OjwKE6_XHXZMpc_4eZ3D"
  },
  {
    id: 2,
    title: "Gardening Tips for Beginners",
    description: "Learn essential gardening tips to grow healthy plants effortlessly.",
    link: "https://vivamutual.org/resources/your-garden-is-an-opportunity-to-become-active/?gad_source=1&gclid=CjwKCAiAh6y9BhBREiwApBLHC27PMC-IC_rjSoQGSd31pUwYsSsppkYH0XRFAhtqUeXpY9aaV3UO9RoCHJ8QAvD_BwE"
  },
  {
    id: 3,
    title: "How to Care for Roses",
    description: "A complete guide on how to grow and maintain beautiful roses in your garden.",
    link: "https://gardens.si.edu/learn/blog/tips-for-growing-healthy-roses/"
  }
];

const BlogsPage = () => {
  return (
    <div className="container mx-auto pt-28 py-6 dark:text-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4">Our Blogs</h1>
      <div className="grid gap-4">
        {blogs.map((blog) => (
          <div key={blog.id} className="border p-4 rounded-lg shadow-md dark:bg-gray-700">
            <h2 className="text-lg md:text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{blog.description}</p>
            <a href={blog.link} className="text-green-600  dark:text-green-400 font-medium mt-2 inline-block" target="_blank" rel="noopener noreferrer">Read More →</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
