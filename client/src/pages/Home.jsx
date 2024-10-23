import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { suggest, requests } from "../assets/data";
import { posts, faculties } from "../assets/home";
import { Link, useLocation, ScrollRestoration } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { BiImages } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { CiFileOn } from "react-icons/ci";
import axiosInstance from '../api/axiosConfig';
import { getPosts, likePost, reportPost, updatePosts } from '../redux/postSlice';
import { FaFile } from 'react-icons/fa6';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [friendRequest, setFriendRequest] = useState(requests);
  const [suggestedFriends, setSuggestedFriends] = useState(suggest);
  const [errMsg, setErrMsg] = useState("");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  const posts = useSelector((state) => state.posts.posts);

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  useEffect(() => {
    //joinUser socket
    const socket = io('http://localhost:5000');
    socket.emit('joinUser', user);
  }, [user]);

  const handlePostSubmit = async (data) => {
    const formData = new FormData();

    formData.append('userId', user._id);
    formData.append('content', data.content);
    formData.append('privacy', selectedScope.toLowerCase());

    images.forEach((image) => {
      formData.append('images', image);
    });

    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setPosting(true);
      const post = await axiosInstance.post('/posts/create-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      reset();
      setPosting(false);
      dispatch(getPosts());
    } catch (error) {
      reset();
      setPosting(false);
      console.error('Error creating post:', error);
    }
  };

  const [selectedScope, setSelectedScope] = useState("Public");
  const handleScopeChange = (event) => {
    setSelectedScope(event.target.value);
  };

  const [selectedFaculty, setSelectedFaculty] = useState('');

  useEffect(() => {
    if (user && user.faculty) {
      setSelectedFaculty(user.faculty);
    } else {
      setSelectedFaculty('');
    }
  }, [user]);

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      dispatch(getPosts());
      toast.success('Đã xóa bài viết thành công!');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikePost = async (post) => {
    const postId = post._id;
    const userId = user._id;
    const socket = io('http://localhost:5000');

    try {
      await dispatch(likePost(postId));

      const updatedPosts = posts.map((p) => {
        if (p._id === postId) {
          // Kiểm tra xem user đã like bài viết hay chưa
          const hasLiked = p.likedBy.includes(userId);

          return {
            ...p,
            likes: hasLiked ? p.likes - 1 : p.likes + 1,  // Tăng hoặc giảm số lượng like
            likedBy: hasLiked
              ? p.likedBy.filter(id => id !== userId)  // Bỏ userId nếu đã like
              : [...p.likedBy, userId],  // Thêm userId nếu chưa like
          };
        }
        return p;
      });
      dispatch(updatePosts(updatedPosts));
      socket.emit('likePost', { userId, postId });

    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReportPost = async (post) => {
    const socket = io('http://localhost:5000');
    const postId = post._id;
    try {
      await dispatch(reportPost(postId));
      await dispatch(getPosts());
      socket.emit('reportPost', { id: postId, reportedBy: user._id });
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };


  return (
    <>
      <div className='w-full h-screen px-0 pb-20 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg'>
        <TopBar friends={user?.friends} />

        <div className='flex w-full h-full gap-2 pt-5 pb-10 lg:gap-4'>
          {/* LEFT */}
          <div className='flex-col hidden w-1/3 h-full gap-3 overflow-y-auto lg:w-1/4 md:flex'>
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className='flex flex-col flex-1 h-full gap-6 px-4 overflow-y-auto rounded-lg'>
            <form
              onSubmit={handleSubmit(handlePostSubmit)}
              className='px-4 rounded-lg bg-primary'
            >
              <div className='w-full flex items-center gap-2 py-4 border-b border-[#66666645]'>
                <img
                  src={user?.avatar ?? NoProfile}
                  alt='User Image'
                  className='object-cover rounded-full w-14 h-14'
                />
                <TextInput
                  styles='w-full rounded-full py-5'
                  placeholder="Bạn đang suy nghĩ điều gì...."
                  name='content'
                  register={register("content", {
                    required: "Hãy nhập nội dung bài viết",
                  })}
                  error={errors.content ? errors.content.message : ""}
                />
              </div>

              {images.length > 0 && (
                <div className='flex gap-2 py-4'>
                  {images.map((image, index) => (
                    <div key={index} className='relative'>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className='object-cover w-24 h-24 rounded-lg'
                      />
                      <button
                        className='absolute top-0 right-0 p-1 font-bold bg-red-500 rounded-full text-red'
                        onClick={() => {
                          setImages((prevImages) => prevImages.filter((_, i) => i !== index));
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className='flex gap-2 py-4'>
                  {files.map((file, index) => (
                    <div key={index} className='relative flex items-center p-2 bg-gray-100 rounded-lg'>
                      <FaFile className='mr-2 text-white' />
                      <span className='flex-1 overflow-hidden text-blue'>{file.name}</span>
                      <button
                        className='absolute top-0 right-0 p-1 font-bold text-white bg-red-500 rounded-full'
                        onClick={() => {
                          setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errMsg?.message && (
                <span
                  role='alert'
                  className={`text-sm ${errMsg?.status === "failed"
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                    } mt-0.5`}
                >
                  {errMsg?.message}
                </span>
              )}

              <div className='flex items-center justify-between py-4'>
                <label
                  htmlFor='imgUpload'
                  className='flex items-center gap-1 text-base cursor-pointer text-ascent-2 hover:text-ascent-1'
                >
                  <input
                    type='file'
                    multiple
                    name='images'
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setImages((prevImages) => [...prevImages, ...files]);
                    }}
                    className='hidden'
                    id='imgUpload'
                    data-max-size='5120'
                    accept='.jpg, .png, .jpeg'
                  />
                  <BiImages />
                  <span>Image</span>
                </label>

                <label
                  className='flex items-center gap-1 text-base cursor-pointer text-ascent-2 hover:text-ascent-1'
                  htmlFor='videoUpload'
                >
                  <input
                    type='file'
                    multiple
                    name='files'
                    data-max-size='5120'
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setFiles((prevFiles) => [...prevFiles, ...files]);
                    }}
                    className='hidden'
                    id='videoUpload'
                    accept='*'
                  />
                  <CiFileOn />
                  <span>File</span>
                </label>

                <label>
                  <select
                    id="gender"
                    value={selectedScope}
                    onChange={handleScopeChange}
                    className={`bg-secondary border-[#66666690] mb-2 outline-none text-sm text-ascent-2 placeholder:text-[#666] w-full border rounded-md py-2 px-3 mt-1`}
                  >
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                    <option value="Groups">Groups</option>
                  </select>
                </label>

                <div>
                  {posting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type='submit'
                      title='Post'
                      containerStyles='bg-blue hover:bg-sky text-white py-1 px-6 rounded-full font-semibold text-sm'
                    />
                  )}
                </div>
              </div>
            </form>

            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post?._id}
                  post={post}
                  user={user}
                  deletePost={handleDeletePost}
                  likePost={handleLikePost}
                  reportPost={handleReportPost}
                />
              ))
            ) : (
              <div className='flex items-center justify-center w-full h-full'>
                <p className='text-lg text-ascent-2'>No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className='hidden w-1/4 h-[100%] lg:flex flex-col gap-3 overflow-y-auto'>
            {/* Activities */}
            <div className='flex-1 px-5 py-5 mb-1 overflow-y-auto rounded-lg shadow-sm bg-primary' style={{ maxHeight: '300px' }}>
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

              <div className='flex flex-col w-full gap-4 pt-4'>
                {faculties
                  .find((faculty) => faculty._id === selectedFaculty) // Tìm khoa được chọn
                  ?.activities.map((activity) => ( // Hiển thị activities của khoa được chọn
                    <div key={activity.id} className='flex flex-col'>
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
                        className='object-cover w-full h-48 rounded-md'
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
                      />
                      <CustomButton
                        title='Deny'
                        containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGESTED FRIENDS */}
            <div className='flex-1 px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary' style={{ maxHeight: '300px' }}>
              <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                <span>Gợi Ý Kết Bạn</span>
              </div>
              <div className='flex flex-col w-full gap-4 pt-4'>
                {suggestedFriends?.map((friend) => (
                  <div
                    className='flex items-center justify-between'
                    key={friend._id}
                  >
                    <Link
                      to={"/profile/" + friend?._id}
                      key={friend?._id}
                      className='flex items-center w-full gap-4 cursor-pointer'
                    >
                      <img
                        src={friend?.profileUrl ?? NoProfile}
                        alt={friend?.firstName}
                        className='object-cover w-10 h-10 rounded-full'
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

      {edit && <EditProfile />}
    </>
  );
};

export default Home;
