import { React, useState, useRef, useEffect } from 'react';
import { users } from '../assets/users';
import { AiFillDelete } from 'react-icons/ai';
import TextInput from './TextInput';
import { FaSearch, FaBan } from "react-icons/fa";
import { AiOutlineLike } from "react-icons/ai";
import { MdOutlineReportProblem } from "react-icons/md";
import axiosInstance from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedLike, setSelectedLike] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/admin/accounts');
        console.log(res.data);
        setUsers(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (User) => {
    if (selectedUser === User) {
      setSelectedUser(null);
      setSelectedPost(null);
      setSelectedLike(null);
    } else {
      setSelectedUser(User);
      setSelectedPost(null);
      setSelectedLike(null);
    }
  };

  const handlePostClick = (Post) => {
    if (selectedPost === Post) {
      setSelectedPost(null);
      setSelectedLike(null);
    } else {
      setSelectedPost(Post);
      setSelectedLike(null);
    }
  };

  const handleLikeClick = (Like) => {
    if (selectedLike === Like) {
      setSelectedLike(null);
    } else {
      setSelectedLike(Like);
    }
  };

  const handleReportClick = (Report) => {
    if (selectedReport === Report) {
      setSelectedReport(null);
    } else {
      setSelectedReport(Report);
    }
  };

  const handleBanUser = async (UserId) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa tài khoản người dùng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosInstance.delete(`/admin/delete-account/${UserId}`);
          if (res.status === 200) {
            toast.success('Xóa tài khoản người dùng thành công');
          }
        } catch (error) {
          console.log(error);
          toast.error(error.response.data.message);
        }
      }
    });
  };

  const handleDeletePost = async (PostId) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa bài đăng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosInstance.delete(`/admin/delete-post/${PostId}`);
          if (res.status === 200) {
            toast.success('Xóa bài đăng thành công');
          }
        } catch (error) {
          toast.error(error.response.data.message);
          console.log(error);
        }
      }
    });
  };

  const [searchUser, setSearchUser] = useState('');
  const [searchPost, setSearchPost] = useState('');
  const [searchLike, setSearchLike] = useState('');
  const [searchReport, setSearchReport] = useState('');

  const handleSearchUserChange = (event) => {
    setSearchUser(event.target.value);
    console.log("Đang tìm kiếm khoa:", event.target.value);
  };

  const filteredusers = users.filter((User) => {
    const name = User.firstName + ' ' + User.lastName;
    return name.toLowerCase().includes(searchUser.toLowerCase())
  }
  );

  const handleSearchPostChange = (event) => {
    setSearchPost(event.target.value);
    console.log("Đang tìm kiếm ngành:", event.target.value);
  };

  const filteredPosts = selectedUser?.posts.filter((Post) =>
    Post.content.toLowerCase().includes(searchPost.toLowerCase())
  );

  const handleSearchLikeChange = (event) => {
    setSearchLike(event.target.value);
    console.log("Đang tìm kiếm khóa học:", event.target.value);
  };

  const filteredLikes = selectedPost?.likedBy.filter((Like) => {
    const name = Like.firstName + ' ' + Like.lastName;
    return name.toLowerCase().includes(searchLike.toLowerCase())
  }
  );

  const handleSearchReportChange = (event) => {
    setSearchReport(event.target.value);
    console.log("Đang tìm kiếm khóa họ:", event.target.value);
  };

  const filteredReports = selectedPost?.reportedBy.filter((report) => {
    const name = report.firstName + ' ' + report.lastName;
    return name.toLowerCase().includes(searchReport.toLowerCase());
  }
  );

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Cột 1: Danh sách người dùng */}
      <div className="border-r flex-grow h-full overflow-hidden">
        <div className='flex flex-col h-[10%] items-start mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
          <div className="flex items-center justify-between w-full">
            <span className="font-bold">Người dùng</span>
            <div className="flex items-center">
              <TextInput
                placeholder="Tìm người dùng"
                name="SearchUser"
                value={searchUser}
                onChange={handleSearchUserChange}
                className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
              />

              <button type="button" className="ml-2">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        <ul className="rounded-md mr-3 overflow-y-auto h-[90%]">
          {filteredusers.map((User) => (
            <li
              key={User._id}
              onClick={() => handleUserClick(User)}
              className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative 
                ${selectedUser?._id === User._id ? 'bg-sky text-white' : ''}`}
            >
              <>
                <a href={`${import.meta.env.VITE_CLIENT_URL}/profile/${User._id}`} target="_blank" className="hover:underline">{User.firstName} {User.lastName}</a>
                <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                  ${selectedUser?._id === User._id ? '' : 'hidden'}`}>
                  <button className="mr-3" onClick={(event) => {
                    event.stopPropagation();
                    handleBanUser(User._id);
                  }}>
                    <FaBan className="" />
                  </button>
                </div>
              </>
            </li>
          ))}
        </ul>
      </div>

      {/* Cột 2: Danh sách bài đăng */}
      <div className="border-r flex-grow h-full overflow-hidden">
        <div className='flex flex-col h-[10%] items-start mr-3 justify-between text-xl text-ascent-1 pb-2 border-b mb-3 border-[#66666645]'>
          <div className="flex items-center justify-between w-full">
            <span className="font-bold">Bài đăng</span>
            <div className="flex items-center">
              <TextInput
                placeholder="Tìm bài đăng"
                name="SearchPost"
                value={searchPost}
                onChange={handleSearchPostChange}
                className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
              />

              <button type="button" className="ml-2">
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {selectedUser && (
          <ul className="rounded-md mr-3 overflow-y-auto h-[90%]">
            {filteredPosts.map((Post) => (
              <li
                key={Post._id}
                onClick={() => handlePostClick(Post)}
                className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative
                            ${selectedPost?._id === Post._id ? 'bg-sky text-white' : ''}`}
              >
                <>
                  <a href={`http://localhost:5173/posts/${Post._id}`} target="_blank" className="hover:underline">"{Post.content.split(' ').length > 7 ? Post.content.split(' ').slice(0, 7).join(' ') + '...' : Post.content}"</a>
                  <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                    ${selectedPost?._id === Post._id ? '' : 'hidden'}`}>
                    <button onClick={(event) => {
                      event.stopPropagation();
                      handleDeletePost(Post._id);
                    }}>
                      <AiFillDelete className="" />
                    </button>
                  </div>
                  <span className={`${selectedPost?._id === Post._id ? 'text-white' : ''} text-xs text-ascent-1 mt-2 ml-2 flex items-center`}>
                    <AiOutlineLike className="mr-1" /> {Post.likes}
                    <MdOutlineReportProblem className="ml-3 mr-1" /> {Post.reports}
                  </span>
                </>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cột 3: Reports và Likes */}
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-grow overflow-hidden">
          <div className='flex flex-col h-[20%] items-start mr-3 justify-between text-xl text-ascent-1 border-b border-[#66666645]'>
            <div className="flex items-center justify-between w-full">
              <span className="font-bold">Likes</span>
              <div className="flex items-center">
                <TextInput
                  placeholder="Tìm lượt like"
                  name="SearchLike"
                  value={searchLike}
                  onChange={handleSearchLikeChange}
                  className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
                />

                <button type="button" className="ml-2">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {selectedPost && (
            <ul className="rounded-md mr-3 overflow-y-auto h-[80%]">
              {filteredLikes.map((Like) => (
                <li
                  key={Like._id}
                  onClick={() => handleLikeClick(Like)}
                  className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative
                        ${selectedLike?._id === Like._id ? 'bg-sky text-white' : ''}`}
                >
                  <>
                    <a href={`http://localhost:5173/profile/${Like._id}`} target="_blank" className="hover:underline">{Like.firstName} {Like.lastName}</a>
                    <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                            ${selectedLike?._id === Like._id ? '' : 'hidden'}`}>
                    </div>
                  </>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-grow overflow-hidden">
          <div className='flex flex-col h-[20%] items-start mr-3 justify-between text-xl text-ascent-1 border-b border-t border-[#66666645]'>
            <div className="flex items-center mt-1 justify-between w-full mb-1">
              <span className="font-bold">Reports</span>
              <div className="flex items-center">
                <TextInput
                  placeholder="Tìm lượt report"
                  name="SearchReport"
                  value={searchReport}
                  onChange={handleSearchReportChange}
                  className="border border-gray rounded-l-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue"
                />

                <button type="button" className="ml-2">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {selectedPost && (
            <ul className="rounded-md mr-3 mt-0 overflow-y-auto h-[80%]">
              {filteredReports.map((Report) => (
                <li
                  key={Report._id}
                  onClick={() => handleReportClick(Report)}
                  className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative
                        ${selectedReport?._id === Report._id ? 'bg-sky text-white' : ''}`}
                >
                  <>
                    {Report.firstName} {Report.lastName}
                    <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                ${selectedReport?._id === Report._id ? '' : 'hidden'}`}>
                    </div>
                  </>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;