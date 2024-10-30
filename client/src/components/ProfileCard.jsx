import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { LiaEditSolid } from "react-icons/lia";
import {
  BsBriefcase,
  BsFacebook,
  BsPersonCheck,
  BsPersonCircle,
  BsPersonDash,
  BsPersonFillAdd,
} from "react-icons/bs";
import { FaRegBuilding, FaLinkedin, FaGithub } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import moment from "moment";

import { NoProfile } from "../assets";
import { UpdateProfile } from "../redux/userSlice";
import axiosInstance from '../api/axiosConfig';

const ProfileCard = ({ user }) => {
  const { user: data, edit } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [friendStatus, setFriendStatus] = useState("");
  const isFriend = user?.friends?.some((friend) => friend._id === data?._id);

  console.log('is friend:', isFriend);

  useEffect(() => {

    if (!user?._id || user._id === data?._id) return;

    const fetchFriendRequests = async () => {
      try {
        const requests = await axiosInstance.get(`/users/friend-requests/${user._id}`);
        const requestList = requests.data.requests || [];
        // console.log("Friend requests:", requestList);
        const request = requestList.find((req) => req.requestFrom._id === data._id);
        setFriendStatus(request?.requestStatus);
      } catch (error) {
        console.error("Lỗi khi lấy yêu cầu kết bạn:", error);
      }
    };
    fetchFriendRequests();

  }, [user, data]);



  const handleAddFriend = async (userId) => {
    try {
      const res = await axiosInstance.post("/users/friend-request", { requestTo: userId });
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }

  };

  const handleCancelRequest = async () => {
    const res = await axiosInstance.post("/users/cancel-request");
    console.log("Cancel request response:", res.data);
    // setFriendStatus("not_friends");
  };

  const handleUnFriend = async (userId) => {
    try {
      const res = await axiosInstance.post("/users/unfriend", { friendId: userId });
      console.log("Unfriend response:", res.data);
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
    }
  }

  return (
    <div>
      <div className='flex flex-col items-center w-full px-6 py-4 shadow-sm bg-primary rounded-xl '>
        <div className='w-full flex items-center justify-between border-b pb-5 border-[#66666645]'>
          <Link to={"/profile/" + user?._id} className='flex gap-2'>
            <img
              src={user?.avatar ?? NoProfile}
              alt={user?.email}
              className='object-cover rounded-full w-14 h-14'
            />

            <div className='flex flex-col justify-center'>
              <p className='text-lg font-medium text-ascent-1'>
                {user?.lastName} {user?.firstName}
              </p>
            </div>
          </Link>

          <div className=''>
            {user?._id === data?._id && (
              <LiaEditSolid
                size={22}
                className='cursor-pointer text-blue'
                onClick={() => dispatch(UpdateProfile(true))}
              />

            )}

            {user?._id !== data?._id && (
              <button
                className='bg-[#0444a430] text-sm text-white p-1 rounded'
                onClick={() => {
                  if (!isFriend && friendStatus === "PENDING") {
                    handleCancelRequest();
                  } else if (!isFriend) {
                    handleAddFriend(user?._id);
                  } else {
                    handleUnFriend(user?._id);
                  }
                }}
              >
                {!isFriend && friendStatus !== "PENDING" && (
                  <BsPersonFillAdd size={30} className='text-[#0f52b6]' />
                )}
                {friendStatus === "PENDING" && (
                  <BsPersonDash size={30} className='text-[#0552b6]' />
                )}
                {isFriend && (
                  <BsPersonCheck size={30} className='text-[#0f52b6]' />
                )}
              </button>
            )}
          </div>
        </div>

        <div className='w-full flex flex-col gap-2 py-4 border-b border-[#66666645]'>
          <div className='flex items-center gap-2 text-ascent-2'>
            <FaRegBuilding className='text-xl text-ascent-1' />
            <span>{user?.faculty?.name ?? ""}</span>
          </div>

          <div className='flex items-center gap-2 text-ascent-2'>
            <BsBriefcase className='text-lg text-ascent-1' />
            <span>{user?.major?.majorName ?? ""} - {user?.academicYear ?? ""}</span>
          </div>
        </div>

        <div className='w-full flex flex-col gap-2 py-4 border-b border-[#66666645]'>
          <p className='text-xl font-semibold text-ascent-1'>
            {user?.friends?.length} Bạn bè
          </p>

          <div className='flex items-center justify-between'>
            <span className='text-ascent-2'>Who viewed your profile</span>
            <span className='text-lg text-ascent-1'>{user?.views?.length}</span>
          </div>

          <span className='text-base text-blue'>
            {user?.isVerified ? "Tài khoản đã xác thực" : "Tài khoản chưa xác thực"}
          </span>

          <div className='flex items-center justify-between'>
            <span className='text-ascent-2'>Joined</span>
            <span className='text-base text-ascent-1'>
              {moment(user?.createdAt).fromNow()}
            </span>
          </div>
        </div>

        <div className='flex flex-col w-full gap-4 py-4 pb-6'>
          <p className='text-lg font-semibold text-ascent-1'>Mạng xã hội khác</p>

          <div className='flex items-center gap-2 text-ascent-2'>
            <BsFacebook className='text-xl text-ascent-1' />
            <a href={`${user?.facebook}`} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>

          <div className='flex items-center gap-2 text-ascent-2'>
            <FaLinkedin className='text-xl text-ascent-1' />
            <a href={`${user?.linkedin}`} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>

          <div className='flex items-center gap-2 text-ascent-2'>
            <FaGithub className='text-xl text-ascent-1' />
            <a href={`${user?.github}`} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
