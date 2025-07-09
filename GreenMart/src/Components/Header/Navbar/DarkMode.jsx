import React from "react";
import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa";

const DarkMode = () => {
  const [theme, setTheme] = React.useState(
    localStorage.getItem("theme") || "light"
  );

  const element = document.documentElement;

  React.useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="relative flex items-center justify-center ">
      {theme === "light" ? (
        <FaMoon
          onClick={toggleTheme}
          className="text-3xl text-green-800 cursor-pointer transition-all duration-300  hover:text-gray-800"
        />
      ) : (
        <MdSunny
          onClick={toggleTheme}
          className="text-3xl cursor-pointer transition-all duration-300 text-white "
        />
      )}
    </div>
  );
};

export default DarkMode;