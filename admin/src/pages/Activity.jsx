import React, { useState } from 'react'

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddActivity = () => {

    };

    const handleEditActivity = (id) => {

    }

    const handleDeleteAcitivity = (id) => {

    }

    const filteredActivities = activities.filter(activity => {
        activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div>
            <h1 className='text-2xl font-bold mb-6'>Quản lý hoạt động</h1>
            <div className='mb-4'>
                <input
                    type='text'
                    placeholder='Tìm kiếm...'
                    className='w-1/2 rounded-md border border-gray-300 p-2'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button>
                Thêm hoạt động
            </button>
        </div>
    )
}

export default Activity