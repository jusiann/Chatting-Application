import "../style/MessageSent.css";
import { CheckCheck, Check, File } from "lucide-react";
import timeFormatter from "../controllers/TimeController";
import { useState } from "react";

function MessageSent({ message }) {
  let statusIcon = null;
  const [open, setOpen] = useState(false);

  if (message.status === "sent") {
    statusIcon = <Check className="message-sended-check" />;
  } else if (message.status === "delivered") {
    statusIcon = <CheckCheck className="message-sended-check" />;
  } else {
    statusIcon = <CheckCheck className="message-sended-check-read" />; // Varsayılan olarak hiçbir ikon gösterme
  }

  return (
    <div className="message-sended-container">
      <div className="message-sended">
        {message.content && (
          <p className="message-sended-text">{message.content}</p>
        )}
        {message.file_url && message.file_type.startsWith("image/") && (
          <img
            src={message.file_url}
            alt="Gönderilen Görsel"
            className="message-sended-image"
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
          <div className="message-sended-file">
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
                className="message-sended-file-icon"
                size={100}
                color="white"
              />
              {(() => {
                const index = message.file_key.lastIndexOf("_");
                if (index !== -1) {
                  message.file_key = message.file_key.substring(index + 1);
                }
                return (
                  <p
                    className="message-sended-file-name"
                    style={{ color: "white", textDecoration: "none" }}
                  >
                    {message.file_key}
                  </p>
                );
              })()}
            </a>
          </div>
        )}
        <div className="message-sended-meta">
          <span className="message-sended-time">
            {timeFormatter(message.created_at)}
          </span>
          {statusIcon}
        </div>
      </div>
    </div>
  );
}

export default MessageSent;
