import React, { useEffect, useState } from 'react';
import useConservationStore from '../store/Conservation';
import useSocketStore from '../store/Socket';

const ChatComponent = () => {
  const { 
    messages, 
    sendMessage, 
    initializeSocket, 
    joinSocketRoom,
    disconnectSocket,
    sendTyping 
  } = useConservationStore();
  
  const { isConnected } = useSocketStore();
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Socket bağlantısını başlat
    initializeSocket('http://13.60.211.144'); // Server URL'inizi buraya yazın
    
    // Kullanıcıyı socket odasına dahil et
    const userId = 'current-user-id'; // Bu değeri gerçek user ID ile değiştirin
    joinSocketRoom(userId);

    // Component unmount olduğunda socket bağlantısını kes
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        text: newMessage,
        receiverId: 'receiver-user-id', // Alıcı user ID
        senderId: 'current-user-id', // Gönderen user ID
        timestamp: new Date()
      };
      
      sendMessage(messageData);
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    sendTyping({
      userId: 'current-user-id',
      isTyping: true
    });
  };

  return (
    <div>
      <div>
        Socket Durumu: {isConnected ? 'Bağlı ✅' : 'Bağlı Değil ❌'}
      </div>
      
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            {message.text}
          </div>
        ))}
      </div>
      
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleTyping}
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        placeholder="Mesaj yazın..."
      />
      
      <button onClick={handleSendMessage}>Gönder</button>
    </div>
  );
};

export default ChatComponent;
