import React, { useState, useContext, useEffect, useRef } from "react";
import img from "../assets/bot_icon.gif";
import SendIcon from "../assets/send.png";
import AccountIcon from "../assets/account.svg";
import { useNavigate } from "react-router-dom";
import pdficon from '../assets/pdficon.png';

import GroupContext from "../contexts/GroupContext";
import LoginContext from "../contexts/LoginContext";

import { io } from "socket.io-client";
const socket = io("https://guided-backend-1.onrender.com", {
  path: "/socket.io",
  autoConnect: false,
});

const ChatUser = ({ username, message, onCopyMessage }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="chat chat-end chat-user"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCopyMessage(message)}
      style={{ cursor: "pointer" }}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={AccountIcon} alt="User Avatar" />
        </div>
      </div>
      <div className="chat-header">{username}</div>
      <div className="chat-bubble">{message}</div>
      {isHovered && <FloatingIconOption message={message} />}
    </div>
  );
};

const ChatOther = ({ username, message, onCopyMessage }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="chat chat-start chat-other"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCopyMessage(message)}
      style={{ cursor: "pointer" }}
    >
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={AccountIcon} alt="User Avatar" />
        </div>
      </div>
      <div className="chat-header">{username}</div>
      <div className="chat-bubble">{message}</div>
      {isHovered && <FloatingIconOption message={message} />}
    </div>
  );
};

const FloatingIconOption = ({ message }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = () => {
    navigate("/ai", { state: { message } });
  };

  return (
    <div
      className="floating-icon"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSubmit}
    >
      <img
        src={img}
        alt="Icon"
        className={`w-24 h-24 ${isHovered ? "hover:opacity-80" : ""}`}
      />
    </div>
  );
};

const SendMessageBox = ({ setIsChatsUpdated, channelId }) => {
  const navigate = useNavigate();
  const { activeGroupId } = useContext(GroupContext);
  const { userId } = useContext(LoginContext);
  const [sendButtonClicked, setIsSendButtonClicked] = useState(false);
  const inputRef = useRef(null);
  const [lastMessageTime, setLastMessageTime] = useState(null);

  const handleButtonOnClick = () => {
    if (!inputRef.current.value || sendButtonClicked) return;

    setIsSendButtonClicked(true);
    const message = inputRef.current.value;
    const currentTime = Date.now();
    setLastMessageTime(currentTime);
    socket.emit(
      "chat",
      {
        message,
        group: activeGroupId,
        channel: channelId,
        sender: userId,
      },
      (data) => {
        if (data.status === "error") {
          alert("Error Sending Message");
          return;
        } else {
          inputRef.current.value = "";
          setIsChatsUpdated((prev) => !prev);
        }
        setIsSendButtonClicked(false);
      }
    );
  };

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.key === "Enter") {
        handleButtonOnClick();
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (lastMessageTime && currentTime - lastMessageTime >= 30000) {
        navigate("/ai");
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [lastMessageTime]);

  return (
    <div className="sendMessageBox mt-auto w-[100%] flex border border-secondary-content bg-base-100">
      <input
        type="text"
        placeholder="Type here"
        className="input w-full"
        ref={inputRef}
      />
      <button className="h-12 w-12 border-l" onClick={handleButtonOnClick}>
        <img src={SendIcon} className="h-[50%] w-[50%] m-auto" alt="sendicon" />
      </button>
      {/* Button to navigate to Python application */}
      <button
        onClick={() => window.location.href = 'http://localhost:8501/'}
        className="h-12 w-12 border-l"
      >
        <img
          src={pdficon}
          alt="PDF Icon"
          className="w-full h-full"
        />
      </button>
    </div>
  );
};

const ChatBox = ({ channelId }) => {
  const { activeGroupId } = useContext(GroupContext);
  const { userId } = useContext(LoginContext);
  const [chats, setChats] = useState([]);
  const [isChatsUpdated, setIsChatsUpdated] = useState(true);
  const chatContainer = useRef(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
  }, [chats]);

  const getAllChats = async () => {
    if (!activeGroupId) return;
    const res = await fetch(
      "https://guided-backend-1.onrender.com/api/group/getAllChats/" + activeGroupId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "true",
        },
        credentials: "include",
      }
    );
    const data = await res.json();
    if (data.status === "ok") {
      setChats(data.chats);
    } else {
      alert("Error Fetching Chats");
    }
  };

  useEffect(() => {
    getAllChats();
  }, [isChatsUpdated, activeGroupId]);

  useEffect(() => {
    function onChat(data) {
      if (data.group === activeGroupId) {
        setIsChatsUpdated((prev) => !prev);
      }
    }
    socket.connect();
    socket.on("chat", onChat);

    return () => {
      socket.off("chat", onChat);
      socket.disconnect();
    };
  }, [activeGroupId]);

  const handleCopyMessage = (message) => {
    navigator.clipboard.writeText(message);
  };

  const openAiModal = () => {
    setIsAiModalOpen(true);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
  };

  return (
    <section className="w-full flex flex-col bg-base-100">
      <div className="w-[100%] h-full flex-1 border border-gray-500 border-solid flex flex-col justify-end">
        <div ref={chatContainer} className="h-full p-8 overflow-y-auto">
          {chats &&
            chats.map((chat, index) =>
              chat.sender === userId ? (
                <ChatUser
                  key={index}
                  username={chat.senderName}
                  message={chat.message}
                  onCopyMessage={handleCopyMessage}
                />
              ) : (
                <ChatOther
                  key={index}
                  username={chat.senderName}
                  message={chat.message}
                  onCopyMessage={handleCopyMessage}
                />
              )
            )}
          {chats.length === 0 && (
            <p className="text-2xl text-center font-bold text-secondary">
              No Chat
            </p>
          )}
        </div>
      </div>
      <SendMessageBox
        setIsChatsUpdated={setIsChatsUpdated}
        channelId={channelId}
      />

      {/* AI modal */}
      <AiModal isOpen={isAiModalOpen} onClose={closeAiModal} />
      {/* Button to open AI modal */}
      <button onClick={openAiModal}>Open AI</button>
    </section>
  );
};

const AiModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <Ai />
      </div>
    </div>
  );
};

export default ChatBox;
