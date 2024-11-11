// import { groupRequests } from '../assets/groupRequests';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { useEffect } from 'react';
import { useState } from 'react';
import socket from '../api/socket';
import { formatDate } from '../utils/formatDate';

const GroupRequests = () => {

    const [groupRequests, setGroupRequests] = useState([]);
    useEffect(() => {
        const fetchGroupRequests = async () => {
            const response = await axiosInstance.get('/admin/group-requests');
            console.log(response.data.groupRequests);
            setGroupRequests(response.data.groupRequests);
        }
        fetchGroupRequests();


    }, []);

    useEffect(() => {
        socket.on('receiveGroupRequest', (groupRequest) => {
            setGroupRequests((prevGroupRequests) => [...prevGroupRequests, groupRequest]);
        });

        return () => {
            socket.off('receiveGroupRequest');
        }
    }, []);

    const handleAcceptRequest = async (groupRequest) => {
        console.log('Phê duyệt yêu cầu:', groupRequest);
        try {
            const response = await axiosInstance.post(`/admin/accept-group-request`, { requestId: groupRequest._id, status: 'APPROVED' });
            if (response.status === 201) {
                const notiRes = await axiosInstance.post('/users/create-notification', {
                    receiverIds: [groupRequest.user._id],
                    type: 'acceptGroupRequest',
                    message: `Yêu cầu tạo nhóm ${groupRequest.name} của bạn đã được phê duyệt`,
                    link: `/group/${response.data.group._id}`
                });
                setGroupRequests((prevGroupRequests) => prevGroupRequests.filter((req) => req._id !== groupRequest._id));
                socket.emit('sendNotification', { notification: notiRes.data.notification, receiverId: groupRequest.user._id });
                console.log('socket emit:', notiRes.data.notification);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRejectRequest = async (groupRequest) => {
        console.log('Từ chối yêu cầu:', groupRequest);
        try {
            const response = await axiosInstance.post(`/admin/reject-group-request`, { requestId: groupRequest._id });

            setGroupRequests((prevGroupRequests) => prevGroupRequests.filter((req) => req._id !== groupRequest._id));
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ul className="divide-y divide-gray overflow-y-auto h-full">
            {groupRequests.length > 0 ? groupRequests.map((groupRequest) => (
                <li key={groupRequest._id} className="py-4 flex items-center rounded-md hover:bg-gray">
                    <div className="flex-1 ml-3">
                        <p className="text-md mr-3 text-ascent-1 font-bold text-gray-900">
                            <Link
                                to={`${import.meta.env.VITE_CLIENT_URL}/profile/${groupRequest?.user?._id}`}
                                className="hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className='text-blue'>{groupRequest?.user.lastName} {groupRequest?.user.firstName}</span>
                            </Link>
                            <span> đã yêu cầu tạo nhóm </span>
                            <span className='text-ascent-2'> {groupRequest.name}</span>
                        </p>

                        {groupRequest.description &&
                            <>
                                <p className="text-ascent-1">Mục đích:</p>
                                <p className="text-ascent-2">
                                    {groupRequest?.description}
                                </p>
                            </>
                        }

                        <p className="text-xs text-ascent-1">
                            {formatDate(groupRequest.createdAt)}
                        </p>
                    </div>

                    <div className="mr-3">
                        <button
                            className="bg-green hover:bg-white hover:text-green text-white font-bold py-2 px-4 border rounded mr-2"
                            onClick={() => handleAcceptRequest(groupRequest)}
                        >
                            Phê duyệt
                        </button>
                        <button
                            className="bg-red hover:bg-white hover:text-red text-white font-bold py-2 px-4 border rounded-md"
                            onClick={() => handleRejectRequest(groupRequest)}
                        >
                            Từ chối
                        </button>
                    </div>
                </li>
            ))
                : (
                    <div className="flex justify-center items-center h-full">
                        <h2 className='text-ascent-2 text-xl'>Không có yêu cầu nào</h2>
                    </div>
                )}
        </ul>
    )
}

export default GroupRequests;