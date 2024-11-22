import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { BsArrowDownCircleFill } from 'react-icons/bs';
import { IoMdArrowRoundBack } from "react-icons/io";
import axiosInstance from '../api/axiosConfig';
import socket from '../api/socket';
import { NoProfile } from '../assets';
import { FaPaperclip } from 'react-icons/fa6';
import { formatDate } from '../utils/formatDate';

const MessagePage = () => {
    const { handleSubmit, register, reset, setValue } = useForm({ mode: "onChange" });
    const { id } = useParams();
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [userConversations, setUserConversations] = useState([]);
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [friendUnreadCounts, setFriendUnreadCounts] = useState({});
    const [previewImages, setPreviewImages] = useState([]);


    const selectedConversation = conversations.find(conv => conv._id === selectedConversationId);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const navigate = useNavigate();
    const messageContainerRef = useRef(null);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axiosInstance.get(`/chat/friends/${id}`);
                setFriends(response.data.friends);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };
        fetchFriends();
    }, [id]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axiosInstance.get(`/chat/conversations/${id}`);
                setConversations(response.data.conversations);
                const userConversations = response.data.conversations.filter(conv => conv.recipients.includes(id));
                setUserConversations(userConversations);

                const unreadCount = {};
                response.data.conversations.forEach(conv => {
                    unreadCount[conv._id] = conv.messages.filter(msg => !msg.seen && msg.sender._id !== id).length;
                });
                setUnreadCounts(unreadCount);

                const friendUnread = {};
                response.data.conversations.forEach(conv => {
                    const unreadMessages = conv.messages.filter(msg => !msg.seen && msg.sender._id !== id).length;
                    const friendId = conv.recipients.find(recipient => recipient !== id);

                    if (friendId) {
                        friendUnread[friendId] = (friendUnread[friendId] || 0) + unreadMessages;
                    }
                });
                setFriendUnreadCounts(friendUnread);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();
    }, [id]);

    useEffect(() => {
        socket.on('getMessage', (message) => {
            if (message.conversationId === selectedConversationId) {
                setMessages(prev => [...prev, message]);
            }

            if (message.sender._id !== id) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.conversationId]: (prev[message.conversationId] || 0) + 1
                }));
                setFriendUnreadCounts(prev => ({
                    ...prev,
                    [message.sender._id]: (prev[message.sender._id] || 0) + 1
                }));
            }
        });
    }, [selectedConversationId, id]);

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
        setShowScrollButton(scrollTop + clientHeight < scrollHeight);
    };

    useEffect(() => {
        if (selectedConversationId) {
            messageContainerRef.current.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (messageContainerRef.current) {
                messageContainerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [selectedConversationId]);

    const scrollToBottom = () => {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    };

    useEffect(() => {
        if (selectedConversationId) {
            scrollToBottom();
        }
    }, [selectedConversationId, messages]);

    useEffect(() => {
        setShowScrollButton(false);
    }, [selectedConversationId]);


    const markMessagesAsSeen = async (conversationId, friendId) => {
        try {
            await axiosInstance.patch(`/chat/${conversationId}/seen`, { userId: id });
            setUnreadCounts(prev => ({ ...prev, [conversationId]: 0 }));
            setFriendUnreadCounts(prev => ({ ...prev, [friendId]: 0 }));
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    };

    const handleImagePreview = (event) => {
        const files = Array.from(event.target.files);
        const previewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...previewUrls]);
        setValue('media', files);
    };

    const handleFriendClick = async (friendId) => {
        let existingConversation = conversations.find(conv =>
            conv.recipients.includes(friendId) && conv.recipients.includes(id)
        );

        if (existingConversation) {
            setSelectedConversationId(existingConversation._id);
            setMessages(existingConversation.messages);
            markMessagesAsSeen(existingConversation._id, friendId);
        } else {
            try {

                const response = await axiosInstance.post('/chat/conversation', {
                    senderId: id,
                    friendId,
                });

                const newConversation = response.data.conversation;


                setSelectedConversationId(newConversation._id);
                setMessages(newConversation.messages);
                setUserConversations(prev => [...prev, newConversation]);
                setConversations(prev => [...prev, newConversation]);

            } catch (error) {
                console.error('Error creating conversation:', error);
            }
        }
    };


    const handleConversationClick = (conversationId) => {
        setSelectedConversationId(conversationId);
        const selected = conversations.find(conv => conv._id === conversationId);
        setMessages(selected.messages);
        markMessagesAsSeen(conversationId);
        const friendId = selected.recipients.find(recipient => recipient !== id);
        markMessagesAsSeen(conversationId, friendId);
    }

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('conversationId', selectedConversationId);
        formData.append('senderId', id);
        formData.append('recipientId', selectedConversation.recipients.find(recipient => recipient !== id));
        formData.append('text', data.message);

        if (data.media.length > 0) {
            for (let i = 0; i < data.media.length; i++) {
                formData.append('media', data.media[i]);
            }
        }

        try {
            const response = await axiosInstance.post('/chat/message', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // console.log('Message sent.', response.data.message);
            setMessages(prev => [...prev, response.data.message]);
            const updatedUserConversations = [...userConversations, response.data.conversation];
            const updatedConversations = [...conversations, response.data.conversation];
            setUserConversations(updatedUserConversations);
            setConversations(updatedConversations);
            // setConversations(prev => prev.map(conv => conv._id === selectedConversationId ? updatedConversation : conv));
            socket.emit('sendMessage', response.data.message);
            reset();
            setPreviewImages([]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
            <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
                <div className="w-1/4 h-full bg-primary shadow-sm rounded-lg px-5 py-5 mb-3 mt-3 overflow-y-auto">
                    <div className='flex items-center mt-3 mb-3 text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                        <button onClick={() => navigate('/')} className="mb-4 mt-4 mr-3 text-blue">
                            <IoMdArrowRoundBack className="text-ascent-1" />
                        </button>
                        <span>Tin nhắn</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className='mb-3'>
                            <h2 className='text-lg text-ascent-2'>Danh sách bạn bè</h2>
                            {friends.length > 0 && friends.map(friend => (
                                <div
                                    key={friend?._id}
                                    onClick={() => handleFriendClick(friend?._id)}
                                    className="flex items-center text-ascent-1 mb-7 hover:sky cursor-pointer"
                                >
                                    <img src={friend?.avatar ?? NoProfile} alt={friend?.firstName} className="w-8 h-8 rounded-full mr-2" />
                                    <span>{friend?.firstName} {friend?.lastName}</span>
                                    <span className='text-sm text-white'>
                                        {friendUnreadCounts[friend._id] > 0 && <span className='text-sm ml-5 text-red'>{friendUnreadCounts[friend._id]}</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className='mt-5'>
                            <h2 className='text-lg text-ascent-2'>Các cuộc trò chuyện</h2>
                            {userConversations.length > 0 && userConversations.map(conversation => (
                                <div
                                    key={conversation?._id}
                                    onClick={() => handleConversationClick(conversation?._id)}
                                    className="flex flex-col mb-7 cursor-pointer hover:sky text-ascent-1"
                                >
                                    {/* <img src={conversation?.avatar} alt={conversation?.name} className="w-8 h-8 rounded-full mr-2" /> */}

                                    <span className="font-semibold">{conversation?.name}</span>
                                    <span className="text-sm text-ascent-2 truncate">{conversation?.lastMessage}</span>
                                    <span className='text-sm text-red'>
                                        {unreadCounts[conversation._id] > 0 && <span className="badge">{unreadCounts[conversation._id]}</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-3/4 h-full bg-primary shadow-sm rounded-lg px-5 py-5 mb-3 mt-3">
                    {selectedConversation && (
                        <div className="flex flex-col h-full relative">
                            <div className="flex items-center mb-8 gap-4 bg-primary p-4">
                                {/* <img src={selectedConversation.avatar === '' ? NoProfile : selectedConversation.avatar} alt={selectedConversation.name} className="w-10 h-10 rounded-full" /> */}
                                <span className="font-medium text-ascent-1 text-lg">{selectedConversation.name}</span>
                            </div>
                            <div className="flex-grow overflow-y-auto" ref={messageContainerRef}>
                                {messages.map((message, index) => (
                                    <div key={index} className={`flex ${message.sender._id === id ? 'justify-end' : 'justify-start'} mb-4 text-ascent-1`}>
                                        <p className={`p-2 rounded-lg ${message.sender._id === id ? 'bg-blue' : 'bg-gray'} text-white`}>
                                            {message.text}
                                            {message?.media && message.media.map((mediaUrl, idx) => (
                                                <div key={idx}>
                                                    {mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                        <img src={mediaUrl} alt="media" className="mt-2 max-w-xs" />
                                                    ) : (
                                                        <video controls className="mt-2 max-w-xs">
                                                            <source src={mediaUrl} type="video/mp4" />
                                                            Trình duyệt không hỗ trợ xem video
                                                        </video>
                                                    )}
                                                </div>
                                            ))}
                                            <span className={`block text-xs ${message.sender._id === id ? 'text-ascent-2' : 'text-base'} mt-1`}>
                                                {formatDate(message.createdAt)}
                                            </span>
                                            {message.sender._id === id && (
                                                <span className="block text-xs text-ascent-2">
                                                    {message?.seen ? 'Đã xem' : 'Đã gửi'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                ))}
                                {previewImages.map((url, idx) => (
                                    <img key={idx} src={url} alt="preview" className="w-16 h-16 object-cover" />
                                ))}
                                {showScrollButton && (
                                    <button onClick={scrollToBottom} className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray text-white rounded-full p-2 flex items-center justify-center">
                                        <BsArrowDownCircleFill className="text-ascent-1" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-4 bg-primary p-4">
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-grow px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        {...register('message')}
                                    />
                                    <input type='file' multiple {...register('media')} id='file-input' style={{ display: 'none' }} onChange={handleImagePreview} />
                                    <label htmlFor='file-input' className='cursor-pointer' >
                                        <FaPaperclip className='text-ascent-1' size={24} />
                                    </label>
                                    <button className="bg-blue hover:bg-sky text-white font-bold py-2 px-4 rounded-lg">Gửi</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagePage;