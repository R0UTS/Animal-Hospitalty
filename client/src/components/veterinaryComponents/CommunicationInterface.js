import React, { useState } from 'react';
import './CommunicationInterface.css'; // Create this CSS file

function CommunicationInterface() {
    const [messages, setMessages] = useState([
        { sender: "Farmer", text: "Need help with my cow!" },
        { sender: "Vet", text: "On my way." },
        // Add more static messages
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            setMessages([...messages, { sender: "Vet", text: newMessage }]);
            setNewMessage("");
        }
    };

    return (
        <section className="communication-interface">
            <h2>Communication</h2>
            <div className="message-list">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender.toLowerCase()}`}>
                        <p><strong>{message.sender}:</strong> {message.text}</p>
                    </div>
                ))}
            </div>
            <div className="message-input">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </section>
    );
}

export default CommunicationInterface;