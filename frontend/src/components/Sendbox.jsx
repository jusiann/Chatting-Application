import React, { useState, useEffect, useRef } from "react";
import "emoji-picker-element";
import "../style/sendbox.css";
import { SmilePlus, Paperclip, Send } from "lucide-react";
import useConservationStore from "../store/conservation";

const Sendbox = () => {
  const [message, setMessage] = useState({
    content: "",
    receiver_id: "",
  });
  const [showEmoji, setShowEmoji] = useState(false);
  const popRef = useRef(null);
  const pickerRef = useRef(null);

  const {
    sendMessage,
    messagingUser,
    chatUsersFetch,
    sendGroupMessage,
    messagingType,
    sendTyping,
    sendStopTyping,
  } = useConservationStore();

  const typingRef = useRef({ isTyping: false, timer: null });

  useEffect(() => {
    setMessage((prev) => ({
      ...prev,
      receiver_id: messagingUser?.id || "",
    }));
  }, [messagingUser]);

  useEffect(() => {
    const handler = (e) => {
      if (showEmoji && popRef.current && !popRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  useEffect(() => {
    if (!showEmoji) return;
    let cleanup;
    let rafId;

    const attach = () => {
      const picker = pickerRef.current;
      if (!picker) return;
      const onEmoji = (event) => {
        const value =
          event.detail?.unicode ||
          event.detail?.emoji?.unicode ||
          event.detail?.native ||
          event.detail?.unified;
        if (value) {
          setMessage((prev) => ({ ...prev, content: prev.content + value }));
        }
      };
      picker.addEventListener("emoji-click", onEmoji);
      cleanup = () => picker.removeEventListener("emoji-click", onEmoji);
    };

    if (!pickerRef.current) {
      rafId = requestAnimationFrame(attach);
    } else {
      attach();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (cleanup) cleanup();
    };
  }, [showEmoji]);

  const emitTyping = () => {
    if (!messagingUser) return;
    const payload =
      messagingType === "group"
        ? { groupId: messagingUser.id }
        : { receiver_id: messagingUser.id };
    if (!typingRef.current.isTyping) {
      typingRef.current.isTyping = true;
      sendTyping(payload);
    }
    if (typingRef.current.timer) clearTimeout(typingRef.current.timer);
    typingRef.current.timer = setTimeout(() => {
      typingRef.current.isTyping = false;
      sendStopTyping(payload);
    }, 1200);
  };

  const handleChange = (e) => {
    setMessage({ ...message, [e.target.name]: e.target.value });
    emitTyping();
  };
  const handleSend = () => {
    if (message.content.trim() && message.receiver_id) {
      if (messagingType === "individual") {
        sendMessage(message);
        console.log("Mesaj gönderildi:", message);
        setMessage({ ...message, content: "" }); // Mesaj kutusunu temizle
        setShowEmoji(false);
        sendStopTyping({ receiver_id: messagingUser.id });
      } else if (messagingType === "group") {
        const groupId = messagingUser.id;
        const content = message.content;
        sendGroupMessage(groupId, content);
        console.log("Grup mesajı gönderildi:", message);
        setMessage({ ...message, content: "" }); // Mesaj kutusunu temizle
        setShowEmoji(false);
        if (typingRef.current.isTyping) {
          typingRef.current.isTyping = false;
          sendStopTyping({ groupId });
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sendbox-wrapper">
      <div className="sendbox-container">
        <div className="sendbox-icon" onClick={() => setShowEmoji((v) => !v)}>
          <SmilePlus size={24} />
        </div>

        {showEmoji && (
          <div className="emoji-popover" ref={popRef}>
            <emoji-picker ref={pickerRef} class="emoji-picker"></emoji-picker>
          </div>
        )}

        <input
          type="text"
          placeholder="Mesaj"
          className="sendbox-input"
          name="content"
          value={message.content}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          onBlur={() => {
            if (!messagingUser) return;
            const payload =
              messagingType === "group"
                ? { groupId: messagingUser.id }
                : { receiver_id: messagingUser.id };
            if (typingRef.current.isTyping) {
              typingRef.current.isTyping = false;
              sendStopTyping(payload);
            }
          }}
        />

        <div className="sendbox-attachment">
          <Paperclip size={24} />
        </div>

        <div className="sendbox-send" onClick={handleSend}>
          <Send size={24} />
        </div>
      </div>
    </div>
  );
};

export default Sendbox;
