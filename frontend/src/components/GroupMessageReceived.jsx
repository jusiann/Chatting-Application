import "../style/GroupMessageReceived.css";
import timeFormatter from "../controllers/TimeController";
import useConservationStore from "../store/Conservation";
import { File } from "lucide-react";
import { useState } from "react";

function GroupMessageReceived({ message }) {
  const { contactUsers } = useConservationStore();
  const [open, setOpen] = useState(false);

  const findSenderName = (message) => {
    const sender = contactUsers.find((user) => user.id === message.sender_id);
    return sender ? `${sender.first_name} ${sender.last_name}` : "Unknown";
  };
  return (
    <div className="group-message-received-container">
      <div className="group-message-received">
        <h3>{findSenderName(message)}</h3>
        {message.content && (
          <p className="group-message-received-text">{message.content}</p>
        )}
        {message.file_url && message.file_type.startsWith("image/") && (
          <img
            src={message.file_url}
            alt="Alınan Görsel"
            className="group-message-received-image"
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
          <div className="group-message-received-file">
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
                className="group-message-received-file-icon"
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
                    className="group-message-received-file-name"
                    style={{ color: "#910811", textDecoration: "none" }}
                  >
                    {message.file_key}
                  </p>
                );
              })()}
            </a>
          </div>
        )}
        <span className="group-message-received-time">
          {timeFormatter(message.created_at)}
        </span>
      </div>
    </div>
  );
}

export default GroupMessageReceived;
