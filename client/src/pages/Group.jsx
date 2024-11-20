import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
} from "../components";
import { Link, useLocation, ScrollRestoration, useParams } from "react-router-dom";
import { NoProfile, EmptyImage } from "../assets";
import { SiVerizon, SiX } from "react-icons/si";
import { FaDeleteLeft } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axiosInstance from "../api/axiosConfig";
import {
  getGroupPosts,
  getPosts,
  likePost,
  reportPost,
  updatePost,
} from "../redux/postSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import socket from "../api/socket";

const Group = () => {
  const { user, edit } = useSelector((state) => state.user);
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const { id: groupId } = useParams();
  const [hasSentJoinRequest, setHasSentJoinRequest] = useState(false);
  const { groupPosts } = useSelector((state) => state.posts);
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
  }, [groupId, dispatch]);

  useEffect(() => {
    if (group) {
      dispatch(getGroupPosts(group._id));
    }
  }, [dispatch, group]);

  useEffect(() => {
    const getJoinRequests = async () => {
      try {
        const res = await axiosInstance.get(`/group/${groupId}/join-requests`);
        console.log("Join requests:", res.data.requests);
        setJoinRequests(res.data.requests);
      } catch (error) {
        console.error("Error getting join requests:", error);
      }
    };

    getJoinRequests();
  }, [groupId]);

  console.log('group', group);
  console.log("Group posts:", groupPosts);
  console.log('joinRequests', joinRequests);

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

  const submitBanner = async (file) => {
    console.log("submit banner", file);
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const res = await axiosInstance.put(`/group/${group._id}`, formData);
      setGroup({ ...group, banner: res.data.group.banner });
      toast.success("Đã cập nhật ảnh bìa nhóm");
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(group?.description);
  const textAreaRef = useRef(null); // Create a ref for the textarea

  const handleEditDescriptionClick = () => {
    setIsEditingDescription(true);
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
    group.description = editedDescription;

    try {
      const response = await axiosInstance.put(`/group/${group._id}`, { description: editedDescription });

      if (response.status === 200) {
        toast.success('Đã lưu mô tả nhóm');
        setGroup({ ...group, description: editedDescription });
      }
    } catch (error) {
      console.error('Error saving description:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
    setIsEditingDescription(false);
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState(group?.name);
  const groupNameInputRef = useRef(null);

  const handleEditGroupNameClick = () => {
    setIsEditingName(true);
    setTimeout(() => {
      if (groupNameInputRef.current) {
        groupNameInputRef.current.focus();
      }
    }, 0);
  };

  const handleGroupNameChange = (event) => {
    setEditedGroupName(event.target.value);
  };

  const handleSaveGroupName = () => {
    console.log("Tên nhóm đã đổi:", editedGroupName);
    // Thêm logic đổi tên nhóm ở đây
    try {
      axiosInstance.put(`/group/${group._id}`, { name: editedGroupName });
      setGroup({ ...group, name: editedGroupName });
      toast.success('Đã lưu tên nhóm');
    } catch (error) {
      console.error('Error saving group name:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
    // Reset the editing state
    setIsEditingName(false);
  };

  const handleJoinRequest = async () => {
    try {
      const response = await axiosInstance.post(`/group/join-request`, { userId: user._id, groupId: group._id });

      if (response.status === 201) {
        toast.success('Yêu cầu tham gia nhóm đã được gửi');
        setJoinRequests([...joinRequests, { user: user }]);
        setHasSentJoinRequest(true);
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleCancelJoinRequest = async () => {
    try {
      const response = await axiosInstance.post(`/group/cancel-request`, { userId: user._id, groupId: group._id });

      if (response.status === 201) {
        toast.success('Đã hủy yêu cầu tham gia nhóm');
        setHasSentJoinRequest(false);
      }
    } catch (error) {
      console.error('Error cancelling join request:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleAcceptJoinRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post(`/group/${group._id}/accept-request`, { requestId, status: 'APPROVED' });

      if (response.status === 200) {
        setJoinRequests(joinRequests.filter(request => request._id !== requestId));
        const receiverId = response.data.request.user;
        const notiRes = await axiosInstance.post('/users/create-notification', {
          receiverIds: [receiverId],
          sender: user._id,
          message: `${user.firstName} ${user.lastName} đã chấp nhận yêu cầu tham gia nhóm`,
          type: 'acceptGroupRequest',
          link: `/group/${group._id}`,
        });

        socket.emit('sendNotification', { notification: notiRes.data.notification, receiverId });
        toast.success('Đã chấp nhận yêu cầu tham gia nhóm');
      }
    } catch (error) {
      console.error('Error accepting join request:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleRejectJoinRequest = async (requestId) => {
    try {
      const response = await axiosInstance.post(`/group/reject-request`, { requestId });

      if (response.status === 200) {
        setJoinRequests(joinRequests.filter(request => request._id !== requestId));
        setHasSentJoinRequest(false);
        toast.success('Đã từ chối yêu cầu tham gia nhóm');
      }
    } catch (error) {
      console.error('Error rejecting join request:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa thành viên này?',
        text: 'Thành viên sẽ bị xóa khỏi nhóm',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.post(`/group/${group._id}/delete-member`, { userId: memberId });

        if (response.status === 200) {
          setGroup({ ...group, members: group.members.filter(member => member._id !== memberId) });
          toast.success('Đã xóa thành viên khỏi nhóm');
        }
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <>
      <div className="w-full h-[89vh] px-0 pb-20 overflow-hidden lg:px-10 2xl:px-40 bg-bgColor lg:rounded-lg">
        {/* <TopBar friends={user?.friends} /> */}
        <div className="relative">
          <img
            src={group?.banner === '' ? EmptyImage : group?.banner}
            alt="Banner"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-0 left-0 w-full h-48 flex items-center justify-between bg-black bg-opacity-50 rounded-t-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
            {user._id === group?.owner._id ? (
              <div className="rounded-xl bg-gray flex items-center">
                {isEditingName ? (
                  <input
                    ref={groupNameInputRef}
                    type="text"
                    value={editedGroupName}
                    onChange={handleGroupNameChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveGroupName();
                      }
                    }}
                    className="text-white font-bold text-lg px-4 py-2 rounded-lg bg-gray focus:outline-none"
                  />
                ) : (
                  <span className="text-white font-bold text-lg px-4">
                    {group?.name}
                  </span>
                )}
                {!isEditingName && (
                  <button
                    onClick={handleEditGroupNameClick}
                    className="text-white focus:outline-none"
                  >
                    <FaEdit className="mr-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-gray flex items-center">
                <span className="text-white font-bold text-lg px-4">
                  {group?.name}
                </span>
              </div>
            )}
            <input
              type="file"
              name='banner'
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
            ) : group?.members.some(member => member._id === user._id) ? (
              groupPosts?.length > 0 ? (
                groupPosts.map((post) => (
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
                  <p className="text-lg text-ascent-2">Nhóm chưa có bài viết nào</p>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center w-full h-full flex-col">
                {hasSentJoinRequest ? (
                  <>
                    <p className="text-lg text-ascent-2">Đã gửi yêu cầu tham gia</p>
                    <button
                      onClick={handleCancelJoinRequest}
                      className='mt-4 px-4 py-2 bg-primary text-ascent-1 rounded-lg hover:bg-blue'
                    >
                      Hủy yêu cầu tham gia
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-lg text-ascent-2">Bạn chưa là thành viên của nhóm</p>

                    <button
                      onClick={handleJoinRequest}
                      className="mt-4 px-4 py-2 bg-primary text-ascent-1 rounded-lg hover:bg-blue"
                    >
                      Gửi yêu cầu tham gia
                    </button>
                  </>
                )}
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
                  {joinRequests?.map((request) => (
                    <div
                      className="flex items-center justify-between"
                      key={request._id}
                    >
                      <Link
                        to={"/profile/" + request?.user?._id}
                        key={request?._id}
                        className="flex items-center w-full gap-4 cursor-pointer"
                      >
                        <img
                          src={request?.user?.avatar ?? NoProfile}
                          alt={request?.user?.firstName}
                          className="object-cover w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 ">
                          <p className="text-base font-medium text-ascent-1">
                            {request?.user?.firstName} {request?.user?.lastName}
                          </p>
                        </div>
                      </Link>

                      <div className="flex gap-1">
                        <button
                          className="bg-[#0444a430] text-sm text-white p-1 rounded mr-2"
                          onClick={() => handleAcceptJoinRequest(request?._id)}
                        >
                          <SiVerizon size={20} className="text-[#0f52b6]" />
                        </button>

                        <button
                          className="bg-[#0444a430] text-sm text-white p-1 rounded"
                          onClick={() => handleRejectJoinRequest(request?._id)}
                        >
                          <SiX size={20} className="text-red" />
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
                {group?.members?.map((member) => (
                  <div
                    className="flex items-center justify-between"
                    key={member._id}
                  >
                    <Link
                      to={"/profile/" + member?._id}
                      key={member?._id}
                      className="flex items-center w-full gap-4 cursor-pointer"
                    >
                      <img
                        src={member?.avatar ?? NoProfile}
                        alt={member?.firstName}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 ">
                        <p className="text-base font-medium text-ascent-1">
                          {member?.firstName} {member?.lastName}
                        </p>
                      </div>
                    </Link>

                    {user._id === group?.owner._id && member._id !== group?.owner._id && (
                      <div className="flex gap-1">
                        <button
                          className="bg-[#0444a430] text-sm text-white p-1 rounded"
                          onClick={() => handleDeleteMember(member?._id)}
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
