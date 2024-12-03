import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [user, setUser] = useState("");

  const backendUrl = "http://localhost:3000";

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const name = params.get("name");
    const room = params.get("room");

    setUser(name);
    setRoom(room);

    socket = io(backendUrl);
    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
        window.location = "/";
      }
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [backendUrl]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();

    if (message.trim()) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="chat-container">
      <h1>Room: {room}</h1>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user === "admin" ? "admin" : ""}`}
          >
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
