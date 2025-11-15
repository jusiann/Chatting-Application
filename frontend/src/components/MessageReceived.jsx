import "../style/MessageReceived.css";
import timeFormatter from "../controllers/TimeController";
import { useState } from "react";
import { File } from "lucide-react";

function MessageReceived({ message }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="message-received-container">
      <div className="message-received">
        {message.content && (
          <p className="message-received-text">{message.content}</p>
        )}
        {message.file_url && message.file_type.startsWith("image/") && (
          <img
            src={message.file_url}
            alt="Alınan Görsel"
            className="message-received-image"
            onClick={() => setOpen(true)}
            style={{ cursor: "pointer" }}
          />
        )}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <img
              src={message.file_url}
              alt="Büyük Görsel"
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          </div>
        )}
        {message.file_url && message.file_type.startsWith("application/") && (
          <div className="message-received-file">
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <File
                className="message-received-file-icon"
                size={100}
                color="#910811"
              />
              {(() => {
                const index = message.file_key.lastIndexOf("_");
                if (index !== -1) {
                  message.file_key = message.file_key.substring(index + 1);
                }
                return (
                  <p
                    className="message-received-file-name"
                    style={{ color: "#910811", textDecoration: "none" }}
                  >
                    {message.file_key}
                  </p>
                );
              })()}
            </a>
          </div>
        )}
        <span className="message-received-time">
          {timeFormatter(message.created_at)}
        </span>
      </div>
    </div>
  );
}

export default MessageReceived;
