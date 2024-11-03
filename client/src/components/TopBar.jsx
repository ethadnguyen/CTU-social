import { React, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import Menu from "./Menu";
import { useForm } from "react-hook-form";
import { BsMoon, BsSunFill } from "react-icons/bs";
import { IoNotificationsOutline } from "react-icons/io5";
import { SetTheme } from "../redux/theme";
import { Logout } from "../redux/userSlice";
import { BgImage } from "../assets";
import { FaRegMessage, FaMessage } from "react-icons/fa6";
import { IoIosMenu, IoIosNotifications } from "react-icons/io";
import socket from '../api/socket';

const TopBar = ({ friends, searchQuery }) => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  // useEffect(() => {
  //   if (user && user.notifications) {
  //     const unreadNotifications = user.notifications.filter((n) => !n.isRead);
  //     setNotificationCount(unreadNotifications.length);
  //   }

  //   socket.on('getNotification', (notification) => {
  //     console.log('getNotification', notification);
  //     setNotificationCount(prevCount => prevCount + 1);
  //   });

  //   return () => {
  //     socket.off('getNotification');
  //   };
  // }, [user]);

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";

    dispatch(SetTheme(themeValue));
  };

  const handleSearch = () => {
    if (inputValue.trim() !== '')
      navigate(`/search/${inputValue}`);
  };

  const [inputValue, setInputValue] = useState(searchQuery || "");

  return (
    <div className="topbar w-full flex items-center justify-between py-3 md:py-6 px-4 bg-primary">
      <div>
        <Link to="/" className="flex gap-2 items-center">
          <img src={BgImage} className="hidden lg:flex w-14 h-14" />
          <span className="hidden lg:flex text-xl md:text-2xl text-[#065ad8] font-semibold">
            CTU Social
          </span>
        </Link>
      </div>
      {/* Mobile Menu Icon */}
      <div className="lg:hidden text-2xl absolute left-4 flex items-center">
        <Link to="/" className="flex gap-2 items-center">
          <img src={BgImage} className="lg:hidden w-9 h-9" />
        </Link>
        <div className="relative">
          <IoIosMenu
            className={`lg:hidden text-2xl ml-2 ${
              theme === "dark" ? "text-white" : ""
            }`}
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMenu && <Menu user={user} friends={user?.friends} searchQuery={inputValue} />}

      <form
        onSubmit={handleSubmit(handleSearch)}
        className="hidden md:flex items-center justify-center"
      >
        <TextInput
          placeholder="Tìm kiếm..."
          styles="w-[10rem] lg:w-[30rem]  rounded-l-full py-3 "
          register={register("search")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <CustomButton
          title="Search"
          type="submit"
          containerStyles="bg-blue hover:bg-sky text-white px-3 py-2.5 mt-2 rounded-r-full"
        />
      </form>

      {/* ICONS */}
      <div className="flex gap-4 items-center text-ascent-1 text-md md:text-xl">
        <button onClick={() => handleTheme()}>
          {theme ? <BsMoon /> : <BsSunFill />}
        </button>

        <div className="flex relative">
          <Link to={`/messages/${user?._id}`}>
            {user?.messages?.length > 0 && (
              <div className="absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red border-3 border-white rounded-full -top-2 -end-2">
                <span className="text-sm text-white">{user?.messages}</span>
              </div>
            )}
            {user?.messages > 0 ? (
              <FaMessage color="#065ad8" />
            ) : (
              <FaRegMessage />
            )}
          </Link>
        </div>

        <div className="flex relative">
          <Link to={`/notifications/${user?._id}`}>
            {notificationCount > 0 && (
              <div className='absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red border-3 border-white rounded-full -top-1 -end-1'>
                <span className='text-sm text-white'>{notificationCount}</span>
              </div>
            )}
            {notificationCount > 0 ? (
              <IoIosNotifications size={24} color='#065ad8' />
            ) : (
              <IoNotificationsOutline size={24} />
            )}
          </Link>
        </div>

        <div>
          <CustomButton
            onClick={() => dispatch(Logout())}
            title="Đăng xuất"
            containerStyles="text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
