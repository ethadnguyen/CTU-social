import { React, useState, useEffect } from 'react';
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
import { useDispatch, useSelector } from "react-redux";
import { suggest, requests } from "../assets/data";
import { NoProfile } from "../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import { fetchFaculties } from '../redux/facultySlice';
import axiosInstance from '../api/axiosConfig';
import { updateUser } from '../redux/userSlice';
import socket from '../api/socket';
import moment from 'moment';
import { BiCheckCircle, BiGroup, BiLike, BiMessage, BiNews } from 'react-icons/bi';

const NotificationsPage = () => {
    const { user, edit } = useSelector((state) => state.user);
    const [friendRequest, setFriendRequest] = useState(requests);
    const [suggestedFriends, setSuggestedFriends] = useState(suggest);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const { faculties } = useSelector((state) => state.faculty);
    const [notifications, setNotifications] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFaculties());
    }, [dispatch]);

    useEffect(() => {
        if (user && user.faculty._id) {
            setSelectedFaculty(user.faculty._id);
        } else {
            setSelectedFaculty('');
        }
    }, [user]);

    useEffect(() => {
        const getFriendRequests = async () => {
            try {
                const res = await axiosInstance.get('/users/friend-requests');
                console.log('Friend requests:', res.data.requests);
                setFriendRequest(res.data.requests);
            } catch (error) {
                console.error('Error getting friend requests:', error);
            }
        }

        getFriendRequests();
    }, []);

    useEffect(() => {
        const getNotifications = async () => {
            try {
                const res = await axiosInstance.get('/users/notifications');
                console.log('Notifications:', res.data.notifications);
                setNotifications(res.data.notifications);
            } catch (error) {
                console.error('Error getting notifications:', error);
            }
        }
        getNotifications();
    }, []);

    // socket listeners

    useEffect(() => {
        socket.on('getNotification', (notification) => {
            setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        });

        return () => {
            socket.off('getNotification');
        };
    }, []);

    const handleAcceptFriendRequest = async (requestId) => {
        const senderName = `${user.firstName} ${user.lastName}`;
        try {
            const res = await axiosInstance.post('/users/accept-request', { requestId, status: "ACCEPTED" });
            setFriendRequest((prevRequests) => prevRequests.filter((req) => req._id !== requestId));
            dispatch(updateUser(res.data.user));

            const resNoti = await axiosInstance.post('/users/create-notification', {
                receiverId: res.data.friend._id,
                sender: user._id,
                message: `${senderName} đã chấp nhận lời mời kết bạn`,
                type: 'accept',
                link: `/profile/${user._id}`,
            });

            if (resNoti.status === 201) {
                socket.emit('sendNotification', {
                    ...resNoti.data.notification,
                    senderName,
                });
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectFriendRequest = async (requestId) => {
        try {
            const res = await axiosInstance.post('/users/reject-request', { requestId, status: "REJECTED" });
            console.log('Reject friend request:', res.data);
            setFriendRequest((prevRequests) => prevRequests.filter((req) => req._id !== requestId));
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    return (
        <div className='w-full text-ascent-1 px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
            {/* <TopBar friends={user?.friends} /> */}

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
                            <li key={notification._id} className="py-4">
                                <Link
                                    to={notification?.link ? `${import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'}${notification.link}` : '#'}
                                    className={`flex items-center space-x-3 ${notification.link ? 'hover:bg-gray' : ''} px-2 py-2 rounded-lg`}
                                >
                                    <div className={`text-sm text-red font-medium ${!notification?.isRead ? '' : 'hidden'}`}>
                                        <GoDotFill />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-5">
                                            <p className={`text-md font-medium ${notification.isRead ? 'font-bold' : 'font-normal text-blue'} text-gray-900`}>
                                                {notification.message}
                                            </p>
                                            {notification.message && notification.type === 'like' && (
                                                <BiLike className='text-blue font-bold' size={30} />
                                            )}
                                            {notification.message && notification.type === 'comment' && (
                                                <BiMessage className='text-blue font-bold' size={30} />
                                            )}
                                            {notification.message && notification.type === 'post' && (
                                                <BiNews className='text-blue font-bold' size={30} />
                                            )}
                                            {notification.message && notification.type === 'accept' && (
                                                <BiCheckCircle className='text-blue font-bold' size={30} />
                                            )}
                                            {notification.message && notification.type === 'joinGroupRequest' && (
                                                <BiGroup className='text-blue font-bold' size={30} />
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            {moment(notification.createdAt).fromNow()} <span className="mx-3"></span>
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
                                        <option key={faculty._id} value={faculty._id}>
                                            {faculty.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className='w-full flex flex-col gap-4 pt-4'>
                            {faculties
                                .find((faculty) => faculty._id === selectedFaculty)
                                ?.activities.map((activity) => (
                                    <div key={activity._id} className='flex flex-col'>
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
                    <div className='flex-1 px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary' style={{ maxHeight: '300px' }}>
                        <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                            <span>Yêu Cầu Kết Bạn</span>
                            <span>{friendRequest?.length}</span>
                        </div>

                        <div className='flex flex-col w-full gap-4 pt-4'>
                            {friendRequest?.map(({ _id, requestFrom: from }) => (
                                <div key={_id} className='flex items-center justify-between'>
                                    <Link
                                        to={"/profile/" + from._id}
                                        className='flex items-center w-full gap-4 cursor-pointer'
                                    >
                                        <img
                                            src={from?.avatar ?? NoProfile}
                                            alt={from?.firstName}
                                            className='object-cover w-10 h-10 rounded-full'
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
                                            onClick={() => handleAcceptFriendRequest(_id)}
                                        />
                                        <CustomButton
                                            title='Deny'
                                            containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                                            onClick={() => handleRejectFriendRequest(_id)}
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