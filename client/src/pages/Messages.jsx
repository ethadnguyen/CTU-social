import { React, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CustomButton,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
} from "../components";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { conversation } from "../assets/messages";
import { BsArrowDownCircleFill } from "react-icons/bs";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSearch, FaTimes } from "react-icons/fa";
import { friends } from "../assets/data";
import { NoProfile } from "../assets";

const MessagePage = () => {
  const {
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const { id } = useParams();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const selectedConversation = conversation.find(
    (conv) => conv.id === selectedConversationId
  );
  const handleConversationClick = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();

  const messageContainerRef = useRef(null);

  //Xử lý nút cuộn đến tin nhắn mới nhất
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        messageContainerRef.current;
      setShowScrollButton(scrollTop + clientHeight < scrollHeight);
    };

    // Chỉ thêm event listener khi đã chọn conversation
    if (selectedConversationId && messageContainerRef.current) {
      // Check if ref is valid
      messageContainerRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (selectedConversationId && messageContainerRef.current) {
        // Check again before removing
        messageContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [selectedConversationId]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (selectedConversationId) {
      scrollToBottom();
    }
  }, [selectedConversationId]);

  // Đặt lại showScrollButton về false khi chọn conversation mới
  useEffect(() => {
    setShowScrollButton(false);
  }, [selectedConversationId]);

  //Cuộn xuống cuối khi vừa vào cuộc trò chuyện
  useEffect(() => {
    if (selectedConversationId) {
      scrollToBottomFirst();
    }
  }, [selectedConversationId]);
  const scrollToBottomFirst = () => {
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  };

  const onSubmit = async (data) => {
    console.log("is submitted");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showFriends, setShowFriends] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setShowFriends(true);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      setShowFriends(true);
    }
  };

  const filteredFriends = searchQuery
    ? friends.filter(
        (friend) =>
          friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          friend.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  return (
    <div className="home w-full px-0 lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg h-[89vh] overflow-hidden">
      {/* <TopBar /> */}

      <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-1 h-full">
        {/*Danh sách cuộc trò chuyện */}
        <div className="w-1/4 h-full bg-primary shadow-sm rounded-lg px-5 py-5 mb-3 mt-3 overflow-y-auto">
          <div className="flex items-center justify-between mt-3 mb-3 border-b border-[#66666645]">
            <div className="flex items-center text-xl text-ascent-1 pb-2">
              <button
                onClick={() => navigate("/")}
                className="mb-4 mt-4 mr-3 text-blue"
                type="button"
              >
                <IoMdArrowRoundBack className="text-ascent-1" />
              </button>
              <span>Tin nhắn</span>
            </div>
            {showSearchInput ? (
              <div className="relative w-[50%]">
                {" "}
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <FaTimes
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchQuery("");
                    setShowFriends(false);
                  }}
                  className="absolute top-1/3 right-2 transform -translate-y-1/2 cursor-pointer"
                />
              </div>
            ) : (
              <FaSearch
                onClick={() => {
                  setShowSearchInput(true);
                  setShowFriends(true);
                }}
                className="cursor-pointer mb-1"
              />
            )}
          </div>

          {showFriends ? (
            <>
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => handleConversationClick(friend._id)}
                    className="flex items-center text-ascent-1 mb-7 hover:sky cursor-pointer"
                  >
                    <img
                      src={friend.profileUrl ?? NoProfile}
                      alt={friend.firstName + " " + friend.lastName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{friend.firstName + " " + friend.lastName}</span>
                  </div>
                ))
              ) : (
                <p className="text-ascent-1">Không tìm thấy bạn bè</p>
              )}
            </>
          ) : (
            conversation.length > 0 &&
            conversation.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className="flex items-center text-ascent-1 mt-5 mb-7 hover:sky cursor-pointer"
              >
                <img
                  src={conv.avatar ?? NoProfile}
                  alt={conv.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{conv.name}</span>
              </div>
            ))
          )}
        </div>

        {/* Chat */}
        <div className="w-3/4 cols-1 h-full bg-primary shadow-sm rounded-lg px-5 py-5 mb-3 mt-3">
          {selectedConversation && (
            <div className="flex flex-col h-full relative">
              {/* Chat Header */}
              <div className="flex items-center mb-8 gap-4 bg-primary p-4">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium text-ascent-1 text-lg">
                  {selectedConversation.name}
                </span>
              </div>

              <div
                className="flex-grow overflow-y-auto"
                ref={messageContainerRef}
              >
                {/* Nội dung */}
                {selectedConversation.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.userId === id ? "justify-end" : "justify-start"
                    } mb-4 text-ascent-1`}
                  >
                    <p
                      className={`p-2 rounded-lg ${
                        message.userId === id ? "bg-blue" : "bg-gray"
                      } text-white`}
                    >
                      {message.content}
                    </p>
                  </div>
                ))}

                {showScrollButton && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray text-white rounded-full p-2 flex items-center justify-center"
                  >
                    <BsArrowDownCircleFill className="text-ascent-1" />
                  </button>
                )}
              </div>

              {/* ChatBar */}
              <div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex items-center gap-4 bg-primary p-4"
                >
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-grow px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button className="bg-blue hover:bg-sky text-white font-bold py-2 px-4 rounded-lg">
                    Gửi
                  </button>
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
