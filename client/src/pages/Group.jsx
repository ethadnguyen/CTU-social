import { React, useState, useEffect, useRef } from "react";
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
import { Link, useLocation, ScrollRestoration, useParams } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsPersonFillAdd } from "react-icons/bs";
import { SiVerizon } from "react-icons/si";
import { FaDeleteLeft } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import axiosInstance from "../api/axiosConfig";
import {
  getGroupPosts,
  getPosts,
  likePost,
  reportPost,
  updatePost,
  updatePosts,
} from "../redux/postSlice";
import { toast } from "react-toastify";
import { updateUser } from "../redux/userSlice";
import { fetchFaculties } from "../redux/facultySlice";
import Swal from "sweetalert2";
import socket, { connectSocket, disconnectSocket } from "../api/socket";

const Group = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { faculties } = useSelector((state) => state.faculty);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState(suggest);
  const [errMsg, setErrMsg] = useState("");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const { id: groupId } = useParams();

  const groupPosts = useSelector((state) => state.posts.posts);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const getGroup = async () => {
      try {
        const res = await axiosInstance.get(`/group/${groupId}`);
        console.log("Group:", res.data.group);
        setGroup(res.data.group);
      } catch (error) {
        console.error("Error getting group:", error);
      }
    };

    getGroup();
  }, [groupId]);

  useEffect(() => {
    dispatch(getGroupPosts(groupId));
  }, [dispatch, groupId]);

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

  console.log('group', group);
  console.log("Group posts:", groupPosts);

  useEffect(() => {
    dispatch(fetchFaculties());
  }, [dispatch]);

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

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      submitBanner(file);
    }
  };

  const submitBanner = (file) => {
    console.log("submit banner", file);
    // Thực hiện các thao tác upload file ở đây
    // ...
  };

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(group?.description);
  const textAreaRef = useRef(null); // Create a ref for the textarea

  const handleEditDescriptionClick = () => {
    setIsEditingDescription(true);
    // Focus on the textarea after it renders
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 0);
  };

  const handleDescriptionChange = (event) => {
    setEditedDescription(event.target.value);
  };

  const handleSaveDescription = async () => {
    console.log("Nội dung mô tả đã sửa:", editedDescription);

    // Update the group description in the UI
    group.description = editedDescription;

    // Hide the input field
    setIsEditingDescription(false);
  };

  return (
    <>
      <div className="w-full h-[89vh] px-0 pb-20 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        {/* <TopBar friends={user?.friends} /> */}
        <div className="relative">
          <img
            src={group?.banner === '' ? "../src/assets/empty.jpg" : group?.banner}
            alt="Banner"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-0 left-0 w-full h-48 flex items-center justify-between bg-black bg-opacity-50 rounded-t-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="rounded-xl bg-gray">
              <span className="text-white font-bold text-lg px-4">
                {group?.name}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <div></div>
            {user._id === group?.owner._id && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-sky hover:bg-blue text-white font-bold py-2 px-4 rounded"
              >
                Chọn ảnh banner
              </button>
            )}
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div className="flex w-full h-full gap-2 pt-5 pb-10 lg:gap-4">
          {/* LEFT */}
          <div className="flex-col hidden w-1/3 h-[90%] gap-3 overflow-y-auto lg:w-1/4 md:flex">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex flex-col flex-1 h-[90%] gap-6 px-4 overflow-y-auto rounded-lg">
            {loading ? (
              <Loading />
            ) : groupPosts?.length > 0 ? (
              groupPosts?.map((post) => (
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
                <p className="text-lg text-ascent-2">Nhóm chưa co bài viết nào</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="hidden w-1/4 h-[90%] lg:flex flex-col gap-3 overflow-y-auto">
            {group?.description && (
              <div className="flex-1 h-full px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary">
                <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                  <span>Mô tả</span>
                  {user._id === group?.owner._id && (
                    <>
                      {!isEditingDescription && (
                        <CustomButton
                          title={isEditingDescription ? "Lưu" : "Chỉnh sửa"}
                          containerStyles="text-sm text-ascent-1 mb-2 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
                          onClick={
                            isEditingDescription
                              ? handleSaveDescription
                              : handleEditDescriptionClick
                          }
                        />
                      )}
                      {isEditingDescription && (
                        <CustomButton
                          title={isEditingDescription ? "Hủy" : "Lưu"}
                          containerStyles="text-sm text-ascent-1 mb-2 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
                          onClick={() => setIsEditingDescription(false)}
                        />
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col text-ascent-1 w-full gap-4 pt-4">
                  {isEditingDescription ? (
                    <div>
                      <textarea
                        ref={textAreaRef}
                        value={editedDescription}
                        onChange={handleDescriptionChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveDescription();
                          }
                        }}
                        className="w-full p-2 rounded-md resize-none bg-primary text-ascent-1"
                      />
                    </div>
                  ) : (
                    <p className='text-ascent-1'>{group?.description}</p>
                  )}
                </div>
              </div>
            )}
            {/* Join requests */}
            {user._id === group?.owner._id && (
              <div className="flex-1 h-full px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary">
                <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                  <span>Yêu cầu tham gia</span>
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
                          onClick={() => { }}
                        >
                          <SiVerizon size={20} className="text-[#0f52b6]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div className="flex-1 h-full px-5 py-5 overflow-y-auto rounded-lg shadow-sm bg-primary">
              <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                <span>Thành viên</span>
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

                    {user._id === group?.owner._id && (
                      <div className="flex gap-1">
                        <button
                          className="bg-[#0444a430] text-sm text-white p-1 rounded"
                          onClick={() => { }}
                        >
                          <FaDeleteLeft size={20} className="text-[#0f52b6]" />
                        </button>
                      </div>
                    )}
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

export default Group;
