import React from "react";
import { useNavigate } from "react-router-dom";
import image1logo from "../../../assets/image1.jpg"; 
import image2logo from "../../../assets/image2.jpg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
//import "./Hero.css";

const Hero = () => {
const settings = {
  dots: false,
  arrows: false,
  infinite: true,
  speed: 800,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  cssEase: "ease-in-out",
  pauseOnHover: false,
  pauseOnFocus: true,
};

const Imagelist = [
  {
    id: 1,
    img: image1logo,
    title: "Go green",
    description: "Plant trees and protect the environment.",
  },
  {
    id: 2,
    img: image2logo,
    title: "Save the planet",
    description: "Reduce waste and save natural resources.",
  },
];


  const navigate=useNavigate();
  
  const handleOrderClick = () => {
   
    navigate("/topproducts");

  }

  return (
    <div className="relative overflow-hidden min-h-[550px] sm:min-h-[650px] bg-gray-100 flex justify-center items-center dark:bg-gray-950 dark:text-white duration-200 ">
     
      <div className="h-[700px] w-[700px] bg-primary/40 absolute -top-1/2 right-0 rounded-3xl rotate-45 -z[8]"></div>
   
      <div className="container pb-8 sm:pb-0">
        <Slider {...settings}>
          {Imagelist.map((data) => (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
               
                <div className="flex flex-col justify-center gap-4 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1 relative z-10 ">
                  <h1
                    data-aos="zoom-out"
                    data-aos-duration="500"
                    data-aos-once="true"
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold"
                  >
                    {data.title}
                  </h1>
                  <p
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay="100"
                    className="text-sm"
                  >
                    {data.description}
                  </p>
                  <div
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay="300"
                  >
                    <button
                      onClick={handleOrderClick}
                      className="bg-gradient-to-r from-primary to-secondary hover:scale-105 duration-200 text-white py-2 px-4 rounded-full"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
            
                <div className="order-1 sm:order-2">
                  <div
                    data-aos="zoom-in"
                    data-aos-once="true"
                    className="relative z-10 mt-[120px]"
                  >
                    <img 
                      src={data.img}
                      alt=""
                      className=" mb-12 w-[300px] h-[300px] sm:h-[450px] sm:w-[450px] sm:scale-105 lg:scale-120 object-contain mx-auto opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Hero;
