import React from "react";
import img1 from "../../assets/serviceimg1.jpg";
import img2 from "../../assets/serviceimg2.webp";
import img3 from "../../assets/service3.webp";
import img4 from "../../assets/serviceimg4.jpg";

const ServicePage = () => {
  return (
    <div className="bg-gray-50  dark:bg-gray-950 dark:text-white">
      {/* Header Section */}
      <header
        className="w-full h-[500px] object-cover object-top relative bg-cover bg-center  bg-opacity-10"
        style={{ backgroundImage: `url(${img1})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-extrabold">Our Gardening Services</h1>
            <p className="text-xl mt-4 font-semibold">
              Cultivating Beautiful Gardens with Professional Care
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-green-700 tracking-wide hover:bg-green-500 hover:text-white dark:text-green-300 transition duration-300 ease-in-out inline-block px-4 py-2 rounded">
            Our Expert Gardening Services
          </h2>
          <p className="text-lg text-gray-400 mt-6 leading-relaxed font-medium max-w-2xl mx-auto">
            Transform your outdoor space with our expert gardening services.
            From design to maintenance, we ensure vibrant, healthy gardens with
            a serene ambiance.
          </p>
          <div className="mt-8">
            <a
              href="#services"
              className="text-white bg-green-600 hover:bg-green-800 transition duration-300 px-6 py-3 rounded-full font-semibold text-lg shadow-lg"
            >
              Discover More
            </a>
          </div>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Service 1: Plant Care */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden  dark:bg-gray-700 dark:text-white">
            <img
              className="w-full h-64 object-cover object-center"
              src={img4}
              alt="Plant Care"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold hover:bg-green-700">
                Plant Care & Maintenance
              </h3>
              <p className="text-black-700 mt-4 font-semibold ">
                1.Regular Watering
                <br />
                2.Pruning and Trimming
                <br />
                3.Fertilization
                <br />
                4.Seasonal Planting and Maintenance
              </p>
            </div>
          </div>

          {/* Service 2: Garden Setup */}
          <div className="bg-white rounded-lg   dark:bg-gray-700 dark:text-white shadow-lg overflow-hidden">
            <img
              className="w-full h-64 object-cover object-center"
              src={img3}
              alt="Garden Setup"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold hover:bg-green-700">
                Garden Setup & Design
              </h3>
              <p className="text-black-700 mt-4 font-semibold">
                1.Personalized Consultation
                <br />
                2.Creative Landscape Design
                <br />
                3.Custom Garden Features
                <br />
                4.Eco-Friendly and Sustainable
              </p>
            </div>
          </div>

          {/* Service 3: Lawn Care */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden  dark:bg-gray-700 dark:text-white  dark:border-white">
            <img
              className="w-full h-64 object-cover object-center"
              src={img2}
              alt="Lawn Care"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold hover:bg-green-700">
                Lawn Care & Treatment
              </h3>
              <p className="text-black-700 mt-4 font-semibold">
                1.Lawn Mowing
                <br />
                2.Lawn Aeration
                <br />
                3.Seasonal Treatments
                <br />
                4.Soil Testing and pH Balancing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-green-200   dark:bg-gray-700 dark:text-white text-white py-12 ">
        <div className=" mx-auto text-center ">
          <h2 className="text-3xl font-bold text-green-700 tracking-wide hover:bg-green-500 hover:text-white transition duration-300 ease-in-out inline-block px-4 py-2 rounded  dark:text-white">
            Ready to Transform Your Garden?
          </h2>
          <p className="mt-4 font-semibold text-black  dark:text-gray-400">
            Get in touch with us today for personalized gardening services that
            cater to all your needs.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-block bg-green-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 hover:text-white transition duration-300"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default ServicePage;