import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I help you?" }]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await axios.post("http://localhost:3002/chatbot", { message: input });
      setMessages([...newMessages, { sender: "bot", text: res.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { sender: "bot", text: "Error! Try again." }]);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "bot" ? "bot-message" : "user-message"}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
