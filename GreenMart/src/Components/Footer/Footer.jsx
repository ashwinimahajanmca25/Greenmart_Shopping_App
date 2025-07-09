import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaGithub, FaInstagram, FaTwitter, FaTwitch } from "react-icons/fa";

// Footer Sections Data
const sections = [
  { title: "Company", items: [{ name: "About Us", path: "/about" }, { name: "Contact", path: "/contact" }, { name: "Blogs", path: "/blogs" }] },
  { title: "Services", items: [{ name: "Shipping", path: "/shipping" }, { name: "Feedbacks", path: "/feedbacks" }, { name: "FAQs", path: "/faq" }] },
  { title: "Legal", items: [{ name: "Return Policy", path: "/returns" }, { name: "Privacy & Policy", path: "/terms-policy" }, { name: "Terms & Conditions", path: "/terms-policy" }] },
];

// Social Media Links
const socialItems = [
  { name: "Facebook", icon: FaFacebook, link: "https://facebook.com/" },
  { name: "Instagram", icon: FaInstagram, link: "https://instagram.com/" },
  { name: "Twitter", icon: FaTwitter, link: "https://twitter.com/" },
  { name: "Twitch", icon: FaTwitch, link: "https://twitch.com/" },
  { name: "Github", icon: FaGithub, link: "https://github.com/" },
];

const Footer = () => (
  <footer className="w-full relative bg-green-900 dark:bg-gray-800 text-white pb-5">
    {/* Background Image & Overlay */}
    <div className="w-full h-full bg-cover bg-center relative" style={{ backgroundImage: "url('/f1.jpg')" }}>
      {/* Green Transparent Overlay */}
      <div className="absolute inset-0 bg-green-900 opacity-55"></div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto sm:px-12 py-2">
        <div className="text-2xl flex -ml-16 justify-center md:justify-start font-bold gap-2 mb-6">
          <img src="/titleLogo.png" alt="Logo" className="w-8 h-6 md:h-14 md:w-14 object-cover" />
          <span className="text-lg md:text-2xl text-white">GreenMart</span>
        </div>

        {/* Footer Sections */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-8 relative">
          {sections.map((section, index) => (
            <div key={index}>
              <h6 className="text-2xl font-bold mb-3">{section.title}</h6>
              <ul className="text-lg">
                {section.items.map((item, i) => (
                  <li key={i} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                    <Link to={item.path}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscription Section */}
          <div className="col-span-2 md:col-span-2">
            <h6 className="text-lg font-bold mb-2">Subscribe to our Company</h6>
            <p className="text-sm text-gray-300 mb-3">
              Get the latest updates, articles, and resources directly to your inbox.
            </p>
            <form className="flex flex-col gap-2">
              <input type="email" placeholder="Enter email address" className="p-2 rounded-md border border-gray-500 bg-gray-800 text-white w-full" />
              <button type="submit" className="bg-green-600 hover:bg-green-700 dark:bg-green-800 text-white rounded-md px-4 py-2 w-full">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="w-full bg-green-950 text-white text-center py-4 mt-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        <p className="text-sm">© 2025 GreenMart. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          {socialItems.map((item, index) => (
            <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-xl transition-colors">
              <item.icon />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
