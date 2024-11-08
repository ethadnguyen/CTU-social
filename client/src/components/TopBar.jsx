import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
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

const TopBar = (friends) => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(
    () => parseInt(localStorage.getItem("notificationCount")) || user?.notifications.length
  );
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    if (user && user.notifications) {
      const unreadNotifications = user.notifications.filter((n) => !n.isRead);
      const initialNotificationCount = parseInt(localStorage.getItem("notificationCount")) || unreadNotifications.length;

      setNotificationCount(initialNotificationCount);
      localStorage.setItem("notificationCount", initialNotificationCount);
    }

    socket.on("getNotification", (notification) => {
      console.log('getNotification', notification);
      setNotificationCount((prevCount) => {
        const newCount = prevCount + 1;
        localStorage.setItem("notificationCount", newCount);
        return newCount;
      });
    });

    return () => {
      socket.off('getNotification');
    };
  }, [user]);

  useEffect(() => {
    console.log('re-render component', notificationCount);
  }, [notificationCount]);

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";

    dispatch(SetTheme(themeValue));
  };

  const handleSearch = async (data) => { };

  return (
    <div className='flex items-center justify-between w-full px-4 py-3 topbar md:py-6 bg-primary'>
      <div>
        <Link to='/' className='flex items-center gap-2'>
          <img src={BgImage} className='hidden lg:flex w-14 h-14' />
          <span className='hidden lg:flex text-xl md:text-2xl text-[#065ad8] font-semibold'>
            CTU Social
          </span>
        </Link>
      </div>
      {/* Mobile Menu Icon */}
      <div className='absolute flex items-center text-2xl lg:hidden left-4'>
        <Link to='/' className='flex items-center gap-2'>
          <img src={BgImage} className='lg:hidden w-9 h-9' />
        </Link>
        <div className='relative'>
          <IoIosMenu
            className={`lg:hidden text-2xl ml-2 ${theme === 'dark' ? 'text-white' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <Menu user={user} friends={user?.friends} />
      )}

      <form
        className='items-center justify-center hidden md:flex'
        onSubmit={handleSubmit(handleSearch)}
      >
        <TextInput
          placeholder='Tìm kiếm...'
          styles='w-[10rem] lg:w-[30rem]  rounded-l-full py-3 '
          register={register("search")}
        />
        <CustomButton
          title='Search'
          type='submit'
          containerStyles='bg-blue hover:bg-sky text-white px-3 py-2.5 mt-2 rounded-r-full'
        />
      </form>

      {/* ICONS */}
      <div className='flex items-center gap-4 text-ascent-1 text-md md:text-xl'>
        <button onClick={() => handleTheme()}>
          {theme ? <BsMoon /> : <BsSunFill />}
        </button>

        <div className='relative flex'>
          <Link to={`/messages/${user?._id}`}>
            {user?.messages?.length > 0 && (
              <div className='absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white border-white rounded-full bg-red border-3 -top-2 -end-2'>
                <span className='text-sm text-white'>{user?.messages}</span>
              </div>
            )}
            {user?.messages > 0 ? (
              <FaMessage color='#065ad8' />
            ) : (
              <FaRegMessage />
            )}
          </Link>


        </div>

        <div className='relative flex'>
          <Link to={`/notifications/${user?._id}`}>
            {notificationCount > 0 && (
              <div className='absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white border-white rounded-full bg-red border-3 -top-2 -end-2'>
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
            title='Đăng xuất'
            containerStyles='text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;