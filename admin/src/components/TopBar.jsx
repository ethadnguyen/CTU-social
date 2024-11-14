import React from "react";
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

const TopBar = (friends) => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = React.useState(false);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";

    dispatch(SetTheme(themeValue));
  };

  const handleSearch = async (data) => { };

  return (
    <div className='topbar w-full flex items-center justify-between py-3 md:py-6 px-4 bg-primary'>
      <div>
        <Link to='/' className='flex gap-2 items-center'>
          <img src={BgImage} className='hidden lg:flex w-14 h-14' />
          <span className='hidden lg:flex text-xl md:text-2xl text-[#065ad8] font-semibold'>
            CTU Social
          </span>
        </Link>
      </div>
      {/* Mobile Menu Icon */}
      <div className='lg:hidden text-2xl absolute left-4 flex items-center'>
        <Link to='/' className='flex gap-2 items-center'>
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

      {/* ICONS */}
      <div className='flex gap-4 items-center text-ascent-1 text-md md:text-xl'>
        <button onClick={() => handleTheme()}>
          {theme ? <BsMoon /> : <BsSunFill />}
        </button>

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
