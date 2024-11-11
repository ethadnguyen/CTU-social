import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
} from "../components";
import { profile } from "../assets/profile";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import {
  MdOutlineFileUpload,
  MdDeleteForever,
  MdDeleteOutline,
} from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import {
  getSavedPosts,
  getUserPosts,
  likePost,
  reportPost,
  updatePost,
} from "./../redux/postSlice";
import io from "socket.io-client";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { UpdateUser } from '../redux/userSlice';
import slugify from 'slugify';
import socket from '../api/socket';

const Profile = () => {
  const { id } = useParams();
  const { user, edit } = useSelector((state) => state.user);
  const { userPosts, savedPosts } = useSelector((state) => state.posts);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedTags, setExpandedTags] = useState({});
  const [tags, setTags] = useState([]);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id === user._id) {
      setUserInfo(user);
    } else {
      setLoading(true);
      axiosInstance.get(`/users/get-user/${id}`).then((res) => {
        setUserInfo(res.data.user);
        setLoading(false);
      });
    }
    dispatch(getUserPosts(id));
    dispatch(getSavedPosts(id));
  }, [dispatch, id, user]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get(`/users/tags/${id}`);
        setTags(res.data.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, [id]);

  const handleDeletePost = async (postId) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa bài viết này?',
        text: 'Bài viết sẽ bị xóa vĩnh viên',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        await axiosInstance.delete(`/posts/${postId}`);
        dispatch(getPosts());
        Swal.fire('Xóa thành công', 'Bạn đã xóa bài viết thành công!', 'success');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      Swal.fire('Xóa thất bại', 'Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  };

  const handleLikePost = async (post) => {
    const postId = post._id;
    const userId = user._id;
    const senderName = `${user.firstName} ${user.lastName}`;
    const receiverIds = [post.user._id];

    try {

      const alreadyLiked = post.likedBy.includes(userId);
      await dispatch(likePost(postId));

      const updatedPost = {
        ...post, likedBy: alreadyLiked ? post.likedBy.filter(id => id !== userId)
          : [...post.likedBy, userId], likes: alreadyLiked ? post.likes - 1 : post.likes + 1
      };

      dispatch(updatePost(updatedPost));


      if (!alreadyLiked && !receiverIds.includes(userId)) {
        const response = await axiosInstance.post('/users/create-notification', {
          receiverIds,
          sender: user._id,
          message: `${senderName} đã thích bài viết của bạn`,
          type: 'like',
          link: `/posts/${postId}`,
        });

        if (response.status === 201) {
          socket.emit('sendNotification', { notification: response.data.notification, receiverId: post.user._id });
        }
      }
    } catch (error) {
      console.log(error);
      console.error('Error liking post:', error);
    }
  };

  const handleReportPost = async (post) => {
    try {
      await dispatch(reportPost(post._id));
      // const updatedPosts = posts.map((p) => {
      //   if (p._id === postId) {
      //     const hasReported = p.reportedBy.includes(user._id);
      //     return {
      //       ...p,
      //       reports: hasReported ? p.reports - 1 : p.reports + 1,
      //       reportedBy: hasReported
      //         ? p.reportedBy.filter(id => id !== user._id)
      //         : [...p.reportedBy, user._id],
      //     }
      //   }
      //   return p;
      // });
      // dispatch(updatePosts(updatedPosts));
      const updatedPost = {
        ...post, reports: post.reportedBy.includes(user._id)
          ? post.reports - 1
          : post.reports + 1, reportedBy: post.reportedBy.includes(user._id)
            ? post.reportedBy.filter(id => id !== user._id)
            : [...post.reportedBy, user._id]
      };
      dispatch(updatePost(updatedPost));
      toast.success(`Đã ${post.reportedBy.includes(user._id) ? 'bỏ' : ''} báo cáo bài viết thành công!`);
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  const toggleTag = (tagId) => {
    setExpandedTags((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
  };

  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCreateGroupClick = () => {
    if (showCreateGroupForm === false) setShowCreateGroupForm(true);
    else setShowCreateGroupForm(false);
  };

  const handleCreateGroup = async (data) => {
    console.log("Tên nhóm:", data.name);
    console.log("Mục đích:", data.description);
    try {
      const res = await axiosInstance.post("/users/group-request", {
        name: data.name,
        description: data.description,
      });

      socket.emit('groupRequest', res.data.groupRequest);
      toast.success("Yêu cầu tạo nhóm đã được gửi!");
      setShowCreateGroupForm(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response.data.message);
    }
    reset();
  };

  const [showAddTagForm, setShowAddTagForm] = useState(false);

  const {
    register: registerTag,
    handleSubmit: handleSubmitTag,
    reset: resetTag,
    formState: { errors: tagErrors },
  } = useForm();

  const handleAddTagClick = () => {
    setShowAddTagForm(!showAddTagForm);
  };

  const handleAddTag = async (data) => {
    if (data.tagName !== null) {
      console.log("Tên thẻ:", data.tagName);
      const res = await axiosInstance.post("/users/tags", {
        name: data.tagName,
      });

      setTags((prev) => [...prev, res.data.tag]);
      resetTag();
      setShowAddTagForm(false);
      toast.success("Thêm thẻ thành công!");
    } else {
      toast.error("Vui lòng nhập tên thẻ!");
    }
  };

  const handleDeleteTag = (tagId) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa thẻ này?',
      text: 'Bạn sẽ không thể hoàn tác hành động này!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/tags/${tagId}`);
          toast.success('Xóa thẻ thành công!');
        } catch (error) {
          console.error('Error deleting tag:', error);
          toast.error('Xóa thẻ thất bại!');
        }
      }
    });
  };

  const handleUploadFile = async (tagId) => {
    const files = fileInputRef.current.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const sanitizedFileName = slugify(files[i].name, {
        replacement: '_',
        lower: true,
        strict: true,
        locale: 'vi'
      });

      const fileCopy = new File([files[i]], sanitizedFileName, { type: files[i].type });
      formData.append('tags', fileCopy);
    }


    try {
      const res = await axiosInstance.post(`/users/tags/${tagId}/files`, formData);

      const updatedTags = tags.map((tag) => { return tag._id === tagId ? { ...tag, files: [...tag.files, ...res.data.files] } : tag });
      // setTags([...tags, res.data.tag]);
      setTags(updatedTags);
      toast.success('Tải lên tệp thành công!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Lỗi khi tải lên tệp!');
    }

  };

  const handleDeleteFile = async (tagId, fileId) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa tệp này?',
      text: 'Bạn sẽ không thể hoàn tác hành động này!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosInstance.delete(`/users/tags/${tagId}/files/${fileId}`);
          const updatedTags = tags.map((tag) => { return tag._id === tagId ? { ...tag, files: tag.files.filter(file => file.id !== fileId) } : tag });
          setTags(updatedTags);
          toast.success('Xóa tệp thành công!');
        } catch (error) {
          toast.error('Lỗi khi xóa tệp!');
          console.error('Error deleting file:', error);
        }
      }
    });
  };

  return (
    <>
      <div className="w-full h-[89vh] px-0 pb-1 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        {/* <TopBar /> */}
        <div className="flex w-full h-full pt-5">
          {/* LEFT */}
          <div className="flex-col h-full hidden w-1/3 gap-4 overflow-y-auto lg:w-1/4 md:flex">
            <ProfileCard user={userInfo} />
            <FriendsCard friends={userInfo?.friends} />

            <div className="block lg:hidden">
              <FriendsCard friends={userInfo?.friends} />
            </div>
          </div>

          {/* CENTER */}
          <div className="flex flex-col flex-1 h-full px-4 overflow-y-auto bg-orimary">
            {loading ? (
              <Loading />
            ) : (
              <>
                <div className="flex flex-col gap-6 lg:hidden">
                  <ProfileCard user={userInfo} />
                </div>

                <div className="">
                  {user?._id === id && (
                    <div className="flex justify-between mb-1 shadow-sm bg-bgColor text-ascent-1">
                      <button
                        className={`w-full rounded-xl bg-primary  ${!showSavedPosts ? "bg-sky text-white" : ""}`}
                        onClick={() => setShowSavedPosts(false)}
                      >
                        Bài đăng
                      </button>

                      <button
                        className={`w-full rounded-xl bg-primary  ${showSavedPosts ? "bg-sky text-white" : ""}`}
                        onClick={() => setShowSavedPosts(true)}
                      >
                        Bài đăng đã lưu
                      </button>
                    </div>
                  )}

                  {userPosts?.length > 0 && !showSavedPosts ? (
                    userPosts?.map((post) => (
                      <PostCard
                        post={post}
                        key={post?._id}
                        user={user}
                        deletePost={handleDeletePost}
                        likePost={handleLikePost}
                        reportPost={handleReportPost}
                      />
                    ))
                  ) : showSavedPosts && savedPosts?.length > 0 ? (
                    savedPosts.map((savedPost) => (
                      <PostCard
                        post={savedPost}
                        key={savedPost?._id}
                        user={user}
                        deletePost={handleDeletePost}
                        likePost={handleLikePost}
                      />
                    ))
                  ) : showSavedPosts ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <p className="text-lg text-ascent-2">
                        Chưa có bài viết đã lưu
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      {user?._id === id ? (
                        <p className="text-lg text-ascent-2">
                          Chưa có bài viết nào. Hãy tạo bài đăng nào!
                        </p>
                      ) : (
                        <p className="text-lg text-ascent-2">
                          Người dùng chưa có bài viết nào
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex-col hidden w-1/4 h-full gap-3 overflow-y-auto lg:flex">
            <div className="flex-1 px-5 py-5 mb-1 overflow-y-auto rounded-lg shadow-sm bg-primary">
              <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
                <span>Tài liệu</span>
                {user._id === id && (
                  <CustomButton
                    title="Thêm thẻ"
                    containerStyles="text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
                    onClick={handleAddTagClick}
                  />
                )}
              </div>

              {/* Form thêm thẻ */}
              <div className="sticky top-0 z-10 bg-primary">
                {" "}
                {/* Add sticky positioning here */}
                {showAddTagForm && (
                  <form
                    onSubmit={handleSubmitTag(handleAddTag)}
                    className="mt-4 border-b border-[#66666645]"
                  >
                    <div className="mb-2">
                      <label
                        htmlFor="tagName"
                        className="block text-sm font-medium text-ascent-1"
                      >
                        Tên thẻ:
                      </label>
                      <div className="flex items-center">
                        <div className="flex-grow mr-2">
                          <input
                            type="text"
                            id="tagName"
                            {...registerTag("tagName", {
                              required: "Vui lòng nhập tên thẻ",
                            })}
                            className="mt-1 p-2 w-full border text-ascent-1 rounded-md bg-secondary"
                          />
                        </div>
                        <button
                          type="submit"
                          className="hover:bg-sky hover:text-white text-ascent-1 font-bold rounded"
                        >
                          <IoMdAddCircleOutline className="size-10" />
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {tags.map((tag) => (
                <div key={tag._id}>
                  <div className="flex items-center justify-between cursor-pointer">
                    <div
                      onClick={() => toggleTag(tag._id)}
                      className="flex items-center cursor-pointer text-ascent-1"
                    >
                      <h4>{tag.name}</h4>
                      {expandedTags[tag._id] ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </div>
                    {user._id === id && (
                      <div className="flex items-center">
                        <MdDeleteForever className="ml-2 size-5 text-ascent-1" onClick={handleDeleteTag} />
                        <MdOutlineFileUpload className="ml-2 size-5 text-ascent-1" onClick={handleUploadClick} />
                        <input type='file' id='file-input' className='hidden' ref={fileInputRef} onChange={() => handleUploadFile(tag._id)} />
                      </div>
                    )}
                  </div>
                  {expandedTags[tag._id] && (
                    <ul>
                      {tag.files.map((file, idx) => (
                        <li
                          key={file.id}
                          className="flex items-center hover:bg-gray"
                        >
                          <div className="w-[90%]">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky hover:underline break-all"
                            >
                              {/* {file.url.split("/").pop()} */}
                              {file?.name}
                            </a>
                          </div>
                          <MdDeleteOutline className="ml-2 size-5 text-ascent-1" onClick={() => handleDeleteFile(file.id)} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary">
              <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
                <span>Nhóm</span>
                {user._id === id && (
                  <CustomButton
                    title="Tạo nhóm"
                    containerStyles="text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
                    onClick={handleCreateGroupClick}
                  />
                )}
              </div>

              {showCreateGroupForm && (
                <div className="mt-4 border-b border-[#66666645]">
                  {/* Form tạo nhóm */}
                  <form onSubmit={handleSubmit(handleCreateGroup)}>
                    <div className="mb-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-ascent-1"
                      >
                        Tên nhóm:
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name", {
                          required: "Vui lòng nhập tên nhóm",
                        })}
                        className="mt-1 p-2 w-full border text-ascent-1 rounded-md bg-secondary"
                      />
                      {errors.name && (
                        <span className="text-red-500 text-sm">
                          {errors.name.message}
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-ascent-1"
                      >
                        Mục đích:
                      </label>
                      <textarea
                        id="description"
                        {...register("description")}
                        className="mt-1 p-2 w-full border text-ascent-1 rounded-md bg-secondary"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-sky w-full hover:bg-blue text-white font-bold mb-2 py-2 px-4 rounded"
                    >
                      Tạo nhóm
                    </button>
                  </form>
                </div>
              )}

              {user.groups?.length > 0
                ? user.groups?.map((group) => (
                  <div
                    className="rounded-md flex flex-col bg-primary py-3 px-3"
                    key={group._id}
                  >
                    <div className="relative">
                      <img
                        src={group?.banner === '' ? "../src/assets/empty.jpg" : group?.banner}
                        alt={group?.name}
                        className="object-cover rounded-md w-full h-20"
                      />
                      <Link
                        to={"/group/" + group?._id}
                        className="flex absolute h-20 w-full top-0"
                      >
                        <div className="flex-grow flex flex-col justify-center bg-secondary bg-opacity-70 hover:opacity-0 transition-opacity duration-300">
                          <p className="ml-1 text-lg font-medium text-ascent-1">
                            {group?.name}
                          </p>
                          <p className="ml-1 text-base text-ascent-2">
                            {group?.description
                              ?.split(" ")
                              .slice(0, 30)
                              .join(" ") +
                              (group?.description?.split(" ").length > 30
                                ? "..."
                                : "")}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))
                : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-lg text-ascent-2">Không có nhóm nào</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      {edit && <EditProfile />}
    </>
  );
};

export default Profile;
