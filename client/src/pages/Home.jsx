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
import { Posts } from "../assets/home";
import { groups } from "../assets/groups";
import { Link, useLocation, ScrollRestoration } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { BiImages } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { CiFileOn } from "react-icons/ci";
import axiosInstance from "../api/axiosConfig";
import {
  getPosts,
  likePost,
  reportPost,
  updatePosts,
} from "../redux/postSlice";
import { FaFile } from "react-icons/fa6";
import { toast } from "react-toastify";
import { updateUser } from "../redux/userSlice";
import { fetchFaculties } from "../redux/facultySlice";
import Swal from "sweetalert2";
import socket, { connectSocket, disconnectSocket } from "../api/socket";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { faculties } = useSelector((state) => state.faculty);
  const [friendRequest, setFriendRequest] = useState([]);
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

  console.log("Posts:", posts);

  useEffect(() => {
    const getFriendRequests = async () => {
      try {
        const res = await axiosInstance.get("/users/friend-requests");
        console.log("Friend requests:", res.data.requests);
        setFriendRequest(res.data.requests);
      } catch (error) {
        console.error("Error getting friend requests:", error);
      }
    };

    getFriendRequests();
  }, []);

  useEffect(() => {
    dispatch(fetchFaculties());
  }, [dispatch]);

  const handlePostSubmit = async (data) => {
    if (selectedScope === "Groups") {
      console.log("đã chọn nhóm: ", selectedGroup);
      //logic đăng bài vào nhóm
    } else if (selectedScope === "Public") {
      const formData = new FormData();

      formData.append("userId", user._id);
      formData.append("content", data.content);
      formData.append("privacy", selectedScope.toLowerCase());

      images.forEach((image) => {
        formData.append("images", image);
      });

      files.forEach((file) => {
        formData.append("files", file);
      });

      try {
        setPosting(true);
        const post = await axiosInstance.post("/posts/create-post", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        reset();
        setImages([]);
        setFiles([]);
        setPosting(false);
        dispatch(getPosts());

        const res = await axiosInstance.post("/users/create-notification", {
          receiverIds: user.friends.map((friend) => friend._id),
          sender: user._id,
          message: `${user.firstName} ${user.lastName} đã tạo bài viết mới`,
          type: "post",
          link: `/posts/${post.data.post._id}`,
        });

        if (res.status === 201) {
          socket.emit("sendFriendsNotification", {
            userId: user._id,
            notification: res.data.notification,
          });
        }
      } catch (error) {
        reset();
        setImages([]);
        setFiles([]);
        setPosting(false);
        console.error("Error creating post:", error);
      }
    }
  };

  const [selectedScope, setSelectedScope] = useState("Public");
  const handleScopeChange = (event) => {
    setSelectedScope(event.target.value);
  };
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [choosingGroup, setChoosingGroup] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState("");

  useEffect(() => {
    if (selectedScope === "Groups") {
      setChoosingGroup(true);
    }
  }, [selectedScope]);

  useEffect(() => {
    if (user && user.faculty) {
      setSelectedFaculty(user.faculty._id);
    } else {
      setSelectedFaculty("");
    }
  }, [user]);

  const handleDeletePost = async (postId) => {
    try {
      const result = await Swal.fire({
        title: "Bạn có chắc muốn xóa bài viết này?",
        text: "Bài viết sẽ bị xóa vĩnh viên",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await axiosInstance.delete(`/posts/${postId}`);
        dispatch(getPosts());
        Swal.fire(
          "Xóa thành công",
          "Bạn đã xóa bài viết thành công!",
          "success"
        );
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Swal.fire("Xóa thất bại", "Có lỗi xảy ra, vui lòng thử lại", "error");
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
      const updatedPosts = posts.map((p) => {
        if (p._id === postId) {
          const hasLiked = p.likedBy.includes(userId);

          return {
            ...p,
            likes: hasLiked ? p.likes - 1 : p.likes + 1,
            likedBy: hasLiked
              ? p.likedBy.filter((id) => id !== userId)
              : [...p.likedBy, userId],
          };
        }
        return p;
      });
      dispatch(updatePosts(updatedPosts));

      if (!alreadyLiked && !receiverIds.includes(userId)) {
        const response = await axiosInstance.post(
          "/users/create-notification",
          {
            receiverIds,
            sender: user._id,
            message: `${senderName} đã thích bài viết của bạn`,
            type: "like",
            link: `/posts/${postId}`,
          }
        );

        if (response.status === 201) {
          socket.emit("sendNotification", response.data.notification);
        }
      }
    } catch (error) {
      console.log(error);
      console.error("Error liking post:", error);
    }
  };

  const handleReportPost = async (post) => {
    const socket = io("http://localhost:5000");
    const postId = post._id;
    try {
      await dispatch(reportPost(postId));
      const updatedPosts = posts.map((p) => {
        if (p._id === postId) {
          const hasReported = p.reportedBy.includes(user._id);
          return {
            ...p,
            reports: hasReported ? p.reports - 1 : p.reports + 1,
            reportedBy: hasReported
              ? p.reportedBy.filter((id) => id !== user._id)
              : [...p.reportedBy, user._id],
          };
        }
        return p;
      });
      dispatch(updatePosts(updatedPosts));
      toast.success(
        `Đã ${
          post.reportedBy.includes(user._id) ? "bỏ" : ""
        } báo cáo bài viết thành công!`
      );
      socket.emit("reportPost", { id: postId, reportedBy: user._id });
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    const senderName = `${user.firstName} ${user.lastName}`;
    try {
      const res = await axiosInstance.post("/users/accept-request", {
        requestId,
        status: "ACCEPTED",
      });
      setFriendRequest((prevRequests) =>
        prevRequests.filter((req) => req._id !== requestId)
      );
      dispatch(updateUser(res.data.user));

      const resNoti = await axiosInstance.post("/users/create-notification", {
        receiverId: res.data.friend._id,
        sender: user._id,
        message: `${senderName} đã chấp nhận lời mời kết bạn`,
        type: "accept",
        link: `/profile/${user._id}`,
      });

      if (resNoti.status === 201) {
        socket.emit("sendNotification", {
          ...resNoti.data.notification,
          senderName,
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      const res = await axiosInstance.post("/users/reject-request", {
        requestId,
        status: "REJECTED",
      });
      console.log("Reject friend request:", res.data);
      setFriendRequest((prevRequests) =>
        prevRequests.filter((req) => req._id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <>
      <div className="w-full h-[89vh] px-0 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        {/* <TopBar friends={user?.friends} /> */}

        <div className="flex w-full h-full gap-2 pt-5 pb-1 lg:gap-4">
          {/* LEFT */}
          <div className="flex-col hidden w-1/3 h-full gap-3 overflow-y-auto lg:w-1/4 md:flex">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex flex-col flex-1 h-full gap-6 px-4 overflow-y-auto rounded-lg">
            <form
              onSubmit={handleSubmit(handlePostSubmit)}
              className="px-4 rounded-lg bg-primary"
            >
              <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
                <img
                  src={user?.avatar ?? NoProfile}
                  alt="User Image"
                  className="object-cover rounded-full w-14 h-14"
                />
                <TextInput
                  styles="w-full rounded-full py-5"
                  placeholder="Bạn đang suy nghĩ điều gì...."
                  name="content"
                  register={register("content", {
                    required: "Hãy nhập nội dung bài viết",
                  })}
                  error={errors.content ? errors.content.message : ""}
                />
              </div>

              {images.length > 0 && (
                <div className="flex gap-2 py-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="object-cover w-24 h-24 rounded-lg"
                      />
                      <button
                        className="absolute top-0 right-0 p-1 font-bold bg-red-500 rounded-full text-red"
                        onClick={() => {
                          setImages((prevImages) =>
                            prevImages.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="flex gap-2 py-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative flex items-center p-2 bg-gray-100 rounded-lg"
                    >
                      <FaFile className="mr-2 text-white" />
                      <span className="flex-1 overflow-hidden text-blue">
                        {file.name}
                      </span>
                      <button
                        className="absolute top-0 right-0 p-1 font-bold text-white bg-red-500 rounded-full"
                        onClick={() => {
                          setFiles((prevFiles) =>
                            prevFiles.filter((_, i) => i !== index)
                          );
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
                  role="alert"
                  className={`text-sm ${
                    errMsg?.status === "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-0.5`}
                >
                  {errMsg?.message}
                </span>
              )}

              <div className="flex items-center justify-between py-4">
                <label
                  htmlFor="imgUpload"
                  className="flex items-center gap-1 text-base cursor-pointer text-ascent-2 hover:text-ascent-1"
                >
                  <input
                    type="file"
                    multiple
                    name="images"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setImages((prevImages) => [...prevImages, ...files]);
                    }}
                    className="hidden"
                    id="imgUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg"
                  />
                  <BiImages />
                  <span>Image</span>
                </label>

                <label
                  className="flex items-center gap-1 text-base cursor-pointer text-ascent-2 hover:text-ascent-1"
                  htmlFor="videoUpload"
                >
                  <input
                    type="file"
                    multiple
                    name="files"
                    data-max-size="5120"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setFiles((prevFiles) => [...prevFiles, ...files]);
                    }}
                    className="hidden"
                    id="videoUpload"
                    accept="*"
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
                      type="submit"
                      title="Post"
                      containerStyles="bg-blue hover:bg-sky text-white py-1 px-6 rounded-full font-semibold text-sm"
                    />
                  )}
                </div>
              </div>
              <div className="flex w-full mb-2 items-center">
                {/* Container for button and group name */}
                {selectedScope === "Groups" && (
                  <button
                    onClick={() => setChoosingGroup(true)}
                    className="bg-gray text-white hover:text-gray hover:bg-primary rounded-md px-1"
                    type="button"
                  >
                    Chọn nhóm
                  </button>
                )}
                {selectedScope === "Groups" && (
                  <div className="rounded-md flex flex-col w-full bg-primary py-3 px-3 mb-2 hover:bg-gray-100">
                    {selectedGroup ? ( // Display selected group if available
                      <div className="rounded-md flex flex-col bg-primary py-3 px-3">
                        <div className="relative">
                          <img
                            src={
                              selectedGroup?.banner ?? "../src/assets/empty.jpg"
                            }
                            alt={selectedGroup?.name}
                            className="object-cover rounded-md w-full h-20"
                          />
                          <div className="flex absolute h-20 w-full top-0">
                            <div className="flex-grow flex flex-col justify-center bg-secondary bg-opacity-70 hover:opacity-0 transition-opacity duration-300">
                              <p className="ml-1 text-lg font-medium text-ascent-1">
                                {selectedGroup?.name}
                              </p>
                              <p className="ml-1 text-base text-ascent-2">
                                {selectedGroup?.description
                                  ?.split(" ")
                                  .slice(0, 30)
                                  .join(" ") +
                                  (selectedGroup?.description?.split(" ")
                                    .length > 30
                                    ? "..."
                                    : "")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red">Bạn chưa chọn nhóm!</p>
                    )}
                  </div>
                )}
              </div>
            </form>

            {loading ? (
              <Loading />
            ) : Posts?.length > 0 ? (
              Posts?.map((post) => (
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
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-lg text-ascent-2">No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="hidden w-1/4 h-[100%] lg:flex flex-col gap-3 overflow-y-auto">
            {/* Activities */}
            <div
              className="flex-1 px-5 py-5 mb-1 overflow-y-auto rounded-lg shadow-sm bg-primary"
              style={{ maxHeight: "300px" }}
            >
              <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
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

              <div className="flex flex-col w-full gap-4 pt-4">
                {faculties
                  .find((faculty) => faculty._id === selectedFaculty)
                  ?.activities.map((activity) => (
                    <div key={activity._id} className="flex flex-col">
                      <a
                        href={activity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-ascent-1 hover:underline"
                      >
                        {activity.title}
                      </a>
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="object-cover w-full h-48 rounded-md"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* FRIEND REQUEST */}
            <div
              className="flex-1 px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary"
              style={{ maxHeight: "300px" }}
            >
              <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
                <span>Yêu Cầu Kết Bạn</span>
                <span>{friendRequest?.length}</span>
              </div>

              <div className="flex flex-col w-full gap-4 pt-4">
                {friendRequest?.map(({ _id, requestFrom: from }) => (
                  <div key={_id} className="flex items-center justify-between">
                    <Link
                      to={"/profile/" + from._id}
                      className="flex items-center w-full gap-4 cursor-pointer"
                    >
                      <img
                        src={from?.avatar ?? NoProfile}
                        alt={from?.firstName}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-base font-medium text-ascent-1">
                          {from?.firstName} {from?.lastName}
                        </p>
                      </div>
                    </Link>

                    <div className="flex gap-1">
                      <CustomButton
                        title="Accept"
                        containerStyles="bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full"
                        onClick={() => handleAcceptFriendRequest(_id)}
                      />
                      <CustomButton
                        title="Deny"
                        containerStyles="border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full"
                        onClick={() => handleRejectFriendRequest(_id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGESTED FRIENDS */}
            <div
              className="flex-1 px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary"
              style={{ maxHeight: "300px" }}
            >
              <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                <span>Gợi Ý Kết Bạn</span>
              </div>
              <div className="flex flex-col w-full gap-4 pt-4">
                {suggestedFriends?.map((friend) => (
                  <div
                    className="flex items-center justify-between"
                    key={friend._id}
                  >
                    <Link
                      to={"/profile/" + friend?._id}
                      key={friend?._id}
                      className="flex items-center w-full gap-4 cursor-pointer"
                    >
                      <img
                        src={friend?.profileUrl ?? NoProfile}
                        alt={friend?.firstName}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 ">
                        <p className="text-base font-medium text-ascent-1">
                          {friend?.firstName} {friend?.lastName}
                        </p>
                      </div>
                    </Link>

                    <div className="flex gap-1">
                      <button
                        className="bg-[#0444a430] text-sm text-white p-1 rounded"
                        onClick={() => {}}
                      >
                        <BsPersonFillAdd size={20} className="text-[#0f52b6]" />
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

      {choosingGroup && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setChoosingGroup(false)}
            >
              <div className="absolute inset-0 bg-black opacity-70"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              className="inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 h-[35rem] overflow-y-auto">
                <div className="border-b border-[#66666645]">
                  <h3
                    className="text-lg leading-6 font-medium text-ascent-1 mb-3"
                    id="modal-headline"
                  >
                    Chọn Nhóm
                  </h3>
                </div>

                {groups?.length > 0 ? (
                  <div className="mt-4">
                    {groups?.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-md flex flex-col bg-primary py-3 px-3 mb-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSelectedGroup(group);
                          setChoosingGroup(false);
                        }}
                      >
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
                            <div
                              className="flex absolute h-20 w-full top-0"
                              onClick={() => setSelectedGroup(group)}
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-lg text-ascent-2">Không có nhóm nào</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setChoosingGroup(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
