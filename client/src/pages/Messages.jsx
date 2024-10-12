import { React, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    CustomButton,
    FriendsCard,
    Loading,
    PostCard,
    ProfileCard,
    TopBar,
} from "../components";
import { useState } from 'react';
import { conversation } from '../assets/messages';
import { BsArrowDownCircleFill } from 'react-icons/bs';

const MessagePage = () => {
    const { id } = useParams();
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const selectedConversation = conversation.find(conv => conv.id === selectedConversationId);
    const handleConversationClick = (conversationId) => {
        setSelectedConversationId(conversationId);
    };

    const [showScrollButton, setShowScrollButton] = useState(false);
    const messageContainerRef = useRef(null); // Tham chiếu đến thẻ div cha

    const messageContainer = messageContainerRef.current;
    console.log(messageContainer);


  return (
    <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar />

        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
            {/*Danh sách cuộc trò chuyện */}
            <div className="w-1/4 h-[90%] bg-primary shadow-sm rounded-lg px-5 py-5 mb-3 mt-3 overflow-y-auto"> 
                {conversation.length > 0 && conversation.map((conv) => (
                    <div
                        key={conv.id} 
                        onClick={() => handleConversationClick(conv.id)}
                        className="flex items-center text-ascent-1 mb-7 hover:sky cursor-pointer"
                    >
                        <img src={conv.avatar} alt={conv.name} className="w-8 h-8 rounded-full mr-2" />
                        <span>{conv.name}</span>
                    </div>
                ))}
            </div>

            {/* Chat */}
            <div className="w-3/4 cols-1 h-[90%] bg-primary shadow-sm rounded-lg px-5 py-5 mb-3 mt-3">
                {selectedConversation && (
                    <div className="flex flex-col h-full relative">
                        <div className="flex-grow overflow-y-auto" ref={messageContainerRef}>
                            {/* Nội dung */}
                            {selectedConversation.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.userId === id ? 'justify-end' : 'justify-start'} mb-4 text-ascent-1`}
                                >
                                    <p className={`p-2 rounded-lg ${message.userId === id ? 'bg-blue' : 'bg-gray'} text-white`}>
                                        {message.content}
                                    </p>
                                </div>
                            ))} 
                        </div>

                        {showScrollButton && (
                            <button
                                
                                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray text-white rounded-full p-2 flex items-center justify-center"
                            >
                                <BsArrowDownCircleFill className="text-ascent-1" />
                            </button>
                        )}

                        {/* ChatBar */}
                        <div className="flex items-center gap-4 bg-primary p-4">
                            <input 
                                type="text" 
                                placeholder="Nhập tin nhắn..." 
                                className="flex-grow px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            
                            <button className="bg-blue hover:bg-sky text-white font-bold py-2 px-4 rounded-lg">
                                Gửi
                            </button>
                        </div>
                    </div>
                )}
                </div>

        </div>
    </div>

  );
};

export default MessagePage;
