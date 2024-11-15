import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { LiaEditSolid } from "react-icons/lia";
import {
  BsBriefcase,
  BsCalendar,
  BsCardList,
  BsFacebook,
  BsPersonCheck,
  BsPersonCircle,
  BsPersonDash,
  BsPersonFillAdd,
} from "react-icons/bs";
import { FaRegBuilding, FaLinkedin, FaGithub } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";

import { NoProfile } from "../assets";
import { UpdateProfile, UpdateUser } from "../redux/userSlice";
import axiosInstance from "../api/axiosConfig";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';
import socket from '../api/socket';
import { formatDate } from './../utils/formatDate';
import moment from 'moment';

const ProfileCard = ({ user }) => {
  const { user: data, edit } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const [requestStatus, setRequestStatus] = useState("");
  const isFriend = user?.friends?.some((friend) => friend._id === data?._id);


  useEffect(() => {
    const handleFriendRemoved = (removedUserId) => {
      if (removedUserId === data._id || removedUserId === user._id) {
        setRequestStatus("");
      }
    };

    socket.on("friendRemoved", handleFriendRemoved);

    return () => {
      socket.off("friendRemoved", handleFriendRemoved);
    };
  }, [user, data]);

  useEffect(() => {
    if (!user?._id || user._id === data?._id) return;

    const fetchFriendRequests = async () => {
      try {
        const requests = await axiosInstance.get(
          `/users/friend-requests/${user._id}`
        );
        const requestList = requests.data.requests || [];
        const request = requestList.find(
          (req) => req.requestFrom._id === data._id
        );
        setRequestStatus(request?.requestStatus);
      } catch (error) {
        console.error("Lỗi khi lấy yêu cầu kết bạn:", error);
      }
    };
    fetchFriendRequests();
  }, [user, data]);

  const handleAddFriend = async (userId) => {
    try {
      const res = await axiosInstance.post("/users/friend-request", {
        requestTo: userId,
      });
      if (res.status === 201) {
        toast.success('Đã gửi yêu cầu kết bạn!');
        // dispatch(UpdateUser(res.data.user));
        setRequestStatus("PENDING");
        const notiRes = await axiosInstance.post("/users/create-notification", {
          receiverIds: [userId],
          sender: data._id,
          type: "friendRequest",
          message: `${data?.firstName} ${data?.lastName} đã gửi yêu cầu kết bạn!`,
          link: `/profile/${data?._id}`,
        });

        if (notiRes.status === 201) {
          socket.emit('sendNotification', {
            notification: notiRes.data.notification,
            receiverId: userId,
          });
          socket.emit('friendRequest', {
            userId,
            request: res.data.request,
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }
  };

  const handleCancelRequest = async () => {
    const res = await axiosInstance.post("/users/cancel-request");

    if (res.status === 200) {
      setRequestStatus("");
      toast.success('Đã hủy yêu cầu kết bạn!');
    }
  };

  const handleUnFriend = async (userId) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn hủy kết bạn?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Có, hủy kết bạn!',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        const res = await axiosInstance.post("/users/unfriend", {
          friendId: userId,
        });

        if (res.status === 200) {
          dispatch(UpdateUser(res.data.user));
          setRequestStatus("");
          socket.emit('unFriend', { userId: data._id, friendId: userId });
          toast.success('Đã hủy kết bạn!');
        }
      }
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      toast.error('Lỗi khi hủy kết bạn!');
    }
  };

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (data?._id && user?._id !== data?._id) {
      setIsFollowing(user?.followers?.includes(data?._id));
    }
  }, [user, data]);

  const handleFollow = async (userId) => {
    try {
      const res = await axiosInstance.post(`/users/follow`, { userToFollowId: userId });
      if (res.status === 200) {
        dispatch(UpdateUser(res.data.user));
        setIsFollowing(true);
        const notiRes = await axiosInstance.post("/users/create-notification", {
          receiverIds: [userId],
          sender: data._id,
          type: "follow",
          message: `${data?.firstName} ${data?.lastName} đã theo dõi bạn!`,
          link: `/profile/${data?._id}`,
        });
        socket.emit('sendNotification', { notification: notiRes.data.notification, receiverId: userId });
        toast.success('Đã theo dõi!');
      }
    } catch (error) {
      console.error("Lỗi khi theo dõi:", error);
      toast.error('Lỗi khi theo dõi!');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const res = await axiosInstance.post(`/users/unfollow`, { userToUnfollowId: userId });
      if (res.status === 200) {
        setIsFollowing(false);
        dispatch(UpdateUser(res.data.user));
        toast.success('Đã bỏ theo dõi!');
      }
    } catch (error) {
      console.error("Lỗi khi bỏ theo dõi:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center w-full px-6 py-4 shadow-sm bg-primary rounded-xl ">
        <div className="w-full flex items-center justify-between border-b pb-5 border-[#66666645]">
          <Link to={"/profile/" + user?._id} className="flex gap-2">
            <img
              src={user?.avatar ?? NoProfile}
              alt={user?.email}
              className="object-cover rounded-full w-14 h-14"
            />

            <div className="flex flex-col justify-center">
              <p className="text-lg font-medium text-ascent-1">
                {user?.lastName} {user?.firstName}
              </p>
            </div>
          </Link>

          <div className="">
            {user?._id === data?._id && (
              <LiaEditSolid
                size={22}
                className="cursor-pointer text-blue"
                onClick={() => dispatch(UpdateProfile(true))}
              />
            )}

            {user?._id !== data?._id && (
              <button
                className="bg-[#0444a430] text-sm text-white p-1 rounded"
                onClick={() => {
                  if (!isFriend && requestStatus === "PENDING") {
                    handleCancelRequest();
                  } else if (!isFriend) {
                    handleAddFriend(user?._id);
                  } else {
                    handleUnFriend(user?._id);
                  }
                }}
              >
                {!isFriend && requestStatus !== "PENDING" && (
                  <BsPersonFillAdd size={30} className='text-[#0f52b6]' />
                )}
                {requestStatus === "PENDING" && (
                  <BsPersonDash size={30} className="text-[#0552b6]" />
                )}
                {isFriend && (
                  <BsPersonCheck size={30} className="text-[#0f52b6]" />
                )}
              </button>
            )}
          </div>
        </div>

        {user?._id === data?._id || user?.privacy === 'public' ? (
          <>
            <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
              <div className="flex items-center gap-2 text-ascent-2">
                <FaRegBuilding className="text-xl text-ascent-1" />
                <span>{user?.faculty?.name ?? ""}</span>
              </div>

              <div className="flex items-center gap-2 text-ascent-2">
                <BsBriefcase className="text-lg text-ascent-1" />
                <span>
                  {user?.major?.majorName ?? ""} - {user?.academicYear ?? ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-ascent-2">
                <BsCardList className="text-lg text-ascent-1" />
                <span>
                  {user?.student_id}
                </span>
              </div>
              <div className="flex items-center gap-2 text-ascent-2">
                <BsCalendar className="text-lg text-ascent-1" />
                <span>
                  {moment(user?.dateOfBirth).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className='flex flex-col'>
            <p className='text-ascent-2'>Thông tin cá nhân đã bị ẩn</p>
          </div>
        )}


        <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
          {user?._id === data?._id || user?.privacy === 'public' ? (
            <p className="text-xl font-semibold text-ascent-1">
              <span className="text-blue"> {user?.friends?.length}</span> Bạn bè
              <span className="mx-4"></span>
              <span className="text-blue">{user?.followers?.length}</span> Người theo dõi
            </p>
          ) : (
            <div className='flex flex-col'>
              <p className='text-ascent-2 items-center'>Bạn bè và theo dõi đã bị ẩn</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-ascent-2">{user?.bio}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ascent-2">Tham gia</span>
            <span className="text-base text-ascent-1">
              {formatDate(user?.createdAt)}
            </span>
          </div>

          {user?._id !== data?._id && (
            <button
              onClick={() => {
                if (isFollowing) {
                  handleUnfollow(user._id);
                } else {
                  handleFollow(user._id);
                }
              }}
              className="bg-blue hover:bg-sky text-sm text-white p-2 rounded"
            >
              {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
            </button>
          )}
        </div>

        {user?._id === data?._id || user?.privacy === 'public' ? (
          <div className="flex flex-col w-full gap-4 py-4 pb-6">
            <p className="text-lg font-semibold text-ascent-1">
              Mạng xã hội khác
            </p>

            {user?.facebook && (
              <div className="flex items-center gap-2 text-ascent-2">
                <BsFacebook className="text-xl text-ascent-1" />
                <a
                  href={`${user?.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </div>
            )}

            {user?.linkedin && (
              <div className="flex items-center gap-2 text-ascent-2">
                <FaLinkedin className="text-xl text-ascent-1" />
                <a
                  href={`${user?.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            )}

            {user?.github && (
              <div className="flex items-center gap-2 text-ascent-2">
                <FaGithub className="text-xl text-ascent-1" />
                <a
                  href={`${user?.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col'>
            <p className='text-ascent-2'>Mạng xã hội đã bị ẩn</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
