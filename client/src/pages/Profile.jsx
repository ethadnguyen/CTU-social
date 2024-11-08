import React, { useEffect, useState } from "react";
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
} from "./../redux/postSlice";
import io from "socket.io-client";
import axiosInstance from "../api/axiosConfig";
import { toast } from "react-toastify";

const Profile = () => {
  const { id } = useParams();
  const { user, edit } = useSelector((state) => state.user);
  const { userPosts, savedPosts } = useSelector((state) => state.posts);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedTags, setExpandedTags] = useState({});
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [showSavedPosts, setShowSavedPosts] = useState(false);

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
  }, [id, user]);

  useEffect(() => {
    dispatch(getUserPosts(id));
    dispatch(getSavedPosts(id));
  }, [dispatch, id]);

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      dispatch(getUserPosts(user._id));
      toast.success("Xóa bài viết thành công!");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLikePost = async (post) => {
    const postId = post._id;
    const userId = user._id;
    const socket = io("http://localhost:5000");

    try {
      await dispatch(likePost(postId));
      await dispatch(getUserPosts(user._id));
      socket.emit("likePost", { userId, postId });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleReportPost = async (post) => {
    const socket = io("http://localhost:5000");
    const postId = post._id;
    try {
      await dispatch(reportPost(postId));
      await dispatch(getUserPosts(user._id));
      socket.emit("reportPost", { id: postId, reportedBy: user._id });
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const toggleTag = (tagId) => {
    setExpandedTags((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
  };

  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);

  const handleCreateGroupClick = () => {
    if (showCreateGroupForm === false) setShowCreateGroupForm(true);
    else setShowCreateGroupForm(false);
  };

  const handleCreateGroup = (data) => {
    console.log("Tên nhóm:", data.name);
    console.log("Mục đích:", data.description);
    // ... logic xử lý tạo nhóm ...

    // Reset form fields after submission
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

  const handleAddTag = (data) => {
    if (data.tagName !== null) {
      console.log("Tên thẻ:", data.tagName);
      // ... logic xử lý thêm thẻ ...

      // Reset form fields after submission
      resetTag();
      setShowAddTagForm(false);
    }
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
                      <p className="text-lg text-ascent-2">
                        Chưa có bài viết nào. Hãy tạo bài đăng nào!
                      </p>
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

              {profile.tags.map((tag) => (
                <div key={tag.id}>
                  <div className="flex items-center justify-between cursor-pointer">
                    <div
                      onClick={() => toggleTag(tag.id)}
                      className="flex items-center cursor-pointer text-ascent-1"
                    >
                      <h4>{tag.name}</h4>
                      {expandedTags[tag.id] ? (
                        <ChevronUpIcon className="w-5 h-5" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                      )}
                    </div>
                    {user._id === id && (
                      <div className="flex items-center">
                        <MdDeleteForever className="ml-2 size-5 text-ascent-1" />
                        <MdOutlineFileUpload className="ml-2 size-5 text-ascent-1" />
                      </div>
                    )}
                  </div>
                  {expandedTags[tag.id] && (
                    <ul>
                      {tag.files.map((file) => (
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
                              {file.url.split("/").pop()}
                            </a>
                          </div>
                          <MdDeleteOutline className="ml-2 size-5 text-ascent-1" />
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

              {profile.user.groups?.length > 0
                ? profile.user.groups?.map((group) => (
                    <div
                      className="rounded-md flex flex-col bg-primary py-3 px-3"
                      key={group.id}
                    >
                      <div className="relative">
                        <img
                          src={group?.banner ?? "../src/assets/empty.jpg"}
                          alt={group?.name}
                          className="object-cover rounded-md w-full h-20"
                        />
                        <Link
                          to={"/group/" + group?.id}
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
                : showGroups && (
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
