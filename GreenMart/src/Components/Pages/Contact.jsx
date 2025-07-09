import React, { useRef } from "react"; // Import useRef
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import bgimg from '../../assets/image10.jpg';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef(); // Initialize useRef

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_eh955vb', 'template_wr0tdi5', form.current, {
        publicKey: '_1ePY0MyaNxcfagkQ',
      })
      .then(
        () => {
          console.log('SUCCESS!');
          alert('Message sent successfully');
          window.location.reload(); // Reload the page
        },
        (error) => {
          console.log('FAILED...', error.text);
        }
      );
  };

  return (
    <div className="min-h-screen bg-gray-100  dark:bg-gray-950 ">
      {/* Hero Section */}
      <div className="relative w-full h-[500px] ">
        <img
          src={bgimg}
          alt="Background"
          className="w-full h-[500px] object-cover object-top"
        />
        <div className="absolute inset-0 bg-primary-dark bg-opacity-60 flex items-center justify-center">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold ">Contact Us</h1>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container space-y-12 py-12 px-4  dark:bg-gray-950 sm:px-8 md:px-16 lg:px-24">
        {/* Form and Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white shadow-lg  dark:bg-gray-600 rounded-lg p-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4  dark:text-gray-100">Send Us a Message</h2>
            <form ref={form} onSubmit={sendEmail} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm sm:text-base font-medium  dark:text-gray-100">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="user_name"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md  dark:text-gray-100"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm   sm:text-base font-medium dark:text-gray-100">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="user_email"
                  className="mt-1 block w-full p-3 border  text-gray-100 border-gray-300 rounded-md"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block dark:text-gray-100 text-sm sm:text-base font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="user_phone"
                  className="mt-1 block w-full p-3 border  border-gray-300 rounded-md dark:text-gray-100"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm sm:text-base font-medium  dark:text-gray-100">
                  Comments
                </label>
                <textarea
                  id="message"
                  name="user_message"
                  rows="4"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
                  placeholder="Write your message"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-dark dark:text-white"
              >
                SEND MESSAGE
              </button>
            </form>
          </div>

          {/* Contact Information */}
          
          <div className="bg-green-100  dark:bg-gray-600 dark:text-gray-100 rounded-lg p-8 shadow-lg">
  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
    Contact Information
  </h2>
  <div className="space-y-6">
    {/* Address */}
    <div className="text-center">
      <h3 className="font-bold text-xl">Address:</h3>
      <p className="text-lg">123 Green Street, Garden City, XY 56789</p>
    </div>
    {/* Phone */}
    <div className="text-center">
      <h3 className="font-bold text-xl">Phone:</h3>
      <p className="text-lg">+1 (123) 456-7890</p>
    </div>
    {/* Email */}
    <div className="text-center">
      <h3 className="font-bold text-xl">Email:</h3>
      <p className="text-lg">contact@company.com</p>
    </div>
    {/* Social Media */}
    <div className="text-center">
      <h3 className="font-bold text-xl mb-4 dark:text-gray-100">Follow Us:</h3>
      <div className="flex justify-center space-x-6 text-3xl">
        <a target="_blank"
          href="https://facebook.com/"
          className="text-black hover:text-blue-300 dark:text-gray-100 transition duration-300"
        >
          <FaFacebook />
        </a>
        <a target="_blank"
          href="https://twitter.com/"
          className="text-black hover:text-blue-300 dark:text-gray-100 transition duration-300"
        >
          <FaTwitter />
        </a>
        <a target="_blank"
          href="https://instagram.com/"
          className="text-black hover:text-blue-300 dark:text-gray-100 transition duration-300"
        >
          <FaInstagram />
        </a>
        <a target="_blank"
          href="https://www.linkedin.com/in/ashwini-mahajan-a8a73629a"
          className="text-black hover:text-blue-300 dark:text-gray-100 transition duration-300"
        >
          <FaLinkedin />
        </a>
      </div>
    </div>
  </div>
</div>
</div>

        {/* Inquiry Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-green-200 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg">Bulk/Corporate Enquiry</h3>
            <p>Contact: corporate@company.com</p>
            <p>Phone: +1 (123) 456-7890</p>
          </div>
          <div className="bg-green-200 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg">Gardening Services</h3>
            <p>Contact: gardening@company.com</p>
            <p>Phone: +1 (123) 456-7891</p>
          </div>
          <div className="bg-green-200 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg">Franchise Enquiry</h3>
            <p>Contact: franchise@company.com</p>
            <p>Phone: +1 (123) 456-7892</p>
          </div>
        </div>

        {/* Embedded Google Map */}
        <div className="w-full h-72 mt-8">
          <iframe
            className="w-full h-full border-0"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345091245!2d144.9556516159258!3d-37.81732697975139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce6e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sin!4v1645083159276!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;