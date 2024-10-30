import { React, useState, useRef } from 'react';
import { users } from '../assets/users';
import { AiFillDelete } from 'react-icons/ai';
import TextInput from './TextInput';
import { FaSearch, FaBan } from "react-icons/fa";
import { AiOutlineLike } from "react-icons/ai";
import { MdOutlineReportProblem } from "react-icons/md";

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedLike, setSelectedLike] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

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

  const handleBanUser = (UserId) => {
    console.log("Cấm người dùng:", UserId);
    // ... (logic ban user)
  };

  const handleDeletePost = (PostId) => {
    console.log("Xóa bài đăng:", PostId);
    // ... (logic xóa post)
  };

  const handleDeleteLike = (LikeId) => {
    console.log("Xóa like:", LikeId);
    // ... (logic xóa like)
  };

  const handleDeleteReport = (LikeId) => {
    console.log("Xóa report:", LikeId);
    // ... (logic xóa report)
  };

  const [searchUser, setSearchUser] = useState('');
  const [searchPost, setSearchPost] = useState('');
  const [searchLike, setSearchLike] = useState('');
  const [searchReport, setSearchReport] = useState('');

  const handleSearchUserChange = (event) => {
    setSearchUser(event.target.value);
    console.log("Đang tìm kiếm khoa:", event.target.value);
  };

  const filteredusers = users.filter((User) =>
    User.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleSearchPostChange = (event) => {
    setSearchPost(event.target.value);
    console.log("Đang tìm kiếm ngành:", event.target.value);
  };

  const filteredPosts = selectedUser?.posts.filter((Post) =>
    Post.title.toLowerCase().includes(searchPost.toLowerCase())
  );

  const handleSearchLikeChange = (event) => {
    setSearchLike(event.target.value);
    console.log("Đang tìm kiếm khóa học:", event.target.value);
  };

  const filteredLikes = selectedPost?.likes.filter((Like) =>
    Like.name.toLowerCase().includes(searchLike.toLowerCase())
  );

  const handleSearchReportChange = (event) => {
    setSearchReport(event.target.value);
    console.log("Đang tìm kiếm khóa họ:", event.target.value);
  };

  const filteredReports = selectedPost?.reports.filter((report) =>
    report.name.toLowerCase().includes(searchReport.toLowerCase())
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
              key={User.id}
              onClick={() => handleUserClick(User)}              
              className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative 
                ${selectedUser?.id === User.id ? 'bg-sky text-white' : ''}`}
            >
              <>
              <a href={`http://localhost:5173/profile/${User.id}`} target="_blank" className="hover:underline">{User.name}</a>
                <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                  ${selectedUser?.id === User.id ? '' : 'hidden'}`}>
                    <button className="mr-3" onClick={(event) => {
                      event.stopPropagation();
                      handleBanUser(User.id);
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
                    key={Post.id}
                    onClick={() => handlePostClick(Post)}
                    className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative
                            ${selectedPost?.id === Post.id ? 'bg-sky text-white' : ''}`}
                >
                    <>
                    <a href={`http://localhost:5173/posts/${Post.id}`} target="_blank" className="hover:underline">"{Post.title.split(' ').length > 7 ? Post.title.split(' ').slice(0, 7).join(' ') + '...' : Post.title}"</a>
                        <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                    ${selectedPost?.id === Post.id ? '' : 'hidden'}`}>
                            <button onClick={(event) => {
                            event.stopPropagation();
                            handleDeletePost(Post.id);
                            }}>
                            <AiFillDelete className="" />
                            </button>
                        </div>
                        <span className={`${selectedPost?.id === Post.id ? 'text-white' : ''} text-xs text-ascent-1 mt-2 ml-2 flex items-center`}> 
                            <AiOutlineLike className="mr-1" /> {Post.likes.length}
                            <MdOutlineReportProblem className="ml-3 mr-1" /> {Post.reports.length} 
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
                        key={Like.id}
                        onClick={() => handleLikeClick(Like)}
                        className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative
                        ${selectedLike?.id === Like.id ? 'bg-sky text-white' : ''}`}
                    >
                        <>
                        <a href={`http://localhost:5173/profile/${Like.userId}`} target="_blank" className="hover:underline">{Like.name}</a>
                            <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                            ${selectedLike?.id === Like.id ? '' : 'hidden'}`}>
                            <button onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteLike(Like.id);
                            }}>
                                <AiFillDelete className="" />
                            </button>
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
                        key={Report.id}
                        onClick={() => handleReportClick(Report)}
                        className={`cursor-pointer text-ascent-1 hover:bg-gray py-2 px-4 rounded-md relative
                        ${selectedReport?.id === Report.id ? 'bg-sky text-white' : ''}`}
                    >
                        <>
                            {Report.name}
                            <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                ${selectedReport?.id === Report.id ? '' : 'hidden'}`}>
                                <button onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteReport(Report.id);
                                }}>
                                    <AiFillDelete className="" />
                                </button>
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