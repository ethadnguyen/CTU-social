import { postRequests } from '../assets/groupRequests';
import { Link } from 'react-router-dom';

const PostRequests = () => {

    return (
        <ul className="divide-y divide-gray">
            {postRequests.map((postRequest) => (
                <li key={postRequest.id} className="py-4 flex items-center hover:bg-gray rounded-md"> 
                    <div className="flex-1 ml-3">
                        <Link to={`${postRequest.url}`} className="block">
                            <p className="text-md text-ascent-1 font-bold text-gray-900">
                                <span className="hover:underline cursor-pointer">
                                    "{postRequest.requestor}" 
                                </span>
                                <span> muốn đăng </span>
                                {postRequest.title ? '\"' : ''}
                                {(postRequest.title && postRequest.title.split(" ").slice(0, 10).join(" ") + (postRequest.title.split(" ").length > 10 ? "...\"" : "\"")) || ''}
                            </p>

                            <p className="text-xs text-ascent-1">
                                {postRequest.date} <span className="mx-3"></span> {postRequest.time}
                            </p>
                        </Link>
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

export default PostRequests;