import React, { useEffect, useState } from "react";

const GoogleTranslator = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Define the Google Translate callback function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,ta,te,bn,pa,fr,es,zh",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
        setIsScriptLoaded(true); // Set script as loaded
      }
    };

    // Check if the script is already added
    if (!document.querySelector("script[src*='translate']")) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onload = () => {
        console.log("Google Translate script loaded.");
        window.googleTranslateElementInit(); // Initialize when script is ready
      };
      document.body.appendChild(script);
    } else {
      // If script already exists, initialize immediately
      if (window.google && window.google.translate) {
        window.googleTranslateElementInit();
      }
    }
  }, []);

  return (
    <div>
      <div id="google_translate_element"></div>
      {!isScriptLoaded && <p className="text-gray-500 text-sm">Loading translator...</p>}
    </div>
  );
};

export default GoogleTranslator;
