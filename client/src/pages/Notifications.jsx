import { React, useState, useEffect } from 'react';
import { notifications } from '../assets/notifications';
import { Link } from 'react-router-dom';
import {
    CustomButton,
    EditProfile,
    FriendsCard,
    Loading,
    PostCard,
    ProfileCard,
    TextInput,
    TopBar,
  } from "../components";
  import { useSelector } from "react-redux";
  import { faculties } from "../assets/home";
  import { suggest, requests } from "../assets/data";
  import { NoProfile } from "../assets";
  import { BsPersonFillAdd } from "react-icons/bs";
  import { GoDotFill } from "react-icons/go";

const NotificationsPage = () => {
    const { user, edit } = useSelector((state) => state.user);
    const [friendRequest, setFriendRequest] = useState(requests);
    const [suggestedFriends, setSuggestedFriends] = useState(suggest);

    const [selectedFaculty, setSelectedFaculty] = useState('')

    useEffect(() => {
        if (user && user.facultyId) {
        setSelectedFaculty(user.facultyId);
        } else {
        setSelectedFaculty('');
        }
    }, [user]);

    return (
    <div className='w-full text-ascent-1 px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar friends={user?.friends} />

        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
            {/* LEFT */}
            <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-3 overflow-y-auto'>
                <ProfileCard user={user} />
                <FriendsCard friends={user?.friends} />
            </div>


            <div className="flex-1 text-ascent-1 bg-primary h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
                <div className='flex items-center mt-3 mb-3 justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                    <span>Thông báo</span>
                </div>

                <ul className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                        <li key={notification.id} className="py-4">
                            <Link to={notification?.url || '#'} className={`flex items-center space-x-3 ${notification.url ? 'hover:bg-gray' : ''} px-2 py-2 rounded-lg`}>
                                <div className={`text-sm text-red font-medium ${notification.seen ? '' : 'hidden'}`}>
                                    <GoDotFill />
                                </div>
                                
                                <div className="flex-1">
                                    <p className={`text-md font-medium ${notification.seen ? 'font-bold' : 'font-normal'} text-gray-900`}>
                                        {notification.content} <span> </span> {notification.title ? '\"' : ''}
                                        {(notification.title && notification.title.split(" ").slice(0, 10).join(" ") + (notification.title.split(" ").length > 10 ? "...\"" : "\"")) || ''}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {notification.date} <span className="mx-3"></span> {notification.time}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* RIGHT */}
            <div className='hidden w-1/4 h-[100%] lg:flex flex-col gap-3 overflow-y-auto'>
                {/* Activities */}
                <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 mb-1 overflow-y-auto' style={{ maxHeight: '300px' }}>
                    <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                        <span>Hoạt Động</span>
                        <label>
                        <select
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                        >
                            {faculties.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                                {faculty.name}
                            </option>
                            ))}
                        </select>
                        </label>
                    </div>

                    <div className='w-full flex flex-col gap-4 pt-4'>
                        {faculties
                        .find((faculty) => faculty.id === selectedFaculty) // Tìm khoa được chọn
                        ?.activities.map((activity) => ( // Hiển thị activities của khoa được chọn
                            <div key={activity.id} className='flex flex-col'>
                            <a
                                href={activity.link}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-base font-medium text-ascent-1 hover:underline'
                            >
                                {activity.title}
                            </a>
                            <img
                                src={activity.image}
                                alt={activity.title}
                                className='w-full h-48 object-cover rounded-md'
                            />
                            </div>
                        ))}
                    </div>
                </div>

                {/* FRIEND REQUEST */}
                <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 overflow-y-auto' style={{ maxHeight: '300px' }}>
                    <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                        <span>Yêu Cầu Kết Bạn</span>
                        <span>{friendRequest?.length}</span>
                    </div>

                    <div className='w-full flex flex-col gap-4 pt-4'>
                        {friendRequest?.map(({ _id, requestFrom: from }) => (
                        <div key={_id} className='flex items-center justify-between'>
                            <Link
                            to={"/profile/" + from._id}
                            className='w-full flex gap-4 items-center cursor-pointer'
                            >
                            <img
                                src={from?.profileUrl ?? NoProfile}
                                alt={from?.firstName}
                                className='w-10 h-10 object-cover rounded-full'
                            />
                            <div className='flex-1'>
                                <p className='text-base font-medium text-ascent-1'>
                                {from?.firstName} {from?.lastName}
                                </p>
                            </div>
                            </Link>

                            <div className='flex gap-1'>
                            <CustomButton
                                title='Accept'
                                containerStyles='bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full'
                            />
                            <CustomButton
                                title='Deny'
                                containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                            />
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* SUGGESTED FRIENDS */}
                <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 overflow-y-auto' style={{ maxHeight: '300px' }}>
                    <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                        <span>Gợi Ý Kết Bạn</span>
                    </div>
                    <div className='w-full flex flex-col gap-4 pt-4'>
                        {suggestedFriends?.map((friend) => (
                        <div
                            className='flex items-center justify-between'
                            key={friend._id}
                        >
                            <Link
                            to={"/profile/" + friend?._id}
                            key={friend?._id}
                            className='w-full flex gap-4 items-center cursor-pointer'
                            >
                            <img
                                src={friend?.profileUrl ?? NoProfile}
                                alt={friend?.firstName}
                                className='w-10 h-10 object-cover rounded-full'
                            />
                            <div className='flex-1 '>
                                <p className='text-base font-medium text-ascent-1'>
                                {friend?.firstName} {friend?.lastName}
                                </p>
                            </div>
                            </Link>

                            <div className='flex gap-1'>
                            <button
                                className='bg-[#0444a430] text-sm text-white p-1 rounded'
                                onClick={() => { }}
                            >
                                <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default NotificationsPage;