import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (name.trim() && room.trim()) {
      navigate(`/chat?name=${name}&room=${room}`);
    } else {
      alert("Please enter both a name and a room.");
    }
  };

  return (
    <div className="join-container">
      <h1>Join Room</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
};

export default Login;
