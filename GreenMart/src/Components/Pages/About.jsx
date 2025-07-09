import React from 'react';
import img4 from "../../assets/about4.jpg"; 
import img5 from '../../assets/about5.jpg'; 
import img2 from '../../assets/aboutimage2.jpg';
import img3 from '../../assets/abouti3.jpg';
import img1 from '../../assets/about1.jpg';
import img6 from '../../assets/about6.jpg';
//import './About.css';


const AboutPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <header className="w-full h-[500px] object-cover object-top relative bg-cover bg-center  bg-opacity-10" style={{ backgroundImage: `url(${img5})` }}>
        <div className="bg-black bg-opacity-50 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl  font-extrabold">Welcome to Our Gardening Plant Nursery</h1>
            <p className="text-xl mt-4 font-semibold">Discover our journey and passion for gardening.</p>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold dark:text-gray-100  text-green-700 hover:bg-lime-400">Our Story</h2>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-100  font-bold">
            We are a team of passionate gardeners dedicated to bringing the best plants to your home.
          </p>
        </div>

        {/* Image and Text Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-4xl font-bold text-green-700 hover:bg-lime-400 dark:text-gray-100 " >Our Mission</h3>
            <p className="text-lg text-black dark:text-gray-400  font-semibold">
              Our mission is to make gardening accessible and enjoyable for everyone, whether you're a beginner or an expert.
              Gardening is the process of growing plants for their vegetables, fruits, flowers, herbs, and appearances within a designated space.Gardens fulfill a wide assortment of purposes, notably the production of aesthetically pleasing areas, medicines, cosmetics, dyes, foods, poisons, wildlife habitats, and saleable goods (see market gardening). 
            </p>
          </div>
          <img src={img2} alt="Gardening" className="rounded-lg shadow-lg  ml-auto block" />
        </div>

        {/* Features Section */}
      <div className="flex flex-col lg:flex-row items-start dark:bg-gray-800  p-8 mt-12 rounded-lg shadow-lg">
        <div className="lg:w-1/2 lg:order-2 lg:ml-8">
            <img src={img6} alt="Gardening" className="rounded-lg shadow-lg  ml-auto block" />
        </div>
       <div className="lg:w-1/2 ">
         <h3 className="text-3xl font-bold dark:text-gray-100  text-green-700 mb-6 hover:bg-lime-400">What We Offer</h3>
         <ul className="list-disc list-inside space-y-4 text-lg text-black dark:text-gray-300  font-semibold">
           <li>High-quality plants</li>
           <li>Expert gardening advice</li>
           <li>Custom plant arrangements</li>
           <li>Eco-friendly gardening solutions</li>
         </ul>
         </div>
      </div>


        {/* Image Gallery */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <img src={img4} alt="Plants" className="rounded-lg shadow-lg" />
          <img src={img3} alt="Flowers" className="rounded-lg shadow-lg" />
          <img src={img1} alt="Garden" className="rounded-lg shadow-lg" />
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition duration-300 dark:text-blue-300">
            Ready to start your gardening journey? <a href="/contact" className="underline">Contact us</a> today!
          </p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-red-200 text-white text-center py-5  dark:bg-gray-800">
        <p className="text-lg font-bold text-black dark:text-gray-100  ">Cultivating a Passion for Gardening!</p>
      </footer>
    </div>
  );
};

export default AboutPage;