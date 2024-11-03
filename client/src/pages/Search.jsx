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
import { Posts, Users } from "../assets/home";
import { Link, useParams, useLocation, ScrollRestoration } from "react-router-dom";
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
import io from "socket.io-client";
import { toast } from "react-toastify";
import { updateUser } from "../redux/userSlice";
import { fetchFaculties } from "../redux/facultySlice";

const Search = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { faculties } = useSelector((state) => state.faculty);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState(suggest);
  const [errMsg, setErrMsg] = useState("");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { searchQuery } = useParams();

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
    const socket = io("http://localhost:5000");
    socket.emit("joinUser", user);
  }, [user]);

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

  const [selectedFaculty, setSelectedFaculty] = useState("");

  useEffect(() => {
    if (user && user.faculty) {
      setSelectedFaculty(user.faculty._id);
    } else {
      setSelectedFaculty("");
    }
  }, [user]);

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      dispatch(getPosts());
      toast.success("Đã xóa bài viết thành công!");
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

      const updatedPosts = posts.map((p) => {
        if (p._id === postId) {
          // Kiểm tra xem user đã like bài viết hay chưa
          const hasLiked = p.likedBy.includes(userId);

          return {
            ...p,
            likes: hasLiked ? p.likes - 1 : p.likes + 1, // Tăng hoặc giảm số lượng like
            likedBy: hasLiked
              ? p.likedBy.filter((id) => id !== userId) // Bỏ userId nếu đã like
              : [...p.likedBy, userId], // Thêm userId nếu chưa like
          };
        }
        return p;
      });
      dispatch(updatePosts(updatedPosts));
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
    try {
      const res = await axiosInstance.post("/users/accept-request", {
        requestId,
        status: "ACCEPTED",
      });
      console.log("Accept friend request:", res.data);
      setFriendRequest((prevRequests) =>
        prevRequests.filter((req) => req._id !== requestId)
      );
      dispatch(updateUser(res.data.user));
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

  const [showUsers, setShowUsers] = useState(false);
  const [showPosts, setshowPosts] = useState(true);
  const [showGroups, setshowGroups] = useState(false);

  return (
    <>
      <div className="w-full h-screen px-0 pb-20 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        <TopBar friends={user?.friends} searchQuery={searchQuery} />

        <div className="flex w-full h-full gap-2 pt-5 pb-10 lg:gap-4">
          {/* LEFT */}
          <div className="flex-col hidden w-1/3 h-full gap-3 overflow-y-auto lg:w-1/4 md:flex">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex flex-col flex-1 h-full gap-6 px-4 overflow-y-auto rounded-lg">
            <div className="flex justify-between h-fix shadow-sm rounded-xl text-ascent-1">
              <div className={`flex justify-center w-1/2 h-full mb-2 border rounded-xl bg-primary ${showPosts ? 'bg-sky' : ''}`}>
                <button
                  className="w-full"
                  onClick={() => {
                    setShowUsers(false);
                    setshowPosts(true);
                    setshowGroups(false);
                  }}
                >
                  Bài đăng
                </button>
              </div>
              <div className={`flex justify-center w-1/2 h-full mb-2 border rounded-xl bg-primary ${showUsers ? 'bg-sky' : ''}`}>
                <button
                  className="w-full"
                  onClick={() => {
                    setShowUsers(true);
                    setshowPosts(false);
                    setshowGroups(false);
                  }}
                >
                  Người dùng
                </button>
              </div>
              <div className={`flex justify-center w-1/2 h-full mb-2 border rounded-xl bg-primary ${showGroups ? 'bg-sky' : ''}`}>
                <button
                  className="w-full"
                  onClick={() => {
                    setShowUsers(false);
                    setshowPosts(false);
                    setshowGroups(true);
                  }}
                >
                  Nhóm
                </button>
              </div>
            </div>

            {showPosts && Posts?.length > 0
              ? Posts?.map((post) => (
                  <PostCard
                    post={post}
                    key={post?._id}
                    user={user}
                    deletePost={handleDeletePost}
                    likePost={handleLikePost}
                    reportPost={handleReportPost}
                  />
                ))
              : showPosts && (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-lg text-ascent-2">
                      Không có bài viết nào
                    </p>
                  </div>
                )}

            {showUsers && Users?.length > 0
              ? Users?.map((user) => (
                  <div className="rounded-md flex flex-col bg-primary py-3 px-3">
                    <Link to={"/profile/" + user?.id} className="flex gap-2">
                      <img
                        src={user?.avatar ?? NoProfile}
                        alt={user?.email}
                        className="object-cover rounded-full w-14 h-14"
                      />

                      <div className="flex flex-col justify-center">
                        <p className="text-lg font-medium text-ascent-1">
                          {user?.lastName} {user?.firstName}
                        </p>
                        <p className="text-base text-ascent-2">
                          {user?.faculty} - {user?.major}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))
              : showUsers && (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-lg text-ascent-2">
                      Không có người dùng nào
                    </p>
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
                    <div key={activity.id} className="flex flex-col">
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
    </>
  );
};

export default Search;
