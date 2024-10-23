import { groupRequests } from '../assets/groupRequests';
import { Link } from 'react-router-dom';

const GroupRequests = () => {

    return (
        <ul className="divide-y divide-gray">
            {groupRequests.map((groupRequest) => (
                <li key={groupRequest.id} className="py-4 flex items-center rounded-md hover:bg-gray">    
                    <div className="flex-1 ml-3">
                        <p className="text-md mr-3 text-ascent-1 font-bold text-gray-900">
                            <Link to={`${groupRequest.userUrl}`} className="hover:underline"> 
                                "{groupRequest.requestor}" 
                            </Link>
                            <span> đã yêu cầu tạo nhóm </span>
                            "{groupRequest.groupName}" <span></span>
                        </p>

                        {groupRequest.purpose && 
                            <>
                                <p className="text-ascent-1">Mục đích:</p>
                                <p className="text-ascent-1">
                                    "{groupRequest?.purpose}"
                                </p>
                            </>
                        }

                        <p className="text-xs text-ascent-1">
                            {groupRequest.date} <span className="mx-3"></span> {groupRequest.time}
                        </p>
                    </div>

                    <div className="mr-3">
                        <button className="bg-green hover:bg-white hover:text-green text-white font-bold py-2 px-4 border rounded mr-2">
                            Phê duyệt
                        </button>
                        <button className="bg-red hover:bg-white hover:text-red text-white font-bold py-2 px-4 border rounded-md">
                            Từ chối
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default GroupRequests;