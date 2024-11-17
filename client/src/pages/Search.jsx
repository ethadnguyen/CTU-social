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
import {
  Link,
  useParams,
  useLocation,
  ScrollRestoration,
} from "react-router-dom";
import { NoProfile } from "../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { EmptyImage } from '../assets';
import axiosInstance from "../api/axiosConfig";
import {
  getPosts,
  likePost,
  reportPost,
  updatePost,
} from "../redux/postSlice";
import { toast } from "react-toastify";
import { getUsersByQuery, UpdateUser, updateUser } from "../redux/userSlice";
import { fetchFaculties } from "../redux/facultySlice";
import Swal from "sweetalert2";
import socket from '../api/socket';
import { getGroupsByQuery } from '../redux/groupSlice';

const Search = () => {
  const { user, users, edit } = useSelector((state) => state.user);
  const { faculties } = useSelector((state) => state.faculty);
  const { groups } = useSelector((state) => state.group);
  const posts = useSelector((state) => state.posts.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);


  const dispatch = useDispatch();
  const location = useLocation();

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("search");
  }

  const searchQuery = getQueryParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const getFriendSuggestions = async () => {
      try {
        const res = await axiosInstance.get("/users/friend-suggestions");
        setSuggestedFriends(res.data.users);
      } catch (error) {
        console.error("Error getting friend suggestions:", error);
      }
    };

    getFriendSuggestions();
  }, []);

  useEffect(() => {
    dispatch(getPosts(searchQuery));
    dispatch(getUsersByQuery(searchQuery));
    dispatch(getGroupsByQuery(searchQuery));
  }, [dispatch, searchQuery]);

  useEffect(() => {
    const getFriendRequests = async () => {
      try {
        const res = await axiosInstance.get("/users/friend-requests");
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
      console.error('Error liking post:', error);
    }
  };

  const handleReportPost = async (post) => {
    try {
      await dispatch(reportPost(post._id));
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
      console.error("Error reporting post:", error);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const res = await axiosInstance.post("/users/friend-request", {
        requestTo: userId,
      });
      if (res.status === 201) {
        toast.success('Đã gửi yêu cầu kết bạn!');
        dispatch(UpdateUser(res.data.user));
        setSuggestedFriends((prevFriends) => prevFriends.filter((friend) => friend._id !== userId));
        const notiRes = await axiosInstance.post("/users/create-notification", {
          receiverIds: [userId],
          sender: user._id,
          type: "friendRequest",
          message: `${user?.firstName} ${user?.lastName} đã gửi yêu cầu kết bạn!`,
          link: `/profile/${user?._id}`,
        });

        if (notiRes.status === 201) {
          socket.emit('sendNotification', {
            notification: notiRes.data.notification,
            receiverId: userId,
          });
          socket.emit('friendRequest', {
            userId,
            request: res.data.request,
          });
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const res = await axiosInstance.post("/users/accept-request", {
        requestId,
        status: "ACCEPTED",
      });
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
      setFriendRequest((prevRequests) =>
        prevRequests.filter((req) => req._id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const [showUsers, setShowUsers] = useState(false);
  const [showPosts, setShowPosts] = useState(true);
  const [showGroups, setShowGroups] = useState(false);

  return (
    <>
      <div className="w-full h-screen px-0 pb-20 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        <div className="flex w-full h-full gap-2 pt-5 pb-10 lg:gap-4">
          {/* LEFT */}
          <div className="flex-col hidden w-1/3 h-full gap-3 overflow-y-auto lg:w-1/4 md:flex">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex flex-col flex-1 h-full gap-6 px-4 overflow-y-auto rounded-lg">
            <div className="flex justify-between h-fix shadow-sm rounded-xl text-ascent-1">
              <div
                className={`flex justify-center w-1/2 h-full mb-2 border rounded-xl bg-primary ${showPosts ? "bg-sky" : ""
                  }`}
              >
                <button
                  className="w-full"
                  onClick={() => {
                    setShowUsers(false);
                    setShowPosts(true);
                    setShowGroups(false);
                  }}
                >
                  Bài đăng
                </button>
              </div>
              <div
                className={`flex justify-center w-1/2 h-full mb-2 border rounded-xl bg-primary ${showUsers ? "bg-sky" : ""
                  }`}
              >
                <button
                  className="w-full"
                  onClick={() => {
                    setShowUsers(true);
                    setShowPosts(false);
                    setShowGroups(false);
                  }}
                >
                  Người dùng
                </button>
              </div>
              <div
                className={`flex justify-center w-1/2 h-full mb-2 border rounded-xl bg-primary ${showGroups ? "bg-sky" : ""
                  }`}
              >
                <button
                  className="w-full"
                  onClick={() => {
                    setShowUsers(false);
                    setShowPosts(false);
                    setShowGroups(true);
                  }}
                >
                  Nhóm
                </button>
              </div>
            </div>

            {showPosts && posts?.length > 0
              ? posts?.map((post) => (
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

            {showUsers && users?.length > 0
              ? users?.map((user) => (
                <div key={user._id} className="rounded-md flex flex-col bg-primary py-3 px-3">
                  <Link to={"/profile/" + user?._id} className="flex gap-2">
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
                        {user?.faculty?.name} - {user?.major?.majorName}
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

            {showGroups && groups?.length > 0
              ? groups?.map((group) => (
                <div
                  className="rounded-md flex flex-col bg-primary py-3 px-3"
                  key={group._id}
                >
                  <div className="relative">
                    <img
                      src={group?.banner === '' ? EmptyImage : group?.banner}
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
              : showGroups && (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="text-lg text-ascent-2">Không có nhóm nào</p>
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
                        title="Chấp nhận"
                        containerStyles="bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full"
                        onClick={() => handleAcceptFriendRequest(_id)}
                      />
                      <CustomButton
                        title="Từ chối"
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
                        src={friend?.avatar ?? NoProfile}
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
                        onClick={() => handleAddFriend(friend._id)}
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
