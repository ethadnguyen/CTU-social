import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { LiaEditSolid } from "react-icons/lia";
import { BsPersonFillAdd } from "react-icons/bs";
import moment from "moment";

import { UpdateProfile } from "../redux/userSlice";

const Menu = ({ user }) => {
  const { user: data } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <div className="lg:hidden absolute top-12 left-4 bg-primary border border-gray-300 rounded-md shadow-md">
        <ul className="py-2 text-ascent-1">
          <li className="px-4 py-2 hover:bg-gray-100 flex items-center">
              <Link to={`/profile/${user._id}`}>Hồ sơ</Link>
              <div className='ml-5'>
              {user?._id === data?._id && (
                location.pathname === "/" && (
                  <LiaEditSolid
                    size={22}
                    className='text-blue cursor-pointer'
                    onClick={() => dispatch(UpdateProfile(true))}
                  />
                )
              )}
              
              {user?._id !== data?._id && (
                <button
                  className='bg-[#0444a430] text-sm text-white p-1 rounded'
                  onClick={() => {}}
                >
                  <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                </button>
              )}
            </div>
          </li>

          {/* <li className="px-4 py-2 hover:bg-gray-100">
              <Link to="/notifications/${user._id}">Thông báo</Link>
          </li> */}

          <li className="px-4 py-2 hover:bg-gray-100">
              <span>Bạn bè</span>
          </li>

          {/* <li className="px-4 py-2 hover:bg-gray-100 relative">
              <Link to="/messages/${user._id}">Tin nhắn</Link>
              <div className='absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red border-3 border-white rounded-full top-3 end-3'>
                <span className='text-sm text-white'>{user?.messages?.length}</span>
              </div>
          </li> */}

          <li className="px-4 py-2 hover:bg-gray-100">
              <Link to="/groups">Nhóm</Link>
          </li>
          <li className="px-4 py-2 hover:bg-gray-100">
              <Link to="/settings/${user._id}">Tìm kiếm</Link>
          </li>
        </ul>
    </div>
  );
};

export default Menu;
