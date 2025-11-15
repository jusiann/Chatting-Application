import React, { useState, useEffect, useRef } from "react";
import "emoji-picker-element";
import "../style/SendBox.css";
import { SmilePlus, Paperclip, Send, Image, File, Camera } from "lucide-react";
import useConservationStore from "../store/Conservation";
import useFileStore from "../store/File";

const SendBox = () => {
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

  const [open, setOpen] = useState(false);
  const { file, setFile } = useFileStore();
  const fileInputRef = useRef(null);

  const typingRef = useRef({ isTyping: false, timer: null });
  const menuRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "text/plain",
  ];

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
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert("Dosya boyutu 5MB'dan büyük olamaz.");
        e.target.value = null;
        return;
      }
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        alert("Bu dosya türüne izin verilmiyor!");
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setOpen(false);
      console.log("Seçilen dosya:", useFileStore.getState().file);
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

        <div className="sendbox-attachment" ref={menuRef}>
          <button onClick={() => setOpen((prev) => !prev)}>
            <Paperclip size={24} />
          </button>

          <div className={`attachment-menu ${open ? "open" : ""}`}>
            <button className="menu-item" onClick={handleFileClick}>
              <File /> Dosya
            </button>
            <input
              type="file"
              accept="image/png, image/jpeg, application/pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="sendbox-send" onClick={handleSend}>
          <Send size={24} />
        </div>
      </div>
    </div>
  );
};

export default SendBox;
