import { React, useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { faculties } from "../assets/home";
import {
    CustomButton,
    ActivityForm,
} from './index';
import { MdDelete, MdEdit } from "react-icons/md";
import { FaSearch, FaTimes } from "react-icons/fa";

const ActivitiesCard = () => {
    const { user, edit } = useSelector((state) => state.user);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [showEditActivity, setShowEditActivity] = useState(false);

    const handleAddActivityClick = () => {
        setShowAddActivity(true);
    };

    const handleAddActivitySubmit = (newActivityData) => {
        console.log("Thêm hoạt động mới:", newActivityData, " cho Khoa: ", selectedFaculty);
        // Xử lý thêm hoạt động mới
    };

    useEffect(() => {
        if (user && user.facultyId) {
        setSelectedFaculty(user.facultyId);
        } else {
        setSelectedFaculty('');
        }
    }, [user]);

    const onClose = () => {
        setShowAddActivity(false);
        setShowEditActivity(false);
        setEditingActivity(null);
    };

    const handleDeleteActivity = (activityId) => {
        console.log("Xóa hoạt động:", activityId, " của khoa ", selectedFaculty);
        // logic xóa hoạt động
    };

    const handleUpdateActivity = (newActivityData) => {
        console.log("Cập nhật hoạt động", editingActivity.id ,"của khoa ", selectedFaculty,": ", newActivityData);
        // logic cập nhật hoạt động
    }

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
            <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 mb-1 h-full' >
                <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
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
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name}
                                </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className='w-full flex flex-col gap-4 pt-4 overflow-y-auto h-[calc(85vh-8rem)]'>
                    {faculties
                        .find((faculty) => faculty.id === selectedFaculty)
                        ?.activities.filter((activity) => 
                            activity.title.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((activity) => (
                        <div key={activity.id} className='flex flex-col mb-4 gap-4 relative border-[#66666690] border-b pb-4 transform hover:-translate-y-3 transition-transform duration-300'>
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
                                        onClick={() => handleDeleteActivity(activity.id)}
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