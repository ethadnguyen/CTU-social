import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { LiaEditSolid } from "react-icons/lia";
import {
  BsBriefcase,
  BsCalendar,
  BsCardList,
  BsFacebook,
  BsInstagram,
  BsPersonFillAdd,
} from "react-icons/bs";
import { FaRegBuilding, FaLinkedin, FaGithub } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import moment from "moment";

import { NoProfile } from "../assets";
import { UpdateProfile } from "../redux/userSlice";
import { formatDate } from './../utils/formatDate';

const ProfileCard = ({ user }) => {
  const { user: data, edit } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const location = useLocation();


  return (
    <div>
      <div className='w-full bg-primary flex flex-col items-center shadow-sm rounded-xl px-6 py-4 '>
        <div className='w-full flex items-center justify-between border-b pb-5 border-[#66666645]'>
          <Link to={`${import.meta.env.VITE_CLIENT_URL}/profile/` + user?._id} className='flex gap-2'>
            <img
              src={user?.avatar ?? NoProfile}
              alt={user?.email}
              className='w-14 h-14 object-cover rounded-full'
            />

            <div className='flex flex-col justify-center'>
              <p className='text-lg font-medium text-ascent-1'>
                {user?.lastName} {user?.firstName}
              </p>
            </div>
          </Link>
        </div>

        <div className='w-full flex flex-col gap-2 py-4 border-b border-[#66666645]'>
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

        <div className='w-full flex flex-col gap-2 py-4 border-b border-[#66666645]'>
          <p className='text-xl font-semibold text-ascent-1'>
            <span className='text-blue'> {user?.friends?.length}</span> Bạn bè
            <span className='mx-4'></span>
            <span className='text-blue'>{user?.followers?.length}</span>  Người theo dõi
          </p>

          <div className='flex items-center justify-between'>
            <span className='text-ascent-2'>{user?.bio}</span>
          </div>

          <span className='text-base text-blue'>
            {user?.isVerified ? "Tài khoản đã xác thực" : "Tài khoản chưa xác thực"}
          </span>

          <div className='flex items-center justify-between'>
            <span className='text-ascent-2'>Tham gia</span>
            <span className='text-ascent-1 text-base'>
              {/* {moment(user?.createdAt).fromNow()} */}
              {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>

        <div className='w-full flex flex-col gap-4 py-4 pb-6'>
          <p className='text-ascent-1 text-lg font-semibold'>Mạng xã hội khác</p>

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
      </div>
    </div>
  );
};

export default ProfileCard;