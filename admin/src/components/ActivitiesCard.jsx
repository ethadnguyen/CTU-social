import { React, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {
    CustomButton,
    ActivityForm,
} from './index';
import { MdDelete, MdEdit } from "react-icons/md";
import { FaSearch, FaTimes } from "react-icons/fa";
import { fetchFaculties } from '../redux/facultySlice';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ActivitiesCard = () => {
    const { user, edit } = useSelector((state) => state.user);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [showEditActivity, setShowEditActivity] = useState(false);
    const { faculties } = useSelector((state) => state.faculty);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchFaculties());
    }, [dispatch]);

    const handleAddActivityClick = () => {
        setShowAddActivity(true);
    };

    const handleAddActivitySubmit = async (newActivityData) => {
        console.log("Thêm hoạt động mới:", newActivityData, " cho Khoa: ", selectedFaculty);
        const response = await axiosInstance.post(`/admin/create-activity`, {
            faculty: selectedFaculty,
            title: newActivityData.title,
            image: newActivityData.imageUrl,
            link: newActivityData.url
        });

        if (response.status === 201) {
            toast.success("Thêm hoạt động thành công!");
            dispatch(fetchFaculties());
        } else {
            toast.error("Thêm hoạt động thất bại!");
        }
    };

    useEffect(() => {
        if (user && user.faculty._id) {
            setSelectedFaculty(user.faculty._id);
        } else {
            setSelectedFaculty('');
        }
    }, [user]);

    const onClose = () => {
        setShowAddActivity(false);
        setShowEditActivity(false);
        setEditingActivity(null);
    };


    const handleUpdateActivity = async (newActivityData) => {
        console.log("Cập nhật hoạt động", editingActivity._id, "của khoa ", selectedFaculty, ": ", newActivityData);
        const response = await axiosInstance.put(`/admin/update-activity/${editingActivity._id}`, {
            faculty: selectedFaculty,
            title: newActivityData.title,
            image: newActivityData.imageUrl,
            link: newActivityData.url
        });
        console.log(response);
        if (response.status === 200) {
            toast.success("Cập nhật hoạt động thành công!");
            dispatch(fetchFaculties());
        } else {
            toast.error("Cập nhật hoạt động thất bại!");
        }
    };

    const handleDeleteActivity = (activityId) => {
        console.log("Xóa hoạt động:", activityId, " của khoa ", selectedFaculty);
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa hoạt động này?',
            text: "Dữ liệu sẽ không thể khôi phục lại sau khi xóa!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xóa!',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await axiosInstance.delete(`/admin/delete-activity/${activityId}`);
                console.log(response);
                if (response.status === 200) {
                    toast.success("Xóa hoạt động thành công!");
                    dispatch(fetchFaculties());
                } else {
                    toast.error("Xóa hoạt động thất bại!");
                }
            }
        });
    };

    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        setShowEditActivity(true);
    };

    const handleSearchClick = () => {
        setShowSearch(true);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCloseSearch = () => {
        setShowSearch(false);
        setSearchTerm('');
    };

    useEffect(() => {
        if (showSearch) {
            searchInputRef.current.focus();
        }
    }, [showSearch, selectedFaculty]);

    return (
        <>
            <div className='flex-1 shadow-sm rounded-lg py-5 mb-1 h-full overflow-y-auto' >
                <div className='flex items-center justify-between h-[10%] text-lg text-ascent-1 border-b border-[#66666645]'>
                    <div>
                        <CustomButton
                            onClick={handleAddActivityClick}
                            title='Thêm hoạt động'
                            containerStyles='text-xl mb-2 text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
                        />

                        {showAddActivity && (
                            <ActivityForm
                                submitActivity={handleAddActivitySubmit}
                                onClose={onClose}
                                formTitle="Thêm hoạt động"
                                submitTitle="Thêm"
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {showSearch ? (
                            <div className="relative mr-3">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Tìm hoạt động..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="ml-3 border border-gray bg-secondary text-ascent-1 rounded-md px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue"
                                />
                                <FaTimes
                                    className="absolute top-[45%] right-2 transform -translate-y-1/2 cursor-pointer"
                                    onClick={handleCloseSearch}
                                />
                            </div>
                        ) : (
                            <FaSearch
                                className="ml-3 mr-3 mb-2 size-8 hover:text-sky cursor-pointer"
                                onClick={handleSearchClick}
                            />
                        )}
                        <label className="w-auto">
                            <select
                                value={selectedFaculty}
                                onChange={(e) => setSelectedFaculty(e.target.value)}
                                className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-3 px-3 mt-1`}
                            >
                                {faculties.map((faculty) => (
                                    <option key={faculty._id} value={faculty._id}>
                                        {faculty.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className='w-full flex flex-col gap-4 pt-4 overflow-y-auto h-[90%]'>
                    {faculties
                        .find((faculty) => faculty._id === selectedFaculty)
                        ?.activities.filter((activity) =>
                            activity.title.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((activity) => (
                            <div key={activity._id} className='flex flex-col mb-4 gap-4 relative border-[#66666690] border-b pb-4 transform hover:-translate-y-3 transition-transform duration-300'>
                                <div className="flex items-center justify-between">
                                    <a
                                        href={activity.link}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-3xl mb-2 font-medium text-ascent-1 hover:underline'
                                    >
                                        {activity.title}
                                    </a>

                                    <div>
                                        <button
                                            onClick={() => handleEditActivity(activity)}
                                            className="text-ascent-1 p-2 rounded-md mr-2"
                                        >
                                            <MdEdit className="h-7 w-7" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteActivity(activity._id)}
                                            className="text-ascent-1 p-2 rounded-md"
                                        >
                                            <MdDelete className="h-7 w-7" />
                                        </button>
                                    </div>
                                </div>
                                <img
                                    src={activity.image}
                                    alt={activity.title}
                                    className='w-full h-full rounded-md'
                                />
                            </div>
                        ))}
                </div>
            </div>
            {showEditActivity && (
                <ActivityForm
                    submitActivity={handleUpdateActivity}
                    onClose={onClose}
                    formTitle="Chỉnh sửa hoạt động"
                    submitTitle="Lưu"
                    initialValues={editingActivity}
                />
            )}
        </>
    )
}

export default ActivitiesCard;