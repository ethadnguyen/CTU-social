import { React, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { faculties } from "../assets/home";
import CustomButton from '../components/CustomButton';
import { MdDelete } from "react-icons/md";


const ActivitiesCard = () => {
    const { user, edit } = useSelector((state) => state.user);
    const [selectedFaculty, setSelectedFaculty] = useState('');

    useEffect(() => {
        if (user && user.facultyId) {
        setSelectedFaculty(user.facultyId);
        } else {
        setSelectedFaculty('');
        }
    }, [user]);

    const handleDeleteActivity = (activityId) => {
        console.log("Xóa hoạt động:", activityId);
        // Thêm logic xóa hoạt động ở đây
    };

    return (
        <div className='flex-1 bg-primary shadow-sm rounded-lg px-5 py-5 mb-1 overflow-y-auto h-[calc(100vh-8rem)]' >
            <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                <div>
                    <CustomButton
                        
                        title='Thêm hoạt động'
                        containerStyles='text-xl mb-2 text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
                    />
                </div>
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
                {faculties.find((faculty) => faculty.id === selectedFaculty)?.activities.map((activity) => (
                    <div key={activity.id} className='flex flex-col mb-4 gap-4 relative border-[#66666690] border-b pb-4 transform hover:-translate-y-3 transition-transform duration-300'> 
                        <a
                            href={activity.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-3xl mb-2 font-medium text-ascent-1 hover:underline'
                        >
                            {activity.title}
                        </a>
                        <img
                            src={activity.image}
                            alt={activity.title}
                            className='w-full h-full object-cover rounded-md'
                        />
                        <button 
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="absolute top-0 right-0 text-ascent-1 p-2 rounded-md"
                        >
                            <MdDelete className="h-7 w-7" />
                        </button>
                    </div>
                ))}
                </div>

        </div>
    )
}

export default ActivitiesCard;